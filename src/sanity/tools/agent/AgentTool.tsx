"use client";

import { AddIcon } from "@sanity/icons/Add";
import { ArrowRightIcon } from "@sanity/icons/ArrowRight";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { CloseIcon } from "@sanity/icons/Close";
import { ErrorOutlineIcon } from "@sanity/icons/ErrorOutline";
import { Badge, Box, Button, Card, Container, Flex, Heading, Spinner, Stack, Text, TextArea } from "@sanity/ui";
import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useClient } from "sanity";
import type { AgentEvent } from "@/lib/agent/run";
import { apiVersion } from "../../env";
import { useAdminApi } from "../leads/useAdminApi";
import { readLastPage, type LastPage } from "./lastPage";

type Status = {
  ready: boolean;
  missing: string[];
  usage: { spent: number; budget: number; remaining: number } | null;
  usageError: string | null;
  model: string;
};

type Item =
  | { kind: "user"; text: string; page?: string }
  | { kind: "agent"; text: string }
  | { kind: "tool"; id: string; label: string; state: "running" | "ok" | "error"; summary?: string }
  | { kind: "notice"; text: string; tone: "caution" | "critical" };

type Saved = { items: Item[]; history: unknown[] };

const STORAGE_KEY = "celine-agent-chat";

const EXAMPLES = [
  "Change the home page hero subtitle to say we also design restaurants, in both languages.",
  "Add a FAQ entry about how long a residential project takes.",
  "Make the footer tagline a bit larger on mobile.",
];

function load(): Saved {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Saved;
  } catch {
    // ignore
  }
  return { items: [], history: [] };
}

function save(saved: Saved) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // too large or unavailable: the chat still works until the tab closes
  }
}

/** Plain text with clickable links. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+|\/admin\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^(https?:\/\/|\/admin\/)/.test(part) ? (
          <a key={i} href={part} target={part.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * The Agent tool: ask for website changes in plain words. Content changes
 * become drafts in Sanity (someone publishes them); code changes become a
 * pull request on GitHub (someone merges it). The agent never publishes or
 * merges. Server side: /api/admin/agent.
 */
export function AgentTool() {
  const api = useAdminApi();
  const client = useClient({ apiVersion });
  const [status, setStatus] = useState<Status | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved>({ items: [], history: [] });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState<LastPage | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const loadStatus = useCallback(
    () => api<Status>("agent").then(setStatus, (e: Error) => setStatusError(e.message)),
    [api],
  );

  useEffect(() => {
    setSaved(load());
    setPage(readLastPage());
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [saved.items.length]);

  const update = useCallback((fn: (s: Saved) => Saved) => {
    setSaved((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    const history = saved.history;
    update((s) => ({ ...s, items: [...s.items, { kind: "user", text, page: page?.path }] }));

    const apply = (event: AgentEvent) => {
      switch (event.type) {
        case "text":
          update((s) => ({ ...s, items: [...s.items, { kind: "agent", text: event.text }] }));
          break;
        case "tool":
          update((s) => ({ ...s, items: [...s.items, { kind: "tool", id: event.id, label: event.label, state: "running" }] }));
          break;
        case "tool_result":
          update((s) => ({
            ...s,
            items: s.items.map((it) =>
              it.kind === "tool" && it.id === event.id ? { ...it, state: event.ok ? "ok" : "error", summary: event.summary } : it,
            ),
          }));
          break;
        case "notice":
          update((s) => ({ ...s, items: [...s.items, { kind: "notice", text: event.text, tone: "caution" }] }));
          break;
        case "error":
          update((s) => ({ ...s, items: [...s.items, { kind: "notice", text: event.text, tone: "critical" }] }));
          break;
        case "done":
          update((s) => ({ ...s, history: event.history }));
          break;
      }
    };

    try {
      const token = client.config().token;
      const res = await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ input: text, history, context: page ? { path: page.path, title: page.title } : undefined }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) if (line.trim()) apply(JSON.parse(line) as AgentEvent);
      }
      if (buffer.trim()) apply(JSON.parse(buffer) as AgentEvent);
    } catch (e) {
      update((s) => ({ ...s, items: [...s.items, { kind: "notice", text: (e as Error).message, tone: "critical" }] }));
    } finally {
      setBusy(false);
      loadStatus();
    }
  }, [input, busy, saved.history, page, client, update, loadStatus]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const reset = () => {
    update(() => ({ items: [], history: [] }));
    setPage(readLastPage());
  };

  const usage = status?.usage;

  return (
    <Flex direction="column" style={{ height: "100%" }}>
      <Card borderBottom padding={[3, 4]}>
        <Container width={2}>
          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
            <Stack gap={2}>
              <Heading as="h1" size={2}>
                Agent
              </Heading>
              <Text size={1} muted>
                Content changes become drafts you publish. Code changes become a pull request Andrei merges.
              </Text>
            </Stack>
            <Flex align="center" gap={2}>
              {usage && (
                <Badge tone={usage.remaining <= 0 ? "critical" : usage.remaining < usage.budget * 0.2 ? "caution" : "default"} fontSize={1}>
                  ${usage.spent.toFixed(2)} of ${usage.budget} this month
                </Badge>
              )}
              <Button icon={AddIcon} mode="ghost" text="New chat" onClick={reset} disabled={busy || !saved.items.length} />
            </Flex>
          </Flex>
        </Container>
      </Card>

      <Box flex={1} padding={[3, 4]} style={{ overflowY: "auto" }}>
        <Container width={2}>
          <Stack gap={3}>
            {statusError && (
              <Card padding={4} radius={2} tone="critical" border>
                <Text size={1}>{statusError}</Text>
              </Card>
            )}
            {status && !status.ready && (
              <Card padding={4} radius={2} tone="caution" border>
                <Stack gap={3}>
                  <Text weight="semibold">The agent isn&apos;t set up yet</Text>
                  {status.missing.length > 0 && (
                    <Text size={1}>Missing on the server (Vercel → Settings → Environment Variables): {status.missing.join(", ")}.</Text>
                  )}
                  {status.usageError && <Text size={1}>Usage log: {status.usageError}</Text>}
                </Stack>
              </Card>
            )}

            {saved.items.length === 0 && status?.ready && (
              <Stack gap={3} paddingY={4}>
                <Text muted size={1}>
                  Ask for a change in your own words, in Romanian or English. For example:
                </Text>
                {EXAMPLES.map((example) => (
                  <Card key={example} as="button" padding={3} radius={2} border onClick={() => setInput(example)} style={{ textAlign: "left", cursor: "pointer" }}>
                    <Text size={1}>{example}</Text>
                  </Card>
                ))}
              </Stack>
            )}

            {saved.items.map((item, i) => {
              switch (item.kind) {
                case "user":
                  return (
                    <Flex key={i} justify="flex-end">
                      <Card padding={3} radius={3} tone="primary" style={{ maxWidth: "85%" }}>
                        <Stack gap={2}>
                          <Text size={1} style={{ whiteSpace: "pre-wrap" }}>
                            {item.text}
                          </Text>
                          {item.page && (
                            <Text size={0} muted>
                              On {item.page}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    </Flex>
                  );
                case "agent":
                  return (
                    <Card key={i} padding={3} radius={3} border style={{ maxWidth: "85%" }}>
                      <Text size={1} style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        <Linkified text={item.text} />
                      </Text>
                    </Card>
                  );
                case "tool":
                  return (
                    <Flex key={i} align="flex-start" gap={2} paddingX={2}>
                      <Box style={{ flex: "none", width: 17 }}>
                        {item.state === "running" ? (
                          <Spinner muted />
                        ) : (
                          <Text size={1} muted={item.state === "ok"} style={item.state === "error" ? { color: "var(--card-badge-critical-dot-color)" } : undefined}>
                            {item.state === "ok" ? <CheckmarkCircleIcon /> : <ErrorOutlineIcon />}
                          </Text>
                        )}
                      </Box>
                      <Stack gap={2}>
                        <Text size={1} muted>
                          {item.label}
                        </Text>
                        {item.state === "error" && item.summary && (
                          <Text size={0} muted>
                            {item.summary}
                          </Text>
                        )}
                      </Stack>
                    </Flex>
                  );
                case "notice":
                  return (
                    <Card key={i} padding={3} radius={2} tone={item.tone} border>
                      <Text size={1}>{item.text}</Text>
                    </Card>
                  );
              }
            })}
            {busy && (
              <Flex align="center" gap={2} paddingX={2}>
                <Spinner muted />
                <Text size={1} muted>
                  Working…
                </Text>
              </Flex>
            )}
            <div ref={bottom} />
          </Stack>
        </Container>
      </Box>

      <Card borderTop padding={[3, 4]}>
        <Container width={2}>
          <Stack gap={2}>
            {page && (
              <Flex align="center" gap={1}>
                <Text size={0} muted>
                  About the page you had open: {page.title || page.path}
                </Text>
                <Button icon={CloseIcon} mode="bleed" fontSize={0} padding={1} title="Don't send the page" onClick={() => setPage(null)} />
              </Flex>
            )}
            <Flex gap={2} align="flex-end">
              <Box flex={1}>
                <TextArea
                  rows={2}
                  value={input}
                  placeholder="What should change?"
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={onKeyDown}
                  disabled={!status?.ready}
                />
              </Box>
              <Button
                icon={ArrowRightIcon}
                tone="primary"
                text="Send"
                onClick={send}
                disabled={busy || !input.trim() || !status?.ready || (usage ? usage.remaining <= 0 : false)}
              />
            </Flex>
          </Stack>
        </Container>
      </Card>
    </Flex>
  );
}

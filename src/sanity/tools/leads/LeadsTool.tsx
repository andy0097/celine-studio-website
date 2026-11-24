"use client";

import { RefreshIcon } from "@sanity/icons/Refresh";
import { SearchIcon } from "@sanity/icons/Search";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Select, Spinner, Stack, Text, TextArea, TextInput } from "@sanity/ui";
import { useToast } from "@sanity/ui/toast";
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import type { LeadRow, LeadStatus } from "@/lib/leads/store";
import { useAdminApi } from "./useAdminApi";

const STATUSES: { value: LeadStatus; title: string; tone: ComponentProps<typeof Badge>["tone"] }[] = [
  { value: "new", title: "New", tone: "primary" },
  { value: "contacted", title: "Contacted", tone: "suggest" },
  { value: "meeting", title: "Meeting", tone: "suggest" },
  { value: "proposal", title: "Proposal", tone: "caution" },
  { value: "won", title: "Won", tone: "positive" },
  { value: "lost", title: "Lost", tone: "critical" },
];
const STATUS = Object.fromEntries(STATUSES.map((s) => [s.value, s])) as Record<LeadStatus, (typeof STATUSES)[number]>;
const TYPE: Record<LeadRow["project_type"], string> = { residential: "Residential", horeca: "HORECA", onSite: "On-site visit" };

const date = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * The Leads tool: every request from the booking form, newest first. Filter
 * by status, search, open one to move it along (new → contacted → meeting →
 * proposal → won/lost) and keep notes. Data comes from /api/admin/leads.
 */
export function LeadsTool() {
  const api = useAdminApi();
  const toast = useToast();
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api<{ leads: LeadRow[] }>("leads").then(
        (res) => {
          setError(null);
          setLeads(res.leads);
        },
        (e: Error) => setError(e.message),
      ),
    [api],
  );

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (id: string, patch: { status?: LeadStatus; notes?: string | null }) => {
      try {
        const { lead } = await api<{ lead: LeadRow }>(`leads/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
        setLeads((all) => all?.map((l) => (l.id === id ? lead : l)) ?? null);
        toast.push({ status: "success", title: "Saved" });
      } catch (e) {
        toast.push({ status: "error", title: "Not saved", description: (e as Error).message });
      }
    },
    [api, toast],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads?.length ?? 0 };
    for (const l of leads ?? []) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (leads ?? []).filter(
      (l) =>
        (filter === "all" || l.status === filter) &&
        (!q || [l.name, l.email, l.phone, l.city, l.about].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [leads, filter, query]);

  const open = leads?.find((l) => l.id === openId) ?? null;

  return (
    <Flex direction="column" style={{ height: "100%", overflow: "hidden" }}>
      <Card borderBottom padding={4}>
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Stack gap={2}>
            <Heading as="h1" size={2}>
              Leads
            </Heading>
            <Text size={1} muted>
              Consultation requests from the booking form
            </Text>
          </Stack>
          <Flex gap={2} align="center">
            <TextInput icon={SearchIcon} placeholder="Search name, email, city…" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
            <Button icon={RefreshIcon} mode="ghost" text="Refresh" onClick={load} />
          </Flex>
        </Flex>
        <Flex gap={1} marginTop={4} wrap="wrap">
          {[{ value: "all" as const, title: "All" }, ...STATUSES].map((s) => (
            <Button
              key={s.value}
              mode={filter === s.value ? "default" : "bleed"}
              tone={filter === s.value ? "primary" : "default"}
              fontSize={1}
              padding={2}
              text={`${s.title} ${counts[s.value] ?? 0}`}
              onClick={() => setFilter(s.value)}
            />
          ))}
        </Flex>
      </Card>

      <Grid gridTemplateColumns={open ? [1, 1, 2] : 1} style={{ flex: 1, minHeight: 0 }}>
        <Box style={{ overflow: "auto" }}>
          {error ? (
            <Card margin={4} padding={4} radius={2} tone="critical" border>
              <Text size={1}>{error}</Text>
            </Card>
          ) : !leads ? (
            <Flex justify="center" padding={6}>
              <Spinner muted />
            </Flex>
          ) : shown.length === 0 ? (
            <Box padding={5}>
              <Text muted size={1}>
                {leads.length ? "No leads match." : "No leads yet. They appear here as soon as someone sends the booking form."}
              </Text>
            </Box>
          ) : (
            <Stack>
              {shown.map((l) => (
                <Card
                  key={l.id}
                  as="button"
                  padding={4}
                  borderBottom
                  tone={l.id === openId ? "primary" : "default"}
                  selected={l.id === openId}
                  onClick={() => setOpenId(l.id === openId ? null : l.id)}
                  style={{ textAlign: "left", width: "100%" }}
                >
                  <Flex align="center" gap={3}>
                    <Stack gap={2} flex={1}>
                      <Text weight="semibold">{l.name}</Text>
                      <Text size={1} muted>
                        {[TYPE[l.project_type], l.city, l.email].filter(Boolean).join(" · ")}
                      </Text>
                    </Stack>
                    <Stack gap={2} style={{ textAlign: "right" }}>
                      <Box>
                        <Badge tone={STATUS[l.status].tone}>{STATUS[l.status].title}</Badge>
                      </Box>
                      <Text size={0} muted>
                        {date(l.created_at)}
                      </Text>
                    </Stack>
                  </Flex>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
        {open && <LeadDetail key={open.id} lead={open} onSave={(patch) => save(open.id, patch)} />}
      </Grid>
    </Flex>
  );
}

function LeadDetail({ lead, onSave }: { lead: LeadRow; onSave: (patch: { status?: LeadStatus; notes?: string | null }) => Promise<void> }) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const run = async (patch: Parameters<typeof onSave>[0]) => {
    setSaving(true);
    await onSave(patch);
    setSaving(false);
  };
  const rows: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${lead.email}`}>{lead.email}</a>],
    ["Phone", lead.phone ? <a key="p" href={`tel:${lead.phone.replace(/\s/g, "")}`}>{lead.phone}</a> : null],
    ["Project", TYPE[lead.project_type]],
    ["City", lead.city],
    ["Language", lead.locale.toUpperCase()],
    ["Sent", date(lead.created_at)],
    ["From page", lead.source_page],
  ];
  return (
    <Card borderLeft padding={5} style={{ overflow: "auto" }}>
      <Stack gap={5}>
        <Heading as="h2" size={2}>
          {lead.name}
        </Heading>
        <Stack gap={3}>
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <Flex key={k} gap={3}>
                <Box style={{ width: 96, flexShrink: 0 }}>
                  <Text size={1} muted>
                    {k}
                  </Text>
                </Box>
                <Text size={1}>{v}</Text>
              </Flex>
            ))}
        </Stack>
        {lead.about && (
          <Card padding={3} radius={2} tone="transparent" border>
            <Text size={1} style={{ whiteSpace: "pre-wrap" }}>
              {lead.about}
            </Text>
          </Card>
        )}
        <Stack gap={2}>
          <Text size={1} weight="semibold">
            Status
          </Text>
          <Select value={lead.status} disabled={saving} onChange={(e) => run({ status: e.currentTarget.value as LeadStatus })}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.title}
              </option>
            ))}
          </Select>
        </Stack>
        <Stack gap={2}>
          <Text size={1} weight="semibold">
            Notes
          </Text>
          <TextArea rows={6} value={notes} onChange={(e) => setNotes(e.currentTarget.value)} placeholder="Calls, meetings, budget, next step…" />
          <Flex justify="flex-end">
            <Button text="Save notes" tone="primary" disabled={saving || notes === (lead.notes ?? "")} onClick={() => run({ notes: notes || null })} />
          </Flex>
        </Stack>
      </Stack>
    </Card>
  );
}

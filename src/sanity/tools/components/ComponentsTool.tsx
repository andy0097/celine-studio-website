"use client";

import { LaunchIcon } from "@sanity/icons/Launch";
import { RefreshIcon } from "@sanity/icons/Refresh";
import { SearchIcon } from "@sanity/icons/Search";
import { Badge, Box, Button, Card, Flex, Heading, Stack, Tab, TabList, Text, TextInput } from "@sanity/ui";
import { useMemo, useState } from "react";
import { useRouter, useRouterState } from "sanity/router";
import { REGISTRY } from "@/design-system/registry";
import type { ComponentMeta, Locale } from "@/design-system/types";
import { Details } from "./Details";
import { Preview, VIEWPORTS, type Width } from "./Preview";

type List = "components" | "sections";

/** Components are the building blocks; sections are page bands (and the page chrome) built from them. */
const LISTS: { id: List; title: string; match: (c: ComponentMeta) => boolean }[] = [
  { id: "components", title: "Components", match: (c) => c.kind === "component" },
  { id: "sections", title: "Sections", match: (c) => c.kind !== "component" },
];

const listOf = (c: ComponentMeta): List => (c.kind === "component" ? "components" : "sections");
const groupOf = (c: ComponentMeta) => (c.kind === "layout" ? "Page chrome" : c.group);

const ALL_WIDTHS = VIEWPORTS.map((v) => v.width);

export function ComponentsTool() {
  const router = useRouter();
  const selectedName = useRouterState((state) => (typeof state.name === "string" ? state.name : undefined));
  const selected = REGISTRY.find((c) => c.name === selectedName) ?? REGISTRY[0];

  const [list, setList] = useState<List>(listOf(selected));
  const [query, setQuery] = useState("");
  const [locale, setLocale] = useState<Locale>("ro");
  const [widths, setWidths] = useState<Width[]>(ALL_WIDTHS);
  const [reloadKey, setReloadKey] = useState(0);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const current = LISTS.find((l) => l.id === list)!;
    const matches = REGISTRY.filter(
      (c) => current.match(c) && (!q || `${c.name} ${c.group} ${c.summary}`.toLowerCase().includes(q)),
    );
    const byGroup = new Map<string, ComponentMeta[]>();
    for (const c of matches) byGroup.set(groupOf(c), [...(byGroup.get(groupOf(c)) ?? []), c]);
    return [...byGroup.entries()];
  }, [list, query]);

  const open = (name: string) => {
    const target = REGISTRY.find((c) => c.name === name);
    if (target && listOf(target) !== list) setList(listOf(target));
    router.navigate({ name });
  };

  return (
    <Flex style={{ height: "100%" }}>
      {/* Lists */}
      <Card borderRight style={{ width: 300, flex: "none", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Stack gap={3} padding={3}>
          <TabList gap={1}>
            {LISTS.map((l) => (
              <Tab
                key={l.id}
                id={`components-tab-${l.id}`}
                aria-controls="components-list"
                label={`${l.title} (${REGISTRY.filter(l.match).length})`}
                selected={list === l.id}
                onClick={() => setList(l.id)}
              />
            ))}
          </TabList>
          <TextInput
            icon={SearchIcon}
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            clearButton={Boolean(query)}
            onClear={() => setQuery("")}
          />
        </Stack>
        <Box id="components-list" flex={1} paddingX={2} paddingBottom={4} style={{ overflowY: "auto" }}>
          <Stack gap={4}>
            {groups.map(([group, items]) => (
              <Stack key={group} gap={1}>
                <Box paddingX={3} paddingY={2}>
                  <Text size={1} muted weight="medium">
                    {group}
                  </Text>
                </Box>
                {items.map((c) => (
                  <Button
                    key={c.name}
                    as="a"
                    href={`/admin/components/${c.name}`}
                    mode="bleed"
                    justify="flex-start"
                    text={c.name}
                    selected={c.name === selected.name}
                    onClick={(event: React.MouseEvent) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                      event.preventDefault();
                      open(c.name);
                    }}
                  />
                ))}
              </Stack>
            ))}
            {!groups.length && (
              <Box padding={3}>
                <Text size={1} muted>
                  Nothing matches “{query}”.
                </Text>
              </Box>
            )}
          </Stack>
        </Box>
      </Card>

      {/* The open entry */}
      <Box flex={1} padding={[4, 4, 5]} style={{ minWidth: 0, overflowY: "auto" }}>
        <Stack gap={5}>
          <Stack gap={3}>
            <Flex align="center" gap={3} wrap="wrap">
              <Heading as="h1" size={3}>
                {selected.name}
              </Heading>
              <Badge>{selected.kind === "layout" ? "page chrome" : selected.kind}</Badge>
              <Badge tone="primary">{selected.group}</Badge>
            </Flex>
            <Text muted>{selected.summary}</Text>
          </Stack>

          <Flex gap={3} wrap="wrap" align="center" justify="space-between">
            <Flex gap={3} wrap="wrap">
              <Segmented
                label="Language"
                options={[
                  { id: "ro", title: "RO" },
                  { id: "en", title: "EN" },
                ]}
                value={locale}
                onChange={(v) => setLocale(v as Locale)}
              />
              <Segmented
                label="Width"
                options={[
                  { id: "all", title: "All" },
                  ...VIEWPORTS.map((v) => ({ id: String(v.width), title: String(v.width) })),
                ]}
                value={widths.length > 1 ? "all" : String(widths[0])}
                onChange={(v) => setWidths(v === "all" ? ALL_WIDTHS : [Number(v) as Width])}
              />
            </Flex>
            <Flex gap={2}>
              <Button mode="ghost" icon={RefreshIcon} text="Replay" onClick={() => setReloadKey((k) => k + 1)} />
              <Button
                as="a"
                href={`/admin-render/${locale}/${selected.name}`}
                target="_blank"
                rel="noreferrer"
                mode="ghost"
                icon={LaunchIcon}
                text="Open alone"
              />
            </Flex>
          </Flex>

          <Text size={1} muted>
            Rendered by the website itself with sample text. Scroll inside a frame to play its scroll motion; Replay starts it again.
          </Text>

          <Preview
            name={selected.name}
            locale={locale}
            widths={widths}
            reloadKey={reloadKey}
            onPick={(w) => setWidths([w])}
          />

          <Details component={selected} onOpen={open} />
        </Stack>
      </Box>
    </Flex>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; title: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Card border radius={2} padding={1}>
      <Flex gap={1} role="group" aria-label={label}>
        {options.map((o) => (
          <Button
            key={o.id}
            mode={value === o.id ? "default" : "bleed"}
            tone={value === o.id ? "primary" : "default"}
            text={o.title}
            fontSize={1}
            padding={2}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
          />
        ))}
      </Flex>
    </Card>
  );
}

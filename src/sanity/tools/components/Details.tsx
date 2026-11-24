"use client";

import { Box, Button, Card, Flex, Grid, Heading, Stack, Text } from "@sanity/ui";
import type { ReactNode } from "react";
import { REGISTRY } from "@/design-system/registry";
import type { ComponentMeta, ContentProp, DesignParam } from "@/design-system/types";

const REPO = "https://github.com/andy0097/celine-studio-website/blob/main/";

/** What a content prop accepts, in a few words. */
function describeProp(p: ContentProp): string {
  switch (p.type) {
    case "text":
      return [p.multiline ? "Paragraph" : "Text", p.localized ? "RO + EN" : "one language", p.required && "required"]
        .filter(Boolean)
        .join(" · ");
    case "list":
      return [`List of ${p.of}`, p.min !== undefined && `min ${p.min}`, p.max !== undefined && `max ${p.max}`].filter(Boolean).join(" · ");
    case "image":
      return p.sketch ? "Image with its sketch" : "Image";
    case "link":
      return "Link to a page";
    case "boolean":
      return "On / off";
    case "select":
      return `One of: ${p.options.join(", ")}`;
  }
}

function describeDesign(d: DesignParam): string {
  const options = "options" in d && d.options ? d.options.filter((o) => o !== d.value) : [];
  return options.length ? `also: ${options.join(", ")}` : "";
}

/** Everything the registry knows about an entry, under its preview. */
export function Details({ component: c, onOpen }: { component: ComponentMeta; onOpen: (name: string) => void }) {
  const usedBy = REGISTRY.filter((other) => other.uses.includes(c.name));
  const props = Object.entries(c.props);
  const design = Object.entries(c.design);

  return (
    <Grid gridTemplateColumns={[1, 1, 1, 2]} gap={5}>
      <Stack gap={5}>
        <Section title="Content">
          {props.length ? (
            <Table rows={props.map(([key, p]) => [p.label, describeProp(p), key])} />
          ) : (
            <Text size={1} muted>
              No content of its own.
            </Text>
          )}
        </Section>
        <Section title="Design">
          {design.length ? (
            <Table rows={design.map(([key, d]) => [d.label, <code key="v">{d.value}</code>, describeDesign(d) || key])} />
          ) : (
            <Text size={1} muted>
              Nothing to adjust.
            </Text>
          )}
          <Text size={1} muted>
            Values are design tokens. Changing one changes the component everywhere it is used.
          </Text>
        </Section>
      </Stack>

      <Stack gap={5}>
        <Section title="Built from">
          <Names names={c.uses} onOpen={onOpen} empty="Nothing: it is a base element." />
        </Section>
        <Section title="Used in">
          <Names names={usedBy.map((u) => u.name)} onOpen={onOpen} empty="Not inside another component." />
        </Section>
        <Section title="Pages">
          <Text size={1}>{c.pages.length ? c.pages.join(", ") : "Not on a page yet."}</Text>
        </Section>
        {c.motion && (
          <Section title="Motion">
            <Text size={1}>{c.motion}</Text>
          </Section>
        )}
        {c.sanity && (
          <Section title="Content in Sanity">
            <Text size={1}>{c.sanity}</Text>
          </Section>
        )}
        {c.notes && (
          <Section title="Notes">
            <Text size={1}>{c.notes}</Text>
          </Section>
        )}
        <Section title="Source">
          <Text size={1}>
            <a href={`${REPO}${c.source.file}`} target="_blank" rel="noreferrer">
              {c.source.file}
            </a>
            {c.source.export ? ` · export ${c.source.export}` : ""}
          </Text>
        </Section>
      </Stack>
    </Grid>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap={3}>
      <Heading as="h2" size={1}>
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

function Table({ rows }: { rows: ReactNode[][] }) {
  return (
    <Card border radius={2}>
      {rows.map((cells, i) => (
        <Card key={i} borderTop={i > 0} padding={3}>
          <Flex gap={3} wrap="wrap">
            <Box style={{ width: 160, flex: "none" }}>
              <Text size={1} weight="medium">
                {cells[0]}
              </Text>
            </Box>
            <Box flex={1} style={{ minWidth: 160 }}>
              <Stack gap={2}>
                <Text size={1}>{cells[1]}</Text>
                {cells[2] && (
                  <Text size={0} muted>
                    {cells[2]}
                  </Text>
                )}
              </Stack>
            </Box>
          </Flex>
        </Card>
      ))}
    </Card>
  );
}

function Names({ names, onOpen, empty }: { names: string[]; onOpen: (name: string) => void; empty: string }) {
  if (!names.length)
    return (
      <Text size={1} muted>
        {empty}
      </Text>
    );
  return (
    <Flex gap={2} wrap="wrap">
      {names.map((n) => (
        <Button key={n} mode="ghost" fontSize={1} padding={2} text={n} onClick={() => onOpen(n)} />
      ))}
    </Flex>
  );
}

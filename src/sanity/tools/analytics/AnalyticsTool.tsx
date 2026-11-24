"use client";

import { LaunchIcon } from "@sanity/icons/Launch";
import { RefreshIcon } from "@sanity/icons/Refresh";
import { Box, Button, Card, Container, Flex, Grid, Heading, Spinner, Stack, Tab, TabList, Text } from "@sanity/ui";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { AnalyticsResponse } from "@/app/api/admin/analytics/route";
import { useAdminApi } from "../leads/useAdminApi";

const PERIODS = [
  { days: 7, title: "7 days" },
  { days: 28, title: "28 days" },
  { days: 90, title: "90 days" },
];
const TYPE = { residential: "Residential", horeca: "HORECA", onSite: "On-site visit" } as const;

const number = (n: number) => n.toLocaleString("ro-RO");
const percent = (n: number) => `${(n * 100).toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%`;
const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Change against the previous period, e.g. "+12% vs previous 28 days". */
function delta(current: number, previous: number, days: number) {
  if (!previous) return current ? `New this period` : `No change`;
  const change = (current - previous) / previous;
  const sign = change > 0 ? "+" : change < 0 ? "−" : "±";
  return `${sign}${percent(Math.abs(change))} vs previous ${days} days`;
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card padding={4} radius={3} border>
      <Stack gap={3}>
        <Text size={1} muted>
          {label}
        </Text>
        <Heading as="p" size={4}>
          {value}
        </Heading>
        {note && (
          <Text size={1} muted>
            {note}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card padding={4} radius={3} border>
      <Stack gap={4}>
        <Flex align="center" justify="space-between" gap={3}>
          <Heading as="h2" size={1}>
            {title}
          </Heading>
          {action}
        </Flex>
        {children}
      </Stack>
    </Card>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <Card padding={4} radius={3} tone="caution" border>
      <Text size={1}>{children}</Text>
    </Card>
  );
}

/**
 * Single-series column chart: one bar per entry, the native tooltip gives the
 * exact value, every few labels are shown under the axis.
 */
function Columns({ data, unit }: { data: { label: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const every = Math.ceil(data.length / 8);
  return (
    <Stack gap={2}>
      <Flex align="flex-end" style={{ height: 140, gap: 2, borderBottom: "1px solid var(--card-border-color)" }}>
        {data.map((d) => (
          <Flex
            key={d.label}
            title={`${d.label}: ${number(d.value)} ${unit}`}
            align="flex-end"
            style={{ flex: 1, height: "100%", cursor: "default" }}
          >
            <Box
              style={{
                width: "100%",
                height: `${(d.value / max) * 100}%`,
                minHeight: d.value ? 2 : 0,
                background: "var(--card-focus-ring-color)",
                borderRadius: "4px 4px 0 0",
              }}
            />
          </Flex>
        ))}
      </Flex>
      <Flex style={{ gap: 2 }}>
        {data.map((d, i) => (
          <Box key={d.label} style={{ flex: 1, minWidth: 0 }}>
            {i % every === 0 && (
              <Text size={0} muted style={{ whiteSpace: "nowrap" }}>
                {d.label}
              </Text>
            )}
          </Box>
        ))}
      </Flex>
    </Stack>
  );
}

/** Ranked list with a thin bar showing each row's share of the largest. */
function Ranked({ rows, unit }: { rows: { label: string; value: number }[]; unit: string }) {
  if (!rows.length) {
    return (
      <Text size={1} muted>
        No data for this period yet.
      </Text>
    );
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Stack gap={3}>
      {rows.map((r) => (
        <Stack key={r.label} gap={2}>
          <Flex justify="space-between" gap={3}>
            <Text size={1} textOverflow="ellipsis" title={r.label}>
              {r.label}
            </Text>
            <Text size={1} muted style={{ whiteSpace: "nowrap" }}>
              {number(r.value)} {unit}
            </Text>
          </Flex>
          <Box style={{ height: 4, borderRadius: 2, background: "var(--card-border-color)" }}>
            <Box
              style={{
                height: "100%",
                width: `${(r.value / max) * 100}%`,
                borderRadius: 2,
                background: "var(--card-focus-ring-color)",
              }}
            />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return <Button as="a" href={href} target="_blank" rel="noreferrer" mode="ghost" fontSize={1} padding={2} text={children} iconRight={LaunchIcon} />;
}

/**
 * The Analytics tool (plan 3.6, decision 0.8). Website traffic from GA4
 * (visitors, top pages, where people come from) and owned metrics from the
 * leads (enquiries per month, book-page conversion). Heatmaps and session
 * recordings stay in Microsoft Clarity, one click away. Data from
 * /api/admin/analytics.
 */
export function AnalyticsTool() {
  const api = useAdminApi();
  const [days, setDays] = useState(28);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Callers set `loading` first; the effect only reacts to the answer.
  const load = useCallback(() => {
    api<AnalyticsResponse>(`analytics?days=${days}`)
      .then(
        (res) => {
          setError(null);
          setData(res);
        },
        (e: Error) => setError(e.message),
      )
      .finally(() => setLoading(false));
  }, [api, days]);

  useEffect(() => {
    load();
  }, [load]);

  const traffic = data?.traffic;
  const leads = data?.leads;
  const conversion = traffic && leads && traffic.bookVisitors ? leads.inPeriod / traffic.bookVisitors : null;

  return (
    <Box padding={[4, 5, 6]} style={{ minHeight: "100%", overflow: "auto" }}>
      <Container width={3}>
        <Stack gap={5}>
          <Flex align="flex-end" justify="space-between" gap={4} wrap="wrap">
            <Stack gap={3}>
              <Text size={1} muted>
                Celine Studio admin
              </Text>
              <Heading as="h1" size={4}>
                Analytics
              </Heading>
            </Stack>
            <Flex align="center" gap={3} wrap="wrap">
              <TabList gap={1}>
                {PERIODS.map((p) => (
                  <Tab
                    key={p.days}
                    id={`period-${p.days}`}
                    aria-controls="analytics-panel"
                    label={p.title}
                    selected={days === p.days}
                    onClick={() => {
                      if (p.days === days) return;
                      setLoading(true);
                      setDays(p.days);
                    }}
                  />
                ))}
              </TabList>
              <Button icon={RefreshIcon} mode="bleed" title="Refresh" onClick={() => {
                  setLoading(true);
                  load();
                }}
                disabled={loading} />
            </Flex>
          </Flex>

          {error && <Notice>{error}</Notice>}
          {!data && loading && (
            <Flex justify="center" padding={6}>
              <Spinner muted />
            </Flex>
          )}

          {data && (
            <Stack id="analytics-panel" gap={5} style={{ opacity: loading ? 0.6 : 1, transition: "opacity 150ms" }}>
              {/* Headline numbers */}
              <Grid gridTemplateColumns={[1, 2, 4]} gap={3}>
                <Stat
                  label="Visitors"
                  value={traffic ? number(traffic.totals.visitors) : "—"}
                  note={traffic ? delta(traffic.totals.visitors, traffic.previous.visitors, data.days) : undefined}
                />
                <Stat
                  label="Page views"
                  value={traffic ? number(traffic.totals.pageViews) : "—"}
                  note={traffic ? delta(traffic.totals.pageViews, traffic.previous.pageViews, data.days) : undefined}
                />
                <Stat
                  label="Enquiries"
                  value={leads ? number(leads.inPeriod) : "—"}
                  note={leads ? delta(leads.inPeriod, leads.previousPeriod, data.days) : undefined}
                />
                <Stat
                  label="Book page conversion"
                  value={conversion === null ? "—" : percent(conversion)}
                  note={
                    traffic && leads
                      ? `${number(leads.inPeriod)} enquiries from ${number(traffic.bookVisitors)} book-page visitors`
                      : "Needs Google Analytics and Supabase"
                  }
                />
              </Grid>

              {data.trafficError && <Notice>{data.trafficError}</Notice>}
              {data.leadsError && <Notice>{data.leadsError}</Notice>}

              {traffic && (
                <Panel title={`Visitors per day, last ${data.days} days`} action={data.ga4Url && <ExternalLink href={data.ga4Url}>Google Analytics</ExternalLink>}>
                  <Columns data={traffic.daily.map((d) => ({ label: dayLabel(d.date), value: d.visitors }))} unit="visitors" />
                </Panel>
              )}

              {traffic && (
                <Grid gridTemplateColumns={[1, 1, 3]} gap={3}>
                  <Panel title="Top pages">
                    <Ranked rows={traffic.topPages.map((p) => ({ label: p.path, value: p.views }))} unit="views" />
                  </Panel>
                  <Panel title="How people find the site">
                    <Ranked rows={traffic.channels.map((c) => ({ label: c.channel, value: c.sessions }))} unit="visits" />
                  </Panel>
                  <Panel title="Top sources">
                    <Ranked rows={traffic.sources.map((s) => ({ label: s.source, value: s.sessions }))} unit="visits" />
                  </Panel>
                </Grid>
              )}

              {leads && (
                <Grid gridTemplateColumns={[1, 1, 3]} gap={3}>
                  <Box style={{ gridColumn: "span 2" }}>
                    <Panel title="Enquiries per month">
                      <Columns data={leads.perMonth.map((m) => ({ label: monthLabel(m.month), value: m.count }))} unit="enquiries" />
                    </Panel>
                  </Box>
                  <Panel title={`Enquiries by project, last ${data.days} days`}>
                    <Ranked rows={leads.byType.map((t) => ({ label: TYPE[t.type], value: t.count }))} unit="" />
                    <Text size={1} muted>
                      {number(leads.won)} of them won so far.
                    </Text>
                  </Panel>
                </Grid>
              )}

              <Card padding={4} radius={3} border tone="transparent">
                <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                  <Stack gap={2} flex={1} style={{ minWidth: 240 }}>
                    <Text weight="semibold">Heatmaps and session recordings</Text>
                    <Text size={1} muted>
                      {data.clarityUrl
                        ? "See where visitors click and scroll in Microsoft Clarity."
                        : "Microsoft Clarity is not connected yet (NEXT_PUBLIC_CLARITY_PROJECT_ID)."}
                    </Text>
                  </Stack>
                  {data.clarityUrl && <ExternalLink href={data.clarityUrl}>Open Clarity</ExternalLink>}
                </Flex>
              </Card>

              <Text size={1} muted>
                Visitors are counted only when they accept analytics cookies on the website, so the real number is higher.
              </Text>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

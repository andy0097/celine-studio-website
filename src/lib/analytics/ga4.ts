import { createSign } from "node:crypto";

/**
 * Google Analytics 4 Data API, read from the server with a service account
 * (decision 0.8: GA4 + Microsoft Clarity). No Google client library: one
 * signed JWT for an access token, then plain `runReport` calls.
 *
 * Setup (see .env.example): a service account in Google Cloud with the
 * "Google Analytics Data API" enabled, added as Viewer on the GA4 property.
 */
const propertyId = process.env.GA4_PROPERTY_ID;
const clientEmail = process.env.GA4_CLIENT_EMAIL;
// Vercel and .env files keep the key on one line with literal "\n".
const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const ga4Configured = Boolean(propertyId && clientEmail && privateKey);

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
let cachedToken: { value: string; expires: number } | null = null;

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  );
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(privateKey!).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

type ReportRow = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };

/** One `runReport` call; returns rows as { dims, metrics } with numeric metrics. */
async function runReport(body: Record<string, unknown>) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GA4 report failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { rows?: ReportRow[] };
  return (json.rows ?? []).map((row) => ({
    dims: (row.dimensionValues ?? []).map((d) => d.value),
    metrics: (row.metricValues ?? []).map((m) => Number(m.value) || 0),
  }));
}

/** The book page in both languages (src/i18n/routing.ts). */
export const BOOK_PATHS = ["/programeaza-o-consultanta", "/en/book-a-consultation"];

export type Traffic = {
  totals: { visitors: number; sessions: number; pageViews: number };
  previous: { visitors: number; sessions: number; pageViews: number };
  /** One entry per day, oldest first (YYYY-MM-DD). */
  daily: { date: string; visitors: number }[];
  topPages: { path: string; views: number; visitors: number }[];
  channels: { channel: string; sessions: number }[];
  sources: { source: string; sessions: number }[];
  /** Visitors who opened the book page (either language). */
  bookVisitors: number;
};

/** Traffic for the last `days` days (ending today) and the period before it. */
export async function getTraffic(days: number): Promise<Traffic> {
  const current = { startDate: `${days - 1}daysAgo`, endDate: "today" };
  const prior = { startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo` };
  const metrics = [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }];

  const [totals, daily, pages, channels, sources, book] = await Promise.all([
    runReport({ dateRanges: [current, prior], metrics }),
    runReport({
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 400,
    }),
    runReport({
      dateRanges: [current],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
    runReport({
      dateRanges: [current],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    runReport({
      dateRanges: [current],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    runReport({
      dateRanges: [current],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: { filter: { fieldName: "pagePath", inListFilter: { values: BOOK_PATHS } } },
    }),
  ]);

  // With two date ranges GA4 adds a "dateRange" dimension: date_range_0 = current, date_range_1 = prior.
  const pick = (range: string) => {
    const row = totals.find((r) => r.dims[0] === range);
    return { visitors: row?.metrics[0] ?? 0, sessions: row?.metrics[1] ?? 0, pageViews: row?.metrics[2] ?? 0 };
  };

  // Fill days without visits so the chart has one bar per day.
  const byDate = new Map(daily.map((r) => [r.dims[0], r.metrics[0]]));
  const dailyFilled: Traffic["daily"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10).replaceAll("-", "");
    dailyFilled.push({ date: d.toISOString().slice(0, 10), visitors: byDate.get(key) ?? 0 });
  }

  return {
    totals: pick("date_range_0"),
    previous: pick("date_range_1"),
    daily: dailyFilled,
    topPages: pages.map((r) => ({ path: r.dims[0], views: r.metrics[0], visitors: r.metrics[1] })),
    channels: channels.map((r) => ({ channel: r.dims[0], sessions: r.metrics[0] })),
    sources: sources.map((r) => ({ source: r.dims[0], sessions: r.metrics[0] })),
    bookVisitors: book[0]?.metrics[0] ?? 0,
  };
}

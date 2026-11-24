import { getAdmin, unauthorized } from "@/lib/admin/auth";
import { ga4Configured, getTraffic, type Traffic } from "@/lib/analytics/ga4";
import { getLeadStats, leadsConfigured, type LeadStats } from "@/lib/analytics/leads";

const PERIODS = [7, 28, 90] as const;

export type AnalyticsResponse = {
  days: number;
  /** null when GA4 is not connected or failed; `trafficError` says which. */
  traffic: Traffic | null;
  trafficError: string | null;
  leads: LeadStats | null;
  leadsError: string | null;
  /** Clarity dashboard link, when NEXT_PUBLIC_CLARITY_PROJECT_ID is set. */
  clarityUrl: string | null;
  /** GA4 property link, when GA4_PROPERTY_ID is set. */
  ga4Url: string | null;
};

/**
 * The admin's Analytics tool (plan 3.6, decision 0.8). Website traffic from
 * GA4 and owned metrics from the Supabase leads; each half works on its own,
 * so a missing GA4 setup still shows the enquiries. Editors and
 * administrators only. `?days=7|28|90`.
 */
export async function GET(request: Request) {
  if (!(await getAdmin(request))) return unauthorized();

  const asked = Number(new URL(request.url).searchParams.get("days"));
  const days = (PERIODS as readonly number[]).includes(asked) ? asked : 28;

  const [traffic, leads] = await Promise.allSettled([
    ga4Configured ? getTraffic(days) : Promise.reject(new Error("not-configured")),
    leadsConfigured ? getLeadStats(days) : Promise.reject(new Error("not-configured")),
  ]);

  const explain = (result: PromiseSettledResult<unknown>, notConfigured: string, failed: string, tag: string) => {
    if (result.status === "fulfilled") return null;
    if (result.reason instanceof Error && result.reason.message === "not-configured") return notConfigured;
    console.error(`[admin/analytics] ${tag}`, result.reason);
    return failed;
  };

  const propertyId = process.env.GA4_PROPERTY_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  const body: AnalyticsResponse = {
    days,
    traffic: traffic.status === "fulfilled" ? traffic.value : null,
    trafficError: explain(
      traffic,
      "Google Analytics is not connected yet (GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY).",
      "Could not load the numbers from Google Analytics. Check that the service account is a Viewer on the property.",
      "ga4",
    ),
    leads: leads.status === "fulfilled" ? leads.value : null,
    leadsError: explain(
      leads,
      "Supabase is not connected (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).",
      "Could not load the enquiries from Supabase.",
      "leads",
    ),
    clarityUrl: clarityId ? `https://clarity.microsoft.com/projects/view/${clarityId}/dashboard` : null,
    ga4Url: propertyId ? `https://analytics.google.com/analytics/web/#/p${propertyId}/reports/intelligenthome` : null,
  };
  return Response.json(body, { headers: { "Cache-Control": "private, no-store" } });
}

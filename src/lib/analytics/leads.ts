import { PROJECT_TYPES, type ProjectType } from "@/lib/leads/lead";
import { listLeads } from "@/lib/leads/store";

/**
 * Owned metrics from the Supabase leads table (plan 3.6): enquiries per
 * month and per project type. Reads through listLeads() (src/lib/leads/store.ts);
 * a small studio has far fewer than LIMIT enquiries in two years.
 */
const LIMIT = 5000;

export { storeConfigured as leadsConfigured } from "@/lib/leads/store";

export type LeadStats = {
  /** Last 12 calendar months, oldest first (YYYY-MM). */
  perMonth: { month: string; count: number }[];
  /** Enquiries in the selected period and the period before it. */
  inPeriod: number;
  previousPeriod: number;
  byType: { type: ProjectType; count: number }[];
  won: number;
};

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getLeadStats(days: number): Promise<LeadStats> {
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const periodStart = new Date(now.getTime() - days * 86_400_000);
  const priorStart = new Date(now.getTime() - days * 2 * 86_400_000);
  const since = priorStart < yearStart ? priorStart : yearStart;
  const rows = (await listLeads(LIMIT)).filter((row) => new Date(row.created_at) >= since);

  const months = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    months.set(monthKey(new Date(Date.UTC(yearStart.getUTCFullYear(), yearStart.getUTCMonth() + i, 1))), 0);
  }
  const byType = new Map<ProjectType, number>(PROJECT_TYPES.map((t) => [t, 0]));
  let inPeriod = 0;
  let previousPeriod = 0;
  let won = 0;

  for (const row of rows) {
    const created = new Date(row.created_at);
    const month = monthKey(created);
    if (months.has(month)) months.set(month, months.get(month)! + 1);
    if (created >= periodStart) {
      inPeriod++;
      byType.set(row.project_type, (byType.get(row.project_type) ?? 0) + 1);
      if (row.status === "won") won++;
    } else if (created >= priorStart) {
      previousPeriod++;
    }
  }

  return {
    perMonth: [...months].map(([month, count]) => ({ month, count })),
    inPeriod,
    previousPeriod,
    byType: [...byType].map(([type, count]) => ({ type, count })),
    won,
  };
}

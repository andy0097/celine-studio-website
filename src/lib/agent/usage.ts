import { MONTHLY_BUDGET_USD, usageConfigured } from "./config";

/**
 * The agent's usage log in Supabase (table agent_runs, migration in
 * supabase/migrations). Same REST approach as src/lib/leads/store.ts.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function request(path: string, init: RequestInit = {}) {
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key!,
      ...(key!.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

export type RunRecord = {
  userId: string;
  userName?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  prompt: string;
  stopReason?: string;
  pullRequests: string[];
};

function monthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/** USD spent this calendar month (UTC). Throws if Supabase is missing or refuses, so the cap fails closed. */
export async function spentThisMonth(): Promise<number> {
  if (!usageConfigured) throw new Error("Supabase is not configured, so the monthly cap can't be checked");
  const res = await request(`agent_runs?select=cost_usd&created_at=gte.${encodeURIComponent(monthStart())}`);
  if (!res.ok) throw new Error(`Supabase read failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as { cost_usd: number | string }[];
  return rows.reduce((sum, row) => sum + Number(row.cost_usd), 0);
}

export async function budgetStatus() {
  const spent = await spentThisMonth();
  return { spent, budget: MONTHLY_BUDGET_USD, remaining: Math.max(0, MONTHLY_BUDGET_USD - spent) };
}

export async function recordRun(run: RunRecord) {
  const res = await request("agent_runs", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: run.userId,
      user_name: run.userName ?? null,
      model: run.model,
      input_tokens: run.inputTokens,
      output_tokens: run.outputTokens,
      cache_read_tokens: run.cacheReadTokens,
      cache_write_tokens: run.cacheWriteTokens,
      cost_usd: Number(run.costUsd.toFixed(4)),
      prompt: run.prompt.slice(0, 2000),
      stop_reason: run.stopReason ?? null,
      pull_requests: run.pullRequests,
    }),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
}

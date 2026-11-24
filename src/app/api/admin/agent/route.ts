import type Anthropic from "@anthropic-ai/sdk";
import { getAdmin, unauthorized } from "@/lib/admin/auth";
import { MODEL, MONTHLY_BUDGET_USD, missingSetup } from "@/lib/agent/config";
import { runAgent, type AgentEvent, type RunTotals } from "@/lib/agent/run";
import { budgetStatus, recordRun } from "@/lib/agent/usage";

/**
 * The admin Agent (plan 5.2 / 5.5), used by the Studio's Agent tool.
 * GET  → setup status and this month's spending.
 * POST → one chat turn; streams JSON lines (AgentEvent) while it works.
 * Only signed-in Studio editors and administrators (getAdmin).
 */
export const maxDuration = 300;

const MAX_BODY_BYTES = 2_000_000;

export async function GET(request: Request) {
  const admin = await getAdmin(request);
  if (!admin) return unauthorized();
  const missing = missingSetup();
  let usage: { spent: number; budget: number; remaining: number } | null = null;
  let usageError: string | null = null;
  try {
    usage = await budgetStatus();
  } catch (e) {
    usageError = (e as Error).message;
  }
  return Response.json({ ready: missing.length === 0 && !usageError, missing, usage, usageError, model: MODEL, budget: MONTHLY_BUDGET_USD });
}

type Body = {
  input?: unknown;
  history?: unknown;
  context?: { path?: unknown; tool?: unknown; title?: unknown };
};

export async function POST(request: Request) {
  const admin = await getAdmin(request);
  if (!admin) return unauthorized();

  const missing = missingSetup();
  if (missing.length) return Response.json({ error: `The agent isn't set up yet. Missing: ${missing.join(", ")}` }, { status: 503 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "This conversation is too long. Start a new one." }, { status: 413 });
  }
  let body: Body;
  try {
    body = JSON.parse(raw) as Body;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const input = typeof body.input === "string" ? body.input.trim().slice(0, 8000) : "";
  if (!input) return Response.json({ error: "Write a message first." }, { status: 400 });
  const history = Array.isArray(body.history) ? (body.history as Anthropic.Beta.BetaMessageParam[]) : [];
  const text = (v: unknown) => (typeof v === "string" ? v.slice(0, 500) : undefined);
  const context = { path: text(body.context?.path), tool: text(body.context?.tool), title: text(body.context?.title) };

  // Monthly cap (plan 5.5). Fails closed: no usage store, no agent.
  let remaining: number;
  try {
    remaining = (await budgetStatus()).remaining;
  } catch (e) {
    return Response.json({ error: `Can't check the monthly budget: ${(e as Error).message}` }, { status: 503 });
  }
  if (remaining <= 0) {
    return Response.json({ error: `This month's agent budget ($${MONTHLY_BUDGET_USD}) is used up. It resets on the 1st.` }, { status: 429 });
  }

  const totals: RunTotals = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, costUsd: 0, pullRequests: [] };
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgentEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        for await (const event of runAgent({ history, input, context, userName: admin.name, remainingBudget: remaining, totals })) {
          send(event);
        }
      } catch (e) {
        console.error("Agent run failed", e);
        send({ type: "error", text: e instanceof Error ? e.message : "The agent failed." });
      } finally {
        // Always log what was spent, even when the run failed halfway.
        if (totals.inputTokens || totals.outputTokens) {
          await recordRun({
            userId: admin.id,
            userName: admin.name,
            model: MODEL,
            inputTokens: totals.inputTokens,
            outputTokens: totals.outputTokens,
            cacheReadTokens: totals.cacheReadTokens,
            cacheWriteTokens: totals.cacheWriteTokens,
            costUsd: totals.costUsd,
            prompt: input,
            stopReason: totals.stopReason,
            pullRequests: totals.pullRequests,
          }).catch((e) => console.error("Agent usage not recorded", e));
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}

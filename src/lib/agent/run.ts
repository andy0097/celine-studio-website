import Anthropic from "@anthropic-ai/sdk";
import { costOf, MAX_COST_PER_REQUEST_USD, MAX_STEPS_PER_REQUEST, MODEL } from "./config";
import { contextNote, systemPrompt } from "./prompt";
import { describeTool, runTool, TOOLS } from "./tools";

/** What the chat shows while the agent works, streamed to the Studio as JSON lines. */
export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "tool"; id: string; label: string }
  | { type: "tool_result"; id: string; ok: boolean; summary: string }
  | { type: "notice"; text: string }
  | { type: "done"; history: Anthropic.Beta.BetaMessageParam[]; costUsd: number; pullRequests: string[] }
  | { type: "error"; text: string };

export type RunTotals = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  stopReason?: string;
  pullRequests: string[];
};

type RunOptions = {
  /** The conversation so far, exactly as returned by the previous "done" event (thinking blocks included). */
  history: Anthropic.Beta.BetaMessageParam[];
  input: string;
  context?: { path?: string; tool?: string; title?: string };
  userName: string;
  /** USD the agent may still spend this month. */
  remainingBudget: number;
  totals: RunTotals;
};

const anthropic = new Anthropic(); // ANTHROPIC_API_KEY

/**
 * One chat request: the agent loop (model → tools → model …) until Claude
 * answers, the step limit, or the money runs out. The whole conversation,
 * including thinking blocks, goes back to the browser unchanged so the next
 * request can continue it.
 */
export async function* runAgent(opts: RunOptions): AsyncGenerator<AgentEvent> {
  const { totals } = opts;
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...opts.history,
    { role: "user", content: opts.input + contextNote(opts.context) },
  ];
  const system = await systemPrompt();
  const budget = Math.min(opts.remainingBudget, MAX_COST_PER_REQUEST_USD);

  for (let step = 0; step < MAX_STEPS_PER_REQUEST; step++) {
    if (totals.costUsd >= budget) {
      yield {
        type: "notice",
        text:
          budget === opts.remainingBudget
            ? "Stopped: this month's agent budget is used up."
            : "Stopped: this request reached its spending limit. Ask me to continue if needed.",
      };
      break;
    }

    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: [{ type: "text", text: system }],
      tools: TOOLS,
      messages,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      // Cache the stable prefix (tools + system + earlier turns) across steps.
      cache_control: { type: "ephemeral" },
      // On a safety decline, let the API retry on a fallback model in the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    const usage = response.usage;
    totals.inputTokens += usage.input_tokens ?? 0;
    totals.outputTokens += usage.output_tokens ?? 0;
    totals.cacheReadTokens += usage.cache_read_input_tokens ?? 0;
    totals.cacheWriteTokens += usage.cache_creation_input_tokens ?? 0;
    totals.costUsd += costOf(usage);
    totals.stopReason = response.stop_reason ?? undefined;

    // Keep the assistant turn exactly as returned (thinking and fallback blocks too).
    messages.push({ role: "assistant", content: response.content });

    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) yield { type: "text", text: block.text };
    }

    if (response.stop_reason === "refusal") {
      yield { type: "notice", text: "The model declined this request. Try rephrasing it, or hand it to Andrei." };
      break;
    }
    if (response.stop_reason === "max_tokens") {
      yield { type: "notice", text: "The answer was cut off (too long). Ask me to continue." };
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const calls = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const call of calls) {
      const input = (call.input ?? {}) as Record<string, unknown>;
      yield { type: "tool", id: call.id, label: describeTool(call.name, input) };
      try {
        const output = await runTool(call.name, input, {
          userName: opts.userName,
          onPullRequest: (url) => totals.pullRequests.push(url),
        });
        results.push({ type: "tool_result", tool_use_id: call.id, content: output });
        yield { type: "tool_result", id: call.id, ok: true, summary: output.split("\n")[0].slice(0, 200) };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        results.push({ type: "tool_result", tool_use_id: call.id, content: message, is_error: true });
        yield { type: "tool_result", id: call.id, ok: false, summary: message.slice(0, 200) };
      }
    }
    // All results of one turn go back in a single user message.
    messages.push({ role: "user", content: results });

    if (step === MAX_STEPS_PER_REQUEST - 1) {
      yield { type: "notice", text: "Stopped after the maximum number of steps. Ask me to continue if needed." };
    }
  }

  // If the loop stopped right after tool results, close the turn so the next
  // request's message doesn't merge into those results.
  const last = messages[messages.length - 1];
  if (last?.role === "user" && Array.isArray(last.content) && last.content.every((b) => b.type === "tool_result")) {
    messages.push({ role: "assistant", content: [{ type: "text", text: "(Stopped here.)" }] });
  }

  yield { type: "done", history: messages, costUsd: totals.costUsd, pullRequests: totals.pullRequests };
}

/**
 * Settings of the admin Agent (plan 5.2 / 5.5). Everything secret comes from
 * the environment and is only read on the server.
 */

/** Claude model the agent runs on. */
export const MODEL = process.env.AGENT_MODEL || "claude-opus-5-5";

/** Price per million tokens (USD) used for the monthly cap. Claude Opus 5.5 list price. */
export const PRICE = {
  input: Number(process.env.AGENT_PRICE_INPUT || 4),
  output: Number(process.env.AGENT_PRICE_OUTPUT || 20),
  cacheRead: Number(process.env.AGENT_PRICE_CACHE_READ || 0.2),
  cacheWrite: Number(process.env.AGENT_PRICE_CACHE_WRITE || 5),
};

/** Monthly spending cap in USD; requests stop once the month's runs reach it. */
export const MONTHLY_BUDGET_USD = Number(process.env.AGENT_MONTHLY_BUDGET_USD || 20);

/** Upper bound for one chat request, so a runaway loop can't drain the month. */
export const MAX_STEPS_PER_REQUEST = 30;
export const MAX_COST_PER_REQUEST_USD = Number(process.env.AGENT_MAX_COST_PER_REQUEST_USD || 3);

/** GitHub repository the agent opens pull requests on ("owner/name"). */
export const GITHUB_REPO = process.env.AGENT_GITHUB_REPO || "andy0097/celine-studio-website";
export const GITHUB_BASE_BRANCH = process.env.AGENT_GITHUB_BASE_BRANCH || "main";
/** GitHub login asked to review every pull request and assigned every hand-off. */
export const GITHUB_REVIEWER = process.env.AGENT_GITHUB_REVIEWER || "andy0097";
/** Every branch the agent creates starts with this, and it can only write to such branches. */
export const BRANCH_PREFIX = "agent/";

export const anthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
export const githubConfigured = Boolean(process.env.AGENT_GITHUB_TOKEN);
export const sanityWriteConfigured = Boolean(process.env.SANITY_API_WRITE_TOKEN);
export const usageConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Env vars the agent can't run without, by name, for the status screen. */
export function missingSetup(): string[] {
  const missing: string[] = [];
  if (!anthropicConfigured) missing.push("ANTHROPIC_API_KEY");
  if (!githubConfigured) missing.push("AGENT_GITHUB_TOKEN");
  if (!sanityWriteConfigured) missing.push("SANITY_API_WRITE_TOKEN");
  if (!usageConfigured) missing.push("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}

/** Repository paths the agent must never write, even on its own branch. */
export const BLOCKED_PATHS = [
  /^\.env/,
  /^\.github\//,
  /^package(-lock)?\.json$/,
  /^next\.config\./,
  /^supabase\//,
  /^src\/app\/api\//, // server routes, including this agent and the admin auth
  /^src\/lib\/(admin|agent|leads)\//,
  /^src\/proxy\.ts$/,
];

/**
 * Paths whose changes need Andrei (plan 5.5: tokens, components, schemas).
 * The agent may change them on a branch, but the pull request says so and
 * asks Andrei to review.
 */
export const NEEDS_ANDREI_PATHS = [
  /^design-system\//,
  /^src\/app\/tokens\.css$/,
  /^src\/app\/globals\.css$/,
  /^src\/components\//,
  /^src\/design-system\//,
  /^src\/sanity\/schemaTypes\//,
  /^sanity\.config\.ts$/,
  /^AGENTS\.md$/,
];

export function costOf(usage: {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}) {
  return (
    ((usage.input_tokens ?? 0) * PRICE.input +
      (usage.output_tokens ?? 0) * PRICE.output +
      (usage.cache_read_input_tokens ?? 0) * PRICE.cacheRead +
      (usage.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite) /
    1_000_000
  );
}

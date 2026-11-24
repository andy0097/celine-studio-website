import { BLOCKED_PATHS, BRANCH_PREFIX, GITHUB_BASE_BRANCH, GITHUB_REPO, GITHUB_REVIEWER, NEEDS_ANDREI_PATHS } from "./config";

/**
 * GitHub access for the agent, through the REST API with a fine-grained
 * token scoped to this one repository (Contents + Pull requests + Issues:
 * read and write). It reads any branch, writes only to its own `agent/…`
 * branches, opens pull requests and issues. There is no merge here: a
 * person merges on GitHub.
 */
const API = "https://api.github.com";
const MAX_FILE_CHARS = 80_000;

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}/repos/${GITHUB_REPO}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.AGENT_GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method ?? "GET"} ${path} failed: ${res.status} ${(await res.text()).slice(0, 500)}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

const enc = (path: string) => path.split("/").map(encodeURIComponent).join("/");

function cleanPath(path: string) {
  const p = path.replace(/^\/+/, "");
  if (!p || p.split("/").some((part) => part === ".." || part === ".")) throw new Error(`Invalid path: ${path}`);
  return p;
}

function assertAgentBranch(branch: string) {
  if (!branch.startsWith(BRANCH_PREFIX) || branch === GITHUB_BASE_BRANCH) {
    throw new Error(`The agent can only write to its own branches (${BRANCH_PREFIX}…), not ${branch}`);
  }
}

export const needsAndrei = (path: string) => NEEDS_ANDREI_PATHS.some((re) => re.test(path));

/** Lists a folder: one line per entry, "dir" or "file" and its path. */
export async function listDirectory(path = "", ref = GITHUB_BASE_BRANCH) {
  const p = path ? cleanPath(path) : "";
  const items = await gh<{ type: string; path: string; size: number }[] | { type: string }>(
    `/contents/${enc(p)}?ref=${encodeURIComponent(ref)}`,
  );
  if (!Array.isArray(items)) return `${p} is a file, use github_read_file`;
  return items.map((i) => `${i.type === "dir" ? "dir " : "file"} ${i.path}${i.type === "file" ? ` (${i.size} B)` : ""}`).join("\n");
}

/** Every file path in the repository under a prefix (recursive), for finding things. */
export async function findFiles(prefix = "", ref = GITHUB_BASE_BRANCH) {
  const tree = await gh<{ tree: { path: string; type: string }[]; truncated: boolean }>(
    `/git/trees/${encodeURIComponent(ref)}?recursive=1`,
  );
  const paths = tree.tree.filter((t) => t.type === "blob" && t.path.startsWith(prefix)).map((t) => t.path);
  return paths.slice(0, 1500).join("\n") + (paths.length > 1500 ? `\n… ${paths.length - 1500} more` : "");
}

export async function readFile(path: string, ref = GITHUB_BASE_BRANCH) {
  const p = cleanPath(path);
  const file = await gh<{ type: string; content?: string; encoding?: string; size: number }>(
    `/contents/${enc(p)}?ref=${encodeURIComponent(ref)}`,
  );
  if (file.type !== "file" || file.content == null) throw new Error(`${p} is not a file`);
  const text = Buffer.from(file.content, (file.encoding as BufferEncoding) || "base64").toString("utf8");
  return text.length > MAX_FILE_CHARS ? `${text.slice(0, MAX_FILE_CHARS)}\n… (cut at ${MAX_FILE_CHARS} of ${text.length} characters)` : text;
}

/** Creates `agent/<name>` from the tip of main. */
export async function createBranch(name: string) {
  const slug = name
    .toLowerCase()
    .replace(new RegExp(`^${BRANCH_PREFIX}`), "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  if (!slug) throw new Error("Give the branch a short name, e.g. update-footer-tagline");
  const branch = `${BRANCH_PREFIX}${slug}`;
  const base = await gh<{ object: { sha: string } }>(`/git/ref/heads/${encodeURIComponent(GITHUB_BASE_BRANCH)}`);
  await gh(`/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }) });
  return branch;
}

export type FileChange = { path: string; content?: string; delete?: boolean };

/** One commit on an agent branch with all the given file changes. */
export async function commitFiles(branch: string, message: string, files: FileChange[]) {
  assertAgentBranch(branch);
  if (!files.length) throw new Error("No files to commit");
  const paths = files.map((f) => cleanPath(f.path));
  const blocked = paths.filter((p) => BLOCKED_PATHS.some((re) => re.test(p)));
  if (blocked.length) {
    throw new Error(`These paths are off-limits for the agent: ${blocked.join(", ")}. Hand the change off to Andrei instead.`);
  }

  const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${enc(branch)}`);
  const parent = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
  const tree = await gh<{ sha: string }>(`/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: files.map((f, i) =>
        f.delete
          ? { path: paths[i], mode: "100644", type: "blob", sha: null }
          : { path: paths[i], mode: "100644", type: "blob", content: f.content ?? "" },
      ),
    }),
  });
  const commit = await gh<{ sha: string }>(`/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }),
  });
  await gh(`/git/refs/heads/${enc(branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  const flagged = paths.filter(needsAndrei);
  return (
    `Committed ${commit.sha.slice(0, 7)} on ${branch}: ${paths.join(", ")}` +
    (flagged.length ? `\nNeeds Andrei's review (tokens, components, schemas or rules): ${flagged.join(", ")}` : "")
  );
}

/** Opens a pull request from an agent branch into main and asks Andrei to review it. Never merges. */
export async function openPullRequest(branch: string, title: string, body: string, requestedBy: string) {
  assertAgentBranch(branch);
  const compare = await gh<{ files?: { filename: string }[] }>(
    `/compare/${encodeURIComponent(GITHUB_BASE_BRANCH)}...${enc(branch)}`,
  );
  const changed = (compare.files ?? []).map((f) => f.filename);
  if (!changed.length) throw new Error(`${branch} has no changes compared to ${GITHUB_BASE_BRANCH}`);
  const flagged = changed.filter(needsAndrei);

  const fullBody = [
    `_Opened by the admin Agent at the request of **${requestedBy}**. The agent never merges: review the preview and merge on GitHub._`,
    "",
    body,
    "",
    flagged.length
      ? `> [!IMPORTANT]\n> Needs Andrei: this changes tokens, components, schemas or agent rules:\n${flagged.map((f) => `> - \`${f}\``).join("\n")}`
      : "",
  ].join("\n");

  const pr = await gh<{ number: number; html_url: string }>(`/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, head: branch, base: GITHUB_BASE_BRANCH, body: fullBody, draft: false }),
  });
  // Best effort: ask for review and label it, so it shows up as the agent's.
  await Promise.allSettled([
    gh(`/pulls/${pr.number}/requested_reviewers`, { method: "POST", body: JSON.stringify({ reviewers: [GITHUB_REVIEWER] }) }),
    gh(`/issues/${pr.number}/assignees`, { method: "POST", body: JSON.stringify({ assignees: [GITHUB_REVIEWER] }) }),
    gh(`/issues/${pr.number}/labels`, {
      method: "POST",
      body: JSON.stringify({ labels: ["agent", ...(flagged.length ? ["needs-andrei"] : [])] }),
    }),
  ]);
  return pr;
}

/** Files a GitHub issue for something the agent must not do itself (plan 5.5 hand-off). */
export async function handOff(title: string, body: string, requestedBy: string) {
  const issue = await gh<{ number: number; html_url: string }>(`/issues`, {
    method: "POST",
    body: JSON.stringify({
      title,
      body: `_Handed off by the admin Agent, asked by **${requestedBy}**._\n\n${body}`,
    }),
  });
  await Promise.allSettled([
    gh(`/issues/${issue.number}/assignees`, { method: "POST", body: JSON.stringify({ assignees: [GITHUB_REVIEWER] }) }),
    gh(`/issues/${issue.number}/labels`, { method: "POST", body: JSON.stringify({ labels: ["agent-handoff"] }) }),
  ]);
  return issue;
}

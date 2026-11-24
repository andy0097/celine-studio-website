import type Anthropic from "@anthropic-ai/sdk";
import * as github from "./github";
import * as sanity from "./sanity";

/**
 * The agent's tools. Sanity: read anything, write drafts only. GitHub: read
 * the repo, commit to its own agent/… branches, open pull requests, hand
 * off. Nothing here publishes content or merges code.
 */
export const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "sanity_query",
    description:
      "Run a GROQ query against the Sanity dataset (drafts overlaid on published content). Use it to find documents, e.g. *[_type == \"caseStudy\"]{_id, title, slug}. Keep projections narrow; results over ~60k characters are cut.",
    input_schema: {
      type: "object",
      properties: {
        groq: { type: "string", description: "The GROQ query." },
        params: { type: "object", description: "Optional query parameters ($name → value)." },
      },
      required: ["groq"],
    },
  },
  {
    name: "sanity_get_document",
    description: "Fetch one Sanity document by id, as the editor sees it (the draft if one exists, else the published version). Page singletons use their type name as id (e.g. homePage, siteSettings).",
    input_schema: {
      type: "object",
      properties: { id: { type: "string", description: "Document id, with or without the drafts. prefix." } },
      required: ["id"],
    },
  },
  {
    name: "sanity_edit_draft",
    description:
      "Change fields on a document's DRAFT (created from the published version if there is none). Never publishes. Translatable fields have ro and en sub-fields; change both languages together unless asked otherwise. Paths use Sanity patch syntax, e.g. \"tagline.ro\" or \"gallery[_key==\\\"a1b2\\\"].caption.en\".",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Document id." },
        set: { type: "object", description: "Map of field path → new value." },
        unset: { type: "array", items: { type: "string" }, description: "Field paths to remove." },
      },
      required: ["id"],
    },
  },
  {
    name: "sanity_create_draft",
    description:
      "Create a new DRAFT document of type caseStudy, photo, testimonial, faq or teamMember. Never publishes. Read an existing document of the same type first to copy its shape.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["caseStudy", "photo", "testimonial", "faq", "teamMember"] },
        fields: { type: "object", description: "The document's fields (without _id and _type)." },
      },
      required: ["type", "fields"],
    },
  },
  {
    name: "github_list_directory",
    description: "List one folder of the website's repository.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Folder path, \"\" for the root." },
        ref: { type: "string", description: "Branch, default main." },
      },
      required: ["path"],
    },
  },
  {
    name: "github_find_files",
    description: "List every file path in the repository that starts with a prefix (recursive). Use it to locate files.",
    input_schema: {
      type: "object",
      properties: {
        prefix: { type: "string", description: "Path prefix, e.g. src/components/." },
        ref: { type: "string", description: "Branch, default main." },
      },
      required: ["prefix"],
    },
  },
  {
    name: "github_read_file",
    description: "Read a file of the repository.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" }, ref: { type: "string", description: "Branch, default main." } },
      required: ["path"],
    },
  },
  {
    name: "github_create_branch",
    description: "Create a new branch agent/<name> from main for a code change. Returns the full branch name.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string", description: "Short kebab-case name, e.g. footer-tagline-spacing." } },
      required: ["name"],
    },
  },
  {
    name: "github_commit_files",
    description:
      "Commit whole-file contents to an agent/… branch in one commit. Give the complete new content of every changed file (read it first). Set delete: true to remove a file.",
    input_schema: {
      type: "object",
      properties: {
        branch: { type: "string" },
        message: { type: "string", description: "Commit message, imperative, one line." },
        files: {
          type: "array",
          items: {
            type: "object",
            properties: { path: { type: "string" }, content: { type: "string" }, delete: { type: "boolean" } },
            required: ["path"],
          },
        },
      },
      required: ["branch", "message", "files"],
    },
  },
  {
    name: "github_open_pull_request",
    description:
      "Open a pull request from an agent/… branch into main and request Andrei's review. Vercel builds a preview for it. The agent never merges.",
    input_schema: {
      type: "object",
      properties: {
        branch: { type: "string" },
        title: { type: "string" },
        body: { type: "string", description: "What changed and why, and what to check in the preview. Markdown." },
      },
      required: ["branch", "title", "body"],
    },
  },
  {
    name: "hand_off",
    description:
      "File a GitHub issue for Andrei when the request is something you must not do yourself (publishing, merging, deleting, secrets, dependencies, server code, anything risky or unclear), with everything he needs to do it.",
    input_schema: {
      type: "object",
      properties: { title: { type: "string" }, body: { type: "string", description: "Markdown." } },
      required: ["title", "body"],
    },
  },
];

type Input = Record<string, unknown>;
const str = (input: Input, key: string, optional = false): string => {
  const v = input[key];
  if (typeof v === "string") return v;
  if (optional && v == null) return "";
  throw new Error(`${key} must be a string`);
};
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

export type ToolContext = { userName: string; onPullRequest: (url: string) => void };

/** Runs one tool call and returns its text result. Errors are thrown and reported back to the model. */
export async function runTool(name: string, input: Input, ctx: ToolContext): Promise<string> {
  switch (name) {
    case "sanity_query":
      return sanity.query(str(input, "groq"), obj(input.params));
    case "sanity_get_document":
      return sanity.getDocument(str(input, "id"));
    case "sanity_edit_draft":
      return sanity.editDraft(
        str(input, "id"),
        obj(input.set),
        Array.isArray(input.unset) ? input.unset.filter((p): p is string => typeof p === "string") : [],
      );
    case "sanity_create_draft":
      return sanity.createDraft(str(input, "type"), obj(input.fields));
    case "github_list_directory":
      return github.listDirectory(str(input, "path", true), str(input, "ref", true) || undefined);
    case "github_find_files":
      return github.findFiles(str(input, "prefix", true), str(input, "ref", true) || undefined);
    case "github_read_file":
      return github.readFile(str(input, "path"), str(input, "ref", true) || undefined);
    case "github_create_branch":
      return `Created branch ${await github.createBranch(str(input, "name"))}`;
    case "github_commit_files": {
      const files = Array.isArray(input.files) ? input.files.map(obj) : [];
      return github.commitFiles(
        str(input, "branch"),
        str(input, "message"),
        files.map((f) => ({ path: String(f.path ?? ""), content: typeof f.content === "string" ? f.content : undefined, delete: f.delete === true })),
      );
    }
    case "github_open_pull_request": {
      const pr = await github.openPullRequest(str(input, "branch"), str(input, "title"), str(input, "body"), ctx.userName);
      ctx.onPullRequest(pr.html_url);
      return `Opened pull request #${pr.number}: ${pr.html_url} (review requested; a Vercel preview will appear on it)`;
    }
    case "hand_off": {
      const issue = await github.handOff(str(input, "title"), str(input, "body"), ctx.userName);
      return `Filed issue #${issue.number} for Andrei: ${issue.html_url}`;
    }
    default:
      throw new Error(`Unknown tool ${name}`);
  }
}

/** One-line label for the chat while a tool runs. */
export function describeTool(name: string, input: Input): string {
  const s = (k: string) => (typeof input[k] === "string" ? (input[k] as string) : "");
  switch (name) {
    case "sanity_query":
      return "Searching the content";
    case "sanity_get_document":
      return `Reading ${s("id")}`;
    case "sanity_edit_draft":
      return `Editing the draft of ${s("id")}`;
    case "sanity_create_draft":
      return `Creating a ${s("type")} draft`;
    case "github_list_directory":
    case "github_find_files":
      return `Looking through ${s("path") || s("prefix") || "the repository"}`;
    case "github_read_file":
      return `Reading ${s("path")}`;
    case "github_create_branch":
      return `Creating branch agent/${s("name")}`;
    case "github_commit_files":
      return `Committing to ${s("branch")}`;
    case "github_open_pull_request":
      return `Opening a pull request: ${s("title")}`;
    case "hand_off":
      return `Handing off to Andrei: ${s("title")}`;
    default:
      return name;
  }
}

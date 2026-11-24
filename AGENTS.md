<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rules for AI agents working on this repository

These rules apply to every agent: the admin's website Agent (`/admin/agent`, server in `src/app/api/admin/agent`, logic in `src/lib/agent`) and coding agents such as Claude Code. The admin Agent reads this file from `main` on every conversation, so changes here change its behaviour once merged.

## What lives where

- **Content** (all text RO + EN, case studies, images and their sketches, FAQ, testimonials, team, site settings) lives in Sanity (project `abej04l7`, dataset `production`). Schemas: `src/sanity/schemaTypes/`. Every translatable field has `ro` and `en`. Page singletons use their type name as document id (`homePage`, `siteSettings`, …).
- **Design and structure** live in this repo: tokens in `design-system/tokens.json` (generates `src/app/tokens.css`), components and sections in `src/components/` with their `*.meta.ts` descriptions, the registry in `src/design-system/registry.ts`, interface strings in `messages/ro.json` and `messages/en.json`.

## Approval rules (plan 5.5)

1. **Nothing goes live without a person.** Agents never publish Sanity documents and never merge pull requests. Content changes are drafts; code changes are pull requests into `main`, reviewed on the Vercel preview.
2. **Prefer content over code.** If a request is about wording, images or other content, change the Sanity draft, not the code.
3. **Tokens, components, schemas and these rules need Andrei.** Changes to `design-system/`, `src/components/`, `src/design-system/`, `src/sanity/schemaTypes/`, `sanity.config.ts` or `AGENTS.md` may be prepared, but the pull request must say so (the admin Agent labels them `needs-andrei`).
4. **Off-limits for the admin Agent:** env vars and secrets, `package.json` and dependencies, server routes (`src/app/api/`), `src/lib/admin|agent|leads`, `src/proxy.ts`, `next.config.*`, `.github/`, database migrations (`supabase/`), deleting content. It files a hand-off issue for Andrei instead.
5. **Usage cap.** The admin Agent stops when the month's spend reaches `AGENT_MONTHLY_BUDGET_USD` (logged in the Supabase table `agent_runs`).

## How to change things well

- Use the design system: token values only (colours, type styles, spacing steps), never raw hex or pixel values in components.
- Both languages, always. Romanian with correct diacritics (ă â î ș ț, comma below). If you translate, say the other language is a draft to review.
- Brand voice: calm, precise, warm; no hype, no exclamation marks.
- Small, focused pull requests: one request, one branch (`agent/…` for the admin Agent), a title and a body that say what changed, why, and what to check in the preview at 390, 768 and 1440 wide in RO and EN.
- `npm run build` must pass. Read `node_modules/next/dist/docs/` before using Next.js APIs (see above).

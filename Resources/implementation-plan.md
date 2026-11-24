# Celine Studio — implementation plan

Website + backend (/admin), as discussed on Nov 23–24, 2026 and laid out on the whiteboard
"Celine Studio — website system" (system diagram + Features section).

**Principle:** the repo holds design and structure; Sanity holds all content (RO + EN);
everything else (admin library, Claude Design system, component registry, agent docs) is
generated from those two. Nothing goes live without a person approving it.

Two sources of truth the owner sees in /admin:
- **Component library** = the components themselves. Changing a component's properties there
  changes the component, so it applies everywhere it is used on the site. New components are made
  by duplicating one in the library. (Saved changes become a PR, previewed and approved, then live.)
- **Style guide** = the brand: tokens, fonts, logos, guidelines. **Read-only** in /admin; it is
  generated from the repo and is the reference for anyone working on the brand.

Milestones:
- **M1 — Launchable site** (phases 0–2, plus 3.5 Leads capture and phase 7): bilingual site, owner edits content in Sanity, enquiries are captured.
- **M2 — Admin v1** (phase 3): dashboard shell, assets, brand, component library, leads table.
- **M3 — Design-system loop + agents** (phases 4–5).
- **M4 — Drawing generator** (phase 6). Can start its provider test in parallel at any time.

---

## Phase 0 — Decisions (blocking)

| # | Decision | Blocks | Proposal |
|---|---|---|---|
| 0.1 | Default language | 1.2 | **Decided:** Romanian default, English at /en |
| 0.2 | Translated URL slugs | 1.2, 2.2 | **Decided:** translated (/proiecte/…, /en/projects/…) |
| 0.3 | Who writes English | 2.5 | Owner writes RO, AI drafts EN, someone reviews |
| 0.4 | Hosting | 1.4 | **Decided:** Vercel |
| 0.5 | Admin login | 3.1 | **Decided:** one login — the admin is built inside Sanity Studio |
| 0.6 | Rizoma licence: confirm ș ț (comma below), ă â î | 7.1 | Check before buying |
| 0.7 | Leads storage (Sanity vs small database) | 3.5 | **Decided Nov 24:** Supabase (Postgres) |
| 0.8 | Analytics stack | 3.6 | TBD on the board: GA4 + Microsoft Clarity + owned metrics |
| 0.9 | Which properties the owner may change per component (see 5.6) | 1.3, 5.6 | Token values only (colours, type styles, spacing steps), texts, variants |
| 0.10 | Drawing model provider | 6.3 | **Decided Nov 24:** Google Gemini image model (no free API tier, ≈ $0.04 per drawing; cap 50 a month) |

## Phase 1 — Foundations in the repo

- **1.1 Tokens to JSON.** Move tokens from `globals.css` into `tokens.json` (list format the Claude Design system reads); generate the CSS theme from it; update `design-system-foundations.md`.
- **1.2 Two languages.** next-intl, `[locale]` route segment, RO default, locale redirect, translated slugs, `hreflang` + sitemap per language. Design the RO/EN switch for the vertical nav in Paper first.
- **1.3 Component inventory.** Split into **components** (TextLink, ButtonLink, Tag, Fig, DimensionLine, CropMarks, FAQ row…) and **sections** (built from components: ProjectRows, CtaConversation, ServicesGrid…). Each gets a description file: name, summary, building blocks, a **props schema** (which props, which token values allowed), sample data RO + EN, linked Sanity block.
- **1.4 Hosting and CI.** Vercel project, preview deploy per PR. GitHub Actions on every PR: lint, types, build, Playwright screenshots of changed pages in RO and EN, compared with main.

## Phase 2 — Sanity: content and CMS control

- **2.1 Studio in the site.** Sanity project; Studio embedded at `/admin` (it is the whole admin, see phase 3).
- **2.2 Schemas.** Localized-field helper (RO + EN per field); one singleton per static page (fields mirror its sections); settings documents (contact, testimonials, team, FAQ, on-site fee/duration); `caseStudy` (fixed: hero, specs, gallery, next project; optional: concept, value, results, testimonial; type Residential/HORECA); image documents with a paired `sketch` field + alt text per language.
- **2.3 Migrate content.** Import the current `src/content/*.ts` copy (EN) and the images; write the Romanian.
- **2.4 Wire the site to Sanity.** Server-side fetches with cache tags; publish webhook → revalidate only the tagged pages; interface strings (nav, buttons, form labels) move to next-intl message files; retire the content files.
- **2.5 Live preview and translation.** Presentation tool with click-to-edit, drafts visible only in preview; AI translation draft RO → EN in the Studio, reviewed before publish.
- **2.6 Case studies everywhere.** Dynamic case-study route; Residential/HORECA indexes, home category cards, footer projects and "Next project" all read from Sanity — publishing a project updates them all.

## Phase 3 — Admin (`/admin` = Sanity Studio with custom tools)

**Decided Nov 24 (option A):** the admin lives inside Sanity Studio, so it looks and works exactly like Sanity. `/admin` opens the Studio with **Dashboard** as its first tool; Leads, Components, Assets, Style guide, Drawing generator and Agent are tools in the same top menu, next to Content and Presentation. Built with Sanity UI; one login (the Sanity login, roles per person). Tools stay thin: their logic lives in Next.js server routes that check the Sanity user, so only the screens depend on Sanity.


- **3.1 Studio tools setup.** Register the tools, Dashboard first; Celine logo in the navbar; roles (owner, Andrei); server routes check the Sanity user.
- **3.2 Images and assets.** All Sanity images grouped by project, where each is used, which still lack a sketch (links to 6.3).
- **3.3 Style guide (read-only).** The brand's single reference: colours, type styles and the font files, spacing, lines and frames, motion, logos, image rules, voice. Rendered from `tokens.json`, the fonts and the brand documents; nothing can be edited here (changes go through the repo). Downloads: logos, fonts (as licensed), a PDF export for third parties.
- **3.4 Component library.** Components and sections (sections are built from components) in two lists; each rendered at 390 / 768 / 1440 wide with RO/EN sample data. This is the face of the repo's components, i.e. the source of truth for them. (Copying code is replaced by the registry in 4.2.)
- **3.5 Leads.** Booking form saves to the leads store (0.7) and emails the owner; table with status (new → contacted → meeting → proposal → won/lost), notes and source page. Update the privacy policy.
- **3.6 Dashboard.** Analytics (0.8) and owned metrics (enquiries per month, conversion from the book page). Needs a cookie-consent banner before GA4/Clarity.

## Phase 4 — Design-system loop

- **4.1 `npm run design:sync`.** From `tokens.json` + description files, generate: the admin library data, the agent's component list, and a Claude Design **Design System** synced from code (tokens, README brand book, a compiled bundle with Next-specific parts swapped for plain HTML, static previews).
- **4.2 Component registry.** Publish components as a shadcn-compatible registry (`/r/{name}.json`, private with a token) so Claude Code, Cursor or other projects can pull them through the shadcn MCP.
- **4.3 Run on merge.** CI runs the sync whenever main changes. Rule: components and tokens change only through PRs.

## Phase 5 — AI agents

- **5.1 Agent rules.** `AGENTS.md`, design-system rules, generated component list, approval rules.
- **5.2 Builder (design) agent as the Studio's Agent tool.** Server-side agent with tools for GitHub (branch, PR) and Sanity (drafts only), aware of the admin page the owner is on. Start with this one agent, as the board says.
- **5.3 Change requests.** List in admin: pending, preview link, before/after screenshots, Approve; email when ready.
- **5.4 Reviewer agent.** Runs on each PR after CI: design-system use, both languages, accessibility; comments or sends back.
- **5.5 Guardrails.** Never publishes or merges; tokens/components/schemas need Andrei; monthly usage cap; hands off what it shouldn't do.
- **5.6 Component property panel and duplication.** In the library, a panel per component built from its props schema (1.3): colour, texts, spacing, margins, variants, offering only token values; live preview. "Save" changes the component itself, so every place it is used updates: it becomes a PR → checks → review → approve → live. "Duplicate" creates a new component (or variant) from an existing one the same way. The repo stays the single source.

## Phase 6 — Drawing generator

- **6.1 Provider test.** 2–3 image-to-image models on ~10 real project photos; pass = same framing (hover wipe lines up) and Celine's line style; cost per image.
- **6.2 Style tuning** on the studio's existing sketches.
- **6.3 Admin tool.** Upload → generate → review → attach as the image's sketch in Sanity; also reachable from the agent chat; usage cap.

## Phase 7 — Launch

- **7.1 Fonts:** licensed Rizoma (woff2/woff), diacritics checked (0.6).
- **7.2 Romanian in the layouts:** test long words at 164px (Rezidențial, Proiecte finalizate); fix breaks.
- **7.3 Real content:** photos, sketches, placeholders (XX values, team, venues), FAQ drafts confirmed, privacy policy reviewed by a lawyer.
- **7.4 Checks:** accessibility audit, performance, metadata and social images per language, sitemap, redirects from the old site, consent banner.
- **7.5 Go live:** domain, Sanity webhook, analytics, owner walkthrough (editing, publishing, leads).

---

## Order at a glance

0 Decisions → 1.1 Tokens · 1.2 Languages · 1.3 Inventory · 1.4 CI
→ 2.1–2.6 Sanity → 3.5 Leads → 7 Launch (**M1**)
→ 3.1–3.4, 3.6 Admin (**M2**) → 4 Design-system loop → 5 Agents (**M3**) → 6 Drawing generator (**M4**; 6.1 can run any time)

---

## Progress

- Nov 24 — 1.1 tokens in `design-system/tokens.json` (generates `src/app/tokens.css`); 1.3 component inventory (`*.meta.ts`, `src/design-system/registry.ts`); 1.2 two languages with next-intl (`src/i18n/`, `src/proxy.ts`, `messages/`), hreflang, sitemap, robots, provisional RO / EN switch.
- Nov 24 — decided: admin built as Sanity Studio tools (option A).
- 2026-11-24 — **embed sanity studio in /admin** done. Sanity project `vbl3xzyn`, dataset `production` (ids in `.env.local`). Studio is embedded in the Next app (no separate studio folder): `sanity.config.ts` (basePath `/admin`), `src/app/admin/` (own root layout, NextStudio), `src/sanity/` (env, client, empty schemaTypes, Celine logo, Dashboard tool listing every backend area, "Coming soon" until built). Vision (GROQ) only in development. Packages: sanity 6, next-sanity 13, @sanity/ui 4 (`gap`, `gridTemplateColumns`), @sanity/icons 5 (import each icon from its own subpath). Build passes. Owner setup: `npm install`, add `http://localhost:3000` (and later the Vercel domain) as a CORS origin with credentials in sanity.io/manage.
- 2026-11-24 — Sanity moved to a new project in another account: `abej04l7`, dataset `production` (`.env.local`); same embedded Studio, no separate studio folder.
- 2026-11-24 — **create bilingual sanity schemas** done (2.2). `src/sanity/schemaTypes/`: field-level RO + EN (`localized()` helper; RO required, missing EN is a warning; translated slugs per language); `photo` image documents with paired `sketch` + alt per language, used through `figure` (image + caption); `caseStudy` (Residential/HORECA; fixed overview, hero, facts, gallery, next project; optional Concept, Value, Results, Testimonial sections, each once); `testimonial`, `faq`, `teamMember`; `siteSettings` (contact, six service stages, on-site fee and duration, closing CTA, footer, default SEO); one singleton per page (home, residential, horeca, process, studio, on-site, book, privacy), text only. Content menu in `src/sanity/structure.ts`; singletons can't be created, duplicated or deleted. `npm run typegen` → `src/sanity/types.ts`. Schema validates, build passes.
- 2026-11-24 — Admin side navigation: `src/sanity/navigation.ts` (one list for the sidebar and the Dashboard cards), `components/StudioLayout.tsx` (left sidebar, top-bar tool tabs hidden on wide screens). Each content area is its own tool (Pages, Case studies, Testimonials, FAQ, Team, Images, Site settings), so a screen is just a list and the open document. Opens on Dashboard.
- 2026-11-24 — Live preview (2.5, part): Presentation tool as "Live preview" in the sidebar (`src/sanity/presentation/resolve.ts`: page singletons and case studies ↔ RO/EN URLs), draft-mode routes `src/app/api/draft-mode/{enable,disable}`, `src/components/sanity/PreviewTools.tsx` (VisualEditing + Exit preview, mounted in the site layout by the site-wiring work). Needs `SANITY_API_READ_TOKEN` (Viewer token) in `.env.local` and on Vercel. Click-to-edit works on each page once it reads from Sanity.
- 2026-11-24 — **migrate content and images to sanity** done (2.3). `src/sanity/seed/` holds every page's text (EN as built, Romanian as a draft to review, decision 0.3) and the 12 images as `photo` documents (hotspot = crop, paired sketch). `npm run seed:import` builds `seed/production.ndjson` and imports it with `--missing`. Schema additions to fit the pages: home hero slides, HORECA hero text/image note and venues note, studio philosophy title and team eyebrow, book hero eyebrow and FAQ title, privacy note, settings `servicesIntro` and footer tagline, case study `hasPage` (placeholders without their own page).
- 2026-11-24 — **connect pages to sanity with cache refresh** done (2.4). `src/sanity/lib/live.ts` (defineLive, `<SanityLive>` in the locale layout), `lib/fetch.ts` (`getContent()`: one `'use cache'` boundary with a cache tag; draft mode → drafts + stega for the live preview; falls back to the seed when the dataset is empty or unreachable), `lib/queries.ts` + `content-types.ts`, `/api/revalidate` (publish webhook → `revalidateTag`). Every page and the footer read Sanity; UI strings moved to `messages/*.json`; `src/content/` removed. Needs `SANITY_API_READ_TOKEN` and `SANITY_REVALIDATE_SECRET`.
- 2026-11-24 — **make case studies dynamic everywhere** done (2.6). One route `projects/[slug]` (`/proiecte/<slug-ro>`, `/en/projects/<slug-en>`), static params from Sanity, sections rendered in the editor's order, residential/HORECA gallery layouts; a slug from the other language redirects to the right one. Home slides and categories, Residential list, HORECA venues, footer and "Next project" all link through `caseLink()`; sitemap lists case studies; the language switch keeps the case study.
- 2026-11-24 — **capture leads** (3.5, part). Decision 0.7: Supabase. `supabase/migrations/…_leads.sql` (leads table with status new → contacted → meeting → proposal → won/lost, notes, source page, locale; RLS on, no public policies). The booking form posts to a server action (`book-a-consultation/actions.ts`): validates (`src/lib/leads/lead.ts`), spam trap field, saves through Supabase's REST API with the service-role key (`lib/leads/store.ts`), emails the studio through Resend (`lib/leads/notify.ts`, reply-to = the lead). Sent if either step works; otherwise the form shows the studio's email; fields are kept. Env vars in `.env.example`. Still to do: the Leads table screen in the admin, privacy policy update (Supabase and Resend as processors).
- 2026-11-24 — **Leads tool in the admin** (3.5 + 3.1 auth). Studio tool `src/sanity/tools/leads/` (list newest first, filter by status, search, detail with status and notes). Server routes `src/app/api/admin/leads` (GET) and `leads/[id]` (PATCH) read/write Supabase. Admin auth shared by every tool: `getAdmin(request)` in `src/lib/admin/auth.ts` checks the Studio user's Sanity token against `/users/me` (roles `administrator`, `editor`; `ADMIN_ROLES` overrides); client side `useAdminApi()` (`src/sanity/tools/leads/useAdminApi.ts`) sends that token. Studio login is now `loginMethod: "token"` (sign in again once). Email to the studio deferred to the end of the project (Andrei).
- 2026-11-24 — **drawing generator** (6.3, built; 6.1/6.2 tuning still to do). Decision 0.10: Gemini. Studio tool `src/sanity/tools/drawing/` (pick a library image, images without a sketch first, or upload a photo → choose model + extra instructions → generate → wipe slider over the photo to check the lines sit on it → Save as sketch / Discard). Server: `src/app/api/admin/drawing/` (GET status + usage, POST `generate`) and `src/lib/drawing/` (Gemini, plus optional FLUX Kontext on Replicate and OpenAI adapters; style prompt in `prompt.ts`, overridable with `DRAWING_STYLE_PROMPT`). Monthly cap `DRAWING_MONTHLY_CAP` (default 50) counted in a private Sanity doc `drawing-usage.YYYY-MM`; a failed generation gives its slot back. Saving patches the published image (and its draft) with the admin's own Sanity access; an uploaded photo becomes a new draft image that needs its alt text. Needs `GEMINI_API_KEY` (billing on) locally and on Vercel.

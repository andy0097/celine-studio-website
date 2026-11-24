# Celine Studio design system (in the repo)

The repo is the source of truth for the design. Two things live here:

## 1. Tokens — `design-system/tokens.json`
Colours, type styles and fonts, spacing, radius, layout, lines, frames, overlay.
- Format: the Claude Design "Design System" token format (every family a list of
  `{name, value, usage}`), plus a few site-only fields (`fluid`, `transform`, `lg`).
- `npm run tokens` (also before `dev` and `build`) generates:
  - `src/app/tokens.css` — Tailwind theme, `:root` values with desktop overrides, `type-*` classes;
  - `src/design-system/token-names.ts` — token names as TypeScript types.
- Never edit the generated files. Change tokens.json, run `npm run tokens`.

## 2. Component inventory — `*.meta.ts` next to the components
One description per component, section and layout piece (`src/design-system/types.ts`):
name, kind (component / section / layout), group, summary, source file, the components it uses,
content props (what comes from Sanity), **design parameters** (what the owner may change in the
property panel — token values, text styles and variants only), RO + EN samples, pages that use it,
motion, and the Sanity block it maps to.

All entries are collected in `src/design-system/registry.ts` (`REGISTRY`); `checkRegistry()`
reports duplicate names, unknown `uses` and samples missing a language, and must return `[]`.
Design parameters are typed against the generated token names, so `tsc` rejects a token that doesn't exist.

Adding a component: build it from existing components and tokens, write its meta entry next to it,
make sure it's in the registry.

Fed from here (planned): the /admin component library and style guide, the property panel,
the Claude Design sync (`design:sync`), the component registry and the AI agent.

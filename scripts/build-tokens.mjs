#!/usr/bin/env node
/**
 * Builds src/app/tokens.css from design-system/tokens.json.
 *
 * tokens.json is the single source of the design tokens. It follows the
 * Claude Design "Design System" format (every family a list of
 * {name, value, usage}; type as fonts / families / groups of styles), plus a
 * few fields only this generator reads:
 *   - type style `fluid`: the clamp() size used on the site (fontSize is the
 *     largest, portable value); `transform`: text-transform
 *   - any token `lg`: its value from the lg breakpoint up
 * Also writes src/design-system/token-names.ts (token names as TS types).
 * Run: npm run tokens (also runs before dev and build).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "design-system/tokens.json");
const OUT = path.join(root, "src/app/tokens.css");
const NAMES_OUT = path.join(root, "src/design-system/token-names.ts");

const t = JSON.parse(readFileSync(SRC, "utf8"));

/* Instrument Sans is loaded by next/font (src/app/layout.tsx) under a hashed
   family name exposed as this variable, so stacks reference the variable. */
const FONT_VARIABLES = { '"Instrument Sans"': "var(--font-instrument-sans)" };
const stack = (s) =>
  Object.entries(FONT_VARIABLES).reduce((acc, [name, v]) => acc.split(name).join(v), s);

const firstTheme = t.color.themes[0].id;
const colorValue = (v) => (typeof v === "string" ? v : v[firstTheme]);

/* Families that are plain CSS custom properties on :root. */
const ROOT_FAMILIES = ["layout", "line", "frame", "overlay"];
const SKIP = new Set(["breakpoint-lg"]); // used for the media query, not a property

const out = [];
const line = (s = "") => out.push(s);

line("/*");
line(" * GENERATED from design-system/tokens.json by scripts/build-tokens.mjs.");
line(" * Do not edit: change tokens.json and run `npm run tokens`.");
line(" */");
line();

// Theme: generates Tailwind utilities (bg-surface, text-ink, p-space-md, …)
line("@theme {");
line("  /* Only Celine colours exist: drop Tailwind's default palette. */");
line("  --color-*: initial;");
line("  --color-transparent: transparent;");
line("  --color-current: currentColor;");
line();
for (const c of t.color.tokens) line(`  --${c.name}: ${colorValue(c.value)};`);
line();
for (const [key, s] of Object.entries(t.type.families)) line(`  --font-${key}: ${stack(s)};`);
line();
for (const s of t.spacing.tokens) line(`  --spacing-${s.name}: ${s.value};`);
line();
for (const r of t.radius.tokens) line(`  --${r.name}: ${r.value};`);
line("}");
line();

// Non-utility tokens
const lg = [];
line(":root {");
for (const fam of ROOT_FAMILIES) {
  for (const tok of t[fam]?.tokens ?? []) {
    if (SKIP.has(tok.name)) continue;
    line(`  --${tok.name}: ${tok.cssValue ?? tok.value};`);
    if (tok.lg) lg.push(tok);
  }
}
line("}");
line();

const bp = t.layout.tokens.find((x) => x.name === "breakpoint-lg")?.value ?? "1024px";
if (lg.length) {
  line(`@media (min-width: ${bp}) {`);
  line("  :root {");
  for (const tok of lg) line(`    --${tok.name}: ${tok.lg};`);
  line("  }");
  line("}");
  line();
}

// Type styles: one utility class per style, e.g. <h1 class="type-display">
for (const group of t.type.groups) {
  for (const s of group.styles) {
    const fam = s.family ?? group.family;
    line(`/* ${s.usage ?? ""} */`.replace("/*  */", "").trimEnd() || "");
    line(`@utility ${s.name} {`);
    line(`  font-family: var(--font-${fam});`);
    line(`  font-weight: ${s.fontWeight};`);
    line(`  font-size: ${s.fluid ?? s.fontSize};`);
    line(`  line-height: ${s.lineHeight};`);
    if (s.letterSpacing) line(`  letter-spacing: ${s.letterSpacing};`);
    if (s.transform) line(`  text-transform: ${s.transform};`);
    line("}");
    line();
  }
}

writeFileSync(OUT, out.join("\n").replace(/\n{3,}/g, "\n\n"));

// Token names as TypeScript types, so the component inventory can only
// reference tokens that exist (checked by tsc).
const union = (names) => names.map((n) => JSON.stringify(n)).join(" | ") || "never";
const names = [
  "/* GENERATED from design-system/tokens.json by scripts/build-tokens.mjs. Do not edit. */",
  "",
  `export type ColorToken = ${union(t.color.tokens.map((x) => x.name))};`,
  `export type SpacingToken = ${union(t.spacing.tokens.map((x) => x.name))};`,
  `export type RadiusToken = ${union(t.radius.tokens.map((x) => x.name))};`,
  `export type TypeStyle = ${union(t.type.groups.flatMap((g) => g.styles.map((x) => x.name)))};`,
  `export type LayoutToken = ${union(ROOT_FAMILIES.flatMap((f) => (t[f]?.tokens ?? []).map((x) => x.name)))};`,
  "",
];
writeFileSync(NAMES_OUT, names.join("\n"));
console.log(`tokens: wrote ${path.relative(root, OUT)} and ${path.relative(root, NAMES_OUT)}`);

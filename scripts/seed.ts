/**
 * Writes the site's starting content (src/sanity/seed) as an NDJSON file the
 * Sanity CLI can import, with the images uploaded from /public.
 *
 *   npm run seed:build    → seed/production.ndjson
 *   npm run seed:import   → imports it into the dataset; existing documents are
 *                           left alone (--missing), so edits made in the Studio
 *                           are never overwritten. Needs `npx sanity login` once.
 *
 * To start over from the seed: `npx sanity dataset import seed/production.ndjson production --replace`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SEED_ASSETS, SEED_DOCUMENTS } from "../src/sanity/seed";

const root = process.cwd();
const files = new Map(SEED_ASSETS.map((a) => [a.id, resolve(root, "public", a.path)]));

/** Swap references to seed assets for `_sanityAsset`, which the importer uploads. */
function withUploads(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withUploads);
  if (!value || typeof value !== "object") return value;
  const obj = value as Record<string, unknown>;
  const asset = obj.asset as { _ref?: string } | undefined;
  if (obj._type === "image" && asset?._ref && files.has(asset._ref)) {
    const rest = { ...obj };
    delete rest.asset;
    return { ...rest, _sanityAsset: `image@${pathToFileURL(files.get(asset._ref)!).href}` };
  }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, withUploads(v)]));
}

const out = join(root, "seed");
mkdirSync(out, { recursive: true });
const file = join(out, "production.ndjson");
writeFileSync(file, SEED_DOCUMENTS.map((doc) => JSON.stringify(withUploads(doc))).join("\n") + "\n");
console.log(`Wrote ${SEED_DOCUMENTS.length} documents and ${SEED_ASSETS.length} images to ${file}`);

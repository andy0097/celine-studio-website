/**
 * Small builders for the seed documents, so content.ts reads like content.
 * Shapes follow the schema in src/sanity/schemaTypes (RO + EN side by side).
 */

export type Doc = { _id: string; _type: string; [field: string]: unknown };
export type Loc = { ro: string; en: string };

let keyCounter = 0;
/** Stable `_key` for array items (same input order → same keys on every run). */
export function key() {
  keyCounter += 1;
  return `k${keyCounter.toString(36).padStart(4, "0")}`;
}

/** A translatable value: Romanian first, English second. */
export function L(ro: string, en: string): Loc {
  return { ro, en };
}

export function ref(id: string) {
  return { _type: "reference", _ref: id };
}

/** An item in an array of references. */
export function refItem(id: string) {
  return { _key: key(), _type: "reference", _ref: id };
}

/** An item in an array of objects. */
export function item<T extends Record<string, unknown>>(type: string, fields: T) {
  return { _key: key(), _type: type, ...fields };
}

/** A use of a library image (`photo` document), with an optional caption. */
export function fig(photoId: string, caption?: Loc) {
  return { _type: "figure", photo: ref(photoId), ...(caption ? { caption } : {}) };
}

/** A list of short localized lines (localeStringList). */
export function lines(items: Loc[]) {
  return items.map((l) => ({ _key: key(), _type: "localeString", ...l }));
}

/** Plain paragraphs as Portable Text, one block per paragraph. */
export function blocks(text: string) {
  return text.split(/\n{2,}/).map((p) => ({
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: key(), _type: "span", text: p, marks: [] }],
  }));
}

export function richText(ro: string, en: string) {
  return { ro: blocks(ro), en: blocks(en) };
}

/** Translated slug pair. */
export function slugs(ro: string, en: string) {
  return { ro: { _type: "slug", current: ro }, en: { _type: "slug", current: en } };
}

/* ---------- Images ---------- */

/** A file in /public that becomes a Sanity image asset. */
export type SeedAsset = { id: string; path: string; width: number; height: number };

/**
 * An image field pointing at a seed asset. `hotspot` is the focus point
 * (0–1), used for object-position on the site.
 */
export function img(asset: SeedAsset, hotspot?: { x: number; y: number }) {
  return {
    _type: "image",
    asset: ref(asset.id),
    ...(hotspot ? { hotspot: { _type: "sanity.imageHotspot", x: hotspot.x, y: hotspot.y, width: 1, height: 1 } } : {}),
  };
}

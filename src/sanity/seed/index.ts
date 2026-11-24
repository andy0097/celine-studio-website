import { SEED_ASSETS, SEED_DOCUMENTS } from "./content";
import type { Doc } from "./helpers";

export { SEED_ASSETS, SEED_DOCUMENTS };

/**
 * The seed as an in-memory dataset for the site's fallback: the documents
 * plus one `sanity.imageAsset` per file, whose `url` is the file in /public,
 * so `image.asset->url` resolves the same way it does in the Content Lake.
 */
export const SEED_DATASET: Doc[] = [
  ...SEED_ASSETS.map((a) => ({
    _id: a.id,
    _type: "sanity.imageAsset",
    url: `/${a.path}`,
    metadata: { dimensions: { width: a.width, height: a.height, aspectRatio: a.width / a.height } },
  })),
  ...SEED_DOCUMENTS,
];

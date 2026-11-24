import { cookies, draftMode } from "next/headers";
import { cacheTag } from "next/cache";
import { evaluate, parse } from "groq-js";
import { resolvePerspectiveFromCookies, type LivePerspective } from "next-sanity/live";
import type { Locale } from "@/i18n/routing";
import { SEED_DATASET } from "../seed";
import { sanityFetch } from "./live";

/** What a fetch needs from the request: draft mode decides perspective and click-to-edit markers. */
export type FetchMode = { perspective: LivePerspective; stega: boolean };

const PUBLISHED: FetchMode = { perspective: "published", stega: false };

/**
 * Read draftMode() outside any cache boundary. Published for visitors; in
 * the Studio's preview, drafts with stega (click-to-edit) markers.
 */
export async function getFetchMode(): Promise<FetchMode> {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return PUBLISHED;
  const perspective = await resolvePerspectiveFromCookies({ cookies: await cookies() });
  return { perspective: perspective ?? "drafts", stega: true };
}

/** Tag on every content query; the publish webhook (api/revalidate) refreshes it as a backstop to Sanity Live. */
export const CONTENT_TAG = "sanity-content";

function isEmpty(data: unknown) {
  return data == null || (Array.isArray(data) && data.length === 0);
}

/** Run the same GROQ query on the seed content (src/sanity/seed). */
async function fromSeed<T>(query: string, params: Record<string, unknown>): Promise<T> {
  const value = await evaluate(parse(query), { dataset: SEED_DATASET, params });
  return (await value.get()) as T;
}

/**
 * Cached content query. One 'use cache' boundary for the whole site:
 * sanityFetch adds the per-document tags Sanity Live revalidates.
 *
 * Falls back to the seed content when the dataset doesn't have the
 * document yet, or Sanity can't be reached (local builds without network),
 * so a page never renders empty. Never in preview: there the editor sees
 * exactly what is in the dataset.
 */
async function cachedQuery<T>(query: string, params: Record<string, unknown>, mode: FetchMode): Promise<T> {
  "use cache";
  cacheTag(CONTENT_TAG);
  const preview = mode.perspective !== "published";
  try {
    const { data } = await sanityFetch({ query, params, perspective: mode.perspective, stega: mode.stega });
    if (!isEmpty(data) || preview) return data as T;
  } catch (error) {
    if (preview) throw error;
    console.warn(`[sanity] fetch failed, using seed content: ${(error as Error).message}`);
  }
  return fromSeed<T>(query, params);
}

/**
 * Fetch localized content. Every query gets `$locale` (with Romanian as the
 * fallback inside the query, see queries.ts).
 */
export function getContent<T>(query: string, locale: Locale, mode: FetchMode = PUBLISHED, params: Record<string, unknown> = {}) {
  return cachedQuery<T>(query, { ...params, locale }, mode);
}

import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";
import { apiVersion, dataset, projectId } from "../env";

/**
 * Sanity Live: `sanityFetch` tags every cached query with the documents it
 * read, and `<SanityLive />` (in the [locale] layout) revalidates exactly
 * those when something is published, so pages refresh without a redeploy.
 *
 * Strict mode: callers pass `perspective` and `stega` themselves, resolved
 * from draftMode() outside the cache boundary (see fetch.ts).
 * SANITY_API_READ_TOKEN (Viewer) is only needed to read drafts in preview.
 */
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { studioUrl: "/admin" },
});

const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
  strict: true,
});

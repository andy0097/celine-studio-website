/**
 * Sanity connection settings. The project id and dataset are public (they
 * ship to the browser anyway), so they default to the live project when the
 * environment doesn't set them, e.g. on a Vercel preview without the vars.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "abej04l7";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-01";

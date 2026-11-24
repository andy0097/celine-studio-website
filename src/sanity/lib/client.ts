import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/** Read-only client for the website (published content, CDN). */
export const client = createClient({ projectId, dataset, apiVersion, useCdn: true });

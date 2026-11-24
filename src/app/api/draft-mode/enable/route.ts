import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";

/**
 * Turns on draft mode for the live preview. The Presentation tool in /admin
 * calls this with a secret it checks against Sanity, so only signed-in
 * editors can see drafts. Needs SANITY_API_READ_TOKEN (a Viewer token).
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});

/**
 * Sanity Studio at /admin. Every Studio URL (/admin/structure, /admin/…)
 * lands here; the Studio does its own routing in the browser.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export { metadata, viewport } from "next-sanity/studio";

export default function AdminPage() {
  return <NextStudio config={config} />;
}

import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";
import { routing } from "@/i18n/routing";

/**
 * Live preview (Presentation tool): which site URLs show which document.
 * - mainDocuments: opening a URL in the preview opens its document beside it.
 * - locations: a document shows "Used on" links to the pages it appears on.
 * URLs follow next-intl: Romanian at the root with Romanian slugs, English
 * under /en (src/i18n/routing.ts).
 */

type Pathname = keyof typeof routing.pathnames;

/** Public URL of an internal route, per language. */
function href(path: Pathname, locale: "ro" | "en"): string {
  const entry = routing.pathnames[path];
  const localized = typeof entry === "string" ? entry : entry[locale];
  return locale === "ro" ? localized : `/en${localized === "/" ? "" : localized}`;
}

/** Page singletons: document id = type name. */
const PAGES: { type: string; path: Pathname; title: string }[] = [
  { type: "homePage", path: "/", title: "Home" },
  { type: "residentialPage", path: "/residential", title: "Residential" },
  { type: "horecaPage", path: "/horeca", title: "HORECA" },
  { type: "processPage", path: "/process", title: "Process" },
  { type: "studioPage", path: "/studio", title: "Studio" },
  { type: "onSitePage", path: "/on-site-consultancy", title: "On-site consultancy" },
  { type: "bookPage", path: "/book-a-consultation", title: "Book a consultation" },
  { type: "privacyPage", path: "/privacy", title: "Privacy policy" },
];

/** Case-study URLs: /proiecte/<ro slug> and /en/projects/<en slug>. */
const CASE_STUDY_BASE = { ro: "/proiecte", en: "/en/projects" } as const;

const both = (path: Pathname, title: string) => [
  { title: `${title} (RO)`, href: href(path, "ro") },
  { title: `${title} (EN)`, href: href(path, "en") },
];

export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    ...PAGES.flatMap((p) =>
      (["ro", "en"] as const).map((locale) => ({ route: href(p.path, locale), filter: `_id == "${p.type}"` })),
    ),
    { route: `${CASE_STUDY_BASE.ro}/:slug`, filter: `_type == "caseStudy" && slug.ro.current == $slug` },
    { route: `${CASE_STUDY_BASE.en}/:slug`, filter: `_type == "caseStudy" && slug.en.current == $slug` },
  ]),
  locations: {
    ...Object.fromEntries(PAGES.map((p) => [p.type, { locations: both(p.path, p.title) }])),
    caseStudy: defineLocations({
      select: { title: "title.ro", ro: "slug.ro.current", en: "slug.en.current", category: "category" },
      resolve: (doc) => {
        if (!doc) return null;
        const list = doc.category === "horeca" ? both("/horeca", "HORECA") : both("/residential", "Residential");
        return {
          locations: [
            ...(doc.ro ? [{ title: `${doc.title ?? "Case study"} (RO)`, href: `${CASE_STUDY_BASE.ro}/${doc.ro}` }] : []),
            ...(doc.en ? [{ title: `${doc.title ?? "Case study"} (EN)`, href: `${CASE_STUDY_BASE.en}/${doc.en}` }] : []),
            ...list,
          ],
        };
      },
    }),
    // Shared content: shown on every page (footer, CTA) or picked by pages.
    siteSettings: { message: "Used on every page (contact, closing CTA, footer).", tone: "positive", locations: both("/", "Home") },
  },
};

import { defineRouting } from "next-intl/routing";

/**
 * Languages and URLs.
 * - Romanian is the default and lives at the root (celinestudio.ro/proiecte/…);
 *   English is under /en (celinestudio.ro/en/projects/…).
 * - Every page has a translated slug. The keys below are the internal paths
 *   (the folders under src/app/[locale]); links in code always use these keys
 *   (see ROUTES in i18n/links.ts), and next-intl writes the right URL.
 * Adding a page: add its key here with both slugs.
 */
export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/residential": { ro: "/rezidential", en: "/residential" },
    "/horeca": "/horeca",
    // Case studies: the slug is translated too (caseStudy.slug.ro / .en in Sanity).
    "/projects/[slug]": { ro: "/proiecte/[slug]", en: "/projects/[slug]" },
    "/process": { ro: "/proces", en: "/process" },
    "/studio": "/studio",
    "/book-a-consultation": { ro: "/programeaza-o-consultanta", en: "/book-a-consultation" },
    "/on-site-consultancy": { ro: "/consultanta-pe-santier", en: "/on-site-consultancy" },
    "/privacy": { ro: "/confidentialitate", en: "/privacy" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

/** Static pages (no params): what ROUTES, the nav and Sanity page links point at. */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;

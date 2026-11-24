import { defineRouting } from "next-intl/routing";

/**
 * Languages and URLs.
 * - Romanian is the default and lives at the root (celinestudio.ro/proiecte/…);
 *   English is under /en (celinestudio.ro/en/projects/…).
 * - Every page has a translated slug. The keys below are the internal paths
 *   (the folders under src/app/[locale]); links in code always use these keys
 *   (see ROUTES in content/site.ts), and next-intl writes the right URL.
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
    "/projects/apartment-oradea": { ro: "/proiecte/apartament-oradea", en: "/projects/apartment-oradea" },
    "/projects/street-coffee": { ro: "/proiecte/street-coffee", en: "/projects/street-coffee" },
    "/process": { ro: "/proces", en: "/process" },
    "/studio": "/studio",
    "/book-a-consultation": { ro: "/programeaza-o-consultanta", en: "/book-a-consultation" },
    "/on-site-consultancy": { ro: "/consultanta-pe-santier", en: "/on-site-consultancy" },
    "/privacy": { ro: "/confidentialitate", en: "/privacy" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

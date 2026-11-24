import type { AppPathname } from "@/i18n/routing";

/**
 * Site-wide routes and navigation. Routes are the internal paths (keys of
 * the `pathnames` in i18n/routing.ts); the locale-aware Link turns them into
 * the right URL per language (/proiecte/… in Romanian, /en/projects/… in
 * English). The nav is the same on every page (Home builds it into the
 * hero; inner pages use SiteHeader). Labels come from messages/<locale>.json.
 */
export const ROUTES = {
  home: "/",
  residential: "/residential",
  horeca: "/horeca",
  apartmentOradea: "/projects/apartment-oradea",
  streetCoffee: "/projects/street-coffee",
  process: "/process",
  studio: "/studio",
  book: "/book-a-consultation",
  onSite: "/on-site-consultancy",
  privacy: "/privacy",
} as const satisfies Record<string, AppPathname>;

/** `key` is the label's key in messages (Nav.<key>). */
export const NAV = [
  { key: "projects", href: ROUTES.residential },
  { key: "process", href: ROUTES.process },
  { key: "studio", href: ROUTES.studio },
  { key: "contact", href: ROUTES.book },
] as const;

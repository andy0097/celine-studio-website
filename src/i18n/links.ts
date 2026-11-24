import type { ComponentProps } from "react";
import type { Link } from "./navigation";
import type { StaticPathname } from "./routing";

/** Anything the locale-aware Link accepts: a static route or a case study. */
export type Href = ComponentProps<typeof Link>["href"];

/**
 * Site routes and navigation. Routes are the internal paths (keys of the
 * `pathnames` in routing.ts); the locale-aware Link turns them into the
 * right URL per language (/proiecte/… in Romanian, /en/projects/… in
 * English). The nav is the same on every page (Home builds it into the hero;
 * inner pages use SiteHeader). Labels come from messages/<locale>.json.
 */
export const ROUTES = {
  home: "/",
  residential: "/residential",
  horeca: "/horeca",
  process: "/process",
  studio: "/studio",
  book: "/book-a-consultation",
  onSite: "/on-site-consultancy",
  privacy: "/privacy",
} as const satisfies Record<string, StaticPathname>;

/** `key` is the label's key in messages (Nav.<key>). */
export const NAV = [
  { key: "projects", href: ROUTES.residential },
  { key: "process", href: ROUTES.process },
  { key: "studio", href: ROUTES.studio },
  { key: "contact", href: ROUTES.book },
] as const;

/** A case study's page, by its slug in the current language. */
export function caseStudyHref(slug: string): Href {
  return { pathname: "/projects/[slug]", params: { slug } };
}

/** A case-study link, or null while it has no page of its own. */
export function caseLink(c: { slug: string; hasPage: boolean } | { s: string; p: boolean } | null | undefined): Href | null {
  if (!c) return null;
  return "slug" in c ? (c.hasPage ? caseStudyHref(c.slug) : null) : c.p ? caseStudyHref(c.s) : null;
}

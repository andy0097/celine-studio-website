import type { Metadata } from "next";
import { getPathname } from "./navigation";
import { routing, type Locale } from "./routing";
import type { Href } from "./links";

/** The production origin, for canonical and hreflang URLs. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://celinestudio.ro";

/** Absolute URL of a page in one language. */
export function pageUrl(href: Href, locale: Locale) {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

/** A page's href, or one per language when its slug is translated (case studies). */
export type PageHref = Href | ((locale: Locale) => Href);
const hrefIn = (href: PageHref, locale: Locale) => (typeof href === "function" ? href(locale) : href);

/**
 * Metadata for a page in one language: title, description, canonical URL and
 * hreflang links to its other-language version (x-default = Romanian).
 */
export function pageMetadata(
  href: PageHref,
  locale: Locale,
  text: { title: string; description: string },
): Metadata {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = pageUrl(hrefIn(href, l), l);
  languages["x-default"] = pageUrl(hrefIn(href, routing.defaultLocale), routing.defaultLocale);
  return {
    title: text.title,
    description: text.description,
    alternates: { canonical: pageUrl(hrefIn(href, locale), locale), languages },
    openGraph: { title: text.title, description: text.description, locale, url: pageUrl(hrefIn(href, locale), locale) },
  };
}

import type { Metadata } from "next";
import { getPathname } from "./navigation";
import { routing, type AppPathname, type Locale } from "./routing";

/** The production origin, for canonical and hreflang URLs. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://celinestudio.ro";

/** Absolute URL of a page in one language. */
export function pageUrl(href: AppPathname, locale: Locale) {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

/**
 * Metadata for a page in one language: title, description, canonical URL and
 * hreflang links to its other-language version (x-default = Romanian).
 */
export function pageMetadata(
  href: AppPathname,
  locale: Locale,
  text: { title: string; description: string },
): Metadata {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = pageUrl(href, l);
  languages["x-default"] = pageUrl(href, routing.defaultLocale);
  return {
    title: text.title,
    description: text.description,
    alternates: { canonical: pageUrl(href, locale), languages },
    openGraph: { title: text.title, description: text.description, locale, url: pageUrl(href, locale) },
  };
}

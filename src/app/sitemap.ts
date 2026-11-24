import type { MetadataRoute } from "next";
import { routing, type Locale, type StaticPathname } from "@/i18n/routing";
import { caseStudyHref, type Href } from "@/i18n/links";
import { pageUrl } from "@/i18n/metadata";
import { getContent } from "@/sanity/lib/fetch";
import { CASE_STUDY_SLUGS_QUERY } from "@/sanity/lib/queries";

type Entry = { href: (locale: Locale) => Href; priority: number };

/** Every page in both languages, each listing its other-language version; case studies from Sanity. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = (Object.keys(routing.pathnames) as string[]).filter((p) => !p.includes("[")) as StaticPathname[];
  const cases = (await getContent<{ ro: string; en: string }[]>(CASE_STUDY_SLUGS_QUERY, routing.defaultLocale)) ?? [];
  const entries: Entry[] = [
    ...statics.map((p) => ({ href: () => p, priority: p === "/" ? 1 : 0.7 })),
    ...cases.map((c) => ({ href: (l: Locale) => caseStudyHref(l === "en" ? c.en : c.ro), priority: 0.6 })),
  ];
  return entries.flatMap(({ href, priority }) =>
    routing.locales.map((locale) => ({
      url: pageUrl(href(locale), locale),
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, pageUrl(href(l), l)])) },
    })),
  );
}

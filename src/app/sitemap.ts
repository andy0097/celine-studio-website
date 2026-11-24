import type { MetadataRoute } from "next";
import { routing, type AppPathname } from "@/i18n/routing";
import { pageUrl } from "@/i18n/metadata";

/** Every page in both languages, each listing its other-language version. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = Object.keys(routing.pathnames) as AppPathname[];
  return paths.flatMap((href) =>
    routing.locales.map((locale) => ({
      url: pageUrl(href, locale),
      changeFrequency: "monthly" as const,
      priority: href === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, pageUrl(href, l)])),
      },
    })),
  );
}

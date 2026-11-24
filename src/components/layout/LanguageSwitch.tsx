"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import type { Href } from "@/i18n/links";
import { useAlternateSlugs } from "./AlternateSlugs";

/**
 * RO / EN switch for the nav: the current language plain, the other a link
 * to the same page in that language (translated slug). Provisional look —
 * the design task "design language switch in the nav" settles it.
 */
export default function LanguageSwitch({ className = "", ...rest }: { className?: string } & Record<`data-${string}`, string | boolean>) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Language");
  const params = useParams<{ slug?: string }>();
  const slugs = useAlternateSlugs();
  // Case studies: same page, the other language's slug.
  const hrefFor = (l: Locale): Href =>
    pathname === "/projects/[slug]"
      ? { pathname, params: { slug: slugs[l] ?? params.slug ?? "" } }
      : (pathname as Exclude<typeof pathname, "/projects/[slug]">);

  return (
    <span {...rest} className={`type-label flex items-center gap-space-2xs ${className}`}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-space-2xs">
          {i > 0 && <span aria-hidden>/</span>}
          {l === locale ? (
            <span aria-current="true">{l.toUpperCase()}</span>
          ) : (
            <Link href={hrefFor(l)} locale={l} hrefLang={l} aria-label={t("label")} className="opacity-50 transition-opacity hover:opacity-100">
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}

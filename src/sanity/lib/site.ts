import type { Metadata } from "next";
import { pageMetadata, type PageHref } from "@/i18n/metadata";
import { caseLink, ROUTES, type Href } from "@/i18n/links";
import type { Locale, StaticPathname } from "@/i18n/routing";
import type { FooterContent } from "@/components/footer/Footer";
import type { CaseStudyCard, Seo, Settings } from "./content-types";
import { getContent, type FetchMode } from "./fetch";
import { SETTINGS_QUERY } from "./queries";

/** Site settings (contact, stages, closing CTA, footer, default SEO). */
export function getSettings(locale: Locale, mode?: FetchMode) {
  return getContent<Settings>(SETTINGS_QUERY, locale, mode);
}

/** Props for the closing CTA (CtaConversation) from Site settings. */
export function ctaProps(settings: Settings) {
  const cta = settings.cta;
  return cta ? { title: cta.title, fig: cta.fig ?? "", cta: cta.buttonLabel } : {};
}

/** Where a case study links to: its page, or its category while it has none. */
export function cardHref(card: Pick<CaseStudyCard, "slug" | "hasPage" | "category">): Href {
  return caseLink(card) ?? (card.category === "horeca" ? ROUTES.horeca : ROUTES.residential);
}

const PAGE_LINKS: Record<string, StaticPathname> = Object.fromEntries(Object.values(ROUTES).map((r) => [r, r]));

/** The footer's props from Site settings. */
export function footerContent(settings: Settings): FooterContent {
  const f = settings.footer;
  return {
    contact: {
      email: settings.contact?.email ?? "",
      phone: settings.contact?.phone ?? null,
      address: settings.contact?.address ?? null,
    },
    projects: (f?.projects ?? []).filter(Boolean).map((p) => ({
      key: p._id,
      title: p.title,
      tag: p.category === "horeca" ? "horeca" : "res",
      href: cardHref(p),
    })),
    newsletterTitle: f?.newsletterTitle ?? "",
    newsletterText: f?.newsletterText ?? "",
    tagline: f?.tagline ?? "",
    legal: (f?.legalLinks ?? []).flatMap((l): FooterContent["legal"] => {
      if (l.kind === "external" && l.url) return [{ label: l.label, external: l.url }];
      if (l.kind === "caseStudy" && l.slug) return [{ label: l.label, href: caseLink({ s: l.slug, p: true })! }];
      if (l.kind === "page" && l.page && PAGE_LINKS[l.page]) return [{ label: l.label, href: PAGE_LINKS[l.page] }];
      return [];
    }),
  };
}

/** Page metadata from the page's own SEO fields, falling back to its title and the site defaults. */
export function seoMetadata(
  href: PageHref,
  locale: Locale,
  seo: Seo,
  fallback: { title?: string | null; description?: string | null; defaults?: Seo },
): Metadata {
  const title = seo?.title || (fallback.title ? `${fallback.title} — Celine Studio` : fallback.defaults?.title) || "Celine Studio";
  const description = seo?.description || fallback.description || fallback.defaults?.description || "";
  const meta = pageMetadata(href, locale, { title, description });
  const image = seo?.image || fallback.defaults?.image;
  if (image) meta.openGraph = { ...meta.openGraph, images: [{ url: image, width: 1200, height: 630 }] };
  return meta;
}

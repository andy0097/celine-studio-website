import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FaqSplit from "@/components/sections/FaqSplit";
import CtaConversation from "@/components/sections/CtaConversation";
import { Eyebrow } from "@/components/ui/labels";
import { ButtonLink } from "@/components/ui/links";
import { ROUTES } from "@/i18n/links";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { ON_SITE_QUERY } from "@/sanity/lib/queries";
import type { OnSiteContent } from "@/sanity/lib/content-types";
import { objectPosition } from "@/sanity/lib/image";
import { ctaProps, getSettings, seoMetadata } from "@/sanity/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/on-site-consultancy">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<OnSiteContent>(ON_SITE_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/on-site-consultancy", locale, page?.seo ?? null, { title: page?.hero?.eyebrow, description: page?.hero?.intro, defaults: settings?.seo });
}

/** Paper "On-Site Consultancy — A Editorial". */
export default async function OnSitePage({ params }: PageProps<"/[locale]/on-site-consultancy">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, settings, t] = await Promise.all([
    getContent<OnSiteContent>(ON_SITE_QUERY, locale, mode),
    getSettings(locale, mode),
    getTranslations("OnSite"),
  ]);
  const hero = page?.hero;
  // Duration and fee are kept in Site settings (also used by the booking page)
  const facts = [
    { label: t("duration"), value: settings?.onSite?.duration },
    { label: t("fee"), value: settings?.onSite?.fee },
  ].filter((f) => f.value);
  return (
    <PageShell>
      {/* 01 Hero, split */}
      <section className="container-page grid-12 items-start gap-y-space-3xl pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="col-span-12 flex flex-col gap-space-xl lg:col-span-7">
          <Eyebrow data-page-intro data-intro-item>{hero?.eyebrow}</Eyebrow>
          <h1 data-page-intro data-intro-lines className="type-heading max-w-[620px]">
            {hero?.title}
          </h1>
          <p data-page-intro data-intro-item className="type-link-list max-w-[440px] pt-space-md">
            {hero?.intro}
          </p>
          <div data-page-intro data-intro-item className="pt-space-md">
            <ButtonLink href={ROUTES.book}>{hero?.ctaLabel}</ButtonLink>
          </div>
        </div>
        <figure className="col-span-12 flex flex-col gap-space-md sm:col-span-8 lg:col-span-4 lg:col-start-9 lg:pt-[72px]">
          <div data-page-intro data-intro-media className="relative aspect-[396/520] overflow-clip">
            {hero?.image?.src && (
              <Image
                src={hero.image.src}
                alt={hero.image.alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 400px, 70vw"
                className="object-cover"
                style={{ objectPosition: objectPosition(hero.image) }}
              />
            )}
          </div>
          <figcaption data-page-intro data-intro-item className="type-label">{hero?.image?.caption}</figcaption>
        </figure>
      </section>

      {/* 02 How a visit works */}
      <section aria-labelledby="visit-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page flex flex-col gap-[56px]">
          <div className="flex flex-wrap items-end justify-between gap-space-xl">
            <h2 id="visit-title" data-lines className="type-heading-sm">{page?.visit?.title}</h2>
            <dl data-stagger className="flex gap-space-2xl pb-space-xs">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-[6px]">
                  <dt className="type-label text-ink-muted">{f.label}</dt>
                  <dd className="type-link-list">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ServicesGrid items={page?.visit?.steps ?? []} />
        </div>
      </section>

      {/* 03 FAQ, stone */}
      <FaqSplit stone title={page?.faq?.title ?? ""} items={(page?.faq?.items ?? []).filter(Boolean)} />

      {/* 04 CTA (as on Residential) */}
      <CtaConversation {...ctaProps(settings)} />
    </PageShell>
  );
}

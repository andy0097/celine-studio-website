import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import ProjectRows from "@/components/sections/ProjectRows";
import QuoteCentred from "@/components/sections/QuoteCentred";
import CtaConversation from "@/components/sections/CtaConversation";
import { DimensionLine } from "@/components/ui/drawing";
import { Eyebrow } from "@/components/ui/labels";
import { TextLink } from "@/components/ui/links";
import { ROUTES } from "@/i18n/links";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { RESIDENTIAL_QUERY } from "@/sanity/lib/queries";
import type { ResidentialContent } from "@/sanity/lib/content-types";
import { objectPosition } from "@/sanity/lib/image";
import { ctaProps, getSettings, seoMetadata } from "@/sanity/lib/site";
import { quoteProps } from "@/components/sections/quote";

export async function generateMetadata({ params }: PageProps<"/[locale]/residential">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<ResidentialContent>(RESIDENTIAL_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/residential", locale, page?.seo ?? null, { title: page?.hero?.title, description: page?.hero?.intro, defaults: settings?.seo });
}

/** Paper "Residential — A v2 (comments applied)". */
export default async function ResidentialPage({ params }: PageProps<"/[locale]/residential">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, settings] = await Promise.all([getContent<ResidentialContent>(RESIDENTIAL_QUERY, locale, mode), getSettings(locale, mode)]);
  const hero = page?.hero;
  const onSite = page?.onSite;
  return (
    <PageShell>
      {/* 01 Hero */}
      <section className="container-page pt-[calc(var(--header-h)+var(--spacing-space-4xl))]">
        <div className="flex flex-col gap-space-lg">
          <Eyebrow data-page-intro data-intro-item>{hero?.eyebrow}</Eyebrow>
          <h1 data-page-intro data-intro-lines className="type-display">
            {hero?.title}
          </h1>
        </div>

        <div className="grid-12 mt-[56px] gap-y-space-2xl">
          <p data-page-intro data-intro-item className="type-lead col-span-12 max-w-[560px] lg:col-span-6">
            {hero?.intro}
          </p>
          <div className="col-span-12 flex flex-col gap-space-xl lg:col-span-5 lg:col-start-8">
            <ol className="flex flex-col border-b border-dashed border-ink/20">
              {(hero?.services ?? []).map((s, i) => (
                <li
                  key={s}
                  data-page-intro
                  data-intro-item
                  className={`flex gap-space-lg border-t border-dashed py-[14px] ${i === 0 ? "border-ink/50" : "border-ink/20"}`}
                >
                  <span className="type-label w-space-xl shrink-0 leading-5 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="type-link-list">{s}</span>
                </li>
              ))}
            </ol>
            <div data-page-intro data-intro-item>
              <TextLink href={ROUTES.book}>{hero?.ctaLabel}</TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Hero image */}
      <section aria-label={hero?.image?.alt ?? undefined} className="pt-space-4xl">
        <div className="container-page">
          <div data-dim>
            <DimensionLine fig={hero?.image?.caption ?? ""} />
          </div>
        </div>
        <div data-wipe className="relative mt-[28px] aspect-[1440/712] min-h-[360px] w-full overflow-clip">
          <div data-parallax className="absolute inset-0">
            {hero?.image?.src && (
              <Image src={hero.image.src} alt={hero.image.alt ?? ""} fill sizes="100vw" className="object-cover" style={{ objectPosition: objectPosition(hero.image) }} />
            )}
          </div>
        </div>
      </section>

      {/* 03 Completed projects */}
      <section id="projects" aria-labelledby="completed-title" className="relative mt-space-4xl pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page flex flex-col gap-[72px]">
          <h2 id="completed-title" data-lines className="type-display">
            {page?.projects?.title}
          </h2>
          <ProjectRows projects={(page?.projects?.items ?? []).filter(Boolean)} />
        </div>
      </section>

      {/* 04 On-site consultancy, full bleed */}
      <section
        data-tone="dark"
        aria-labelledby="onsite-title"
        className="relative flex min-h-[640px] items-end overflow-clip py-space-4xl text-surface lg:h-[820px]"
      >
        <div data-parallax className="absolute inset-0">
          {onSite?.image?.src && (
            <Image src={onSite.image.src} alt={onSite.image.alt ?? ""} fill sizes="100vw" className="object-cover" style={{ objectPosition: objectPosition(onSite.image) }} />
          )}
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#1916189e_0%,#1916184d_55%,#19161861_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 [--guide-color:var(--color-line-on-dark)]">
          <span data-line-y className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)] origin-top" />
          <span data-line-y className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)] origin-top" />
        </div>
        <div className="container-page relative grid-12 items-end gap-y-space-2xl">
          <h2 id="onsite-title" data-lines className="type-display col-span-12 lg:col-span-9 lg:leading-[0.872]">
            {onSite?.title}
          </h2>
          <div data-stagger className="col-span-12 flex max-w-[320px] flex-col gap-space-lg text-on-dark lg:col-span-3 lg:col-start-10">
            <p className="type-body">{onSite?.text}</p>
            <TextLink href={ROUTES.onSite}>{onSite?.ctaLabel}</TextLink>
          </div>
        </div>
      </section>

      {/* 05 Testimonial */}
      {page?.testimonial && <QuoteCentred {...quoteProps(page.testimonial)} />}

      {/* 06 CTA */}
      <CtaConversation {...ctaProps(settings)} />
    </PageShell>
  );
}

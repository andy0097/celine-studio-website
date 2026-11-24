import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import VenueCard from "@/components/sections/VenueCard";
import ServicesGrid from "@/components/sections/ServicesGrid";
import QuoteDisplay from "@/components/sections/QuoteDisplay";
import CtaConversation from "@/components/sections/CtaConversation";
import { quoteProps } from "@/components/sections/quote";
import { Eyebrow } from "@/components/ui/labels";
import { TextLink } from "@/components/ui/links";
import { caseLink, ROUTES } from "@/i18n/links";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { HORECA_QUERY } from "@/sanity/lib/queries";
import type { HorecaContent } from "@/sanity/lib/content-types";
import { NO_IMAGE, objectPosition, toImage } from "@/sanity/lib/image";
import { ctaProps, getSettings, seoMetadata } from "@/sanity/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/horeca">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<HorecaContent>(HORECA_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/horeca", locale, page?.seo ?? null, { title: page?.hero?.title, description: page?.hero?.text, defaults: settings?.seo });
}

/** Paper "HORECA — A Editorial". */
export default async function HorecaPage({ params }: PageProps<"/[locale]/horeca">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, settings] = await Promise.all([getContent<HorecaContent>(HORECA_QUERY, locale, mode), getSettings(locale, mode)]);
  const hero = page?.hero;
  // Masonry: even venues in the left column, odd ones in the right (offset down)
  const venues = (page?.venues?.items ?? []).map((v) => ({
    key: v._key,
    title: v.title,
    href: caseLink(v.slug),
    ratio: v.tall ? "aspect-[584/620]" : "aspect-[584/400]",
    image: toImage(v.image) ?? NO_IMAGE,
  }));
  const columns = [venues.filter((_, i) => i % 2 === 0), venues.filter((_, i) => i % 2 === 1)];
  const quote = page?.testimonial?.item;
  return (
    <PageShell>
      {/* 01 Hero: title + portrait */}
      <section className="container-page grid-12 items-end gap-y-space-3xl pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="col-span-12 flex flex-col gap-[56px] lg:col-span-7">
          <div className="flex flex-col gap-space-lg">
            <Eyebrow data-page-intro data-intro-item>{hero?.eyebrow}</Eyebrow>
            <h1 data-page-intro data-intro-lines className="type-display">{hero?.title}</h1>
          </div>
          <p data-page-intro data-intro-item className="type-lead max-w-[480px]">{hero?.intro}</p>
          <p data-page-intro data-intro-item className="type-body max-w-[460px]">{hero?.text}</p>
          <div data-page-intro data-intro-item>
            <TextLink href={ROUTES.book}>{hero?.ctaLabel}</TextLink>
          </div>
        </div>
        <figure className="col-span-12 flex w-full max-w-[440px] flex-col gap-space-md sm:col-span-8 lg:col-span-5 lg:col-start-8 lg:justify-self-end">
          <div data-page-intro data-intro-media className="relative aspect-[440/620] overflow-clip">
            {hero?.image?.src && (
              <Image
                src={hero.image.src}
                alt={hero.image.alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 420px, 70vw"
                className="object-cover"
                style={{ objectPosition: objectPosition(hero.image) }}
              />
            )}
          </div>
          <figcaption data-page-intro data-intro-item className="flex justify-between gap-space-md">
            <span className="type-label">{hero?.image?.caption}</span>
            <span className="type-label text-ink-muted">{hero?.imageNote}</span>
          </figcaption>
        </figure>
      </section>

      {/* 02 Venues, masonry */}
      <section aria-labelledby="venues-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page flex flex-col gap-space-3xl">
          <div className="flex flex-wrap items-end justify-between gap-space-md">
            <h2 id="venues-title" data-lines className="type-display">{page?.venues?.title}</h2>
            <p data-fade className="type-label pb-space-md text-ink-muted">{page?.venues?.note}</p>
          </div>
          <div className="grid-12 gap-y-[40px]">
            {columns.map((column, c) => (
              <div key={c} className={`col-span-12 flex flex-col gap-[40px] lg:col-span-6 ${c === 1 ? "lg:pt-[160px]" : ""}`}>
                {column.map(({ key, ...venue }) => (
                  <VenueCard key={key} {...venue} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 What's included */}
      <section aria-labelledby="included-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-space-xl pb-space-3xl">
            <h2 id="included-title" data-lines className="type-heading">{page?.services?.title}</h2>
            <p data-fade className="type-body max-w-[340px] pb-space-xs">{page?.services?.text}</p>
          </div>
          <ServicesGrid items={settings?.services ?? []} />
        </div>
      </section>

      {/* 04 Testimonial, stone */}
      {quote && <QuoteDisplay stone eyebrow={page?.testimonial?.eyebrow ?? ""} {...quoteProps(quote)} />}

      {/* 05 CTA (as on Residential) */}
      <CtaConversation {...ctaProps(settings)} />
    </PageShell>
  );
}

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import VenueCard from "@/components/sections/VenueCard";
import ServicesGrid from "@/components/sections/ServicesGrid";
import QuoteDisplay from "@/components/sections/QuoteDisplay";
import CtaConversation from "@/components/sections/CtaConversation";
import { Eyebrow } from "@/components/ui/labels";
import { TextLink } from "@/components/ui/links";
import { ROUTES } from "@/content/site";
import { HORECA } from "@/content/horeca";

export async function generateMetadata({ params }: PageProps<"/[locale]/horeca">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/horeca", locale as Locale, {
    title: "HORECA — Celine Studio",
    description: "Cafés, restaurants and hotels planned around how service really runs — guest flow, staff routes, peak hours — and built to be remembered.",
  });
}

/** Paper "HORECA — A Editorial". */
export default async function HorecaPage({ params }: PageProps<"/[locale]/horeca">) {
  setRequestLocale((await params).locale as Locale);
  const [v0, v1, v2, v3] = HORECA.venues;
  return (
    <PageShell>
      {/* 01 Hero: title + portrait */}
      <section className="container-page grid-12 items-end gap-y-space-3xl pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="col-span-12 flex flex-col gap-[56px] lg:col-span-7">
          <div className="flex flex-col gap-space-lg">
            <Eyebrow data-page-intro data-intro-item>Projects / HORECA</Eyebrow>
            <h1 data-page-intro data-intro-lines className="type-display">HORECA</h1>
          </div>
          <p data-page-intro data-intro-item className="type-lead max-w-[480px]">A space as unique as your idea.</p>
          <p data-page-intro data-intro-item className="type-body max-w-[460px]">
            Cafés, restaurants and hotels planned around how service really runs — guest flow, staff routes, peak hours — and built to be remembered.
          </p>
          <div data-page-intro data-intro-item>
            <TextLink href={ROUTES.book}>Book a consultation</TextLink>
          </div>
        </div>
        <figure className="col-span-12 flex w-full max-w-[440px] flex-col gap-space-md sm:col-span-8 lg:col-span-5 lg:col-start-8 lg:justify-self-end">
          <div data-page-intro data-intro-media className="relative aspect-[440/620] overflow-clip">
            <Image src={HORECA.hero.image.src} alt={HORECA.hero.image.alt} fill priority sizes="(min-width: 1024px) 420px, 70vw" className="object-cover" />
          </div>
          <figcaption data-page-intro data-intro-item className="flex justify-between gap-space-md">
            <span className="type-label">FIG. 01 — Custom fixture</span>
            <span className="type-label text-ink-muted">Street Coffee, Oradea</span>
          </figcaption>
        </figure>
      </section>

      {/* 02 Venues, masonry */}
      <section aria-labelledby="venues-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page flex flex-col gap-space-3xl">
          <div className="flex flex-wrap items-end justify-between gap-space-md">
            <h2 id="venues-title" data-lines className="type-display">Venues</h2>
            <p data-fade className="type-label pb-space-md text-ink-muted">Cafés — Restaurants — Hotels</p>
          </div>
          <div className="grid-12 gap-y-[40px]">
            <div className="col-span-12 flex flex-col gap-[40px] lg:col-span-6">
              <VenueCard {...v0} />
              <VenueCard {...v2} />
            </div>
            <div className="col-span-12 flex flex-col gap-[40px] lg:col-span-6 lg:pt-[160px]">
              <VenueCard {...v1} />
              <VenueCard {...v3} />
            </div>
          </div>
        </div>
      </section>

      {/* 03 What's included */}
      <section aria-labelledby="included-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-space-xl pb-space-3xl">
            <h2 id="included-title" data-lines className="type-heading">What’s included</h2>
            <p data-fade className="type-body max-w-[340px] pb-space-xs">Six stages. You see what you get at each one before you sign.</p>
          </div>
          <ServicesGrid />
        </div>
      </section>

      {/* 04 Testimonial, stone */}
      <QuoteDisplay stone {...HORECA.testimonial} />

      {/* 05 CTA (as on Residential) */}
      <CtaConversation />
    </PageShell>
  );
}

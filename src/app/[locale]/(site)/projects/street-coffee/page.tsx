import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import SpecRow from "@/components/sections/SpecRow";
import SplitHeading from "@/components/sections/SplitHeading";
import FourColumns from "@/components/sections/FourColumns";
import ServicesGrid from "@/components/sections/ServicesGrid";
import QuoteDisplay from "@/components/sections/QuoteDisplay";
import NextProject from "@/components/sections/NextProject";
import CtaConversation from "@/components/sections/CtaConversation";
import { Eyebrow } from "@/components/ui/labels";
import { STREET_COFFEE as SC } from "@/content/street-coffee";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/street-coffee">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/projects/street-coffee", locale as Locale, {
    title: "Street Coffee — Celine Studio",
    description: SC.lead,
  });
}

/** Paper "Project · Street Coffee — A Editorial". */
export default async function StreetCoffeePage({ params }: PageProps<"/[locale]/projects/street-coffee">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <PageShell>
      {/* 01 Project hero */}
      <section className="container-page flex flex-col gap-space-3xl pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-[72px]">
        <div className="grid-12 items-end gap-y-space-xl">
          <div className="col-span-12 flex flex-col gap-space-lg lg:col-span-7">
            <Eyebrow data-page-intro data-intro-item>{SC.breadcrumb}</Eyebrow>
            <h1 data-page-intro data-intro-lines className="type-display">
              {SC.title[0]}
              <br />
              {SC.title[1]}
            </h1>
          </div>
          <p data-page-intro data-intro-item className="type-lead col-span-12 max-w-[440px] pb-space-sm lg:col-span-5 lg:col-start-8 lg:justify-self-end">
            {SC.lead}
          </p>
        </div>
        <SpecRow specs={SC.specs} />
      </section>

      {/* 02 Full-bleed image */}
      <section aria-label="The custom light fixture" data-page-intro data-intro-media className="relative aspect-[1440/860] max-h-[100svh] min-h-[380px] w-full overflow-clip">
        <div data-parallax className="absolute inset-0">
          <Image src={SC.hero.src} alt={SC.hero.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: SC.hero.position }} />
        </div>
      </section>

      {/* 03 Business value */}
      <section aria-labelledby="value-title" className="container-page py-space-5xl">
        <SplitHeading id="value-title" eyebrow={SC.value.eyebrow} title={SC.value.title} text={SC.value.text} />
        <FourColumns
          cells={SC.value.items.map((item, i) => (
            <>
              <span className="type-label text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="type-body">{item.title}</h3>
              <p className="type-link-list text-ink-muted">{item.text}</p>
            </>
          ))}
        />
      </section>

      {/* 04 Results, stone */}
      <section aria-labelledby="results-title" className="relative bg-surface-alt py-space-5xl">
        <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
        <div className="container-page">
          <SplitHeading id="results-title" eyebrow={SC.results.eyebrow} eyebrowClass="text-ink" title={SC.results.title} text={SC.results.text} />
          <FourColumns
            strong
            cells={SC.results.items.map((item) => (
              <>
                <span className="type-heading-sm whitespace-pre">{item.value}</span>
                <span className="type-label pt-space-xs">{item.label}</span>
              </>
            ))}
          />
        </div>
      </section>

      {/* 05 Gallery */}
      <section aria-label="Gallery" className="container-page py-space-5xl">
        <ul className="grid-12 gap-y-space-lg">
          {SC.gallery.map((img) => (
            <li key={img.src} className={`col-span-12 ${img.wide ? "sm:col-span-8" : "sm:col-span-4"}`}>
              <div data-wipe className="relative aspect-[400/520] overflow-clip bg-surface-alt sm:h-[min(520px,60vw)] sm:aspect-auto">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 66vw, 100vw" className="object-cover" style={{ objectPosition: img.position }} />
              </div>
            </li>
          ))}
        </ul>
        <p data-fade className="type-label pt-space-lg text-ink-muted">{SC.galleryNote}</p>
      </section>

      {/* 06 Everything included */}
      <section aria-labelledby="included-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page">
          <SplitHeading
            id="included-title"
            title="Everything included"
            titleClass="type-heading"
            titleWidth="max-w-none"
            text="Six stages. You see what you get at each one before you sign."
          />
          <ServicesGrid />
        </div>
      </section>

      {/* 07 Testimonial */}
      <QuoteDisplay {...SC.testimonial} />

      {/* 08 Next project */}
      <NextProject {...SC.next} />

      {/* 09 CTA (as on Residential) */}
      <CtaConversation />
    </PageShell>
  );
}

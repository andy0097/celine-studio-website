import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import SpecRow from "@/components/sections/SpecRow";
import NumberedList from "@/components/sections/NumberedList";
import NextProject from "@/components/sections/NextProject";
import CtaConversation from "@/components/sections/CtaConversation";
import SketchImage from "@/components/ui/SketchImage";
import { Eyebrow } from "@/components/ui/labels";
import { APARTMENT } from "@/content/apartment-oradea";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/apartment-oradea">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/projects/apartment-oradea", locale as Locale, {
    title: "Apartment, Oradea — Celine Studio",
    description: APARTMENT.lead,
  });
}

/* Asymmetric gallery on the 12 columns (desktop): wide + portrait aligned at
   the bottom, then a portrait set in by two columns and a landscape. */
const GALLERY_LAYOUT = [
  { cell: "lg:col-span-8 lg:self-end", ratio: "aspect-[768/520]" },
  { cell: "lg:col-span-4 lg:self-end", ratio: "aspect-[4/5]" },
  { cell: "lg:col-span-4 lg:col-start-3 lg:mt-[56px]", ratio: "aspect-[4/5]" },
  { cell: "lg:col-span-6 lg:mt-[56px]", ratio: "aspect-[568/420]" },
];

/** Paper "Project · Apartment Oradea — A Editorial". */
export default async function ApartmentOradeaPage({ params }: PageProps<"/[locale]/projects/apartment-oradea">) {
  setRequestLocale((await params).locale as Locale);
  const { concept } = APARTMENT;
  return (
    <PageShell>
      {/* 01 Project hero */}
      <section className="container-page flex flex-col gap-space-3xl pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-[72px]">
        <div className="grid-12 items-end gap-y-space-xl">
          <div className="col-span-12 flex flex-col gap-space-lg lg:col-span-8">
            <Eyebrow data-page-intro data-intro-item>{APARTMENT.breadcrumb}</Eyebrow>
            <h1 data-page-intro data-intro-lines className="type-display">
              {APARTMENT.title[0]}
              <br />
              {APARTMENT.title[1]}
            </h1>
          </div>
          <p data-page-intro data-intro-item className="type-lead col-span-12 max-w-[380px] pb-space-sm lg:col-span-4 lg:col-start-9">
            {APARTMENT.lead}
          </p>
        </div>
        <SpecRow specs={APARTMENT.specs} />
      </section>

      {/* 02 Full-bleed image */}
      <section aria-label="Living room" data-page-intro data-intro-media className="relative aspect-[1440/860] max-h-[100svh] min-h-[380px] w-full overflow-clip">
        <div data-parallax className="absolute inset-0">
          <Image src={APARTMENT.hero.src} alt={APARTMENT.hero.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: APARTMENT.hero.position }} />
        </div>
      </section>

      {/* 03 Concept */}
      <section aria-labelledby="concept-title" className="container-page grid-12 gap-y-space-4xl py-space-5xl">
        <div className="col-span-12 flex flex-col gap-[40px] lg:col-span-7">
          <Eyebrow data-fade>{concept.eyebrow}</Eyebrow>
          <h2 id="concept-title" data-lines className="type-heading-sm max-w-[640px]">
            {concept.title}
          </h2>
          <p data-fade className="type-body max-w-[520px]">{concept.text}</p>
          <NumberedList items={concept.points} className="mt-space-md max-w-[584px]" />
        </div>
        <figure className="col-span-12 flex flex-col gap-space-md sm:col-span-8 lg:col-span-4 lg:col-start-9 lg:pt-[180px]">
          <div className="border border-dashed border-line p-[var(--inset-frame-padding)]">
            <div data-wipe className="relative aspect-[418/528] overflow-clip bg-surface">
              <Image src={concept.sketch.src} alt={concept.sketch.alt} fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover" style={{ objectPosition: "40% 50%" }} />
            </div>
          </div>
          <figcaption data-fade className="type-label-caption">{concept.sketch.caption}</figcaption>
        </figure>
      </section>

      {/* 04 Gallery */}
      <section aria-labelledby="gallery-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page">
          <div className="flex flex-wrap justify-between gap-space-md pb-[64px]">
            <h2 id="gallery-title" className="type-label text-ink-muted">02 — Gallery</h2>
            <p className="type-label text-ink-muted max-lg:hidden">Hover a photo to see the sketch</p>
          </div>
          <ul className="grid-12 gap-y-space-2xl">
            {APARTMENT.gallery.map((item, i) => {
              const l = GALLERY_LAYOUT[i];
              return (
                <li key={item.caption} className={`col-span-12 ${l.cell}`}>
                  <figure tabIndex={item.image.sketch ? 0 : undefined} className="group flex flex-col gap-space-md outline-none">
                    <div data-wipe className={`relative overflow-clip bg-surface-alt ${l.ratio}`}>
                      <SketchImage image={item.image} sizes="(min-width: 1024px) 50vw, 100vw" />
                    </div>
                    <figcaption data-fade className="type-label">{item.caption}</figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 05 Next project */}
      <NextProject {...APARTMENT.next} />

      {/* 06 CTA (as on Residential) */}
      <CtaConversation />
    </PageShell>
  );
}

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
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
import { ROUTES } from "@/content/site";
import { RESIDENTIAL_PROJECTS, RESIDENTIAL_SERVICES, RESIDENTIAL_TESTIMONIAL } from "@/content/residential";

export async function generateMetadata({ params }: PageProps<"/[locale]/residential">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/residential", locale as Locale, {
    title: "Residential — Celine Studio",
    description: "Residential interior design: layouts around light and storage, furniture drawn to measure, site visits until the last shelf is in.",
  });
}

/** Paper "Residential — A v2 (comments applied)". */
export default async function ResidentialPage({ params }: PageProps<"/[locale]/residential">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <PageShell>
      {/* 01 Hero */}
      <section className="container-page pt-[calc(var(--header-h)+var(--spacing-space-4xl))]">
        <div className="flex flex-col gap-space-lg">
          <Eyebrow data-page-intro data-intro-item>Projects / Residential</Eyebrow>
          <h1 data-page-intro data-intro-lines className="type-display">
            Residential
          </h1>
        </div>

        <div className="grid-12 mt-[56px] gap-y-space-2xl">
          <p data-page-intro data-intro-item className="type-lead col-span-12 max-w-[560px] lg:col-span-6">
            Every project starts with the way you live.
          </p>
          <div className="col-span-12 flex flex-col gap-space-xl lg:col-span-5 lg:col-start-8">
            <ol aria-label="What's included" className="flex flex-col border-b border-dashed border-ink/20">
              {RESIDENTIAL_SERVICES.map((s, i) => (
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
              <TextLink href={ROUTES.book}>Book a consultation</TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Hero image */}
      <section aria-label="Living room, Apartment Oradea" className="pt-space-4xl">
        <div className="container-page">
          <div data-dim>
            <DimensionLine fig="FIG. 01 — Living room, Apartment Oradea" />
          </div>
        </div>
        <div data-wipe className="relative mt-[28px] aspect-[1440/712] min-h-[360px] w-full overflow-clip">
          <div data-parallax className="absolute inset-0">
            <Image
              src="/images/hero/living-room.png"
              alt="Living room with a woven pendant light, low sectional sofa and round coffee tables, Apartment Oradea"
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "50% 60%" }}
            />
          </div>
        </div>
      </section>

      {/* 03 Completed projects */}
      <section id="projects" aria-labelledby="completed-title" className="relative mt-space-4xl pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page flex flex-col gap-[72px]">
          <h2 id="completed-title" data-lines className="type-display">
            Completed
            <br />
            projects
          </h2>
          <ProjectRows projects={RESIDENTIAL_PROJECTS} />
        </div>
      </section>

      {/* 04 On-site consultancy, full bleed */}
      <section
        data-tone="dark"
        aria-labelledby="onsite-title"
        className="relative flex min-h-[640px] items-end overflow-clip py-space-4xl text-surface lg:h-[820px]"
      >
        <div data-parallax className="absolute inset-0">
          <Image
            src="/images/custom-elements/staircase.png"
            alt="Curved plaster staircase with oak treads beside an indoor tree, decided on site"
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "50% 40%" }}
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#1916189e_0%,#1916184d_55%,#19161861_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 [--guide-color:var(--color-line-on-dark)]">
          <span data-line-y className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)] origin-top" />
          <span data-line-y className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)] origin-top" />
        </div>
        <div className="container-page relative grid-12 items-end gap-y-space-2xl">
          <h2 id="onsite-title" data-lines className="type-display col-span-12 lg:col-span-9 lg:leading-[0.872]">
            Just need advice on your build site?
          </h2>
          <div data-stagger className="col-span-12 flex max-w-[320px] flex-col gap-space-lg text-on-dark lg:col-span-3 lg:col-start-10">
            <p className="type-body">Layouts, finishes and lighting decided on the spot, while the work is still open.</p>
            <TextLink href={ROUTES.onSite}>Schedule a site visit</TextLink>
          </div>
        </div>
      </section>

      {/* 05 Testimonial */}
      <QuoteCentred {...RESIDENTIAL_TESTIMONIAL} />

      {/* 06 CTA */}
      <CtaConversation />
    </PageShell>
  );
}

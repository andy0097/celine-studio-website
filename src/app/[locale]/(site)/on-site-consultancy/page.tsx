import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FaqSplit from "@/components/sections/FaqSplit";
import CtaConversation from "@/components/sections/CtaConversation";
import { Eyebrow } from "@/components/ui/labels";
import { ButtonLink } from "@/components/ui/links";
import { ROUTES } from "@/content/site";
import { ONSITE_FAQ } from "@/content/faq";

export async function generateMetadata({ params }: PageProps<"/[locale]/on-site-consultancy">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/on-site-consultancy", locale as Locale, {
    title: "On-site consultancy — Celine Studio",
    description: "Not ready for a full design? A designer comes to the site and helps you decide layouts, finishes and lighting on the spot.",
  });
}

/* Placeholders: duration and fee. */
const FACTS = [
  { label: "Duration", value: "XX hours" },
  { label: "Fee", value: "XXX lei" },
];

const VISIT = [
  { title: "Before", text: "Send us photos, plans and your questions so the visit is spent on decisions." },
  { title: "On site", text: "We walk the space with you — and your builder if you like — and settle each question." },
  { title: "After", text: "A written summary of every decision, with sketches where they help." },
];

/** Paper "On-Site Consultancy — A Editorial". */
export default async function OnSitePage({ params }: PageProps<"/[locale]/on-site-consultancy">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <PageShell>
      {/* 01 Hero, split */}
      <section className="container-page grid-12 items-start gap-y-space-3xl pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="col-span-12 flex flex-col gap-space-xl lg:col-span-7">
          <Eyebrow data-page-intro data-intro-item>On-site consultancy</Eyebrow>
          <h1 data-page-intro data-intro-lines className="type-heading max-w-[620px]">
            Advice on your build site, while the work is open
          </h1>
          <p data-page-intro data-intro-item className="type-link-list max-w-[440px] pt-space-md">
            Not ready for a full design? A designer comes to the site, looks at what’s built and helps you decide layouts, finishes and lighting on the spot.
          </p>
          <div data-page-intro data-intro-item className="pt-space-md">
            <ButtonLink href={ROUTES.book}>Schedule a site visit</ButtonLink>
          </div>
        </div>
        <figure className="col-span-12 flex flex-col gap-space-md sm:col-span-8 lg:col-span-4 lg:col-start-9 lg:pt-[72px]">
          <div data-page-intro data-intro-media className="relative aspect-[396/520] overflow-clip">
            <Image
              src="/images/custom-elements/staircase.png"
              alt="Curved plaster staircase with oak treads beside an indoor tree"
              fill
              priority
              sizes="(min-width: 1024px) 400px, 70vw"
              className="object-cover"
            />
          </div>
          <figcaption data-page-intro data-intro-item className="type-label">FIG. 01 — Staircase decided on site</figcaption>
        </figure>
      </section>

      {/* 02 How a visit works */}
      <section aria-labelledby="visit-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page flex flex-col gap-[56px]">
          <div className="flex flex-wrap items-end justify-between gap-space-xl">
            <h2 id="visit-title" data-lines className="type-heading-sm">How a visit works</h2>
            <dl data-stagger className="flex gap-space-2xl pb-space-xs">
              {FACTS.map((f) => (
                <div key={f.label} className="flex flex-col gap-[6px]">
                  <dt className="type-label text-ink-muted">{f.label}</dt>
                  <dd className="type-link-list">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ServicesGrid items={VISIT} />
        </div>
      </section>

      {/* 03 FAQ, stone */}
      <FaqSplit stone title="About site visits" items={ONSITE_FAQ} />

      {/* 04 CTA (as on Residential) */}
      <CtaConversation />
    </PageShell>
  );
}

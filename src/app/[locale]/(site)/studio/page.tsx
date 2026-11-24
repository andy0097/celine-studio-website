import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import CtaConversation from "@/components/sections/CtaConversation";
import SketchImage from "@/components/ui/SketchImage";
import { Eyebrow } from "@/components/ui/labels";
import { TextLink } from "@/components/ui/links";
import { ROUTES } from "@/content/site";
import { STUDIO } from "@/content/studio";

export async function generateMetadata({ params }: PageProps<"/[locale]/studio">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/studio", locale as Locale, {
    title: "Studio — Celine Studio",
    description: "Design that makes daily life easier — for the families who live in our rooms and the owners who run their business in them.",
  });
}

/* Work grid: each column starts a little lower than the last one. */
const COLUMN_OFFSET = ["", "sm:pt-[80px]", "sm:pt-space-lg"];

/** Paper "Studio — A Editorial". */
export default async function StudioPage({ params }: PageProps<"/[locale]/studio">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <PageShell>
      {/* 01 Hero, centred */}
      <section className="container-page flex flex-col items-center gap-space-xl pt-[calc(var(--header-h)+var(--spacing-space-5xl))] pb-space-4xl text-center">
        <Eyebrow data-page-intro data-intro-item>The studio — Oradea</Eyebrow>
        <h1 data-page-intro data-intro-lines className="type-display max-w-[1192px] text-[length:clamp(56px,9.72vw,140px)]">
          Design that makes daily life easier
        </h1>
        <p data-page-intro data-intro-item className="type-body max-w-[520px]">
          For the families who live in our rooms and the owners who run their business in them.
        </p>
      </section>

      {/* 02 Image */}
      <section aria-label="The studio" className="container-page pb-space-5xl">
        <figure className="flex flex-col gap-space-md">
          <div data-page-intro data-intro-media className="relative aspect-[1192/640] min-h-[320px] overflow-clip">
            <div data-parallax className="absolute inset-0">
              <Image src={STUDIO.image.src} alt={STUDIO.image.alt} fill priority sizes="(min-width: 1290px) 1240px, 100vw" className="object-cover" />
            </div>
          </div>
          <figcaption data-page-intro data-intro-item className="flex flex-wrap justify-between gap-space-md">
            <span className="type-label">{STUDIO.image.caption}</span>
            <span className="type-label text-ink-muted">{STUDIO.image.since}</span>
          </figcaption>
        </figure>
      </section>

      {/* 03 Philosophy */}
      <section aria-labelledby="philosophy-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-5xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page grid-12 gap-y-space-2xl">
          <div className="col-span-12 flex flex-col gap-space-lg lg:col-span-6">
            <Eyebrow data-fade>Our philosophy</Eyebrow>
            <h2 id="philosophy-title" data-lines className="type-heading">How we design</h2>
            <p data-fade className="type-body max-w-[480px] pt-space-md">
              Four principles behind every residential and HORECA project we take on.
            </p>
          </div>
          <ol data-stagger className="col-span-12 border-b border-dashed border-ink/20 lg:col-span-6">
            {STUDIO.principles.map((p, i) => (
              <li key={p.title} className={`flex gap-space-lg border-t border-dashed py-[28px] ${i === 0 ? "border-ink/50" : "border-ink/20"}`}>
                <span className="type-label w-10 shrink-0 leading-7 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-space-xs">
                  <h3 className="type-lead">{p.title}</h3>
                  <p className="type-link-list text-ink-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 Our work */}
      <section aria-labelledby="work-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page flex flex-col gap-space-2xl">
          <div className="flex flex-wrap items-end justify-between gap-space-lg">
            <h2 id="work-title" data-lines className="type-heading">Our work</h2>
            <div data-fade className="pb-space-xs">
              <TextLink href={ROUTES.residential}>See all projects</TextLink>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-space-lg sm:grid-cols-3">
            {STUDIO.work.map((column, c) => (
              <div key={c} className={`flex flex-col gap-space-lg ${COLUMN_OFFSET[c]}`}>
                {column.map((item) => (
                  <div
                    key={item.image.src + c}
                    tabIndex={item.image.sketch ? 0 : undefined}
                    data-wipe
                    className={`group relative overflow-clip bg-surface-alt outline-none ${item.tall ? "aspect-[381/480]" : "aspect-[381/300]"}`}
                  >
                    <SketchImage image={item.image} sizes="(min-width: 640px) 33vw, 100vw" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 Team, stone */}
      <section aria-labelledby="team-title" className="relative bg-surface-alt py-space-5xl">
        <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
        <div className="container-page grid-12 gap-y-space-2xl">
          <div className="col-span-12 flex flex-col gap-space-lg lg:col-span-6">
            <p data-fade className="type-label">Team</p>
            <h2 id="team-title" data-lines className="type-heading max-w-[584px]">The people behind the drawings</h2>
          </div>
          <ul className="col-span-12 grid grid-cols-2 gap-space-lg lg:col-span-6">
            {STUDIO.team.map((person, i) => (
              <li key={person.name} className={`flex flex-col gap-space-md ${i === 1 ? "pt-[80px]" : ""}`}>
                <div data-wipe aria-hidden className="flex aspect-[280/350] items-center justify-center bg-ink">
                  <span className="type-quote leading-none text-on-dark">{person.initial}</span>
                </div>
                <div data-fade className="flex flex-col gap-space-2xs">
                  <h3 className="type-link-list">{person.name}</h3>
                  <p className="type-label text-ink-muted">{person.role}</p>
                </div>
                <p data-fade className="type-link-list text-ink-muted">{person.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 06 CTA (as on Residential) */}
      <CtaConversation />
    </PageShell>
  );
}

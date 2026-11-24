import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import CtaConversation from "@/components/sections/CtaConversation";
import SketchImage from "@/components/ui/SketchImage";
import { Eyebrow } from "@/components/ui/labels";
import { TextLink } from "@/components/ui/links";
import { ROUTES } from "@/i18n/links";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { STUDIO_QUERY } from "@/sanity/lib/queries";
import type { StudioContent } from "@/sanity/lib/content-types";
import { NO_IMAGE, objectPosition, toImage } from "@/sanity/lib/image";
import { ctaProps, getSettings, seoMetadata } from "@/sanity/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/studio">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<StudioContent>(STUDIO_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/studio", locale, page?.seo ?? null, { title: page?.hero?.title, description: page?.hero?.intro, defaults: settings?.seo });
}

/* Work grid: each column starts a little lower than the last one. */
const COLUMN_OFFSET = ["", "sm:pt-[80px]", "sm:pt-space-lg"];

/** Splits the images, in order, into three columns. */
function columns<T>(items: T[]): T[][] {
  const size = Math.ceil(items.length / 3);
  return size ? [0, 1, 2].map((c) => items.slice(c * size, (c + 1) * size)) : [];
}

/** Paper "Studio — A Editorial". */
export default async function StudioPage({ params }: PageProps<"/[locale]/studio">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, settings] = await Promise.all([getContent<StudioContent>(STUDIO_QUERY, locale, mode), getSettings(locale, mode)]);
  const { hero, philosophy, work, team } = page ?? {};
  const workColumns = columns(
    (work?.images ?? []).map((w) => ({ key: w._key, tall: !!w.tall, image: toImage(w.image) ?? NO_IMAGE })),
  );
  return (
    <PageShell>
      {/* 01 Hero, centred */}
      <section className="container-page flex flex-col items-center gap-space-xl pt-[calc(var(--header-h)+var(--spacing-space-5xl))] pb-space-4xl text-center">
        <Eyebrow data-page-intro data-intro-item>{hero?.eyebrow}</Eyebrow>
        <h1 data-page-intro data-intro-lines className="type-display max-w-[1192px] text-[length:clamp(56px,9.72vw,140px)]">
          {hero?.title}
        </h1>
        <p data-page-intro data-intro-item className="type-body max-w-[520px]">
          {hero?.intro}
        </p>
      </section>

      {/* 02 Image */}
      <section aria-label={hero?.eyebrow ?? undefined} className="container-page pb-space-5xl">
        <figure className="flex flex-col gap-space-md">
          <div data-page-intro data-intro-media className="relative aspect-[1192/640] min-h-[320px] overflow-clip">
            <div data-parallax className="absolute inset-0">
              {hero?.image?.src && (
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt ?? ""}
                  fill
                  priority
                  sizes="(min-width: 1290px) 1240px, 100vw"
                  className="object-cover"
                  style={{ objectPosition: objectPosition(hero.image) }}
                />
              )}
            </div>
          </div>
          <figcaption data-page-intro data-intro-item className="flex flex-wrap justify-between gap-space-md">
            <span className="type-label">{hero?.image?.caption}</span>
            <span className="type-label text-ink-muted">{hero?.since}</span>
          </figcaption>
        </figure>
      </section>

      {/* 03 Philosophy */}
      <section aria-labelledby="philosophy-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-5xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page grid-12 gap-y-space-2xl">
          <div className="col-span-12 flex flex-col gap-space-lg lg:col-span-6">
            <Eyebrow data-fade>{philosophy?.eyebrow}</Eyebrow>
            <h2 id="philosophy-title" data-lines className="type-heading">{philosophy?.title}</h2>
            <p data-fade className="type-body max-w-[480px] pt-space-md">
              {philosophy?.intro}
            </p>
          </div>
          <ol data-stagger className="col-span-12 border-b border-dashed border-ink/20 lg:col-span-6">
            {(philosophy?.principles ?? []).map((p, i) => (
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
            <h2 id="work-title" data-lines className="type-heading">{work?.title}</h2>
            <div data-fade className="pb-space-xs">
              <TextLink href={ROUTES.residential}>{work?.ctaLabel}</TextLink>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-space-lg sm:grid-cols-3">
            {workColumns.map((column, c) => (
              <div key={c} className={`flex flex-col gap-space-lg ${COLUMN_OFFSET[c]}`}>
                {column.map((item) => (
                  <div
                    key={item.key}
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
            <p data-fade className="type-label">{team?.eyebrow}</p>
            <h2 id="team-title" data-lines className="type-heading max-w-[584px]">{team?.title}</h2>
          </div>
          <ul className="col-span-12 grid grid-cols-2 gap-space-lg lg:col-span-6">
            {(team?.members ?? []).filter(Boolean).map((person, i) => (
              <li key={person._id} className={`flex flex-col gap-space-md ${i === 1 ? "pt-[80px]" : ""}`}>
                <div data-wipe aria-hidden className="relative flex aspect-[280/350] items-center justify-center overflow-clip bg-ink">
                  {person.portrait?.src ? (
                    <Image
                      src={person.portrait.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 300px, 50vw"
                      className="object-cover"
                      style={{ objectPosition: objectPosition(person.portrait) }}
                    />
                  ) : (
                    <span className="type-quote leading-none text-on-dark">{person.name.charAt(0)}</span>
                  )}
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
      <CtaConversation {...ctaProps(settings)} />
    </PageShell>
  );
}

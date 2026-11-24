import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import AlternateSlugs from "@/components/layout/AlternateSlugs";
import SpecRow from "@/components/sections/SpecRow";
import SplitHeading from "@/components/sections/SplitHeading";
import FourColumns from "@/components/sections/FourColumns";
import NumberedList from "@/components/sections/NumberedList";
import ServicesGrid from "@/components/sections/ServicesGrid";
import QuoteDisplay from "@/components/sections/QuoteDisplay";
import NextProject from "@/components/sections/NextProject";
import CtaConversation from "@/components/sections/CtaConversation";
import { quoteProps } from "@/components/sections/quote";
import SketchImage from "@/components/ui/SketchImage";
import { Eyebrow } from "@/components/ui/labels";
import { caseStudyHref } from "@/i18n/links";
import { redirect } from "@/i18n/navigation";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { CASE_STUDY_ANY_SLUG_QUERY, CASE_STUDY_QUERY, CASE_STUDY_SLUGS_QUERY } from "@/sanity/lib/queries";
import type { CaseStudyContent, CaseStudySection } from "@/sanity/lib/content-types";
import { NO_IMAGE, objectPosition, toImage } from "@/sanity/lib/image";
import { cardHref, ctaProps, getSettings, seoMetadata } from "@/sanity/lib/site";

type Params = PageProps<"/[locale]/projects/[slug]">;

/** Every case study with a page, by its slug in this language. */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const slugs = await getContent<{ ro: string; en: string }[]>(CASE_STUDY_SLUGS_QUERY, params.locale as Locale);
  return (slugs ?? []).map((s) => ({ slug: params.locale === "en" ? s.en : s.ro }));
}

async function load(params: Params["params"], mode?: Awaited<ReturnType<typeof getFetchMode>>) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  return { locale, page: await getContent<CaseStudyContent>(CASE_STUDY_QUERY, locale, mode, { slug: decodeURIComponent(slug) }) };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, page } = await load(params);
  if (!page) return {};
  const settings = await getSettings(locale);
  return seoMetadata((l) => caseStudyHref(l === "en" ? page.slugs.en : page.slugs.ro), locale, page.seo, {
    title: page.title,
    description: page.lead ?? page.summary,
    defaults: settings?.seo,
  });
}

/* Residential gallery: asymmetric on the 12 columns (desktop): wide + portrait
   aligned at the bottom, then a portrait set in by two columns and a landscape. */
const GALLERY_LAYOUT = [
  { cell: "lg:col-span-8 lg:self-end", ratio: "aspect-[768/520]" },
  { cell: "lg:col-span-4 lg:self-end", ratio: "aspect-[4/5]" },
  { cell: "lg:col-span-4 lg:col-start-3 lg:mt-[56px]", ratio: "aspect-[4/5]" },
  { cell: "lg:col-span-6 lg:mt-[56px]", ratio: "aspect-[568/420]" },
];

/** Two lines: everything before the last word, then the last word ("Street / Coffee"). */
function titleLines(title: string) {
  const i = title.trim().lastIndexOf(" ");
  return i > 0 ? [title.slice(0, i), title.slice(i + 1)] : [title];
}

/**
 * A case study (Paper "Project · Apartment Oradea" and "Project · Street
 * Coffee"). Same frame for both categories; the content sections come from
 * the Studio in the order the editor set, testimonials after the gallery.
 */
export default async function CaseStudyPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const mode = await getFetchMode();
  const [{ page }, settings, t, common] = await Promise.all([
    load(params, mode),
    getSettings(locale as Locale, mode),
    getTranslations("CaseStudy"),
    getTranslations("Common"),
  ]);
  if (!page) {
    // The other language's slug (e.g. /en/projects/apartament-oradea after language detection): send to this language's
    const other = await getContent<{ ro: string; en: string } | null>(CASE_STUDY_ANY_SLUG_QUERY, locale as Locale, mode, {
      slug: decodeURIComponent((await params).slug),
    });
    if (other) redirect({ href: caseStudyHref(locale === "en" ? other.en : other.ro), locale: locale as Locale });
    notFound();
  }

  const horeca = page.category === "horeca";
  const sections = page.sections ?? [];
  const body = sections.filter((s) => s._type !== "testimonialSection");
  const quotes = sections.filter((s) => s._type === "testimonialSection");
  const gallery = (page.gallery ?? []).filter((g) => g.image?.src);
  const [first, second] = titleLines(page.title);

  return (
    <PageShell>
      <AlternateSlugs slugs={page.slugs} />

      {/* 01 Project hero */}
      <section className="container-page flex flex-col gap-space-3xl pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-[72px]">
        <div className="grid-12 items-end gap-y-space-xl">
          <div className={`col-span-12 flex flex-col gap-space-lg ${horeca ? "lg:col-span-7" : "lg:col-span-8"}`}>
            <Eyebrow data-page-intro data-intro-item>
              {t("breadcrumb", { category: common(page.category), number: page.number ?? "" })}
            </Eyebrow>
            <h1 data-page-intro data-intro-lines className="type-display">
              {first}
              {second && (
                <>
                  <br />
                  {second}
                </>
              )}
            </h1>
          </div>
          {page.lead && (
            <p
              data-page-intro
              data-intro-item
              className={`type-lead col-span-12 pb-space-sm ${
                horeca ? "max-w-[440px] lg:col-span-5 lg:col-start-8 lg:justify-self-end" : "max-w-[380px] lg:col-span-4 lg:col-start-9"
              }`}
            >
              {page.lead}
            </p>
          )}
        </div>
        {page.specs?.length ? <SpecRow specs={page.specs} /> : null}
      </section>

      {/* 02 Full-bleed image */}
      {page.hero?.src && (
        <section
          aria-label={page.hero.alt || t("heroImage")}
          data-page-intro
          data-intro-media
          className="relative aspect-[1440/860] max-h-[100svh] min-h-[380px] w-full overflow-clip"
        >
          <div data-parallax className="absolute inset-0">
            <Image
              src={page.hero.src}
              alt={page.hero.alt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: objectPosition(page.hero) }}
            />
          </div>
        </section>
      )}

      {/* 03 Content sections (concept, value, results) */}
      {body.map((s) => (
        <Section key={s._key} section={s} />
      ))}

      {/* 04 Gallery */}
      {gallery.length > 0 &&
        (horeca ? (
          <section aria-label={t("gallery")} className="container-page py-space-5xl">
            <ul className="grid-12 gap-y-space-lg">
              {gallery.map((g) => (
                <li key={g._key} className={`col-span-12 ${g.wide ? "sm:col-span-8" : "sm:col-span-4"}`}>
                  <div data-wipe className="relative aspect-[400/520] overflow-clip bg-surface-alt sm:h-[min(520px,60vw)] sm:aspect-auto">
                    <Image
                      src={g.image!.src!}
                      alt={g.image!.alt ?? ""}
                      fill
                      sizes="(min-width: 640px) 66vw, 100vw"
                      className="object-cover"
                      style={{ objectPosition: objectPosition(g.image) }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {page.galleryNote && <p data-fade className="type-label pt-space-lg text-ink-muted">{page.galleryNote}</p>}
          </section>
        ) : (
          <section aria-labelledby="gallery-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
            <SectionBorder />
            <div className="container-page">
              <div className="flex flex-wrap justify-between gap-space-md pb-[64px]">
                <h2 id="gallery-title" className="type-label text-ink-muted">
                  {t("galleryNumbered", { number: String(body.length + 1).padStart(2, "0") })}
                </h2>
                {gallery.some((g) => g.image?.sketch) && <p className="type-label text-ink-muted max-lg:hidden">{t("hoverSketch")}</p>}
              </div>
              <ul className="grid-12 gap-y-space-2xl">
                {gallery.map((g, i) => {
                  const l = GALLERY_LAYOUT[i % GALLERY_LAYOUT.length];
                  return (
                    <li key={g._key} className={`col-span-12 ${l.cell}`}>
                      <figure tabIndex={g.image?.sketch ? 0 : undefined} className="group flex flex-col gap-space-md outline-none">
                        <div data-wipe className={`relative overflow-clip bg-surface-alt ${l.ratio}`}>
                          <SketchImage image={toImage(g.image) ?? NO_IMAGE} sizes="(min-width: 1024px) 50vw, 100vw" />
                        </div>
                        {g.image?.caption && <figcaption data-fade className="type-label">{g.image.caption}</figcaption>}
                      </figure>
                    </li>
                  );
                })}
              </ul>
              {page.galleryNote && <p data-fade className="type-label pt-space-lg text-ink-muted">{page.galleryNote}</p>}
            </div>
          </section>
        ))}

      {/* 05 Everything included (HORECA) */}
      {horeca && settings?.services?.length ? (
        <section aria-labelledby="included-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
          <SectionBorder />
          <div className="container-page">
            <SplitHeading
              id="included-title"
              title={settings.servicesIntro?.title ?? ""}
              titleClass="type-heading"
              titleWidth="max-w-none"
              text={settings.servicesIntro?.text ?? undefined}
            />
            <ServicesGrid items={settings.services} />
          </div>
        </section>
      ) : null}

      {/* 06 Testimonial */}
      {quotes.map((s) =>
        s._type === "testimonialSection" && s.testimonial ? (
          <QuoteDisplay key={s._key} eyebrow={s.eyebrow ?? ""} {...quoteProps(s.testimonial)} />
        ) : null,
      )}

      {/* 07 Next project */}
      {page.next && <NextProject label={page.next.title} href={cardHref(page.next)} />}

      {/* 08 CTA (as on Residential) */}
      <CtaConversation {...ctaProps(settings)} />
    </PageShell>
  );
}

/** One content section, by type. */
function Section({ section: s }: { section: CaseStudySection }) {
  switch (s._type) {
    case "conceptSection":
      return (
        <section aria-labelledby={`${s._key}-title`} className="container-page grid-12 gap-y-space-4xl py-space-5xl">
          <div className="col-span-12 flex flex-col gap-[40px] lg:col-span-7">
            {s.intro?.eyebrow && <Eyebrow data-fade>{s.intro.eyebrow}</Eyebrow>}
            <h2 id={`${s._key}-title`} data-lines className="type-heading-sm max-w-[640px]">
              {s.intro?.title}
            </h2>
            {s.intro?.text && <p data-fade className="type-body max-w-[520px]">{s.intro.text}</p>}
            {s.points?.length ? <NumberedList items={s.points} className="mt-space-md max-w-[584px]" /> : null}
          </div>
          {s.sketch?.src && (
            <figure className="col-span-12 flex flex-col gap-space-md sm:col-span-8 lg:col-span-4 lg:col-start-9 lg:pt-[180px]">
              <div className="border border-dashed border-line p-[var(--inset-frame-padding)]">
                <div data-wipe className="relative aspect-[418/528] overflow-clip bg-surface">
                  <Image
                    src={s.sketch.src}
                    alt={s.sketch.alt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 420px, 90vw"
                    className="object-cover"
                    style={{ objectPosition: objectPosition(s.sketch) ?? "40% 50%" }}
                  />
                </div>
              </div>
              {s.sketch.caption && <figcaption data-fade className="type-label-caption">{s.sketch.caption}</figcaption>}
            </figure>
          )}
        </section>
      );
    case "valueSection":
      return (
        <section aria-labelledby={`${s._key}-title`} className="container-page py-space-5xl">
          <SplitHeading id={`${s._key}-title`} eyebrow={s.intro?.eyebrow ?? undefined} title={s.intro?.title ?? ""} text={s.intro?.text ?? undefined} />
          <FourColumns
            cells={(s.items ?? []).map((item, i) => (
              <>
                <span className="type-label text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-body">{item.title}</h3>
                <p className="type-link-list text-ink-muted">{item.text}</p>
              </>
            ))}
          />
        </section>
      );
    case "resultsSection":
      return (
        <section aria-labelledby={`${s._key}-title`} className="relative bg-surface-alt py-space-5xl">
          <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
          <div className="container-page">
            <SplitHeading
              id={`${s._key}-title`}
              eyebrow={s.intro?.eyebrow ?? undefined}
              eyebrowClass="text-ink"
              title={s.intro?.title ?? ""}
              text={s.intro?.text ?? undefined}
            />
            <FourColumns
              strong
              cells={(s.items ?? []).map((item) => (
                <>
                  <span className="type-heading-sm whitespace-pre">{item.value}</span>
                  <span className="type-label pt-space-xs">{item.label}</span>
                </>
              ))}
            />
          </div>
        </section>
      );
    default:
      return null;
  }
}

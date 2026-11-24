import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import ConsultationForm from "@/components/book/ConsultationForm";
import TestimonialSlider from "@/components/book/TestimonialSlider";
import Faq from "@/components/ui/Faq";
import { Eyebrow } from "@/components/ui/labels";
import { quoteProps } from "@/components/sections/quote";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { BOOK_QUERY } from "@/sanity/lib/queries";
import type { BookContent } from "@/sanity/lib/content-types";
import { objectPosition } from "@/sanity/lib/image";
import { getSettings, seoMetadata } from "@/sanity/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/book-a-consultation">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<BookContent>(BOOK_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/book-a-consultation", locale, page?.seo ?? null, { title: page?.hero?.title, description: page?.hero?.intro, defaults: settings?.seo });
}

/* The two halves line up with the content box, not the screen edge. */
const INSET = "max(var(--page-margin), calc((100vw - var(--content-max)) / 2))";

/** Paper "Book a Consultation — B Split". No closing CTA: this page is the CTA. */
export default async function BookPage({ params }: PageProps<"/[locale]/book-a-consultation">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, settings, t, common] = await Promise.all([
    getContent<BookContent>(BOOK_QUERY, locale, mode),
    getSettings(locale, mode),
    getTranslations("Book"),
    getTranslations("Common"),
  ]);
  const hero = page?.hero;
  const contact = settings?.contact;
  const quotes = (page?.testimonials ?? []).filter(Boolean).map(quoteProps);
  return (
    <PageShell>
      {/* 01 Split: photo + form */}
      <section aria-label={common("bookConsultation")} className="grid grid-cols-1 lg:min-h-svh lg:grid-cols-2">
        <div
          data-tone="dark-start"
          className="relative flex min-h-[640px] flex-col justify-between gap-space-3xl overflow-clip pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-[72px] text-surface"
          style={{ paddingLeft: INSET, paddingRight: `max(var(--spacing-space-3xl), ${INSET})` }}
        >
          <div data-page-intro data-intro-media className="absolute inset-0">
            {hero?.image?.src && (
              <Image
                src={hero.image.src}
                alt={hero.image.alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                style={{ objectPosition: objectPosition(hero.image) ?? "50% 60%" }}
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#19161833_0%,#191618b3_100%)]" />
          </div>
          <p data-page-intro data-intro-item className="type-label relative text-on-dark">{hero?.eyebrow}</p>
          <div className="relative flex flex-col gap-space-xl">
            <h1 data-page-intro data-intro-lines className="type-heading max-w-[540px]">
              {hero?.title}
            </h1>
            <dl data-page-intro data-intro-item className="flex flex-wrap gap-x-[40px] gap-y-space-md">
              {contact?.phone && (
                <div className="flex flex-col gap-[6px]">
                  <dt className="type-label text-on-dark-muted">{t("call")}</dt>
                  <dd>
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="type-link-list">{contact.phone}</a>
                  </dd>
                </div>
              )}
              {contact?.email && (
                <div className="flex flex-col gap-[6px]">
                  <dt className="type-label text-on-dark-muted">{t("write")}</dt>
                  <dd>
                    <a href={`mailto:${contact.email}`} className="type-link-list">{contact.email}</a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div
          className="flex flex-col gap-space-xl py-[72px] pl-[var(--page-margin)] lg:pt-[calc(var(--header-h)+var(--spacing-space-4xl)+var(--spacing-space-xl))] lg:pl-[72px]"
          style={{ paddingRight: INSET }}
        >
          <p data-page-intro data-intro-item className="type-body max-w-[420px]">
            {hero?.intro}
          </p>
          <ConsultationForm email={contact?.email ?? ""} />
        </div>
      </section>

      {/* 02 Testimonials, stone */}
      {quotes.length > 0 && (
        <section aria-label={t("testimonials")} className="bg-surface-alt py-space-5xl">
          <div className="container-page">
            <TestimonialSlider quotes={quotes} />
          </div>
        </section>
      )}

      {/* 03 FAQ, centred */}
      <section aria-labelledby="faq-title" className="relative py-space-5xl lg:pb-[calc(var(--spacing-space-5xl)+var(--spacing-space-xl))]">
        <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
        <div className="container-page flex flex-col items-center gap-space-2xl">
          <div className="flex flex-col items-center gap-space-lg text-center">
            <Eyebrow data-fade>{page?.faq?.eyebrow ?? common("faq")}</Eyebrow>
            <h2 id="faq-title" data-lines className="type-heading-sm max-w-[620px]">{page?.faq?.title}</h2>
          </div>
          <Faq items={(page?.faq?.items ?? []).filter(Boolean)} className="w-full max-w-[664px]" />
        </div>
      </section>
    </PageShell>
  );
}

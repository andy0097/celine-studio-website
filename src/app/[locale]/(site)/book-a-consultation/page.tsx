import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import ConsultationForm from "@/components/book/ConsultationForm";
import TestimonialSlider from "@/components/book/TestimonialSlider";
import Faq from "@/components/ui/Faq";
import { Eyebrow } from "@/components/ui/labels";
import { CONTACT } from "@/content/footer";
import { BOOK } from "@/content/book";
import { GENERAL_FAQ } from "@/content/faq";

export async function generateMetadata({ params }: PageProps<"/[locale]/book-a-consultation">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/book-a-consultation", locale as Locale, {
    title: "Book a consultation — Celine Studio",
    description: "Free 30-minute consultation. Tell us about the project and we’ll call you within one working day.",
  });
}

/* The two halves line up with the content box, not the screen edge. */
const INSET = "max(var(--page-margin), calc((100vw - var(--content-max)) / 2))";

/** Paper "Book a Consultation — B Split". No closing CTA: this page is the CTA. */
export default async function BookPage({ params }: PageProps<"/[locale]/book-a-consultation">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <PageShell>
      {/* 01 Split: photo + form */}
      <section aria-label="Book a consultation" className="grid grid-cols-1 lg:min-h-svh lg:grid-cols-2">
        <div
          data-tone="dark-start"
          className="relative flex min-h-[640px] flex-col justify-between gap-space-3xl overflow-clip pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-[72px] text-surface"
          style={{ paddingLeft: INSET, paddingRight: `max(var(--spacing-space-3xl), ${INSET})` }}
        >
          <div data-page-intro data-intro-media className="absolute inset-0">
            <Image src={BOOK.hero.src} alt={BOOK.hero.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" style={{ objectPosition: "50% 60%" }} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#19161833_0%,#191618b3_100%)]" />
          </div>
          <p data-page-intro data-intro-item className="type-label relative text-on-dark">Free consultation — 30 min</p>
          <div className="relative flex flex-col gap-space-xl">
            <h1 data-page-intro data-intro-lines className="type-heading max-w-[540px]">
              Let’s talk about your space
            </h1>
            <dl data-page-intro data-intro-item className="flex flex-wrap gap-x-[40px] gap-y-space-md">
              <div className="flex flex-col gap-[6px]">
                <dt className="type-label text-on-dark-muted">Call</dt>
                <dd>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="type-link-list">{CONTACT.phone}</a>
                </dd>
              </div>
              <div className="flex flex-col gap-[6px]">
                <dt className="type-label text-on-dark-muted">Write</dt>
                <dd>
                  <a href={`mailto:${CONTACT.email}`} className="type-link-list">{CONTACT.email}</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div
          className="flex flex-col gap-space-xl py-[72px] pl-[var(--page-margin)] lg:pt-[calc(var(--header-h)+var(--spacing-space-4xl)+var(--spacing-space-xl))] lg:pl-[72px]"
          style={{ paddingRight: INSET }}
        >
          <p data-page-intro data-intro-item className="type-body max-w-[420px]">
            Tell us about the project. We’ll call you within one working day.
          </p>
          <ConsultationForm />
        </div>
      </section>

      {/* 02 Testimonials, stone */}
      <section aria-label="Kind words from our clients" className="bg-surface-alt py-space-5xl">
        <div className="container-page">
          <TestimonialSlider quotes={BOOK.quotes} />
        </div>
      </section>

      {/* 03 FAQ, centred */}
      <section aria-labelledby="faq-title" className="relative py-space-5xl lg:pb-[calc(var(--spacing-space-5xl)+var(--spacing-space-xl))]">
        <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
        <div className="container-page flex flex-col items-center gap-space-2xl">
          <div className="flex flex-col items-center gap-space-lg text-center">
            <Eyebrow data-fade>FAQ</Eyebrow>
            <h2 id="faq-title" data-lines className="type-heading-sm max-w-[620px]">Questions we hear often</h2>
          </div>
          <Faq items={GENERAL_FAQ} className="w-full max-w-[664px]" />
        </div>
      </section>
    </PageShell>
  );
}

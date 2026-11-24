import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import SplitHeading from "@/components/sections/SplitHeading";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FaqSplit from "@/components/sections/FaqSplit";
import CtaConversation from "@/components/sections/CtaConversation";
import { Eyebrow } from "@/components/ui/labels";
import { TextLink } from "@/components/ui/links";
import { ROUTES } from "@/content/site";
import { PROCESS_STEPS } from "@/content/process-page";
import { GENERAL_FAQ } from "@/content/faq";

export async function generateMetadata({ params }: PageProps<"/[locale]/process">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/process", locale as Locale, {
    title: "Process — Celine Studio",
    description: "Four stages. At each one you know exactly what you receive and what you decide.",
  });
}

/** Paper "Process — A Editorial". */
export default async function ProcessPage({ params }: PageProps<"/[locale]/process">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <PageShell>
      {/* 01 Hero */}
      <section className="container-page flex flex-col gap-[56px] pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="flex flex-col gap-space-lg">
          <Eyebrow data-page-intro data-intro-item>Process</Eyebrow>
          <h1 data-page-intro data-intro-lines className="type-display">
            From idea
            <br />
            to a space
          </h1>
        </div>
        <div className="grid-12 gap-y-space-xl">
          <p data-page-intro data-intro-item className="type-lead col-span-12 max-w-[560px] lg:col-span-6">
            Four stages. At each one you know exactly what you receive and what you decide.
          </p>
          <div className="col-span-12 flex max-w-[400px] flex-col gap-space-lg lg:col-span-4 lg:col-start-9">
            <p data-page-intro data-intro-item className="type-body">
              No surprises halfway through the build: every drawing, material and cost is agreed before the next stage starts.
            </p>
            <div data-page-intro data-intro-item>
              <TextLink href={ROUTES.book}>Book a consultation</TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Steps */}
      <section aria-label="The four stages" className="container-page pb-space-5xl">
        <ol className="border-b border-dashed border-ink/20">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step.title} className="relative grid-12 items-start gap-y-space-lg py-space-2xl">
              <span
                aria-hidden
                data-line-x
                className={`absolute inset-x-0 top-0 h-[var(--stroke-hairline)] origin-left border-t border-dashed ${i === 0 ? "border-ink/50" : "border-ink/20"}`}
              />
              <span data-lines aria-hidden className="type-display col-span-12 leading-[0.79] sm:col-span-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div data-stagger className="col-span-12 flex flex-col gap-space-md sm:col-span-9 lg:col-span-5">
                <h2 className="type-lead">
                  <span className="sr-only">Stage {i + 1}: </span>
                  {step.title}
                </h2>
                <p className="type-body text-ink-muted">{step.text}</p>
              </div>
              <div data-stagger className="col-span-12 flex flex-col gap-space-sm sm:col-span-9 sm:col-start-4 lg:col-span-4 lg:col-start-9 lg:pl-space-2xl">
                <h3 className="type-label text-ink-muted">You receive</h3>
                <ul className="flex flex-col gap-space-sm">
                  {step.receive.map((r) => (
                    <li key={r} className="type-link-list">
                      — {r}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 03 All our services */}
      <section aria-labelledby="services-title" className="relative pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))] pb-space-5xl">
        <SectionBorder />
        <div className="container-page">
          <SplitHeading
            id="services-title"
            title="All our services"
            titleClass="type-heading"
            titleWidth="max-w-none"
            text="Take the full process, or only the stages you need."
          />
          <ServicesGrid />
        </div>
      </section>

      {/* 04 FAQ */}
      <FaqSplit title="Questions we hear often" items={GENERAL_FAQ} />

      {/* 05 CTA (as on Residential) */}
      <CtaConversation />
    </PageShell>
  );
}

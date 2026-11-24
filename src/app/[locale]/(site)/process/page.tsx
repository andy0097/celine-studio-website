import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import PageShell from "@/components/layout/PageShell";
import SectionBorder from "@/components/layout/SectionBorder";
import SplitHeading from "@/components/sections/SplitHeading";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FaqSplit from "@/components/sections/FaqSplit";
import CtaConversation from "@/components/sections/CtaConversation";
import { Eyebrow } from "@/components/ui/labels";
import { TextLink } from "@/components/ui/links";
import { ROUTES } from "@/i18n/links";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { PROCESS_QUERY } from "@/sanity/lib/queries";
import type { ProcessContent } from "@/sanity/lib/content-types";
import { ctaProps, getSettings, seoMetadata } from "@/sanity/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/process">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<ProcessContent>(PROCESS_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/process", locale, page?.seo ?? null, { title: page?.hero?.title, description: page?.hero?.intro, defaults: settings?.seo });
}

/** Paper "Process — A Editorial". */
export default async function ProcessPage({ params }: PageProps<"/[locale]/process">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, settings, t] = await Promise.all([
    getContent<ProcessContent>(PROCESS_QUERY, locale, mode),
    getSettings(locale, mode),
    getTranslations("Process"),
  ]);
  const hero = page?.hero;
  return (
    <PageShell>
      {/* 01 Hero */}
      <section className="container-page flex flex-col gap-[56px] pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="flex flex-col gap-space-lg">
          <Eyebrow data-page-intro data-intro-item>{hero?.eyebrow}</Eyebrow>
          <h1 data-page-intro data-intro-lines className="type-display max-w-[900px]">
            {hero?.title}
          </h1>
        </div>
        <div className="grid-12 gap-y-space-xl">
          <p data-page-intro data-intro-item className="type-lead col-span-12 max-w-[560px] lg:col-span-6">
            {hero?.intro}
          </p>
          <div className="col-span-12 flex max-w-[400px] flex-col gap-space-lg lg:col-span-4 lg:col-start-9">
            <p data-page-intro data-intro-item className="type-body">
              {hero?.note}
            </p>
            <div data-page-intro data-intro-item>
              <TextLink href={ROUTES.book}>{hero?.ctaLabel}</TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Steps */}
      <section aria-label={t("stages")} className="container-page pb-space-5xl">
        <ol className="border-b border-dashed border-ink/20">
          {(page?.steps ?? []).map((step, i) => (
            <li key={step._key} className="relative grid-12 items-start gap-y-space-lg py-space-2xl">
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
                  <span className="sr-only">{t("stage", { number: i + 1 })}</span>
                  {step.title}
                </h2>
                <p className="type-body text-ink-muted">{step.text}</p>
              </div>
              <div data-stagger className="col-span-12 flex flex-col gap-space-sm sm:col-span-9 sm:col-start-4 lg:col-span-4 lg:col-start-9 lg:pl-space-2xl">
                <h3 className="type-label text-ink-muted">{t("youReceive")}</h3>
                <ul className="flex flex-col gap-space-sm">
                  {(step.receive ?? []).map((r) => (
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
            title={page?.services?.title ?? ""}
            titleClass="type-heading"
            titleWidth="max-w-none"
            text={page?.services?.text ?? undefined}
          />
          <ServicesGrid items={settings?.services ?? []} />
        </div>
      </section>

      {/* 04 FAQ */}
      <FaqSplit title={page?.faq?.title ?? ""} items={(page?.faq?.items ?? []).filter(Boolean)} />

      {/* 05 CTA (as on Residential) */}
      <CtaConversation {...ctaProps(settings)} />
    </PageShell>
  );
}

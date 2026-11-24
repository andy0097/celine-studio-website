import type { Metadata } from "next";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import PageShell from "@/components/layout/PageShell";
import Contents from "@/components/privacy/Contents";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { PRIVACY_QUERY } from "@/sanity/lib/queries";
import type { PrivacyContent } from "@/sanity/lib/content-types";
import { getSettings, seoMetadata } from "@/sanity/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<PrivacyContent>(PRIVACY_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/privacy", locale, page?.seo ?? null, { title: page?.title, defaults: settings?.seo });
}

/** The section body: paragraphs, lists and links in the site's prose style. */
const PROSE: PortableTextComponents = {
  block: { normal: ({ children }) => <p className="type-prose">{children}</p> },
  list: {
    bullet: ({ children }) => <ul className="type-prose list-disc pl-space-lg">{children}</ul>,
    number: ({ children }) => <ol className="type-prose list-decimal pl-space-lg">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} className="underline underline-offset-4">
        {children}
      </a>
    ),
  },
};

/** "2026-03-01" → "01.03.2026" (placeholder until the date is set in the Studio). */
function formatDate(iso: string | null) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "XX.XX.2026";
}

/** Paper "Privacy Policy — A Index". No closing CTA in the design. */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, t] = await Promise.all([getContent<PrivacyContent>(PRIVACY_QUERY, locale, mode), getTranslations("Privacy")]);
  const sections = (page?.sections ?? []).map((s, i) => ({ ...s, id: s.anchor || `section-${i + 1}` }));
  return (
    <PageShell>
      <section className="container-page pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="flex flex-wrap items-end justify-between gap-x-space-xl gap-y-space-md pb-space-3xl">
          <h1 data-page-intro data-intro-lines className="type-display">{page?.title}</h1>
          <p data-page-intro data-intro-item className="type-label pb-space-xl text-ink-muted">
            {t("updated", { date: formatDate(page?.updated ?? null) })}
          </p>
        </div>

        <div className="grid-12 items-start gap-y-space-2xl">
          <div data-page-intro data-intro-item className="col-span-12 lg:col-span-3">
            <Contents label={t("contents")} items={sections.map(({ id, title }) => ({ id, title }))} />
          </div>

          <div className="col-span-12 flex max-w-[576px] flex-col gap-space-3xl lg:col-span-6 lg:col-start-5">
            {sections.map((s, i) => (
              <article key={s._key} id={s.id} data-stagger className="flex scroll-mt-[calc(var(--header-h)+var(--spacing-space-4xl))] flex-col gap-space-md">
                <h2 className="type-lead">
                  {String(i + 1).padStart(2, "0")} — {s.title}
                </h2>
                {s.body && <PortableText value={s.body} components={PROSE} />}
              </article>
            ))}
            {page?.note && (
              <p data-fade className="type-label border-t border-dashed border-ink/20 pt-space-lg text-ink-muted">{page.note}</p>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

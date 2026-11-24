import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import PageShell from "@/components/layout/PageShell";
import Contents from "@/components/privacy/Contents";
import { PRIVACY } from "@/content/privacy";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/privacy", locale as Locale, {
    title: "Privacy policy — Celine Studio",
    description: "How Celine Studio Art collects, uses and keeps your personal data.",
  });
}

/** Paper "Privacy Policy — A Index". No closing CTA in the design. */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <PageShell>
      <section className="container-page pt-[calc(var(--header-h)+var(--spacing-space-4xl))] pb-space-5xl">
        <div className="flex flex-wrap items-end justify-between gap-x-space-xl gap-y-space-md pb-space-3xl">
          <h1 data-page-intro data-intro-lines className="type-display">Privacy policy</h1>
          <p data-page-intro data-intro-item className="type-label pb-space-xl text-ink-muted">{PRIVACY.updated}</p>
        </div>

        <div className="grid-12 items-start gap-y-space-2xl">
          <div data-page-intro data-intro-item className="col-span-12 lg:col-span-3">
            <Contents items={PRIVACY.sections} />
          </div>

          <div className="col-span-12 flex max-w-[576px] flex-col gap-space-3xl lg:col-span-6 lg:col-start-5">
            {PRIVACY.sections.map((s, i) => (
              <article key={s.id} id={s.id} data-stagger className="flex scroll-mt-[calc(var(--header-h)+var(--spacing-space-4xl))] flex-col gap-space-md">
                <h2 className="type-lead">
                  {String(i + 1).padStart(2, "0")} — {s.title}
                </h2>
                <p className="type-prose">{s.body}</p>
              </article>
            ))}
            <p data-fade className="type-label border-t border-dashed border-ink/20 pt-space-lg text-ink-muted">{PRIVACY.note}</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

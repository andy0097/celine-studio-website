import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { REGISTRY } from "@/design-system/registry";
import type { Locale } from "@/design-system/types";
import { routing } from "@/i18n/routing";
import PageShell from "@/components/layout/PageShell";
import PageMotion from "@/components/motion/PageMotion";
import { DEMOS } from "../../demos";

/** Only ever loaded whole, inside an admin frame: no in-app navigation to keep instant. */
export const instant = false;

/** Every registry entry with a demo, in both languages, is built ahead of time. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => REGISTRY.filter((c) => DEMOS[c.name]).map((c) => ({ locale, name: c.name })));
}

/**
 * One component or section, alone, with its RO or EN sample
 * (/admin-render/en/QuoteDisplay). The admin Components tool shows this
 * page in frames at phone, tablet and desktop widths.
 */
export default async function ComponentRender({ params }: PageProps<"/admin-render/[locale]/[name]">) {
  const { locale, name } = await params;
  setRequestLocale(locale);
  const demo = DEMOS[name];
  if (!demo) notFound();
  const content = await demo.render(locale as Locale);

  if (demo.frame === "page") return <PageShell>{content}</PageShell>;
  if (demo.frame === "bare") return <main>{content}</main>;
  return (
    <main data-page className="flex min-h-screen w-full items-center justify-center bg-surface px-[var(--page-margin)] py-space-4xl">
      {content}
      <PageMotion />
    </main>
  );
}

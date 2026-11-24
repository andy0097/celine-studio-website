import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Href } from "@/i18n/links";

/** "Next project" band closing a case study. */
export default function NextProject({ label, href }: { label: string; href: Href }) {
  const t = useTranslations("Common");
  return (
    <section aria-label={t("nextProject")} className="relative">
      <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
      <Link href={href} className="group container-page flex flex-wrap items-center justify-between gap-space-lg py-space-2xl">
        <span className="type-label text-ink-muted">{t("nextProject")}</span>
        <span data-fade className="flex items-center gap-space-lg">
          <span className="type-quote leading-none">{label}</span>
          <svg width="28" height="28" viewBox="0 0 14 14" aria-hidden className="shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
            <path d="M2 12L12 2M5 2h7v7" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </span>
      </Link>
    </section>
  );
}

import { Link } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";

/** "Next project" band closing a case study. */
export default function NextProject({ label, href }: { label: string; href: AppPathname }) {
  return (
    <section aria-label="Next project" className="relative">
      <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
      <Link href={href} className="group container-page flex flex-wrap items-center justify-between gap-space-lg py-space-2xl">
        <span className="type-label text-ink-muted">Next project</span>
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

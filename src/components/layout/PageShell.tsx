import type { ReactNode } from "react";
import PageMotion from "@/components/motion/PageMotion";

/**
 * Wraps an inner page: the two page guides running its full length (drawn
 * on by the intro), the top dotted line 16px down (as on Home) and the
 * page's motion. Sections inside are transparent unless they are stone or
 * photo bands, so the guides show through.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <main data-page className="relative w-full overflow-x-clip bg-surface">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span data-page-intro data-guide="v" className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)] origin-top" />
        <span data-page-intro data-guide="v" className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)] origin-top" />
        <span data-page-intro data-guide="h" className="guide-h absolute inset-x-0 top-[var(--section-border-offset)] origin-left" />
      </div>
      {children}
      <PageMotion />
    </main>
  );
}

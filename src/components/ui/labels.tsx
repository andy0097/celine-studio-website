import type { ReactNode } from "react";

/** Stone chip for tags (RESIDENTIAL, ORADEA). */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="type-label bg-surface-alt px-space-xs py-space-2xs">{children}</span>;
}

/** FIG. label: type-fig on a stone chip. */
export function Fig({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`type-fig bg-surface-alt px-space-xs whitespace-pre ${className}`}>{children}</span>;
}

/** Small muted label above a section title (“01 — Concept”, “FAQ”). */
export function Eyebrow({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & Record<`data-${string}`, string | boolean>) {
  return (
    <p {...rest} className={`type-label text-ink-muted ${className}`}>
      {children}
    </p>
  );
}

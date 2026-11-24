/**
 * A section's top border: one dotted line 16px below its top edge, drawn on
 * as it scrolls in. Place inside a `relative` section. Never double a line:
 * the next section's border closes the previous one.
 */
export default function SectionBorder({ onDark = false }: { onDark?: boolean }) {
  return (
    <span
      aria-hidden
      data-line-x
      className={`guide-h pointer-events-none absolute inset-x-0 top-[var(--section-border-offset)] origin-left ${
        onDark ? "[--guide-color:var(--color-line-on-dark)]" : ""
      }`}
    />
  );
}

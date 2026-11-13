/**
 * Extra breathing room between two sections. The page guides run through it
 * so the dashed lines stay continuous. Height: --section-gap (globals.css).
 * A spacer rather than section padding, so pinned sections keep their layout.
 */
export default function SectionGap() {
  return (
    <div data-section-gap aria-hidden className="pointer-events-none relative h-[var(--section-gap)] bg-surface">
      <span className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)]" />
      <span className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)]" />
    </div>
  );
}

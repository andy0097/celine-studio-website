import type { CSSProperties, ReactNode } from "react";
import { Fig } from "./labels";

/**
 * Dimension line: solid 1px ink, with a 45° tick at each end and an
 * optional FIG. label centred on it. Animated by PageMotion
 * ([data-dim-line] draws left to right, ticks and label follow).
 */
export function DimensionLine({ fig, className = "" }: { fig?: ReactNode; className?: string }) {
  return (
    <div className={`relative h-[18px] ${className}`}>
      <span data-dim-line className="absolute inset-x-0 top-1/2 h-[var(--stroke-hairline)] origin-left bg-current" />
      <span data-tick className="absolute top-1/2 left-0 h-[var(--stroke-hairline)] w-[calc(var(--dimension-tick)*1.4142)] -translate-x-1/2 -rotate-45 bg-current" />
      <span data-tick className="absolute top-1/2 left-full h-[var(--stroke-hairline)] w-[calc(var(--dimension-tick)*1.4142)] -translate-x-1/2 -rotate-45 bg-current" />
      {fig && (
        <span data-fig className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Fig>{fig}</Fig>
        </span>
      )}
    </div>
  );
}

/**
 * Crop marks around an image, as on Home: verticals from 56px above to 12px
 * below, horizontals running --ov-l / --ov-r past each side (default: the
 * inner overshoot). Put inside the image's `relative` box.
 */
export function CropMarks({
  ovL = "var(--frame-overshoot-inner)",
  ovR = "var(--frame-overshoot-inner)",
  dimension,
}: {
  ovL?: string;
  ovR?: string;
  /** Adds a dimension line 28px above, with this FIG. label. */
  dimension?: ReactNode | true;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10"
      style={{ "--ov-l": ovL, "--ov-r": ovR } as CSSProperties}
    >
      <span data-frame-line="v" className="guide-v absolute top-[calc(-1*var(--frame-overshoot-top))] bottom-[calc(-1*var(--frame-overshoot-bottom))] left-0 origin-top" />
      <span data-frame-line="v" className="guide-v absolute top-[calc(-1*var(--frame-overshoot-top))] bottom-[calc(-1*var(--frame-overshoot-bottom))] right-0 origin-top" />
      <span data-frame-line="h" className="guide-h absolute top-0 right-[calc(-1*var(--ov-r))] left-[calc(-1*var(--ov-l))] origin-left" />
      <span data-frame-line="h" className="guide-h absolute bottom-0 right-[calc(-1*var(--ov-r))] left-[calc(-1*var(--ov-l))] origin-left" />
      {dimension && (
        <DimensionLine
          fig={dimension === true ? undefined : dimension}
          className="absolute inset-x-0 top-[calc(-1*var(--dimension-line-offset)-9px)] text-ink"
        />
      )}
    </div>
  );
}

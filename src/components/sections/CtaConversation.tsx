import { ButtonLink } from "@/components/ui/links";
import { Fig } from "@/components/ui/labels";
import { ROUTES } from "@/i18n/links";

/* The drawing, in the design's 1440 × 760 frame. It stretches with the
   section (preserveAspectRatio="none"); strokes stay 1px and keep the 4 / 4
   dash because they don't scale with it. */
const ROOM = "M320 190H1120V570H320Z";
const RAYS = [
  // corners of the room to the corners of the screen
  "M0 0L320 190M1440 0L1120 190M0 760L320 570M1440 760L1120 570",
  // floor boards
  "M240 760L480 570M480 760L600 570M960 760L840 570M1200 760L960 570",
  // ceiling
  "M240 0L480 190M480 0L600 190M960 0L840 190M1200 0L960 190",
  // walls
  "M0 220L320 315M0 540L320 475M1440 220L1120 315M1440 540L1120 475",
].join("");

function Drawing({ d, ...rest }: { d: string } & Record<string, unknown>) {
  return (
    <svg
      viewBox="0 0 1440 760"
      preserveAspectRatio="none"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      {...rest}
    >
      <path
        d={d}
        fill="none"
        stroke="var(--color-line)"
        strokeDasharray="4 4"
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: "var(--stroke-hairline)" }}
      />
    </svg>
  );
}

/**
 * Closing CTA used on every inner page (Paper "06 CTA — Perspective room",
 * from Residential): a one-point perspective drawing of an empty room, with
 * the invitation written inside the back wall. On scroll the back wall
 * grows towards you, then the lines open out to the edges of the screen
 * (PageMotion, [data-cta]).
 */
export default function CtaConversation({
  title = "It all starts with a conversation.",
  fig = "FIG. 00 — Your room, before the first sketch",
  cta = "Book a free consultation",
}: {
  title?: string;
  fig?: string;
  cta?: string;
}) {
  return (
    <section
      data-cta
      aria-labelledby="cta-title"
      className="relative flex min-h-[600px] items-center justify-center overflow-clip py-space-5xl lg:h-[760px]"
    >
      <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
      <Drawing d={RAYS} data-cta-rays="" />
      <div data-cta-room className="absolute inset-0">
        <Drawing d={ROOM} />
      </div>

      <div className="relative flex w-[min(760px,calc(100%-2*var(--content-inset)))] flex-col items-center gap-[28px] text-center">
        <span data-cta-fig>
          <Fig>{fig}</Fig>
        </span>
        <h2 id="cta-title" data-lines className="type-heading-sm">
          {title}
        </h2>
        <div data-cta-button>
          <ButtonLink href={ROUTES.book}>{cta}</ButtonLink>
        </div>
      </div>
    </section>
  );
}

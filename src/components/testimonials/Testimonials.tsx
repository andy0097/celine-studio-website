"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/** A client quote on the home page (homePage.testimonials in Sanity). */
export type HomeTestimonial = {
  key: string;
  /** Who they are and what we did: "Homeowner | Residential — Living room, Oradea". */
  project: string;
  quote: string;
  client: { name: string; initials: string };
  image: { src: string; alt: string; position?: string } | null;
};
import { revealLines } from "@/components/motion/revealLines";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * Layout (Paper "06 Testimonials", 1440 wide): two staggered columns of
 * 440 × 550 images. Left cards on columns 1–5, right cards on 8–12, each
 * 30px in from the content edge (as in Custom elements). A right card sits
 * STAGGER below its left neighbour; rows are 226px apart (1000px card to card).
 */
const STAGGER = "382px";

/*
 * Desktop pacing, in % of the screen height scrolled. The headline only starts
 * once the section reaches the top of the screen (the Process collage has
 * gone), rises over REVEAL, then holds alone for HOLD before the first card
 * enters from the bottom of the screen.
 */
const REVEAL = 25;
const HOLD = 25;

/**
 * "Kind words from our clients".
 * 1. Once the section reaches the top of the screen, the headline rises in
 *    line by line, stays alone for a moment, then stays put (sticky) while
 *    the testimonials scroll up over it (see REVEAL / HOLD).
 * 2. Each testimonial draws itself in as it enters the screen, scrubbed by
 *    scroll: crop marks, the image wiped in from its bottom edge, the
 *    dimension line and FIG label, then the text.
 * Under 1024px it is a single column and the headline scrolls normally.
 * With prefers-reduced-motion everything is simply shown.
 */
export default function Testimonials({ title, items: TESTIMONIALS }: { title: string; items: HomeTestimonial[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      const q = gsap.utils.selector(section);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Section top border and guides draw on as it arrives
      gsap.fromTo(
        q("[data-t-guide='h']"),
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "top 30%", scrub: true },
        },
      );

      // 1. Headline rises in line by line. Desktop: only after the section
      // has reached the top (the cards are spaced to arrive after the hold).
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      revealLines(
        q("[data-t-headline]")[0],
        desktop
          ? {
              trigger: section,
              start: "top top",
              end: () => `+=${(window.innerHeight * REVEAL) / 100}`,
              scrub: 0.8,
            }
          : { trigger: section, start: "top 75%", end: "top top", scrub: 0.8 },
      );

      // 2. Each testimonial, as it enters
      q("[data-t-card]").forEach((card) => {
        const f = gsap.utils.selector(card);
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: card, start: "top 90%", end: "top 35%", scrub: 0.8 },
          })
          .fromTo(f("[data-t-line='v']"), { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power2.inOut" }, 0)
          .fromTo(f("[data-t-line='h']"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0)
          .fromTo(
            f("[data-t-image]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" },
            0.25,
          )
          .fromTo(f("[data-t-image] img"), { scale: 1.08 }, { scale: 1, duration: 0.9, ease: "power2.out" }, 0.25)
          .fromTo(f("[data-t-dim-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.45)
          .fromTo(f("[data-t-tick]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.85)
          .fromTo(f("[data-t-fig]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.7)
          .fromTo(f("[data-t-text]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.8)
          .fromTo(
            f("[data-t-text] > *"),
            { y: 12 },
            { y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
            0.8,
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="relative w-full overflow-clip bg-surface"
      style={
        {
          "--t-stagger": STAGGER,
          "--t-delay": `${REVEAL + HOLD}svh`,
        } as CSSProperties
      }
    >
      {/* Page guides + section top border */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)]" />
        <span className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)]" />
        <span data-t-guide="h" className="guide-h absolute inset-x-0 top-[var(--section-border-offset)] origin-left" />
      </div>

      {/* Headline: sticky on desktop so the cards scroll up over it */}
      <div className="pt-space-5xl lg:sticky lg:top-0 lg:h-svh lg:pt-[23svh]">
        <div className="container-page">
          <h2
            id="testimonials-title"
            data-t-headline
            className="type-display mx-auto max-w-[1192px] text-center"
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Desktop: the list starts a screen (the sticky headline) plus
          --t-delay below the section top, so the first card only enters once
          the headline has risen and held.
          Bottom space is padding on the list, not the section: the sticky
          headline stops at the section's content edge, and section padding
          would release it before the last card has passed. */}
      <ul className="container-page grid-12 relative z-10 mt-space-4xl gap-y-space-5xl pb-space-5xl lg:mt-[var(--t-delay)] lg:gap-y-[226px] lg:pb-[calc(124px+var(--t-stagger))]">
        {TESTIMONIALS.map((t, i) => {
          const right = i % 2 === 1;
          return (
            <li
              key={t.key}
              className={`col-span-12 w-[min(440px,calc(100%-2*var(--frame-overshoot-outer)))] justify-self-center [--ov-l:var(--frame-overshoot-outer)] [--ov-r:var(--frame-overshoot-outer)] lg:col-span-5 lg:w-[min(440px,calc(100%-var(--frame-overshoot-outer)))] ${
                right
                  ? "lg:relative lg:top-[var(--t-stagger)] lg:col-start-8 lg:mr-[var(--frame-overshoot-outer)] lg:justify-self-end lg:[--ov-l:var(--frame-overshoot-inner)]"
                  : "lg:col-start-1 lg:ml-[var(--frame-overshoot-outer)] lg:justify-self-start lg:[--ov-r:var(--frame-overshoot-inner)]"
              }`}
            >
              <figure data-t-card>
                <div className="relative aspect-[440/550]">
                  <div data-t-image className="absolute inset-0 overflow-clip">
                    <div className="absolute inset-0 bg-surface-alt">
                      {t.image && (
                      <Image
                        src={t.image.src}
                        alt={t.image.alt}
                        fill
                        sizes="(min-width: 1024px) 440px, 90vw"
                        className="object-cover"
                        style={{ objectPosition: t.image.position }}
                      />
                      )}
                    </div>
                  </div>

                  {/* Crop marks, dimension line and FIG label (above the
                      text's backing, which they overshoot into) */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
                    <span data-t-line="v" className="guide-v absolute top-[calc(-1*var(--frame-overshoot-top))] bottom-[calc(-1*var(--frame-overshoot-bottom))] left-0 origin-top" />
                    <span data-t-line="v" className="guide-v absolute top-[calc(-1*var(--frame-overshoot-top))] bottom-[calc(-1*var(--frame-overshoot-bottom))] right-0 origin-top" />
                    <span data-t-line="h" className="guide-h absolute top-0 right-[calc(-1*var(--ov-r))] left-[calc(-1*var(--ov-l))] origin-left" />
                    <span data-t-line="h" className="guide-h absolute bottom-0 right-[calc(-1*var(--ov-r))] left-[calc(-1*var(--ov-l))] origin-left" />

                    <div className="absolute inset-x-0 top-[calc(-1*var(--dimension-line-offset))]">
                      <span data-t-dim-line className="absolute inset-x-0 top-0 h-[var(--stroke-hairline)] origin-left bg-ink" />
                      <span data-t-tick className="absolute top-0 left-0 h-[var(--stroke-hairline)] w-[calc(var(--dimension-tick)*1.4142)] -translate-x-1/2 -rotate-45 bg-ink" />
                      <span data-t-tick className="absolute top-0 left-full h-[var(--stroke-hairline)] w-[calc(var(--dimension-tick)*1.4142)] -translate-x-1/2 -rotate-45 bg-ink" />
                      <span data-t-fig className="type-fig absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-alt px-[10px] whitespace-pre">
                        FIG. {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cream backing so the text reads cleanly as it passes over
                    the headline */}
                <div data-t-text className="flex flex-col gap-[20px] bg-surface pt-[20px] pb-space-xs">
                  <p className="type-label">{t.project}</p>
                  <blockquote className="type-body">
                    <p>“{t.quote}”</p>
                  </blockquote>
                  <figcaption className="flex items-center gap-[14px] pt-space-2xs">
                    <span
                      aria-hidden
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink font-sans text-[14px] leading-[18px] text-on-dark"
                    >
                      {t.client.initials}
                    </span>
                    <span className="type-link">{t.client.name}</span>
                  </figcaption>
                </div>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

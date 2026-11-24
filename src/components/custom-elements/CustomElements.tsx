"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/** A close-up of a piece the studio designed (homePage.customElements in Sanity). 3:4 detail shots. */
export type CustomElement = { key: string; number: string; title: string; image: { src: string; alt: string; position?: string } };
import { revealLines } from "@/components/motion/revealLines";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * Placement of the three floating images, one per 4-column third of the grid
 * (from the Paper design at 1440 × 1024). The outer two sit 30px in from the
 * content edge, the middle one is centred. Images are the design's 320 × 420
 * (narrower only if a third of the grid can't fit them). Vertical offsets
 * are from the section's centre line, as in the design.
 * ovL / ovR: how far the top and bottom crop marks run past the image.
 */
const PLACEMENT = [
  { className: "justify-self-start ml-[var(--frame-overshoot-outer)]", top: "-52px", ovL: "var(--frame-overshoot-outer)", ovR: "var(--frame-overshoot-inner)" },
  { className: "justify-self-center", top: "-12px", ovL: "var(--frame-overshoot-inner)", ovR: "var(--frame-overshoot-inner)" },
  { className: "justify-self-end mr-[var(--frame-overshoot-outer)]", top: "-92px", ovL: "var(--frame-overshoot-inner)", ovR: "var(--frame-overshoot-outer)" },
];

/**
 * "Custom elements that we have designed".
 * 1. As it scrolls in, the page guides keep drawing down from the section
 *    above, and the headline rises in line by line.
 * 2. Then it pins, and scrolling brings in the three images one at a time
 *    over the headline: crop marks draw on, the image is wiped in from its
 *    bottom edge up, then its dimension line and caption. Scrolling back up
 *    plays it in reverse.
 * With prefers-reduced-motion everything is simply shown.
 */
export default function CustomElements({ title, items: CUSTOM_ELEMENTS }: { title: string; items: CustomElement[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      const q = gsap.utils.selector(section);

      // The fixed header is light over the dark projects overlay; back to ink here.
      const header = document.querySelector<HTMLElement>("[data-header]");
      const css = getComputedStyle(document.documentElement);
      const ink = css.getPropertyValue("--color-ink").trim();
      const onDark = css.getPropertyValue("--color-on-dark").trim();
      if (header) {
        // Switch as soon as the cream starts: at the SectionGap above, if any.
        const prev = section.previousElementSibling;
        ScrollTrigger.create({
          trigger: prev?.matches("[data-section-gap]") ? prev : section,
          start: "top 64px",
          onEnter: () => gsap.to(header, { color: ink, duration: 0.4, overwrite: "auto" }),
          onLeaveBack: () => gsap.to(header, { color: onDark, duration: 0.4, overwrite: "auto" }),
        });
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // 1a. Guides continue down from the section above
      gsap.fromTo(
        q("[data-ce-guide]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true },
        },
      );

      // 1b. Headline rises in line by line
      revealLines(q("[data-ce-headline]")[0], {
        trigger: section,
        start: "top 70%",
        end: "top top",
        scrub: 0.8,
      });

      // 2. Pinned: the images, one after another
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "+=200%", pin: true, scrub: 0.8 },
      });
      q("[data-ce-figure]").forEach((figure, i) => {
        const f = gsap.utils.selector(figure);
        const at = i;
        tl.fromTo(f("[data-ce-line='v']"), { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power2.inOut" }, at)
          .fromTo(f("[data-ce-line='h']"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, at)
          .fromTo(
            f("[data-ce-image]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" },
            at + 0.25,
          )
          .fromTo(f("[data-ce-image] img"), { scale: 1.08 }, { scale: 1, duration: 0.9, ease: "power2.out" }, at + 0.25)
          .fromTo(f("[data-ce-dim-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, at + 0.45)
          .fromTo(f("[data-ce-tick]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, at + 0.85)
          .fromTo(f("figcaption"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, at + 0.7);
      });
      // Hold the finished composition for a moment before unpinning
      tl.to({}, { duration: 0.4 });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="custom-elements"
      aria-labelledby="custom-elements-title"
      className="relative h-svh min-h-[640px] w-full overflow-clip bg-surface"
    >
      {/* Page guides, continuing from the section above */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span data-ce-guide className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)] origin-top" />
        <span data-ce-guide className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)] origin-top" />
      </div>

      <h2
        id="custom-elements-title"
        data-ce-headline
        className="type-display absolute top-1/2 left-1/2 w-[min(918px,calc(100%-2*var(--content-inset)))] -translate-x-1/2 -translate-y-1/2 text-center"
      >
        {title}
      </h2>

      {/* Floating images, one per 4-column third, over the headline */}
      {/* Anchored at the centre line; on screens under ~900px tall it moves up
          so the lowest caption (centre + ~434px) stays inside the section. */}
      <div className="container-page grid-12 absolute inset-x-0 top-[min(50%,calc(100%-450px))] items-start">
        {CUSTOM_ELEMENTS.map((item, i) => {
          const p = PLACEMENT[i];
          return (
            <figure
              key={item.key}
              data-ce-figure
              className={`relative col-span-4 row-start-1 w-[min(calc(100%-var(--frame-overshoot-outer)),320px)] ${p.className}`}
              style={{ marginTop: p.top, "--ov-l": p.ovL, "--ov-r": p.ovR } as CSSProperties}
            >
              <div className="relative aspect-[320/420]">
                <div data-ce-image className="absolute inset-0 overflow-clip">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 1024px) 320px, 30vw"
                    className="object-cover"
                    style={{ objectPosition: item.image.position }}
                  />
                </div>

                {/* Crop marks */}
                <div aria-hidden className="pointer-events-none">
                  <span data-ce-line="v" className="guide-v absolute top-[calc(-1*var(--frame-overshoot-top))] bottom-[calc(-1*var(--frame-overshoot-bottom))] left-0 origin-top" />
                  <span data-ce-line="v" className="guide-v absolute top-[calc(-1*var(--frame-overshoot-top))] bottom-[calc(-1*var(--frame-overshoot-bottom))] right-0 origin-top" />
                  <span data-ce-line="h" className="guide-h absolute top-0 right-[calc(-1*var(--ov-r))] left-[calc(-1*var(--ov-l))] origin-left" />
                  <span data-ce-line="h" className="guide-h absolute bottom-0 right-[calc(-1*var(--ov-r))] left-[calc(-1*var(--ov-l))] origin-left" />

                  {/* Dimension line with diagonal end ticks */}
                  <div className="absolute inset-x-0 top-[calc(-1*var(--dimension-line-offset))]">
                    <span data-ce-dim-line className="absolute inset-x-0 top-0 h-[var(--stroke-hairline)] origin-left bg-ink" />
                    <span data-ce-tick className="absolute top-0 left-0 h-[var(--stroke-hairline)] w-[calc(var(--dimension-tick)*1.4142)] -translate-x-1/2 -rotate-45 bg-ink" />
                    <span data-ce-tick className="absolute top-0 left-full h-[var(--stroke-hairline)] w-[calc(var(--dimension-tick)*1.4142)] -translate-x-1/2 -rotate-45 bg-ink" />
                  </div>
                </div>
              </div>
              <figcaption className="type-label mt-[var(--caption-gap)]">
                {item.number} — {item.title}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

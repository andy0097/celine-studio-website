"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PROCESS } from "@/content/process";
import { revealLines } from "@/components/motion/revealLines";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Where the band's centre is on screen when the stripe starts (lower = later). */
const STRIPE_START = "72%";

/**
 * "Our process".
 * 1. As it scrolls in: the section's top border draws on, the headline rises
 *    in line by line, then the text and the CTA fade up.
 * 2. The showcase image arrives like the hero image: a thin stripe wipes in from the
 *    left between two dotted lines, opens to the 640px band, then the band
 *    pins and opens to the full screen.
 * The stage is a full-screen box clipped to the band (see `process-stage`),
 * so pinning it needs no layout changes. With prefers-reduced-motion it just
 * shows the designed band.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const section = root.current!;
      const q = gsap.utils.selector(section);
      const stage = q("[data-pr-stage]")[0];

      // 1. Intro
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
        })
        .fromTo(q("[data-pr-border]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power3.inOut" });
      revealLines(q("[data-pr-headline]")[0], {
        trigger: section,
        start: "top 80%",
        end: "top 15%",
        scrub: 0.8,
      });
      gsap.fromTo(
        q("[data-pr-text]"),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: q("[data-pr-copy]")[0], start: "top 80%", toggleActions: "play none none reverse" },
        },
      );

      // 2a. Stripe wipes in, then opens to the band (until the band is
      // centred). Starts only once the whole text block is on screen, so it
      // can be read before the images arrive: the paragraphs sit ~740px above
      // the band's centre, i.e. at 72% of a 1024px screen.
      gsap
        .timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: stage,
            start: `center ${STRIPE_START}`,
            end: "center center",
            scrub: 0.8,
          },
        })
        .fromTo(stage, { "--appear-x": 0 }, { "--appear-x": 1, duration: 0.4 }, 0)
        .fromTo(q("[data-pr-band-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 0)
        .fromTo(stage, { "--appear-y": 0 }, { "--appear-y": 1, duration: 0.6 }, 0.4)
        .fromTo(q("[data-pr-media] img"), { scale: 1.12 }, { scale: 1, duration: 1, ease: "none" }, 0);

      // 2b. Pinned: the band opens to the full screen
      gsap
        .timeline({
          scrollTrigger: { trigger: stage, start: "top top", end: "+=100%", pin: true, scrub: 0.8 },
        })
        .fromTo(stage, { "--grow": 0 }, { "--grow": 1, duration: 1, ease: "power2.inOut" })
        .to({}, { duration: 0.3 });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="process"
      aria-labelledby="process-title"
      className="relative bg-surface pt-[calc(var(--spacing-space-4xl)+var(--spacing-space-xs))]"
    >
      {/* Page guides + section top border, above the showcase image */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
        <span className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)]" />
        <span className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)]" />
        <span data-pr-border className="guide-h absolute inset-x-0 top-[var(--section-border-offset)] origin-left" />
      </div>

      <div className="container-page grid-12">
        <h2 id="process-title" data-pr-headline className="type-display col-span-12">
          Our process
        </h2>

        <div
          data-pr-copy
          className="col-span-12 mt-[calc(var(--spacing-space-5xl)+var(--spacing-space-xs))] lg:col-span-5 lg:col-start-8 lg:max-w-[472px]"
        >
          <div className="flex flex-col gap-space-lg">
            {PROCESS.paragraphs.map((text) => (
              <p key={text} data-pr-text className="type-body">
                {text}
              </p>
            ))}
          </div>
          <Link
            data-pr-text
            href={PROCESS.cta.href}
            className="type-link mt-[calc(var(--spacing-space-3xl)+var(--spacing-space-xs))] flex w-max items-center gap-space-sm border-b border-ink pb-space-xs"
          >
            {PROCESS.cta.label}
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
              <path d="M2 12L12 2M5 2h7v7" fill="none" stroke="currentColor" style={{ strokeWidth: "var(--stroke-icon)" }} />
            </svg>
          </Link>
        </div>
      </div>

      {/* Showcase image: full-bleed band between dotted lines, then full screen */}
      <div className="pt-[calc(var(--spacing-space-4xl)+var(--spacing-space-xs))] pb-[calc(var(--spacing-space-4xl)-var(--spacing-space-xs))]">
        <div data-pr-stage className="process-stage pointer-events-none relative z-[1]">
          <div
            data-pr-media
            className="absolute inset-0 overflow-clip bg-surface-alt"
            style={{
              clipPath:
                "inset(var(--band-inset) calc((1 - var(--appear-x, 1)) * 100%) var(--band-inset) 0)",
            }}
          >
            <Image
              src={PROCESS.showcase.src}
              alt={PROCESS.showcase.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <span aria-hidden data-pr-band-line className="guide-h absolute inset-x-0 top-[var(--band-inset)] origin-left" />
          <span aria-hidden data-pr-band-line className="guide-h absolute inset-x-0 bottom-[var(--band-inset)] origin-left" />
        </div>
      </div>
    </section>
  );
}

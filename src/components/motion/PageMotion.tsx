"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { revealLines } from "./revealLines";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/** Where the header's text sits, for the tone switch over dark bands. */
const HEADER_LINE = "top 64px";
const HEADER_LINE_END = "bottom 64px";

/**
 * Motion for an inner page, in the homepage's vocabulary, driven by data
 * attributes so the page components stay plain markup. Rendered once per
 * page by PageShell; everything is reverted when the page unmounts.
 *
 * Intro (on load), for elements marked data-page-intro:
 *   [data-guide="v|h"]   page guides / top line draw on
 *   [data-intro-lines]   headline rises line by line from behind masks
 *   [data-intro-media]   image wiped in from its bottom edge, settling in scale
 *   [data-intro-item]    fades up, in document order
 * On scroll:
 *   [data-lines]         headline rises line by line (scrubbed)
 *   [data-line-x|y]      dotted line draws on (scrubbed)
 *   [data-fade]          fades up once in view
 *   [data-stagger]       its children fade up one after another
 *   [data-wipe]          image wiped in bottom to top (scrubbed)
 *   [data-frame]         framed image draws itself: crop marks, image,
 *                        dimension line, ticks, FIG., then [data-frame-text]
 *   [data-parallax]      full-bleed image drifts against the scroll
 *   [data-cta]           perspective CTA: the room opens out from the centre
 * Header: over [data-tone="dark"] bands the whole header turns light; over
 * [data-tone="dark-start"] (a dark left half) only the wordmark does.
 * With prefers-reduced-motion everything is shown in its final state.
 */
export default function PageMotion() {
  useGSAP(() => {
    const page = document.querySelector<HTMLElement>("[data-page]");
    if (!page) return;
    const q = gsap.utils.selector(page);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Header tone
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (header) {
      const css = getComputedStyle(document.documentElement);
      const ink = css.getPropertyValue("--color-ink").trim();
      const onDark = css.getPropertyValue("--color-on-dark").trim();
      const logo = header.querySelector("[data-header-logo]");
      const nav = header.querySelector("[data-header-nav]");
      gsap.set([logo, nav], { color: ink });
      q("[data-tone]").forEach((band) => {
        const targets = (band as HTMLElement).dataset.tone === "dark-start" ? [logo] : [logo, nav];
        ScrollTrigger.create({
          trigger: band,
          start: HEADER_LINE,
          end: HEADER_LINE_END,
          onToggle: (self) =>
            gsap.to(targets, { color: self.isActive ? onDark : ink, duration: 0.4, overwrite: "auto" }),
        });
      });
    }

    if (reduced) {
      gsap.set(q("[data-page-intro]"), { autoAlpha: 1 });
      return;
    }

    /* ---------------------------------------------------------------- Intro */
    const intro = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    intro
      .fromTo(q("[data-guide='v']"), { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 1.4, stagger: 0.12 }, 0)
      .fromTo(q("[data-guide='h']"), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 1.4 }, 0);

    q("[data-intro-lines]").forEach((el, i) => {
      gsap.set(el, { autoAlpha: 1 });
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(self.masks, { paddingBottom: "0.25em", marginBottom: "-0.25em" });
          return gsap.from(self.lines, {
            yPercent: 130,
            duration: 1.2,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.3 + i * 0.15,
          });
        },
      });
    });

    q("[data-intro-media]").forEach((el) => {
      intro
        .fromTo(el, { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" }, 0.5)
        .fromTo(el.querySelectorAll("img"), { scale: 1.08 }, { scale: 1, duration: 1.8, ease: "power3.out" }, 0.5);
    });
    intro.fromTo(
      q("[data-intro-item]"),
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" },
      0.8,
    );

    /* --------------------------------------------------------------- Scroll */
    q("[data-lines]").forEach((el) =>
      revealLines(el, { trigger: el, start: "top 90%", end: "top 50%", scrub: 0.8 }),
    );

    q("[data-line-x]").forEach((el) =>
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1,
        ease: "power2.inOut",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 55%", scrub: 0.8 },
      }),
    );
    q("[data-line-y]").forEach((el) =>
      gsap.fromTo(el, { scaleY: 0 }, {
        scaleY: 1,
        ease: "power2.inOut",
        scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 60%", scrub: 0.8 },
      }),
    );

    q("[data-fade]").forEach((el) =>
      gsap.fromTo(el, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
      }),
    );

    q("[data-stagger]").forEach((el) =>
      gsap.fromTo(el.children, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
      }),
    );

    q("[data-wipe]").forEach((el) =>
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 92%", end: "top 45%", scrub: 0.8 } })
        .fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, 0)
        .fromTo(el.querySelectorAll("img"), { scale: 1.08 }, { scale: 1, duration: 0.9, ease: "power2.out" }, 0),
    );

    q("[data-frame]").forEach((frame) => {
      const f = gsap.utils.selector(frame);
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: frame, start: "top 90%", end: "top 40%", scrub: 0.8 },
        })
        .fromTo(f("[data-frame-line='v']"), { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power2.inOut" }, 0)
        .fromTo(f("[data-frame-line='h']"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0)
        .fromTo(f("[data-frame-image]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, 0.25)
        .fromTo(f("[data-frame-image] img"), { scale: 1.08 }, { scale: 1, duration: 0.9, ease: "power2.out" }, 0.25)
        .fromTo(f("[data-dim-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.45)
        .fromTo(f("[data-tick]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.85)
        .fromTo(f("[data-fig]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.7)
        .fromTo(f("[data-frame-text]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.75);
    });

    // Loose dimension lines (outside a frame) draw on by themselves
    q("[data-dim]").forEach((dim) => {
      const d = gsap.utils.selector(dim);
      gsap
        .timeline({ scrollTrigger: { trigger: dim, start: "top bottom", end: "top 65%", scrub: 0.8 } })
        .fromTo(d("[data-dim-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 0)
        .fromTo(d("[data-tick]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.55)
        .fromTo(d("[data-fig]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.3);
    });

    q("[data-parallax]").forEach((el) => {
      const band = el.closest("section") ?? el;
      gsap.fromTo(el, { yPercent: -6, scale: 1.14 }, {
        yPercent: 6,
        scale: 1.14,
        ease: "none",
        scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    q("[data-cta]").forEach((cta) => {
      const c = gsap.utils.selector(cta);
      gsap
        .timeline({ scrollTrigger: { trigger: cta, start: "top 80%", end: "center 55%", scrub: 0.8 } })
        .fromTo(c("[data-cta-room]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 0)
        .fromTo(c("[data-cta-rays]"), { clipPath: "inset(25% 22% 25% 22%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" }, 0.3)
        .fromTo(c("[data-cta-fig]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.5)
        .fromTo(c("[data-cta-button]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1);
    });
  });

  return null;
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProjectsOverlay from "./ProjectsOverlay";
import { revealOnTop } from "./stack";
import { useTranslations } from "next-intl";
import { NAV as NAV_LINKS, ROUTES, type Href } from "@/i18n/links";
import type { SketchImageData } from "@/components/ui/SketchImage";
import { Link } from "@/i18n/navigation";
import LanguageSwitch from "@/components/layout/LanguageSwitch";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger, useGSAP);

const WORDMARK = ["Celine", "Studio"];
/* Scramble only with the wordmark's own letters so it never looks like noise. */
const SCRAMBLE_CHARS = "CELINSTUDO";
/* Longest we hold the blank screen waiting for fonts and images. */
const ASSET_TIMEOUT_MS = 3000;
/* How far you scroll before the hero animation plays through on its own. */
const PLAY_THRESHOLD_PX = 8;
/* Height of the wordmark once it has shrunk into the navbar. */
const NAV_LOGO_HEIGHT_PX = 30;

function waitForImage(img: HTMLImageElement | null) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth) return img.decode().catch(() => {});
  return new Promise<void>((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

/**
 * Home hero, with the loading intro built into it:
 * 1. Blank cream screen. "CELINE / STUDIO" scrambles in at the centre.
 * 2. Behind it, the line drawing of the room is drawn top to bottom.
 * 3. The page guides draw on and the nav scrambles in.
 * 4. The wordmark travels to its place in the layout (FLIP).
 * 5. The drawing turns into the render, then the tagline and CTA appear.
 * With prefers-reduced-motion the final layout is shown immediately.
 *
 * Then, once you scroll a few pixels, it plays through on its own (scroll
 * input is held until it finishes; scrolling back to the top reverses it):
 * 1. The image grows to the full height of the screen while the wordmark
 *    shrinks into the navbar (top left, NAV_LOGO_HEIGHT_PX tall) and the
 *    tagline fades out; then it grows to the full width.
 * 2. The reference projects appear over it: overlay, guides, list, panel.
 * Hovering a project swaps the background photo (here) and the panel image
 * (ProjectsOverlay).
 *
 * The wordmark and nav live in a fixed header layer outside the pinned
 * section, so they stay on screen for the rest of the page.
 */
/** A reference project over the hero image (homePage.hero.slides in Sanity). */
export type HeroSlide = {
  key: string;
  number: string;
  title: string;
  location: string;
  photo: SketchImageData;
  /** Framed image beside the list: the sketch, or a detail crop. */
  panel: string | null;
  href: Href | null;
};

export default function Hero({ tagline, ctaLabel, slides }: { tagline: string; ctaLabel: string; slides: HeroSlide[] }) {
  const PROJECTS = slides;
  const scope = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const t = useTranslations("Nav");
  const photoZ = useRef(PROJECTS.length);
  const shownActive = useRef(0);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(scope);
      let onRefresh: (() => void) | undefined;

      const buildScroll = contextSafe!(() => {
        const image = q("[data-hero-image]")[0];
        const header = q("[data-header]")[0] as HTMLElement;
        const wordmark = q("[data-wordmark]")[0] as HTMLElement;
        const nav = q("[data-nav]")[0] as HTMLElement;
        const onDark = getComputedStyle(document.documentElement)
          .getPropertyValue("--color-on-dark")
          .trim();

        // Navbar logo: top left, mirroring the nav's inset on the right, with
        // its top aligned to the nav's. Measured from layout offsets (not
        // getBoundingClientRect) so the wordmark's own transform is ignored.
        const box = wordmark.offsetParent as HTMLElement;
        const homeLeft = () => box.offsetLeft + wordmark.offsetLeft;
        const homeTop = () => box.offsetTop + wordmark.offsetTop;
        const navRect = () => nav.getBoundingClientRect();
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const tl = gsap
          .timeline({
            paused: true,
            defaults: { ease: "none" },
            onComplete: () => lock.disable(),
            onReverseComplete: () => lock.disable(),
          })
          // 1. Full height, hero content steps aside
          .fromTo(
            image,
            { "--grow-y": 0 },
            { "--grow-y": 1, duration: 1, ease: "power2.inOut" },
            0,
          )
          .to(
            wordmark,
            {
              transformOrigin: "0 0",
              scale: () => NAV_LOGO_HEIGHT_PX / wordmark.offsetHeight,
              x: () => header.clientWidth - navRect().right - homeLeft(),
              y: () => navRect().top - homeTop(),
              duration: 1,
              ease: "power2.inOut",
            },
            0,
          )
          .to("[data-side-item]", { autoAlpha: 0, duration: 0.4 }, 0)
          // 2. Full width
          .fromTo(
            image,
            { "--grow-x": 0 },
            { "--grow-x": 1, duration: 1, ease: "power2.inOut" },
            1,
          )
          // 3. Projects
          .fromTo(
            "[data-proj-overlay]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.6 },
            1.5,
          )
          // Logo and nav switch to light over the dark overlay
          .to(header, { color: onDark, duration: 0.6 }, 1.5)
          .fromTo(
            "[data-proj-guide='v']",
            { autoAlpha: 1, scaleY: 0 },
            { scaleY: 1, duration: 0.8 },
            2,
          )
          .fromTo(
            "[data-proj-guide='h']",
            { autoAlpha: 1, scaleX: 0 },
            { scaleX: 1, duration: 0.8 },
            2,
          )
          .fromTo(
            "[data-proj-row]",
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.12,
              ease: "power2.out",
            },
            2.1,
          )
          .fromTo(
            "[data-proj-panel]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3 },
            2.2,
          )
          .fromTo(
            "[data-proj-panel-inner]",
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.8,
              ease: "power2.inOut",
            },
            2.3,
          );

        // While it plays, swallow scroll input so the hero stays put until
        // the animation has finished.
        const lock = ScrollTrigger.observe({
          type: "wheel,touch",
          preventDefault: true,
        });
        lock.disable();

        // Re-measure the logo's target after a resize, keeping the progress.
        onRefresh = () => {
          const p = tl.progress();
          tl.progress(0).invalidate().progress(p);
        };
        ScrollTrigger.addEventListener("refresh", onRefresh);

        // Pinned for a short stretch. Past the first few pixels the whole
        // animation plays on its own; back near the top it reverses.
        let forward = false;
        const sync = (scrolled: number) => {
          const next = scrolled > PLAY_THRESHOLD_PX;
          if (next === forward) return;
          forward = next;
          if (reduced) {
            tl.progress(forward ? 1 : 0);
          } else if (forward) {
            lock.enable();
            tl.timeScale(1).play();
          } else {
            tl.timeScale(1.6).reverse();
          }
        };
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          onUpdate: (self) => sync(self.scroll() - self.start),
          onLeave: () => sync(Infinity),
        });
        // This pin is created after the intro, i.e. after the sections below
        // set up their triggers; re-order and re-measure them around it.
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        buildScroll();
        return () => {
          if (onRefresh)
            ScrollTrigger.removeEventListener("refresh", onRefresh);
        };
      }

      const html = document.documentElement;
      const unlock = () => html.classList.remove("is-intro");

      window.scrollTo(0, 0);
      html.classList.add("is-intro");

      const play = contextSafe!(() => {
        const wordmark = q("[data-wordmark]")[0] as HTMLElement;
        const lines = q("[data-wordmark-line]");
        const navItems = q("[data-nav-item]");
        const pen = q("[data-pen]");
        const sketch = q("[data-sketch]");
        const photo = q("[data-photo]");
        const photoInner = q("[data-project-photo='0']");

        // FLIP: measure the wordmark in its final place, then offset it to
        // the centre of the viewport and let the timeline bring it home.
        const r = wordmark.getBoundingClientRect();
        const dx = window.innerWidth / 2 - (r.left + r.width / 2);
        const dy = window.innerHeight / 2 - (r.top + r.height / 2);
        gsap.set(wordmark, { x: dx, y: dy, autoAlpha: 1 });
        gsap.set(lines, { textContent: "" });
        gsap.set(navItems, { textContent: "" });

        const tl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => {
            unlock();
            gsap.set(wordmark, { clearProps: "transform" });
            buildScroll();
          },
        });

        // 1. Wordmark scrambles in, centred
        lines.forEach((line, i) => {
          tl.to(
            line,
            {
              duration: 1.3,
              ease: "none",
              scrambleText: {
                text: WORDMARK[i].toUpperCase(),
                chars: SCRAMBLE_CHARS,
                revealDelay: 0.35,
                speed: 0.45,
              },
            },
            0.2 + i * 0.3,
          );
        });

        // 2. The drawing is drawn top to bottom behind it; the pen line leads
        tl.fromTo(
          "[data-image-frame]",
          { autoAlpha: 1, clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.6,
            ease: "power2.inOut",
          },
          0.7,
        ).fromTo(
          pen,
          { autoAlpha: 1, top: "0%" },
          { top: "100%", duration: 1.6, ease: "power2.inOut" },
          0.7,
        );

        // 3. Guides draw on, nav scrambles in
        tl.fromTo(
          "[data-guide='v']",
          { autoAlpha: 1, scaleY: 0 },
          { scaleY: 1, duration: 1.4, stagger: 0.12 },
          2.0,
        ).fromTo(
          "[data-guide='h']",
          { autoAlpha: 1, scaleX: 0 },
          { scaleX: 1, duration: 1.4 },
          2.0,
        );
        navItems.forEach((item, i) => {
          tl.set(item, { autoAlpha: 1 }, 2.3 + i * 0.08).to(
            item,
            {
              duration: 0.8,
              ease: "none",
              scrambleText: {
                text: (item.getAttribute("aria-label") ?? "").toUpperCase(),
                chars: "upperCase",
                speed: 0.6,
              },
            },
            2.3 + i * 0.08,
          );
        });
        tl.fromTo(q("[data-lang-switch]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 2.7);

        // 4. Wordmark travels to its place in the layout
        tl.to(wordmark, { x: 0, y: 0, duration: 1.4 }, 2.4);

        // 5. Drawing turns into the render (pen sweeps back up)
        tl.fromTo(
          photo,
          { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 },
          3.0,
        )
          .fromTo(
            photoInner,
            { scale: 1.08 },
            { scale: 1, duration: 1.8, ease: "power3.out" },
            3.0,
          )
          .to(sketch, { scale: 1.04, duration: 1.5 }, 3.0)
          .to(pen, { top: "0%", duration: 1.5 }, 3.0)
          .to(pen, { autoAlpha: 0, duration: 0.3, ease: "none" }, 4.3);

        // 6. The rest of the page
        tl.fromTo(
          "[data-side-item]",
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
          },
          3.7,
        );
      });

      // Hold the blank screen until the fonts (for the FLIP measurement) and
      // both images are ready, but never longer than ASSET_TIMEOUT_MS.
      let cancelled = false;
      const ready = Promise.all([
        document.fonts.ready,
        waitForImage(q("[data-sketch] img")[0] as HTMLImageElement),
        waitForImage(q("[data-project-photo='0']")[0] as HTMLImageElement),
      ]);
      const timeout = new Promise((r) => setTimeout(r, ASSET_TIMEOUT_MS));
      Promise.race([ready, timeout]).then(() => {
        if (!cancelled) play();
      });

      return () => {
        cancelled = true;
        unlock();
        if (onRefresh) ScrollTrigger.removeEventListener("refresh", onRefresh);
      };
    },
    { scope },
  );

  // Hovered project: its photo fades in over the current one
  useGSAP(
    () => {
      // Skip unchanged index (incl. Strict Mode's second mount run), which
      // would otherwise force photo 0 visible before the intro reveals it.
      if (shownActive.current === active) return;
      shownActive.current = active;
      revealOnTop(
        gsap.utils.toArray("[data-project-photo]", root.current),
        active,
        photoZ,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
      );
    },
    { dependencies: [active], scope: root },
  );

  return (
    <div ref={scope}>
      <section
        ref={root}
        className="relative h-svh min-h-[640px] w-full overflow-clip bg-surface"
      >
        {/* Page guides + section top border */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span
            data-intro
            data-guide="v"
            className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)] origin-top"
          />
          <span
            data-intro
            data-guide="v"
            className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)] origin-top"
          />
          <span
            data-intro
            data-guide="h"
            className="guide-h absolute inset-x-0 top-[var(--section-border-offset)] origin-left"
          />
        </div>

        {/* Image: line drawing underneath, render on top */}
        <div
          data-hero-image
          className="hero-image absolute left-1/2 -translate-x-1/2"
        >
          <div
            data-intro
            data-image-frame
            className="absolute inset-0 overflow-clip"
          >
            <div data-sketch className="absolute inset-0">
              <Image
                src={slides[0]?.photo.sketch ?? slides[0]?.photo.src}
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 28vw, 70vw"
                className="object-cover"
              />
            </div>
            {/* One photo per project; the first is the hero render. Sized for
              the full-screen state they grow into. */}
            <div
              data-intro
              data-photo
              className="absolute inset-0 overflow-clip"
            >
              {PROJECTS.map((project, i) => (
                <Image
                  key={project.key}
                  data-project-photo={i}
                  src={project.photo.src}
                  alt={i === active ? project.photo.alt : ""}
                  fill
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  sizes="100vw"
                  className={`object-cover ${i === 0 ? "" : "invisible"}`}
                />
              ))}
            </div>
          </div>
          {/* The "pen": a dashed line that leads the drawing, overshooting like a crop mark */}
          <span
            data-intro
            data-pen
            aria-hidden
            className="guide-h absolute -inset-x-[var(--frame-overshoot-inner)] top-0"
          />
        </div>

        {/* Content box (80vh, on the 12-column grid). The image above is a
          separate layer over columns 5–8 so it can grow to full screen.
          1–4: headline (in the fixed header below; may overflow onto the
          image) · 9–12: subtext + CTA. */}
        <div className="hero-content container-page grid-12 absolute inset-x-0">
          <div className="col-span-12 col-start-1 row-start-1 flex flex-col items-start gap-space-lg self-end text-left lg:col-span-4 lg:col-start-9">
            {/* tracking-normal: at type-lead's 0.12em the tagline runs into the image (Paper hero uses 0). */}
            <p data-intro data-side-item className="type-lead tracking-normal">
              {tagline}
            </p>
            <Link
              data-intro
              data-side-item
              href={ROUTES.book}
              className="type-link flex w-max items-center gap-space-sm border-b border-ink pb-space-xs"
            >
              {ctaLabel}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden
                className="shrink-0"
              >
                <path
                  d="M2 12L12 2M5 2h7v7"
                  fill="none"
                  stroke="currentColor"
                  style={{ strokeWidth: "var(--stroke-icon)" }}
                />
              </svg>
            </Link>
          </div>
        </div>

        <ProjectsOverlay slides={slides} active={active} onActivate={setActive} />

        <noscript>
          <style>{`[data-intro]{visibility:visible!important}`}</style>
        </noscript>
      </section>

      {/* Fixed header: wordmark and nav. Same box as the hero, so the
          wordmark's home is the hero layout; it shrinks into the navbar on
          scroll and both follow the page from then on. */}
      <header
        data-header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-svh min-h-[640px] text-ink"
      >
        {/* Nav */}
        <nav
          data-nav
          aria-label="Main"
          className="pointer-events-auto absolute right-[calc(var(--page-guide)+var(--spacing-space-sm))] top-[calc(var(--section-border-offset)+var(--spacing-space-xs))]"
        >
          <ul className="flex flex-col items-end gap-space-md">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  aria-label={t(key)}
                  data-intro
                  data-nav-item
                  className="type-label block min-h-[1lh]"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
            <li className="pt-space-xs">
              <LanguageSwitch data-intro data-lang-switch />
            </li>
          </ul>
        </nav>

        <div className="hero-content container-page grid-12 absolute inset-x-0">
          <h1
            data-intro
            data-wordmark
            aria-label="Celine Studio"
            className="type-display relative z-10 col-span-12 col-start-1 row-start-1 self-start whitespace-pre uppercase lg:col-span-4"
          >
            {WORDMARK.map((word) => (
              <span
                key={word}
                aria-hidden
                data-wordmark-line
                className="block h-[1lh]"
              >
                {word}
              </span>
            ))}
          </h1>
        </div>
      </header>
    </div>
  );
}

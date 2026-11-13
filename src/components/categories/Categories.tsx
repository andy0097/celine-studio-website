"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CATEGORIES, type CategoryProject } from "@/content/categories";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path d="M2 12L12 2M5 2h7v7" fill="none" stroke="currentColor" style={{ strokeWidth: "var(--stroke-icon)" }} />
    </svg>
  );
}

/** Stand-in until a project's sketch exists. */
function SketchPlaceholder() {
  return (
    <div className="absolute inset-0 bg-surface-alt p-[var(--inset-frame-padding)]">
      <div className="flex h-full items-center justify-center border border-dashed border-line">
        <span className="type-fig text-ink-muted">Sketch — coming soon</span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: CategoryProject }) {
  return (
    <a data-card href={project.href} className="group invisible col-span-12 block sm:col-span-4 lg:col-span-3">
      <div data-card-media className="relative aspect-[304/210] overflow-clip bg-surface-alt">
        {project.image ? (
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 100vw"
            className="object-cover"
            style={{ objectPosition: project.image.position }}
          />
        ) : (
          <SketchPlaceholder />
        )}
        {/* Sketch: wiped in bottom to top on hover/focus */}
        <div
          aria-hidden
          className="absolute inset-0 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)] motion-reduce:transition-none"
        >
          {project.sketch ? (
            <Image src={project.sketch} alt="" fill sizes="(min-width: 1024px) 300px, 100vw" className="bg-surface object-cover" />
          ) : (
            <SketchPlaceholder />
          )}
        </div>
      </div>
      <div data-card-caption className="mt-[var(--card-caption-gap)] flex items-start justify-between gap-space-md">
        <span className="type-label-caption">{project.title}</span>
        <Arrow />
      </div>
    </a>
  );
}

/**
 * Residential / HORECA. Hovering (or focusing, or tapping) a category row
 * opens that category's projects directly above it. Each row has its own
 * collapsible card slot, plus an empty spacer at the top for when nothing is
 * open; exactly one of the three is open at a time, so the section's height
 * never changes and the hovered row stays under the cursor (hovering HORECA
 * moves Residential up). Leaving the section closes the cards. Hovering a
 * project wipes its photo into its sketch. On touch screens Residential is
 * open from the start.
 */
export default function Categories() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const firstRun = useRef(true);

  // Section lines draw on as it scrolls in; touch screens start on Residential
  useGSAP(
    () => {
      if (window.matchMedia("(hover: none)").matches) setActive(0);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top 85%", toggleActions: "play none none reverse" },
        })
        .fromTo(q("[data-cat-line]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.15, ease: "power3.inOut" })
        .fromTo(
          q("[data-cat-title]"),
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" },
          0.2,
        )
        .fromTo(q("[data-cat-all]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.12 }, 0.6);
    },
    { scope: root },
  );

  // Open the active slot (or the idle spacer), close the rest
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const instant =
        firstRun.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      firstRun.current = false;
      const open = active === null ? "idle" : String(active);

      // Every slot gets the tallest slot's height, so the sum stays constant
      const layout = (animate: boolean) => {
        const inners = q("[data-slot-inner]");
        gsap.set(inners, { minHeight: 0 });
        const h = Math.max(...inners.map((el) => (el as HTMLElement).offsetHeight));
        gsap.set(inners, { minHeight: h });
        q("[data-slot]").forEach((slot) => {
          gsap.to(slot, {
            height: (slot as HTMLElement).dataset.slot === open ? h : 0,
            duration: animate ? 0.8 : 0,
            ease: "power3.inOut",
            overwrite: "auto",
          });
        });
      };
      layout(!instant);

      // Cards: the opening slot's wipe in; the others fade out
      q("[data-slot]").forEach((slot) => {
        const s = gsap.utils.selector(slot);
        const cards = s("[data-card]");
        if (!cards.length) return;
        if ((slot as HTMLElement).dataset.slot === open) {
          gsap.set(cards, { autoAlpha: 1 });
          gsap.fromTo(
            s("[data-card-media]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: instant ? 0 : 0.8, stagger: 0.08, delay: instant ? 0 : 0.25, ease: "power3.inOut", overwrite: true },
          );
          gsap.fromTo(
            s("[data-card-caption]"),
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: instant ? 0 : 0.5, stagger: 0.08, delay: instant ? 0 : 0.6, ease: "power2.out", overwrite: true },
          );
        } else {
          gsap.to(cards, { autoAlpha: 0, duration: instant ? 0 : 0.4, overwrite: true });
        }
      });

      const onResize = () => layout(false);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { dependencies: [active], scope: root },
  );

  const slot = (key: string, children?: ReactNode) => (
    <div data-slot={key} className="h-0 overflow-hidden">
      <div data-slot-inner className="container-page pt-space-xl pb-space-md">
        {children}
      </div>
    </div>
  );

  return (
    <section
      ref={root}
      id="projects"
      aria-label="Projects by category"
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setActive(null);
      }}
      className="relative bg-surface pt-[var(--section-border-offset)] pb-[calc(var(--spacing-space-5xl)+var(--spacing-space-xs))]"
    >
      {/* Page guides + section top border */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)]" />
        <span className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)]" />
        <span data-cat-line className="guide-h absolute inset-x-0 top-[var(--section-border-offset)] origin-left" />
      </div>

      {/* Empty space held while no category is open */}
      {slot("idle")}

      {CATEGORIES.map((category, i) => (
        <div key={category.slug}>
          {/* This category's projects (3 columns each), open while hovered */}
          {slot(
            String(i),
            <div aria-live="polite" className="grid-12 gap-y-space-xl">
              {category.projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>,
          )}

          {/* Category row */}
          <div
            id={category.slug}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setActive(i);
            }}
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="relative"
          >
            <div className="container-page flex flex-wrap items-baseline justify-between gap-x-space-lg gap-y-space-md pt-[calc(var(--spacing-space-3xl)+var(--spacing-space-xs))] pb-[var(--section-border-offset)]">
              <h2 data-cat-title className="type-display-tight">
                {category.name}
              </h2>
              <a
                data-cat-all
                href={category.allHref}
                className="type-link flex items-center gap-space-sm border-b border-ink pb-space-xs"
              >
                See all {category.name} projects
                <Arrow />
              </a>
            </div>
            <span aria-hidden data-cat-line className="guide-h pointer-events-none absolute inset-x-0 bottom-0 origin-left" />
          </div>
        </div>
      ))}
    </section>
  );
}

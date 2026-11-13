"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PROJECTS } from "@/content/projects";
import { revealOnTop } from "./stack";

type Props = {
  active: number;
  onActivate: (index: number) => void;
};

/**
 * The reference-projects layer that sits over the hero image once it has grown
 * to full screen. Its entrance is driven by the hero's scroll timeline (the
 * data-proj-* hooks); hovering a row switches the panel image here and the
 * background photo in Hero.
 */
export default function ProjectsOverlay({ active, onActivate }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const z = useRef(PROJECTS.length);
  // Last index shown. Compared against `active` rather than using a "first
  // run" flag: React Strict Mode runs effects twice on mount, and a flag would
  // let the second run reveal layer 0 (forcing it visible during the intro).
  const shown = useRef(active);

  // New panel image is drawn on top to bottom, like the hero intro
  useGSAP(
    () => {
      if (shown.current === active) return;
      shown.current = active;
      revealOnTop(
        gsap.utils.toArray("[data-panel-layer]", root.current),
        active,
        z,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut" },
      );
    },
    { dependencies: [active], scope: root },
  );

  return (
    <div ref={root} className="pointer-events-none absolute inset-0">
      <div data-scroll-reveal data-proj-overlay className="bg-overlay-photo absolute inset-0" />

      {/* Guides, on dark */}
      <div aria-hidden className="absolute inset-0 [--guide-color:var(--color-line-on-dark)]">
        <span data-scroll-reveal data-proj-guide="v" className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)] origin-top" />
        <span data-scroll-reveal data-proj-guide="v" className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)] origin-top" />
        <span data-scroll-reveal data-proj-guide="h" className="guide-h absolute inset-x-0 top-[var(--section-border-offset)] origin-left" />
      </div>

      {/* Content on the 12-column grid: list on 1–6, drawing panel on 9–12 */}
      <div className="container-page grid-12 absolute inset-x-0 bottom-space-4xl items-end">
      <ul
        aria-label="Reference projects"
        className="pointer-events-auto col-span-12 flex flex-col gap-space-lg lg:col-span-6"
      >
        {PROJECTS.map((project, i) => {
          const isActive = i === active;
          return (
            <li key={project.slug} data-scroll-reveal data-proj-row>
              <a
                href={`#${project.slug}`}
                onMouseEnter={() => onActivate(i)}
                onFocus={() => onActivate(i)}
                aria-current={isActive ? "true" : undefined}
                className={`flex items-baseline border-b border-dashed pb-space-md transition-colors duration-500 ${
                  isActive ? "border-on-dark/50 text-on-dark" : "border-on-dark/20 text-on-dark-muted"
                }`}
              >
                <span className="type-label w-14 shrink-0 max-lg:w-space-2xl">{project.number}</span>
                <span className="type-lead grow max-lg:text-base max-lg:leading-6">{project.title}</span>
                <span className="type-label">{project.location}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Drawing panel */}
      <div
        data-scroll-reveal
        data-proj-panel
        aria-hidden
        className="col-span-4 col-start-9 border border-dashed border-on-dark/60 p-[var(--inset-frame-padding)] max-lg:hidden"
      >
        <div data-proj-panel-inner className="relative aspect-[380/460] w-full overflow-clip bg-surface">
          {PROJECTS.map((project, i) => (
            <div
              key={project.slug}
              data-panel-layer
              className={`absolute inset-0 ${i === 0 ? "" : "invisible"}`}
            >
              <Image src={project.panel.src} alt="" fill sizes="400px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

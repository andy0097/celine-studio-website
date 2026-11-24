"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import ProjectsOverlay from "@/components/hero/ProjectsOverlay";
import type { HeroSlide } from "@/components/hero/Hero";

/**
 * ProjectsOverlay on its own: on the site it sits over the hero once the
 * image has grown full screen, and the hero's scroll timeline reveals it.
 * Here it is shown in that end state, over the active slide's photo.
 */
export function ProjectsOverlayDemo({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const photo = slides[active]?.photo;
  return (
    <div data-overlay-demo className="relative h-screen min-h-[640px] w-full overflow-clip bg-ink">
      <style>{`[data-overlay-demo] [data-scroll-reveal]{visibility:visible}`}</style>
      {photo?.src && <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-cover" />}
      <ProjectsOverlay slides={slides} active={active} onActivate={setActive} />
    </div>
  );
}

/** Lets the form be tried in the library without sending a real request. */
export function NoSubmit({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      onSubmitCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}

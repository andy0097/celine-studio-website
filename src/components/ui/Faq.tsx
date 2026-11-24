"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PlusMinus } from "./icons";

gsap.registerPlugin(useGSAP);

export type FaqItem = { q: string; a: string };

/**
 * Accordion with dashed row dividers (the open row's line at 50%, others at
 * 20%). One open at a time; the first is open by default. Answers slide
 * open/closed and fade.
 */
export default function Faq({ items, className = "" }: { items: FaqItem[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  const first = useRef(true);

  useGSAP(
    () => {
      const instant = first.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      first.current = false;
      gsap.utils.toArray<HTMLElement>("[data-faq-panel]", root.current).forEach((panel, i) => {
        const isOpen = i === open;
        gsap.to(panel, {
          height: isOpen ? "auto" : 0,
          duration: instant ? 0 : 0.6,
          ease: "power3.inOut",
          overwrite: true,
        });
        gsap.to(panel.firstElementChild, {
          autoAlpha: isOpen ? 1 : 0,
          y: isOpen ? 0 : -8,
          duration: instant ? 0 : 0.5,
          delay: isOpen && !instant ? 0.15 : 0,
          overwrite: true,
        });
      });
    },
    { dependencies: [open], scope: root },
  );

  return (
    <div ref={root} data-stagger className={`flex flex-col border-b border-dashed border-ink/20 ${className}`}>
      {items.map((item, i) => {
        const isOpen = i === open;
        const id = `faq-${i}-${item.q.length}`;
        return (
          <div
            key={item.q}
            className={`border-t border-dashed transition-colors duration-500 ${isOpen ? "border-ink/50" : "border-ink/20"}`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : i)}
                className="type-body flex w-full items-center justify-between gap-space-lg py-space-lg text-left"
              >
                {item.q}
                <PlusMinus open={isOpen} />
              </button>
            </h3>
            <div id={id} data-faq-panel role="region" className={`overflow-hidden ${i === 0 ? "" : "h-0"}`}>
              <p className="type-link-list max-w-[640px] pb-space-xl text-ink-muted">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

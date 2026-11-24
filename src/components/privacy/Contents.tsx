"use client";

import { useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Sticky table of contents. The section being read is marked (ink, its
 * divider at 50%); the others stay muted.
 */
export default function Contents({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useGSAP(() => {
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (self) => self.isActive && setActive(id),
      });
    });
  }, [items]);

  return (
    <nav aria-label="Contents" className="lg:sticky lg:top-[calc(var(--header-h)+var(--spacing-space-4xl))]">
      <ol data-stagger className="flex flex-col border-b border-dashed border-ink/20">
        {items.map((item, i) => {
          const on = item.id === active;
          return (
            <li key={item.id} className={`border-t border-dashed transition-colors duration-500 ${on ? "border-ink/50" : "border-ink/20"}`}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "location" : undefined}
                className={`type-label flex gap-space-lg py-space-sm transition-colors duration-500 ${on ? "text-ink" : "text-ink-muted hover:text-ink"}`}
              >
                <span className="w-space-lg shrink-0">{String(i + 1).padStart(2, "0")}</span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

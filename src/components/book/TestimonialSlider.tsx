"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import Attribution from "@/components/ui/Attribution";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";

gsap.registerPlugin(SplitText, useGSAP);

export type Quote = { quote: string; name: string; initials: string; project: string };

/**
 * One quote at a time on stone, with a counter and arrows. Changing quote:
 * the lines drop away behind their masks, the next quote rises in (the
 * headline reveal from Home). Keyboard: arrows are buttons; the quote is a
 * polite live region.
 */
export default function TestimonialSlider({ quotes }: { quotes: Quote[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const busy = useRef(false);
  const t = useTranslations("Book");

  function go(dir: 1 | -1, contextSafe: <T extends (...args: never[]) => unknown>(fn: T) => T) {
    if (busy.current) return;
    const next = (index + dir + quotes.length) % quotes.length;
    setIndex(next);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(next);
      return;
    }
    busy.current = true;
    const quoteEl = root.current!.querySelector("[data-slide-quote]")!;
    const out = SplitText.create(quoteEl, { type: "lines", mask: "lines" });
    gsap.set(out.masks, { paddingBottom: "0.25em", marginBottom: "-0.25em" });
    gsap
      .timeline({
        onComplete: () => {
          out.revert();
          setShown(next);
          // Wait for React to render the new quote, then bring it in
          requestAnimationFrame(() =>
            requestAnimationFrame(
              contextSafe(() => {
                const inn = SplitText.create(quoteEl, { type: "lines", mask: "lines" });
                gsap.set(inn.masks, { paddingBottom: "0.25em", marginBottom: "-0.25em" });
                gsap.from(inn.lines, {
                  yPercent: 130,
                  duration: 0.8,
                  stagger: 0.08,
                  ease: "power3.out",
                  onComplete: () => {
                    inn.revert();
                    busy.current = false;
                  },
                });
                gsap.fromTo("[data-slide-who]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.3 });
              }),
            ),
          );
        },
      })
      .to(out.lines, { yPercent: dir === 1 ? -130 : 130, duration: 0.5, stagger: 0.05, ease: "power2.in" })
      .to("[data-slide-who]", { autoAlpha: 0, duration: 0.3 }, 0);
  }

  // The click handler, wrapped by useGSAP so its animations are cleaned up
  // with the component. Re-wrapped when `index` changes (fresh closure).
  const goRef = useRef<(dir: 1 | -1) => void>(() => {});
  useGSAP(
    (_, contextSafe) => {
      goRef.current = contextSafe!((dir: 1 | -1) => go(dir, contextSafe!));
    },
    { scope: root, dependencies: [index] },
  );


  const q = quotes[shown];
  return (
    <div ref={root} className="flex flex-col gap-space-2xl">
      <div className="flex items-center justify-between gap-space-lg">
        <p data-fade className="type-label">{t("testimonials")}</p>
        <div className="flex items-center gap-space-lg">
          <span className="type-label whitespace-nowrap tabular-nums" aria-hidden>
            {String(index + 1).padStart(2, "0")} / {String(quotes.length).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => goRef.current(-1)} aria-label={t("previous")} className="-m-space-xs p-space-xs transition-transform hover:-translate-x-0.5">
            <ArrowLeft />
          </button>
          <button type="button" onClick={() => goRef.current(1)} aria-label={t("next")} className="-m-space-xs p-space-xs transition-transform hover:translate-x-0.5">
            <ArrowRight />
          </button>
        </div>
      </div>
      {/* Keyed so each quote is a fresh element: SplitText rewrites its
          children, which React must not try to update in place. */}
      <figure data-fade aria-live="polite" className="flex flex-col gap-space-2xl">
        <blockquote key={shown} data-slide-quote className="type-quote max-w-[1100px]">
          “{q.quote}”
        </blockquote>
        <Attribution data-slide-who initials={q.initials} name={q.name} project={q.project} />
      </figure>
    </div>
  );
}

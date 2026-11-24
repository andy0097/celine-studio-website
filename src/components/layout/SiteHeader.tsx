"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitch from "./LanguageSwitch";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import { NAV, ROUTES } from "@/i18n/links";

gsap.registerPlugin(ScrambleTextPlugin, useGSAP);

/**
 * Header for the inner pages: the homepage header in its scrolled state.
 * The "CELINE / STUDIO" wordmark sits top left at navbar size (30px tall),
 * mirroring the nav's inset on the right; the nav is the same vertical list
 * as on Home. Fixed, so it follows the page. PageMotion switches its colour
 * over dark sections (data-tone).
 * On first load the nav scrambles in like on Home; it persists across
 * client-side navigation, so it doesn't replay between inner pages.
 */
export default function SiteHeader() {
  const root = useRef<HTMLElement>(null);
  const t = useTranslations("Nav");

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(q("[data-header-lang]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.7 });
      gsap.fromTo(
        q("[data-header-logo]"),
        { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.2 },
      );
      q("[data-header-nav-item]").forEach((item, i) => {
        const text = item.textContent ?? "";
        gsap.fromTo(
          item,
          { autoAlpha: 1, textContent: "" },
          {
            delay: 0.3 + i * 0.08,
            duration: 0.8,
            ease: "none",
            scrambleText: { text, chars: "upperCase", speed: 0.6 },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      data-site-header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 text-ink"
    >
      <Link
        href={ROUTES.home}
        aria-label={t("home")}
        data-header-logo
        className="type-nav-logo pointer-events-auto absolute top-[calc(var(--section-border-offset)+var(--spacing-space-xs))] left-[calc(var(--page-guide)+var(--spacing-space-sm))] block"
      >
        <span aria-hidden className="block">Celine</span>
        <span aria-hidden className="block">Studio</span>
      </Link>

      <nav
        aria-label={t("main")}
        data-header-nav
        className="pointer-events-auto absolute top-[calc(var(--section-border-offset)+var(--spacing-space-xs))] right-[calc(var(--page-guide)+var(--spacing-space-sm))]"
      >
        <ul className="flex flex-col items-end gap-space-md">
          {NAV.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-label={t(item.key)}
                data-header-nav-item
                className="type-label block min-h-[1lh]"
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
          <li className="pt-space-xs">
            <LanguageSwitch data-header-lang />
          </li>
        </ul>
      </nav>
    </header>
  );
}

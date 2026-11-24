"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { NAV as EXPLORE_LINKS, ROUTES, type Href } from "@/i18n/links";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path d="M2 12L12 2M5 2h7v7" fill="none" stroke="currentColor" style={{ strokeWidth: "var(--stroke-icon)" }} />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path d="M1 7h12M8 2l5 5-5 5" fill="none" stroke="currentColor" style={{ strokeWidth: "var(--stroke-icon)" }} />
    </svg>
  );
}

/** Column heading: small muted label, as in the design. */
function Heading({ children, id, htmlFor }: { children: string; id?: string; htmlFor?: string }) {
  const Tag = htmlFor ? "label" : "h2";
  return (
    <Tag id={id} htmlFor={htmlFor} className="type-label block text-ink-muted">
      {children}
    </Tag>
  );
}

/**
 * Footer (Paper "Section — Footer"). Three bands, split by full-width dashed
 * lines between the page guides:
 * 1. Contact + CTA · Explore · Projects · Newsletter
 * 2. The "Celine" wordmark, which rises out of its band as you reach it
 * 3. Copyright, tagline, legal links
 * Below 1024px the columns become a 2-up / stacked grid.
 */
export type FooterContent = {
  contact: { email: string; phone: string | null; address: string | null };
  /** Featured projects; RES / HORECA tag. Those without a page point at their category. */
  projects: { key: string; title: string; tag: "res" | "horeca"; href: Href }[];
  newsletterTitle: string;
  newsletterText: string;
  tagline: string;
  legal: ({ label: string; href: Href } | { label: string; external: string })[];
};

export default function Footer({ content }: { content: FooterContent }) {
  const root = useRef<HTMLElement>(null);
  const t = useTranslations("Nav");
  const f = useTranslations("Footer");
  const c = useTranslations("Common");
  const CONTACT = content.contact;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(
        q("[data-footer-wordmark]"),
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: q("[data-footer-wordmark-band]")[0],
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="contact" className="relative w-full overflow-clip bg-surface">
      {/* Page guides + section top border */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="guide-v absolute top-0 bottom-0 left-[var(--page-guide)]" />
        <span className="guide-v absolute top-0 bottom-0 right-[var(--page-guide)]" />
        <span className="guide-h absolute inset-x-0 top-[var(--section-border-offset)]" />
      </div>

      {/* 1. Columns */}
      <div className="container-page pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl)+var(--spacing-space-xs))] pb-space-5xl">
        <div className="grid grid-cols-1 gap-x-space-3xl gap-y-space-2xl sm:grid-cols-2 lg:flex lg:items-start">
          {/* Contact + CTA */}
          <div className="flex flex-col items-start gap-space-xl sm:col-span-2 lg:flex-1">
            <address className="flex flex-col gap-[6px] not-italic">
              <a href={`mailto:${CONTACT.email}`} className="type-link-list">
                {CONTACT.email}
              </a>
              {CONTACT.phone && (
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="type-link-list">
                  {CONTACT.phone}
                </a>
              )}
              {CONTACT.address && <span className="type-link-list font-normal text-ink-muted">{CONTACT.address}</span>}
            </address>
            <Link
              href={ROUTES.book}
              className="type-link flex items-center gap-[14px] bg-ink px-[22px] py-space-md text-surface"
            >
              {c("bookConsultation")}
              <ArrowUpRight />
            </Link>
          </div>

          {/* Explore */}
          <nav aria-labelledby="footer-explore" className="flex flex-col gap-space-lg lg:w-[160px] lg:shrink-0 lg:pt-[6px]">
            <Heading id="footer-explore">{f("explore")}</Heading>
            <ul className="flex flex-col gap-space-sm">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="type-link-list block">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Projects */}
          <div className="flex flex-col gap-space-lg lg:w-[232px] lg:shrink-0 lg:pt-[6px]">
            <Heading>{f("projects")}</Heading>
            <ul className="flex flex-col gap-space-sm">
              {content.projects.map((project) => (
                <li key={project.key}>
                  <Link href={project.href} className="flex items-baseline justify-between gap-space-sm">
                    <span className="type-link-list">{project.title}</span>
                    <span className="type-label text-ink-muted">{f(project.tag === "res" ? "tagRes" : "tagHoreca")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <form
            className="flex flex-col gap-space-lg sm:col-span-2 lg:w-[260px] lg:shrink-0 lg:pt-[6px]"
            onSubmit={(e) => {
              // TODO: connect to the newsletter provider.
              e.preventDefault();
            }}
          >
            <Heading htmlFor="footer-newsletter-email">{content.newsletterTitle}</Heading>
            <div className="flex items-center gap-space-sm border-b border-ink pb-[10px]">
              <input
                id="footer-newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder={f("emailPlaceholder")}
                className="type-link-list min-w-0 flex-1 bg-transparent font-normal outline-none placeholder:text-ink-subtle"
              />
              <button type="submit" aria-label={f("subscribe")} className="-m-space-xs p-space-xs">
                <ArrowRight />
              </button>
            </div>
            <p className="type-label text-ink-muted">{content.newsletterText}</p>
          </form>
        </div>
      </div>

      {/* 2. Wordmark */}
      <div data-footer-wordmark-band className="relative">
        <span aria-hidden className="guide-h absolute inset-x-0 top-0" />
        <div className="container-page overflow-clip pt-space-lg">
          <p
            aria-hidden
            data-footer-wordmark
            className="type-wordmark text-center text-[length:min(500px,calc((100vw-2*var(--page-margin))/2.4))] text-ink opacity-64"
          >
            Celine
          </p>
        </div>
      </div>

      {/* 3. Bottom bar */}
      <div className="relative">
        <span aria-hidden className="guide-h absolute inset-x-0 top-0" />
        <div className="container-page type-label flex flex-col gap-space-md pt-[22px] pb-space-2xl lg:flex-row lg:items-center lg:justify-between">
          <p>{f("copyright", { year: 2026 })}</p>
          <p>{content.tagline}</p>
          <ul className="flex gap-space-xl">
            {content.legal.map((link) => (
              <li key={link.label}>
                {"external" in link ? (
                  <a href={link.external} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

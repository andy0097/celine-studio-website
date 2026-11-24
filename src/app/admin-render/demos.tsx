import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { getComponent } from "@/design-system/registry";
import type { Locale } from "@/design-system/types";
import { ROUTES } from "@/i18n/links";
import { TextLink, ButtonLink } from "@/components/ui/links";
import { Eyebrow, Fig, Tag } from "@/components/ui/labels";
import { CropMarks, DimensionLine } from "@/components/ui/drawing";
import SketchImage from "@/components/ui/SketchImage";
import Attribution from "@/components/ui/Attribution";
import Faq, { type FaqItem } from "@/components/ui/Faq";
import { ArrowLeft, ArrowRight, ArrowUpRight, PlusMinus } from "@/components/ui/icons";
import CtaConversation from "@/components/sections/CtaConversation";
import ProjectRows from "@/components/sections/ProjectRows";
import VenueCard from "@/components/sections/VenueCard";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FourColumns from "@/components/sections/FourColumns";
import SpecRow from "@/components/sections/SpecRow";
import NumberedList from "@/components/sections/NumberedList";
import SplitHeading from "@/components/sections/SplitHeading";
import QuoteCentred from "@/components/sections/QuoteCentred";
import QuoteDisplay from "@/components/sections/QuoteDisplay";
import NextProject from "@/components/sections/NextProject";
import FaqSplit from "@/components/sections/FaqSplit";
import TestimonialSlider from "@/components/book/TestimonialSlider";
import ConsultationForm from "@/components/book/ConsultationForm";
import Contents from "@/components/privacy/Contents";
import Hero from "@/components/hero/Hero";
import CustomElements from "@/components/custom-elements/CustomElements";
import Categories from "@/components/categories/Categories";
import Process from "@/components/process/Process";
import Testimonials from "@/components/testimonials/Testimonials";
import SiteHeader from "@/components/layout/SiteHeader";
import SectionBorder from "@/components/layout/SectionBorder";
import SectionGap from "@/components/layout/SectionGap";
import Footer from "@/components/footer/Footer";
import { ProjectsOverlayDemo, NoSubmit } from "./demo-client";
import { CONTACT_EMAIL, FILL, IMAGES } from "./fixtures";

/**
 * How each registry entry is rendered in the admin component library.
 * Text comes from the entry's RO/EN `samples` (src/**\/*.meta.ts); images,
 * and list items a sample doesn't have, come from ./fixtures. The
 * components themselves are imported unchanged: what you see is what the
 * site renders.
 *
 * `frame`: "stage" centres a small component on a padded cream stage;
 * "page" renders a section edge to edge inside PageShell, as on an inner
 * page (guides, scroll motion); "bare" renders it with nothing around it
 * (the home sections, header and footer run their own motion).
 */
export type Demo = { frame: "stage" | "page" | "bare"; render: (locale: Locale) => ReactNode | Promise<ReactNode> };

type Sample = Record<string, unknown>;
const s = (name: string, locale: Locale): Sample => getComponent(name)?.samples[locale] ?? {};
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Who said the sample quotes (Attribution's sample). */
const who = (locale: Locale) => {
  const a = s("Attribution", locale);
  return { name: str(a.name), initials: str(a.initials), project: str(a.project) };
};

export const DEMOS: Record<string, Demo> = {
  // --- Components -----------------------------------------------------------
  TextLink: { frame: "stage", render: (l) => <TextLink href={ROUTES.book}>{str(s("TextLink", l).label)}</TextLink> },
  ButtonLink: { frame: "stage", render: (l) => <ButtonLink href={ROUTES.book}>{str(s("ButtonLink", l).label)}</ButtonLink> },
  Tag: { frame: "stage", render: (l) => <Tag>{str(s("Tag", l).label)}</Tag> },
  Fig: { frame: "stage", render: (l) => <Fig>{str(s("Fig", l).label)}</Fig> },
  Eyebrow: { frame: "stage", render: (l) => <Eyebrow>{str(s("Eyebrow", l).label)}</Eyebrow> },
  DimensionLine: {
    frame: "stage",
    render: (l) => <DimensionLine fig={str(s("DimensionLine", l).fig)} className="w-full max-w-[584px]" />,
  },
  CropMarks: {
    frame: "stage",
    render: (l) => (
      <div className="w-full max-w-[420px] pt-[var(--frame-overshoot-top)] pb-[var(--frame-overshoot-bottom)]">
        <div className="relative aspect-[418/528] bg-surface-alt">
          <SketchImage image={IMAGES.bathroom(l)} sizes="420px" />
          <CropMarks dimension={str(s("CropMarks", l).dimension)} />
        </div>
      </div>
    ),
  },
  SketchImage: {
    frame: "stage",
    render: (l) => (
      <div className="group relative aspect-[418/528] w-full max-w-[420px] overflow-clip bg-surface-alt">
        <SketchImage image={(s("SketchImage", l).image as Parameters<typeof SketchImage>[0]["image"]) ?? IMAGES.bathroom(l)} sizes="420px" />
      </div>
    ),
  },
  Attribution: { frame: "stage", render: (l) => <Attribution {...who(l)} /> },
  Faq: { frame: "stage", render: (l) => <Faq items={list<FaqItem>(s("Faq", l).items)} className="w-full max-w-[800px]" /> },
  Icons: {
    frame: "stage",
    render: () => (
      <ul className="type-label flex flex-wrap items-center gap-space-xl">
        {[
          ["ArrowUpRight", <ArrowUpRight key="a" />],
          ["ArrowRight", <ArrowRight key="b" />],
          ["ArrowLeft", <ArrowLeft key="c" />],
          ["PlusMinus", <PlusMinus key="d" open={false} />],
          ["PlusMinus (open)", <PlusMinus key="e" open />],
        ].map(([label, icon]) => (
          <li key={label as string} className="flex flex-col items-center gap-space-sm">
            {icon}
            <span className="text-ink-muted">{label}</span>
          </li>
        ))}
      </ul>
    ),
  },
  VenueCard: {
    frame: "stage",
    render: (l) => (
      <div className="w-full max-w-[584px]">
        <VenueCard
          title={str(s("VenueCard", l).title)}
          href={null}
          ratio={s("VenueCard", l).ratio === "584/400" ? "aspect-[584/400]" : "aspect-[584/620]"}
          image={IMAGES.dining(l)}
        />
      </div>
    ),
  },
  NumberedList: {
    frame: "stage",
    render: (l) => <NumberedList items={list<string>(s("NumberedList", l).items)} className="w-full max-w-[584px]" />,
  },
  SplitHeading: {
    frame: "page",
    render: (l) => {
      const x = s("SplitHeading", l);
      return (
        <div className="container-page py-space-4xl">
          <SplitHeading id="demo-title" eyebrow={str(x.eyebrow)} title={str(x.title)} text={str(x.text)} />
        </div>
      );
    },
  },
  ConsultationForm: {
    frame: "stage",
    render: () => (
      <NoSubmit className="w-full max-w-[584px]">
        <ConsultationForm email={CONTACT_EMAIL} />
      </NoSubmit>
    ),
  },
  Contents: {
    frame: "stage",
    render: async (l) => {
      const t = await getTranslations({ locale: l, namespace: "Privacy" });
      return (
        <div className="w-full max-w-[280px]">
          <Contents label={t("contents")} items={list<{ id: string; title: string }>(s("Contents", l).items)} />
        </div>
      );
    },
  },
  ProjectsOverlay: {
    frame: "bare",
    render: (l) => <ProjectsOverlayDemo slides={FILL.slides(l, str(list<{ title: string }>(s("ProjectsOverlay", l).projects)[0]?.title))} />,
  },

  // --- Sections -------------------------------------------------------------
  CtaConversation: {
    frame: "page",
    render: (l) => {
      const x = s("CtaConversation", l);
      return <CtaConversation fig={str(x.fig)} title={str(x.title)} cta={str(x.cta)} />;
    },
  },
  ProjectRows: {
    frame: "page",
    render: (l) => (
      <div className="container-page py-space-4xl">
        <ProjectRows
          projects={list<{ title: string; summary: string; tags: string[]; meta: string }>(s("ProjectRows", l).projects).map((p, i) => {
            const [area, year] = p.meta.split(" — ");
            return {
              _id: `demo-${i}`,
              title: p.title,
              slug: "demo",
              category: "residential",
              number: null,
              summary: p.summary,
              location: p.tags[1] ?? null,
              year: Number(year) || null,
              area: area ?? null,
              hasPage: false,
              image: (({ src, alt, sketch }) => ({ src, alt, sketch: sketch ?? null, hotspot: null, caption: null }))(IMAGES.bathroom(l)),
            };
          })}
        />
      </div>
    ),
  },
  ServicesGrid: {
    frame: "page",
    render: (l) => (
      <div className="container-page py-space-4xl">
        <ServicesGrid items={list<{ title: string; text: string }>(s("ServicesGrid", l).items)} />
      </div>
    ),
  },
  FourColumns: {
    frame: "page",
    render: (l) => (
      <div className="container-page py-space-4xl">
        <FourColumns
          cells={list<{ value: string; label: string }>(s("FourColumns", l).cells).map((c) => (
            <>
              <span className="type-heading-sm whitespace-pre">{c.value}</span>
              <span className="type-label pt-space-xs">{c.label}</span>
            </>
          ))}
        />
      </div>
    ),
  },
  SpecRow: {
    frame: "page",
    render: (l) => (
      <div className="container-page py-space-4xl">
        <SpecRow specs={list<{ label: string; value: string }>(s("SpecRow", l).specs)} />
      </div>
    ),
  },
  QuoteCentred: { frame: "page", render: (l) => <QuoteCentred quote={str(s("QuoteCentred", l).quote)} {...who(l)} /> },
  QuoteDisplay: {
    frame: "page",
    render: (l) => {
      const x = s("QuoteDisplay", l);
      return <QuoteDisplay eyebrow={str(x.eyebrow)} quote={str(x.quote)} {...who(l)} />;
    },
  },
  NextProject: { frame: "page", render: (l) => <NextProject label={str(s("NextProject", l).label)} href={ROUTES.horeca} /> },
  FaqSplit: {
    frame: "page",
    render: (l) => <FaqSplit title={str(s("FaqSplit", l).title)} items={list<FaqItem>(s("Faq", l).items)} />,
  },
  TestimonialSlider: {
    frame: "page",
    render: (l) => {
      // Its own sample plus the other quote samples, so the arrows have somewhere to go.
      const quotes = [
        ...list<{ quote: string }>(s("TestimonialSlider", l).quotes).map((q) => q.quote),
        str(s("QuoteCentred", l).quote),
        str(s("QuoteDisplay", l).quote),
      ].filter(Boolean);
      return <TestimonialSlider quotes={quotes.map((quote) => ({ quote, ...who(l) }))} />;
    },
  },
  Hero: {
    frame: "bare",
    render: (l) => {
      const x = s("Hero", l);
      return <Hero tagline={str(x.tagline)} ctaLabel={str(x.cta)} slides={FILL.slides(l, str(list<{ title: string }>(s("ProjectsOverlay", l).projects)[0]?.title))} />;
    },
  },
  CustomElements: {
    frame: "bare",
    render: (l) => <CustomElements title={str(s("CustomElements", l).title)} items={FILL.customElements(l)} />,
  },
  Categories: {
    frame: "bare",
    render: (l) => {
      const [res, horeca] = list<string>(s("Categories", l).categories);
      return (
        <Categories
          categories={[
            { slug: "residential", name: res ?? "", allHref: ROUTES.residential, projects: FILL.categoryProjects(l, "residential") },
            { slug: "horeca", name: horeca ?? "", allHref: ROUTES.horeca, projects: FILL.categoryProjects(l, "horeca") },
          ]}
        />
      );
    },
  },
  Process: {
    frame: "bare",
    render: (l) => (
      <Process
        title={FILL.processTitle[l]}
        paragraphs={FILL.processParagraphs[l]}
        cta={{ label: str(s("Process", l).cta), href: ROUTES.process }}
        image={IMAGES.living(l)}
      />
    ),
  },
  Testimonials: {
    frame: "bare",
    render: (l) => <Testimonials title={str(s("Testimonials", l).title)} items={FILL.testimonials(l)} />,
  },

  // --- Page chrome ----------------------------------------------------------
  SiteHeader: {
    frame: "bare",
    render: () => (
      <div className="relative min-h-[400px]">
        <SiteHeader />
      </div>
    ),
  },
  PageShell: {
    frame: "page",
    render: () => <div className="min-h-[600px]" />,
  },
  SectionBorder: {
    frame: "page",
    render: () => (
      <section className="relative min-h-[240px]">
        <SectionBorder />
      </section>
    ),
  },
  SectionGap: {
    frame: "bare",
    render: () => (
      <div className="relative">
        <SectionGap />
      </div>
    ),
  },
  Footer: { frame: "bare", render: (l) => <Footer content={FILL.footer(l, str(s("Footer", l).newsletter))} /> },
};

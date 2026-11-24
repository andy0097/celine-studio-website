import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { caseLink, ROUTES } from "@/i18n/links";
import Hero, { type HeroSlide } from "@/components/hero/Hero";
import CustomElements from "@/components/custom-elements/CustomElements";
import Categories, { type Category } from "@/components/categories/Categories";
import Process from "@/components/process/Process";
import Testimonials from "@/components/testimonials/Testimonials";
import Footer from "@/components/footer/Footer";
import SectionGap from "@/components/layout/SectionGap";
import { getContent, getFetchMode } from "@/sanity/lib/fetch";
import { HOME_QUERY } from "@/sanity/lib/queries";
import type { CaseStudyCard, HomeContent } from "@/sanity/lib/content-types";
import { NO_IMAGE, toImage } from "@/sanity/lib/image";
import { cardHref, footerContent, getSettings, seoMetadata } from "@/sanity/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [page, settings] = await Promise.all([getContent<HomeContent>(HOME_QUERY, locale), getSettings(locale)]);
  return seoMetadata("/", locale, page?.seo ?? null, { defaults: settings?.seo });
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const mode = await getFetchMode();
  const [page, settings, t] = await Promise.all([
    getContent<HomeContent>(HOME_QUERY, locale, mode),
    getSettings(locale, mode),
    getTranslations("Common"),
  ]);

  const slides: HeroSlide[] = (page?.hero?.slides ?? []).map((s, i) => ({
    key: s._key,
    number: String(i + 1).padStart(2, "0"),
    title: s.title,
    location: s.location ?? "",
    photo: toImage(s.image) ?? NO_IMAGE,
    panel: s.panel?.src ?? s.image?.sketch ?? null,
    href: caseLink(s.slug),
  }));

  const cards = (list: CaseStudyCard[] | null | undefined) =>
    (list ?? []).filter(Boolean).map((c) => ({
      key: c._id,
      title: c.title,
      href: cardHref(c),
      image: toImage(c.image),
      sketch: c.image?.sketch ?? null,
    }));
  const categories: Category[] = [
    { slug: "residential", name: t("residential"), allHref: ROUTES.residential, projects: cards(page?.categories?.residential) },
    { slug: "horeca", name: t("horeca"), allHref: ROUTES.horeca, projects: cards(page?.categories?.horeca) },
  ];

  return (
    <>
      <main>
        <Hero tagline={page?.hero?.tagline ?? ""} ctaLabel={page?.hero?.ctaLabel ?? t("bookConsultation")} slides={slides} />
        <SectionGap />
        <CustomElements
          title={page?.customElements?.title ?? ""}
          items={(page?.customElements?.items ?? []).map((item, i) => ({
            key: item._key,
            number: String(i + 1).padStart(2, "0"),
            title: item.title,
            image: toImage(item.image) ?? NO_IMAGE,
          }))}
        />
        <SectionGap />
        <Categories categories={categories} />
        <SectionGap />
        <Process
          title={page?.process?.title ?? ""}
          paragraphs={page?.process?.paragraphs ?? []}
          cta={{ label: page?.process?.ctaLabel ?? "", href: ROUTES.process }}
          image={toImage(page?.process?.image)}
        />
        <SectionGap />
        <Testimonials
          title={page?.testimonials?.title ?? ""}
          items={(page?.testimonials?.items ?? []).filter(Boolean).map((q) => ({
            key: q._id,
            project: q.project ?? "",
            quote: q.quote,
            client: { name: q.name, initials: q.initials },
            image: toImage(q.image),
          }))}
        />
        <SectionGap />
      </main>
      <Footer content={footerContent(settings)} />
    </>
  );
}

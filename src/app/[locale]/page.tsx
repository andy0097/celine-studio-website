import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import Hero from "@/components/hero/Hero";
import CustomElements from "@/components/custom-elements/CustomElements";
import Categories from "@/components/categories/Categories";
import Process from "@/components/process/Process";
import Testimonials from "@/components/testimonials/Testimonials";
import Footer from "@/components/footer/Footer";
import SectionGap from "@/components/layout/SectionGap";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/", locale as Locale, {
    title: "Celine Studio — Residential & HORECA interior design",
    description: "Celine Studio — interior architecture and design for homes, cafés, restaurants and hotels. Oradea, Romania.",
  });
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <>
      <main>
        <Hero />
        <SectionGap />
        <CustomElements />
        <SectionGap />
        <Categories />
        <SectionGap />
        <Process />
        <SectionGap />
        <Testimonials />
        <SectionGap />
      </main>
      <Footer />
    </>
  );
}

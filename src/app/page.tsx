import Hero from "@/components/hero/Hero";
import CustomElements from "@/components/custom-elements/CustomElements";
import Categories from "@/components/categories/Categories";
import Process from "@/components/process/Process";
import Testimonials from "@/components/testimonials/Testimonials";
import Footer from "@/components/footer/Footer";
import SectionGap from "@/components/layout/SectionGap";

export default function Home() {
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

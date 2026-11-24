import { setRequestLocale } from "next-intl/server";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/footer/Footer";
import type { Locale } from "@/i18n/routing";

/**
 * Inner pages: the fixed header (same nav as Home, in its scrolled state)
 * and the footer stay mounted while you move between pages.
 */
export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  setRequestLocale((await params).locale as Locale);
  return (
    <>
      <SiteHeader />
      {children}
      <Footer />
    </>
  );
}

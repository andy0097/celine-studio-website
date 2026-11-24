import { setRequestLocale } from "next-intl/server";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/footer/Footer";
import type { Locale } from "@/i18n/routing";
import { getFetchMode } from "@/sanity/lib/fetch";
import { footerContent, getSettings } from "@/sanity/lib/site";

/**
 * Inner pages: the fixed header (same nav as Home, in its scrolled state)
 * and the footer stay mounted while you move between pages.
 */
export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const settings = await getSettings(locale, await getFetchMode());
  return (
    <>
      <SiteHeader />
      {children}
      <Footer content={footerContent(settings)} />
    </>
  );
}

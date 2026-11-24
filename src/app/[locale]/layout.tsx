import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";
import { draftMode } from "next/headers";
import { SanityLive } from "@/sanity/lib/live";
import { PreviewTools } from "@/components/sanity/PreviewTools";
import { CookieConsent } from "@/components/consent/CookieConsent";
import "../globals.css";

// Text / UI face. Rizoma (display) is self-hosted via @font-face in globals.css.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Celine Studio",
  description: "Celine Studio — interior architecture and design.",
};

/** Both languages are rendered at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Root layout, one per language (/ = Romanian, /en = English). The
 * language comes from the URL; the proxy (src/proxy.ts) maps translated
 * slugs to these pages.
 */
export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          {children}
          {/* GA4 + Clarity load only after the visitor accepts (decision 0.8). */}
          <CookieConsent />
        </NextIntlClientProvider>
        {/* Refreshes pages when content is published; in preview, also drafts + click-to-edit. */}
        <Suspense>
          <Live />
        </Suspense>
      </body>
    </html>
  );
}

async function Live() {
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive includeDrafts={isEnabled} />
      <PreviewTools />
    </>
  );
}

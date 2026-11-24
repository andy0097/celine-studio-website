import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../../globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Component preview · Celine Studio",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Root layout for the component library's render route
 * (/admin-render/<locale>/<name>), which the admin Components tool shows in
 * frames at 390 / 768 / 1440 px. Same styles, fonts and messages as the
 * site, but no header, footer, Sanity live updates or analytics: only the
 * one component. The proxy (src/proxy.ts) leaves /admin… paths alone, so the
 * language is the path segment, not a translated URL.
 */
export default async function RenderLayout({ children, params }: LayoutProps<"/admin-render/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${instrumentSans.variable} antialiased`}>
      <body data-component-render>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

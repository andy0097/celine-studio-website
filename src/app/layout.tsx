import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

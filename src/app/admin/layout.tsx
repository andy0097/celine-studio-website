import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Celine Studio",
  robots: { index: false, follow: false },
};

/** Root layout for the backend: no site header, styles or languages. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}

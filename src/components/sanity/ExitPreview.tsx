"use client";

import { useIsPresentationTool } from "next-sanity/hooks";
import { usePathname } from "next/navigation";

/** Shown when draft mode is on outside the Studio's preview, so editors can get back to the published site. */
export function ExitPreview() {
  const inPresentation = useIsPresentationTool();
  const pathname = usePathname();
  if (inPresentation !== false) return null;
  return (
    <a
      href={`/api/draft-mode/disable?redirect=${encodeURIComponent(pathname)}`}
      className="type-label fixed right-4 bottom-4 z-50 bg-ink px-4 py-3 text-on-dark"
    >
      Exit preview
    </a>
  );
}

import type { SketchImageData } from "@/components/ui/SketchImage";
import type { Img } from "./content-types";

/** CSS object-position from the image's hotspot (its focus point in the Studio). */
export function objectPosition(img: Pick<Img, "hotspot"> | null | undefined) {
  const h = img?.hotspot;
  return h ? `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%` : undefined;
}

/** A library image as the site's image components take it; null when it has no file. */
export function toImage(img: Img | null | undefined, options: { decorative?: boolean } = {}): SketchImageData | null {
  if (!img?.src) return null;
  return {
    src: img.src,
    alt: options.decorative ? "" : (img.alt ?? ""),
    position: objectPosition(img),
    sketch: img.sketch ?? undefined,
  };
}

/** For required images: an empty frame rather than a crash when the image is missing. */
export const NO_IMAGE: SketchImageData = { src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=", alt: "" };

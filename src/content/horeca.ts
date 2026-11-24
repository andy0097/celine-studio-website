import type { SketchImageData } from "@/components/ui/SketchImage";
import { ROUTES } from "./site";
import type { AppPathname } from "@/i18n/routing";

/**
 * HORECA page (Paper "HORECA — A Editorial"). Only Street Coffee is a real
 * venue; the other three are placeholders and reuse the Home renders.
 */
export const HORECA = {
  hero: {
    image: {
      src: "/images/custom-elements/lighting.png",
      alt: "Oval blackened-steel ceiling light with inset LED strips, Street Coffee café, Oradea",
    },
  },
  venues: [
    {
      title: "Street Coffee, Oradea",
      href: ROUTES.streetCoffee as AppPathname | null,
      ratio: "aspect-[584/620]",
      image: { src: "/images/custom-elements/lighting.png", alt: "Custom oval light fixture over the Street Coffee bar, Oradea" },
    },
    {
      title: "Restaurant — placeholder",
      href: null,
      ratio: "aspect-[584/400]",
      image: { src: "/images/projects/dining.png", alt: "Placeholder: dining area with arched oak shelving and marble table" },
    },
    {
      title: "Bistro bar — placeholder",
      href: null,
      ratio: "aspect-[584/400]",
      image: { src: "/images/projects/kitchen.png", alt: "Placeholder: bar counter with an oak arch and fluted island" },
    },
    {
      title: "Boutique hotel — placeholder",
      href: null,
      ratio: "aspect-[584/620]",
      image: { src: "/images/custom-elements/staircase.png", alt: "Placeholder: curved plaster staircase with oak treads" },
    },
  ] satisfies { title: string; href: AppPathname | null; ratio: string; image: SketchImageData }[],
  testimonial: {
    eyebrow: "What an owner says",
    quote: "Our guests notice the light first. The custom fixture became the signature of our café, and the whole project ran on schedule.",
    name: "Mihai Pop",
    initials: "MP",
    project: "Owner, Street Coffee — Oradea",
  },
};

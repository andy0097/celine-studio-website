import type { SketchImageData } from "@/components/ui/SketchImage";
import { ROUTES } from "./site";

/**
 * Case study: Apartment, Oradea (Paper "Project · Apartment Oradea — A
 * Editorial"). Placeholders: area (XX m²). Images are the Home renders;
 * only the bathroom has a sketch so far.
 */
export const APARTMENT = {
  breadcrumb: "Projects / Residential / 01",
  title: ["Apartment,", "Oradea"],
  lead: "A city apartment rebuilt around light and storage.",
  specs: [
    { label: "Type", value: "Residential" },
    { label: "Location", value: "Oradea, Bihor" },
    { label: "Area", value: "XX m²" },
    { label: "Year", value: "2025" },
    { label: "Scope", value: "Design + site supervision" },
  ],
  hero: {
    src: "/images/hero/living-room.png",
    alt: "Living room with a woven pendant light, low sectional sofa and round coffee tables, Apartment Oradea",
    position: "50% 60%",
  },
  concept: {
    eyebrow: "01 — Concept",
    title: "We kept what worked and redrew the rest.",
    text: "We kept the layout that already worked and rethought everything else around light and storage, so every object has a place.",
    points: [
      "The kitchen opens to the living area, with an island that both separates and stores.",
      "Furniture drawn to the room’s dimensions — no gaps, no dead corners.",
      "Layered lighting — general, task and ambient, on separate scenes.",
    ],
    sketch: {
      src: "/images/hero/living-room_sketch.png",
      alt: "Design sketch of the living room: pendant light, sofa and round coffee tables",
      caption: "FIG. 02 — Living room, design sketch",
    },
  },
  gallery: [
    {
      caption: "Kitchen — walnut joinery, stone island",
      image: { src: "/images/projects/kitchen.png", alt: "Kitchen with walnut joinery, an oak arch and a fluted stone island, Apartment Oradea" },
    },
    {
      caption: "Bathroom — sketch overlay",
      image: {
        src: "/images/projects/residential/bathroom.png",
        alt: "Bathroom with a round backlit mirror, marble vanity and walk-in shower, Apartment Oradea",
        sketch: "/images/projects/residential/bathroom_sketch.png",
      },
    },
    {
      caption: "Hallway — staircase and oak",
      image: { src: "/images/custom-elements/staircase.png", alt: "Curved plaster staircase with oak treads beside an indoor tree, Apartment Oradea" },
    },
    {
      caption: "Dining — arched shelving",
      image: { src: "/images/projects/dining.png", alt: "Dining area with arched oak shelving, marble table and patterned bench, Apartment Oradea" },
    },
  ] satisfies { caption: string; image: SketchImageData }[],
  /** The design links Family house, Cluj, which has no page yet. */
  next: { label: "Street Coffee", href: ROUTES.streetCoffee },
};

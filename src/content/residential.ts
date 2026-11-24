import { ROUTES } from "./site";
import type { AppPathname } from "@/i18n/routing";

/**
 * Residential page (Paper "Residential — A v2 (comments applied)").
 * Placeholders: XX m², the Cluj and Home remodel case studies (no pages
 * yet), images reuse the Home renders.
 */
export const RESIDENTIAL_SERVICES = [
  "Layouts around light and storage",
  "Furniture drawn to measure",
  "Lighting in layers, materials chosen with you",
  "Site visits until the last shelf is in",
];

export type ProjectRow = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  meta: string;
  /** Case-study page; null until it exists. */
  href: AppPathname | null;
  image: { src: string; alt: string; position?: string };
  /** Line drawing wiped in on hover, when the project has one. */
  sketch?: string;
};

export const RESIDENTIAL_PROJECTS: ProjectRow[] = [
  {
    slug: "apartment-oradea",
    title: "Apartment, Oradea",
    summary: "A city apartment reorganised around natural light and storage, with furniture made to measure.",
    tags: ["Residential", "Oradea"],
    meta: "XX m² — 2025",
    href: ROUTES.apartmentOradea,
    image: {
      src: "/images/projects/kitchen.png",
      alt: "Kitchen with an oak arch, stone splashback and fluted island with bar stools, Apartment Oradea",
      position: "55% 50%",
    },
  },
  {
    slug: "family-house-cluj",
    title: "Family house, Cluj",
    summary: "A family home in warm tones and walnut, planned around the hours of the day and how the family moves through it.",
    tags: ["Residential", "Cluj"],
    meta: "XX m² — 2024",
    href: null,
    image: {
      src: "/images/projects/dining.png",
      alt: "Dining area with arched oak shelving, marble table and patterned bench, Family house Cluj",
    },
  },
  {
    slug: "home-remodel-oradea",
    title: "Home remodel, Oradea",
    summary: "A mid-century home remodel — bathroom, kitchen and shelving drawn as one family of details.",
    tags: ["Residential", "Oradea"],
    meta: "XX m² — 2024",
    href: null,
    image: {
      src: "/images/projects/residential/bathroom.png",
      alt: "Bathroom with a round backlit mirror, marble vanity and walk-in shower, Home remodel Oradea",
    },
    sketch: "/images/projects/residential/bathroom_sketch.png",
  },
];

export const RESIDENTIAL_TESTIMONIAL = {
  quote:
    "We knew how we wanted to live, but not how to get there. Every decision was explained, and halfway through the build there was nothing left for us to decode alone.",
  name: "Ioana & Radu Pavel",
  initials: "IP",
  project: "Family house, Cluj",
};

/**
 * "Kind words from our clients". Placeholder quotes from the Paper design;
 * images reuse existing renders until each project's own photography arrives.
 */
export type Testimonial = {
  slug: string;
  /** Who they are and what we did: "Homeowner | Residential — Living room, Oradea". */
  project: string;
  quote: string;
  client: { name: string; initials: string };
  image: {
    src: string;
    alt: string;
    /** object-position, when the subject isn't centred. */
    position?: string;
    /** Extra zoom on top of object-cover (the design crops some tighter). */
    zoom?: number;
  };
};

export const TESTIMONIALS: Testimonial[] = [
  {
    slug: "living-room-oradea",
    project: "Homeowner | Residential — Living room, Oradea",
    quote:
      "We wanted a calm room the whole family could live in. Celine walked us through every step, and the result feels like it was always ours.",
    client: { name: "Ana Mureșan", initials: "AM" },
    image: {
      src: "/images/hero/living-room.png",
      alt: "Living room with a woven pendant light, low sectional sofa and round coffee tables",
      position: "50% 55%",
    },
  },
  {
    slug: "cafe-interior",
    project: "Café owner | HORECA — Café interior",
    quote:
      "Our guests notice the light first. The custom fixture became the signature of our cafe, and the whole project ran on schedule.",
    client: { name: "Mihai Pop", initials: "MP" },
    image: {
      src: "/images/custom-elements/lighting.png",
      alt: "Oval blackened-steel ceiling light with inset LED strips, hung from a vaulted ceiling",
    },
  },
  {
    slug: "kitchen-remodel",
    project: "Homeowners | Residential — Kitchen remodel",
    quote:
      "Every drawing, material sample and budget line was clear before work started. No surprises, just a kitchen we love cooking in.",
    client: { name: "Ioana & Radu Pavel", initials: "IP" },
    image: {
      src: "/images/custom-elements/kitchen-joinery.png",
      alt: "Oak kitchen with an arched niche, open shelving and a fluted island",
      position: "60% 50%",
      zoom: 1.15,
    },
  },
  {
    slug: "private-house",
    project: "Homeowner | Residential — Private house",
    quote:
      "Celine turned a difficult staircase into the most beautiful part of the house. Her team handled details we would never have thought of.",
    client: { name: "Daniel Crișan", initials: "DC" },
    image: {
      src: "/images/custom-elements/staircase.png",
      alt: "Curved plaster staircase with oak treads beside an indoor tree",
    },
  },
];

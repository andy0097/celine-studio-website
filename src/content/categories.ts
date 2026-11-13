/**
 * Project categories (Residential / HORECA) and the projects previewed when
 * a category is hovered. Hovering a project swaps its photo for its sketch.
 *
 * Placeholders, to replace when the real content arrives:
 * - `sketch: null` renders a "sketch coming soon" placeholder.
 * - HORECA projects are placeholders; only the Street Coffee photo is real.
 * - Project and "see all" links point at in-page anchors until the project
 *   pages exist.
 */
export type CategoryProject = {
  slug: string;
  title: string;
  href: string;
  /** Project cover, ~3:2. `position` is the object-position crop. */
  image: { src: string; alt: string; position?: string } | null;
  /** Line drawing shown on hover; null until the sketch is ready. */
  sketch: string | null;
};

export type Category = {
  slug: string;
  name: string;
  allHref: string;
  projects: CategoryProject[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "residential",
    name: "Residential",
    allHref: "#residential",
    projects: [
      {
        slug: "home-remodel",
        title: "Home remodel, mid-century modern — Oradea",
        href: "#home-remodel",
        image: {
          src: "/images/projects/residential/bathroom.png",
          alt: "Bathroom with a round backlit mirror, marble vanity and walk-in shower",
        },
        sketch: "/images/projects/residential/bathroom_sketch.png",
      },
      {
        slug: "kitchen-remodel",
        title: "Kitchen remodel, mid-century modern — Oradea",
        href: "#kitchen-remodel",
        image: {
          src: "/images/projects/kitchen.png",
          alt: "Kitchen with an oak arch, stone splashback and fluted island with bar stools",
          position: "60% 40%",
        },
        sketch: null,
      },
      {
        slug: "dining-shelving",
        title: "Dining & shelving, mid-century modern — Oradea",
        href: "#dining-shelving",
        image: {
          src: "/images/projects/dining.png",
          alt: "Dining area with arched oak shelving, marble table and patterned bench",
        },
        sketch: null,
      },
    ],
  },
  {
    slug: "horeca",
    name: "HORECA",
    allHref: "#horeca",
    projects: [
      {
        slug: "street-coffee",
        title: "Street Coffee, café — placeholder",
        href: "#street-coffee",
        image: {
          src: "/images/custom-elements/lighting.png",
          alt: "Oval blackened-steel ceiling light with inset LED strips in the Street Coffee café",
          position: "50% 30%",
        },
        sketch: null,
      },
      {
        slug: "horeca-project-2",
        title: "HORECA project — placeholder",
        href: "#horeca",
        image: null,
        sketch: null,
      },
      {
        slug: "horeca-project-3",
        title: "HORECA project — placeholder",
        href: "#horeca",
        image: null,
        sketch: null,
      },
    ],
  },
];

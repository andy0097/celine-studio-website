/**
 * Reference projects shown over the full-screen hero image.
 * Placeholder content: 02 and 03 reuse renders from the design file until the
 * real project photography and sketches arrive.
 */
export type Project = {
  slug: string;
  number: string;
  title: string;
  location: string;
  /** Full-bleed background while the project is active. */
  photo: { src: string; alt: string };
  /**
   * The framed image beside the list. A sketch when the project has one;
   * otherwise a detail crop of the photo. Never a filtered photo.
   */
  panel: { src: string; kind: "sketch" | "detail" };
};

export const PROJECTS: Project[] = [
  {
    slug: "light-open-living-room",
    number: "01",
    title: "Light, open living room",
    location: "Oradea",
    photo: {
      src: "/images/hero/living-room.png",
      alt: "Living room with a woven pendant light, low sectional sofa and round coffee tables",
    },
    panel: { src: "/images/projects/living-room_panel.png", kind: "sketch" },
  },
  {
    slug: "japandi-apartment",
    number: "02",
    title: "Japandi apartment",
    location: "Oradea",
    photo: {
      src: "/images/projects/kitchen.png",
      alt: "Kitchen with an oak arch, stone splashback and fluted island with bar stools",
    },
    panel: { src: "/images/projects/kitchen_panel.png", kind: "detail" },
  },
  {
    slug: "minimalist-house",
    number: "03",
    title: "Minimalist house",
    location: "Cluj",
    photo: {
      src: "/images/projects/dining.png",
      alt: "Dining area with arched oak shelving, marble table and patterned bench",
    },
    panel: { src: "/images/projects/dining_panel.png", kind: "detail" },
  },
];

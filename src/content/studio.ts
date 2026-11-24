import type { SketchImageData } from "@/components/ui/SketchImage";

/**
 * Studio page (Paper "Studio — A Editorial"). Placeholders: the studio
 * portrait, founding year, team names, titles and bios.
 */
type WorkItem = { tall: boolean; image: SketchImageData };

export const STUDIO = {
  image: {
    src: "/images/projects/dining.png",
    alt: "Placeholder: dining area with arched oak shelving and marble table",
    caption: "FIG. 01 — Placeholder: studio portrait or workspace",
    since: "Since 20XX",
  },
  principles: [
    { title: "Function first", text: "We settle how the space works before choosing how it looks." },
    { title: "Light shapes the plan", text: "Rooms follow the daylight; artificial light comes in layers." },
    { title: "Drawn to measure", text: "Custom joinery and fixtures instead of catalogue compromises." },
    { title: "Every decision explained", text: "You always know what you get, what it costs and why." },
  ],
  /** Three staggered columns of two images each. */
  work: <WorkItem[][]>[
    [
      { tall: true, image: { src: "/images/projects/kitchen.png", alt: "Kitchen with an oak arch and fluted island" } },
      {
        tall: false,
        image: {
          src: "/images/projects/residential/bathroom.png",
          alt: "Bathroom with a round backlit mirror and marble vanity",
          sketch: "/images/projects/residential/bathroom_sketch.png",
        },
      },
    ],
    [
      { tall: false, image: { src: "/images/custom-elements/lighting.png", alt: "Custom oval light fixture, Street Coffee" } },
      { tall: true, image: { src: "/images/custom-elements/staircase.png", alt: "Curved plaster staircase with oak treads" } },
    ],
    [
      {
        tall: true,
        image: {
          src: "/images/hero/living-room.png",
          alt: "Living room with a woven pendant light and low sectional sofa",
          sketch: "/images/hero/living-room_sketch.png",
        },
      },
      { tall: false, image: { src: "/images/hero/living-room_sketch.png", alt: "Design sketch of the living room" } },
    ],
  ],
  team: [
    {
      initial: "C",
      name: "Celine — Full name",
      role: "Founder, interior designer",
      bio: "Short bio — background, focus, a residential and a HORECA project she led.",
    },
    {
      initial: "—",
      name: "Full name",
      role: "Job title",
      bio: "Short bio — two lines about their role in each project.",
    },
  ],
};

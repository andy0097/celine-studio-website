/**
 * "Custom elements that we have designed": close-ups of pieces the studio
 * designed itself. Images are 3:4 detail shots (see the image guidelines).
 */
export type CustomElement = {
  slug: string;
  number: string;
  title: string;
  image: { src: string; alt: string };
};

export const CUSTOM_ELEMENTS: CustomElement[] = [
  {
    slug: "lighting",
    number: "01",
    title: "Lighting",
    image: {
      src: "/images/custom-elements/lighting.png",
      alt: "Oval blackened-steel ceiling light with inset LED strips, hung from a vaulted ceiling",
    },
  },
  {
    slug: "kitchen-joinery",
    number: "02",
    title: "Kitchen joinery",
    image: {
      src: "/images/custom-elements/kitchen-joinery.png",
      alt: "Oak kitchen with an arched niche, open shelving and a fluted island",
    },
  },
  {
    slug: "staircase",
    number: "03",
    title: "Staircase",
    image: {
      src: "/images/custom-elements/staircase.png",
      alt: "Curved plaster staircase with oak treads beside an indoor tree",
    },
  },
];

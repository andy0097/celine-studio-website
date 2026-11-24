import type { Quote } from "@/components/book/TestimonialSlider";
import { TESTIMONIALS } from "./testimonials";

/** Book a consultation (Paper "Book a Consultation — B Split"). */
export const BOOK = {
  hero: {
    src: "/images/hero/living-room.png",
    alt: "",
  },
  quotes: [
    {
      quote:
        "Every drawing, material and cost was agreed before the builders started. Halfway through the build there was nothing left for us to decode alone.",
      name: "Ioana & Radu Pavel",
      initials: "IP",
      project: "Family house, Cluj",
    },
    // The Home testimonials, minus the Pavels' second quote
    ...TESTIMONIALS.filter((t) => t.slug !== "kitchen-remodel").map((t) => ({
      quote: t.quote,
      name: t.client.name,
      initials: t.client.initials,
      project: t.project.split("|")[1]?.trim() ?? t.project,
    })),
  ] satisfies Quote[],
};

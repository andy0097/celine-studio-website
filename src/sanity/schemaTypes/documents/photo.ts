import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";
import { localized } from "../localized";

/**
 * The image library. Each image is stored once with its paired sketch (the
 * line drawing at the same framing, wiped in on hover) and alt text in both
 * languages; pages and case studies reference it, so the alt text and the
 * sketch follow the image everywhere it is used.
 */
export const photo = defineType({
  name: "photo",
  title: "Image",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "For finding it in the library, e.g. “Apartment Oradea — kitchen”.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "Set the focus point (hotspot) so crops keep the subject.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sketch",
      title: "Sketch",
      type: "image",
      description:
        "The line drawing of the same view. Must match the photo's framing so the hover wipe lines up. Leave empty until it exists.",
    }),
    localized("alt", "Alt text", {
      required: true,
      description: "What the photo shows, for screen readers and search. Leave decorative images' alt empty on the page, not here.",
    }),
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "caseStudy" }],
      description: "Optional: groups the image under its project in the library.",
    }),
  ],
  preview: {
    select: { title: "name", alt: "alt.ro", media: "image", sketch: "sketch.asset._ref" },
    prepare: ({ title, alt, media, sketch }) => ({
      title,
      subtitle: [sketch ? "With sketch" : "No sketch yet", alt].filter(Boolean).join(" · "),
      media,
    }),
  },
});

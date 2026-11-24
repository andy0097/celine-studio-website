import { defineArrayMember, defineField, defineType } from "sanity";
import { localized } from "../localized";

/**
 * Small reusable objects. Layout stays in code: these hold only text,
 * references and the choices a section needs (which image, which link).
 */

/** Static pages a link can point at (the internal route keys in src/i18n/routing.ts). */
export const PAGE_ROUTES = [
  { title: "Home", value: "/" },
  { title: "Residential", value: "/residential" },
  { title: "HORECA", value: "/horeca" },
  { title: "Process", value: "/process" },
  { title: "Studio", value: "/studio" },
  { title: "Book a consultation", value: "/book-a-consultation" },
  { title: "On-site consultancy", value: "/on-site-consultancy" },
  { title: "Privacy policy", value: "/privacy" },
];

/** A use of an image from the image library, with an optional caption (e.g. "FIG. 01 — Living room"). */
export const figure = defineType({
  name: "figure",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "photo",
      title: "Image",
      type: "reference",
      to: [{ type: "photo" }],
      description: "Pick from the image library. Alt text and the sketch come with the image.",
      validation: (rule) => rule.required(),
    }),
    localized("caption", "Caption", { description: "Optional, e.g. “FIG. 01 — Living room, Apartment Oradea”." }),
  ],
  preview: {
    select: { title: "photo.name", subtitle: "caption.ro", media: "photo.image" },
  },
});

/** A link to a page, a case study or another website. */
export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    localized("label", "Label", { required: true }),
    defineField({
      name: "kind",
      title: "Goes to",
      type: "string",
      options: {
        list: [
          { title: "A page", value: "page" },
          { title: "A case study", value: "caseStudy" },
          { title: "Another website", value: "external" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "page",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "page",
      type: "string",
      options: { list: PAGE_ROUTES },
      hidden: ({ parent }) => parent?.kind !== "page",
      validation: (rule) =>
        rule.custom((value, ctx) => ((ctx.parent as { kind?: string })?.kind === "page" && !value ? "Choose a page" : true)),
    }),
    defineField({
      name: "caseStudy",
      title: "Case study",
      type: "reference",
      to: [{ type: "caseStudy" }],
      hidden: ({ parent }) => parent?.kind !== "caseStudy",
      validation: (rule) =>
        rule.custom((value, ctx) =>
          (ctx.parent as { kind?: string })?.kind === "caseStudy" && !value ? "Choose a case study" : true,
        ),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      hidden: ({ parent }) => parent?.kind !== "external",
      validation: (rule) =>
        rule
          .uri({ scheme: ["https", "http", "mailto", "tel"] })
          .custom((value, ctx) => ((ctx.parent as { kind?: string })?.kind === "external" && !value ? "Add a URL" : true)),
    }),
  ],
  preview: { select: { title: "label.ro", subtitle: "kind" } },
});

/** Title + short text (service stages, value points, principles, visit steps). */
export const titledText = defineType({
  name: "titledText",
  title: "Title and text",
  type: "object",
  fields: [localized("title", "Title", { required: true }), localized("text", "Text", { kind: "text" })],
  preview: { select: { title: "title.ro", subtitle: "text.ro" } },
});

/** Label + value (project facts: Type · Location · Area · Year · Scope). */
export const labelValue = defineType({
  name: "labelValue",
  title: "Fact",
  type: "object",
  fields: [localized("label", "Label", { required: true }), localized("value", "Value", { required: true })],
  preview: { select: { title: "label.ro", subtitle: "value.ro" } },
});

/** A number and what it measures (case-study results). */
export const statItem = defineType({
  name: "statItem",
  title: "Number",
  type: "object",
  fields: [
    defineField({
      name: "value",
      type: "string",
      description: "As shown, e.g. “48”, “120 m²”, “+30%”.",
      validation: (rule) => rule.required(),
    }),
    localized("label", "What it measures", { required: true }),
  ],
  preview: { select: { title: "value", subtitle: "label.ro" } },
});

/** Section intro: eyebrow, title, paragraph (SplitHeading). */
export const sectionIntro = defineType({
  name: "sectionIntro",
  title: "Section heading",
  type: "object",
  fields: [
    localized("eyebrow", "Eyebrow", { description: "Small label above the title, e.g. “01 — Concept”." }),
    localized("title", "Title"),
    localized("text", "Paragraph", { kind: "text" }),
  ],
});

/** Search and social preview. Empty fields fall back to the page's own title and the site defaults. */
export const seo = defineType({
  name: "seo",
  title: "Search & sharing",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    localized("title", "Title", { description: "About 50–60 characters." }),
    localized("description", "Description", { kind: "text", description: "About 120–160 characters." }),
    defineField({ name: "image", title: "Sharing image", type: "image", description: "1200 × 630." }),
  ],
});

/** A list of short localized lines (bullet points, "what you receive"). */
export const localeStringList = defineType({
  name: "localeStringList",
  title: "List",
  type: "array",
  of: [defineArrayMember({ type: "localeString" })],
});

export const objectTypes = [figure, link, titledText, labelValue, statItem, sectionIntro, seo, localeStringList];

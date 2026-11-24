import { CaseIcon } from "@sanity/icons/Case";
import { defineArrayMember, defineField, defineType } from "sanity";
import { localized } from "../localized";

export const CATEGORIES = [
  { title: "Residential", value: "residential" },
  { title: "HORECA", value: "horeca" },
];

/* ---------- Optional story sections (each at most once per case study) ---------- */

/** "01 — Concept": intro, numbered points and a sketch (Apartment Oradea). */
export const conceptSection = defineType({
  name: "conceptSection",
  title: "Concept",
  type: "object",
  fields: [
    defineField({ name: "intro", title: "Heading", type: "sectionIntro" }),
    defineField({
      name: "points",
      title: "Points",
      type: "localeStringList",
      description: "Shown as 01, 02, 03…",
    }),
    defineField({ name: "sketch", title: "Sketch", type: "figure" }),
  ],
  preview: { select: { title: "intro.title.ro" }, prepare: ({ title }) => ({ title: "Concept", subtitle: title }) },
});

/** "Value for the business": four points (HORECA). */
export const valueSection = defineType({
  name: "valueSection",
  title: "Value",
  type: "object",
  fields: [
    defineField({ name: "intro", title: "Heading", type: "sectionIntro" }),
    defineField({
      name: "items",
      title: "Points",
      type: "array",
      of: [defineArrayMember({ type: "titledText" })],
      validation: (rule) => rule.length(4).warning("The layout has four columns"),
    }),
  ],
  preview: { select: { title: "intro.title.ro" }, prepare: ({ title }) => ({ title: "Value", subtitle: title }) },
});

/** "Results": four numbers. */
export const resultsSection = defineType({
  name: "resultsSection",
  title: "Results",
  type: "object",
  fields: [
    defineField({ name: "intro", title: "Heading", type: "sectionIntro" }),
    defineField({
      name: "items",
      title: "Numbers",
      type: "array",
      of: [defineArrayMember({ type: "statItem" })],
      validation: (rule) => rule.length(4).warning("The layout has four columns"),
    }),
  ],
  preview: { select: { title: "intro.title.ro" }, prepare: ({ title }) => ({ title: "Results", subtitle: title }) },
});

/** A client quote, from the testimonials list. */
export const testimonialSection = defineType({
  name: "testimonialSection",
  title: "Testimonial",
  type: "object",
  fields: [
    localized("eyebrow", "Eyebrow", { description: "e.g. “What the owner says”." }),
    defineField({
      name: "testimonial",
      type: "reference",
      to: [{ type: "testimonial" }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "testimonial.clientName", subtitle: "testimonial.quote.ro" },
    prepare: ({ title, subtitle }) => ({ title: `Testimonial — ${title ?? ""}`, subtitle }),
  },
});

export const caseStudySectionTypes = [conceptSection, valueSection, resultsSection, testimonialSection];

/* ---------- Case study ---------- */

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case study",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "hero", title: "Hero & facts" },
    { name: "gallery", title: "Gallery" },
    { name: "story", title: "Story" },
    { name: "seo", title: "Search & sharing" },
  ],
  fields: [
    /* Overview: what indexes, cards and the footer show */
    localized("title", "Title", { required: true, group: "overview", description: "e.g. “Apartment, Oradea”." }),
    localized("slug", "URL", {
      kind: "slug",
      required: true,
      group: "overview",
      description: "Generated from the title in each language.",
    }),
    defineField({
      name: "category",
      type: "string",
      group: "overview",
      options: { list: CATEGORIES, layout: "radio", direction: "horizontal" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "number",
      type: "string",
      group: "overview",
      description: "Shown in the breadcrumb (“Projects / Residential / 01”).",
      validation: (rule) => rule.regex(/^\d{2}$/, { name: "two digits" }),
    }),
    localized("summary", "Summary", {
      kind: "text",
      group: "overview",
      description: "One or two sentences for the project lists.",
    }),
    localized("location", "Location", { group: "overview", description: "e.g. “Oradea”." }),
    defineField({ name: "year", type: "number", group: "overview", validation: (rule) => rule.integer().min(2000).max(2100) }),
    defineField({ name: "area", type: "string", group: "overview", description: "e.g. “120 m²”." }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "figure",
      group: "overview",
      description: "Used in lists, the home categories and the HORECA venues.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Show on the home page",
      type: "boolean",
      group: "overview",
      initialValue: false,
    }),

    /* Hero & facts (fixed part of every case study) */
    localized("lead", "Lead", { kind: "text", required: true, group: "hero", description: "The line under the title." }),
    defineField({ name: "hero", title: "Hero image", type: "figure", group: "hero", validation: (rule) => rule.required() }),
    defineField({
      name: "specs",
      title: "Facts",
      type: "array",
      group: "hero",
      of: [defineArrayMember({ type: "labelValue" })],
      description: "Type · Location · Area · Year · Scope (3 to 5).",
      validation: (rule) => rule.min(3).max(5),
    }),

    /* Gallery (fixed) */
    defineField({
      name: "gallery",
      type: "array",
      group: "gallery",
      of: [
        defineArrayMember({
          name: "galleryItem",
          type: "object",
          fields: [
            defineField({ name: "image", type: "figure", validation: (rule) => rule.required() }),
            defineField({ name: "wide", title: "Full width", type: "boolean", initialValue: false }),
          ],
          preview: {
            select: { title: "image.photo.name", subtitle: "image.caption.ro", media: "image.photo.image", wide: "wide" },
            prepare: ({ title, subtitle, media, wide }) => ({ title: `${title ?? "Image"}${wide ? " (wide)" : ""}`, subtitle, media }),
          },
        }),
      ],
    }),
    localized("galleryNote", "Gallery note", { group: "gallery", description: "Optional line under the gallery." }),

    /* Story: optional sections, in the order they appear */
    defineField({
      name: "sections",
      title: "Story sections",
      type: "array",
      group: "story",
      description: "Optional. Add the ones this project needs: Concept, Value, Results, Testimonial.",
      of: caseStudySectionTypes.map((t) => defineArrayMember({ type: t.name })),
      validation: (rule) =>
        rule.custom((items: { _type: string }[] | undefined) => {
          const seen = new Set<string>();
          for (const item of items ?? []) {
            if (seen.has(item._type)) return "Each section can be used once";
            seen.add(item._type);
          }
          return true;
        }),
    }),
    defineField({
      name: "next",
      title: "Next project",
      type: "reference",
      group: "story",
      to: [{ type: "caseStudy" }],
      options: { filter: ({ document }) => ({ filter: "_id != $id && !(_id in path('drafts.**'))", params: { id: document._id.replace(/^drafts\./, "") } }) },
      description: "The band at the end of the page.",
    }),

    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  orderings: [
    { title: "Category, then number", name: "categoryNumber", by: [{ field: "category", direction: "desc" }, { field: "number", direction: "asc" }] },
    { title: "Newest", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title.ro", category: "category", number: "number", media: "cover.photo.image" },
    prepare: ({ title, category, number, media }) => ({
      title,
      subtitle: [category === "horeca" ? "HORECA" : "Residential", number].filter(Boolean).join(" · "),
      media,
    }),
  },
});

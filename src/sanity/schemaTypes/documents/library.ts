import { CommentIcon } from "@sanity/icons/Comment";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";
import { localized } from "../localized";

/**
 * Shared content referenced from pages and case studies: testimonials,
 * FAQ and the team. Edited once, used wherever they are referenced.
 */

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: CommentIcon,
  fields: [
    localized("quote", "Quote", { kind: "text", required: true }),
    defineField({ name: "clientName", title: "Client", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "initials",
      type: "string",
      description: "Shown in the round badge, e.g. “AM”.",
      validation: (rule) => rule.required().max(3),
    }),
    localized("project", "Who and what", {
      description: "e.g. “Homeowner | Residential — Living room, Oradea” or “Owner, Street Coffee — Oradea”.",
    }),
    defineField({ name: "caseStudy", title: "Case study", type: "reference", to: [{ type: "caseStudy" }] }),
    defineField({ name: "image", type: "figure", description: "Shown beside the quote on the home page." }),
  ],
  preview: {
    select: { title: "clientName", subtitle: "quote.ro", media: "image.photo.image" },
  },
});

export const FAQ_TOPICS = [
  { title: "General (Process page)", value: "general" },
  { title: "On-site consultancy", value: "onSite" },
  { title: "Booking", value: "book" },
];

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    localized("question", "Question", { required: true }),
    localized("answer", "Answer", { kind: "text", required: true }),
    defineField({
      name: "topics",
      type: "array",
      of: [{ type: "string" }],
      options: { list: FAQ_TOPICS, layout: "grid" },
      description: "For finding it; each page picks its own questions and their order.",
    }),
  ],
  preview: { select: { title: "question.ro", subtitle: "answer.ro" } },
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    localized("role", "Role", { required: true }),
    localized("bio", "Bio", { kind: "text" }),
    defineField({ name: "portrait", type: "figure", description: "Optional; the initial is shown until there is one." }),
  ],
  preview: { select: { title: "name", subtitle: "role.ro", media: "portrait.photo.image" } },
});

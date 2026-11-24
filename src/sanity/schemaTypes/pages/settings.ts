import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";
import { localized } from "../localized";

/**
 * Site settings (singleton, id "siteSettings"): what is shared by many
 * pages: contact details, the closing CTA, the six service stages, the
 * on-site visit fee and duration, the footer and default search settings.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "services", title: "Services" },
    { name: "cta", title: "Closing CTA" },
    { name: "footer", title: "Footer" },
    { name: "seo", title: "Search & sharing" },
  ],
  fields: [
    defineField({
      name: "contact",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "email", type: "string", validation: (rule) => rule.required().email() }),
        defineField({ name: "phone", type: "string", description: "As shown, e.g. “+40 745 123 456”." }),
        localized("address", "Address", { kind: "text" }),
        defineField({ name: "instagram", title: "Instagram URL", type: "url" }),
      ],
    }),
    defineField({
      name: "services",
      title: "Service stages",
      type: "array",
      group: "services",
      of: [defineArrayMember({ type: "titledText" })],
      description: "The six stages of a project, shown on HORECA, Process and the case studies.",
      validation: (rule) => rule.min(2),
    }),
    defineField({
      name: "servicesIntro",
      title: "Services heading on case studies",
      type: "object",
      group: "services",
      description: "“Everything included” above the stages on HORECA case studies.",
      fields: [localized("title", "Title"), localized("text", "Paragraph", { kind: "text" })],
    }),
    defineField({
      name: "onSite",
      title: "On-site visit",
      type: "object",
      group: "services",
      description: "Shown on the On-site consultancy page.",
      fields: [
        localized("duration", "Duration", { description: "e.g. “2 hours”." }),
        localized("fee", "Fee", { description: "e.g. “450 lei”." }),
      ],
    }),
    defineField({
      name: "cta",
      title: "Closing CTA",
      type: "object",
      group: "cta",
      description: "“It all starts with a conversation.”: the drawing at the end of every inner page.",
      fields: [
        localized("fig", "FIG. label"),
        localized("title", "Title", { required: true }),
        localized("buttonLabel", "Button label", { required: true }),
      ],
    }),
    defineField({
      name: "footer",
      type: "object",
      group: "footer",
      fields: [
        defineField({
          name: "projects",
          title: "Featured projects",
          type: "array",
          of: [defineArrayMember({ type: "reference", to: [{ type: "caseStudy" }] })],
          validation: (rule) => rule.max(4).unique(),
        }),
        localized("tagline", "Tagline", { description: "Bottom bar, e.g. “Residential & HORECA interiors — Oradea, Romania”." }),
        localized("newsletterTitle", "Newsletter title"),
        localized("newsletterText", "Newsletter note"),
        defineField({
          name: "legalLinks",
          title: "Legal and social links",
          type: "array",
          of: [defineArrayMember({ type: "link" })],
        }),
      ],
    }),
    defineField({ name: "seo", title: "Default search & sharing", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

import { DocumentIcon } from "@sanity/icons/Document";
import { HomeIcon } from "@sanity/icons/Home";
import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";
import { localized } from "../localized";

/**
 * One singleton per static page. Fields mirror the page's sections, in
 * order, and hold only text and content choices; layout and motion stay in
 * the components. Document id = type name (see structure.ts).
 */

/* ---------- Helpers ---------- */

function refs(name: string, title: string, to: string, options: { max?: number; description?: string } = {}): FieldDefinition {
  return defineField({
    name,
    title,
    type: "array",
    description: options.description,
    of: [defineArrayMember({ type: "reference", to: [{ type: to }] })],
    validation: (rule) => (options.max ? rule.max(options.max).unique() : rule.unique()),
  }) as FieldDefinition;
}

function section(name: string, title: string, fields: FieldDefinition[], description?: string): FieldDefinition {
  return defineField({ name, title, type: "object", description, options: { collapsible: true }, fields }) as FieldDefinition;
}

const eyebrow = () => localized("eyebrow", "Eyebrow");
const titleField = (required = true) => localized("title", "Title", { required });
const intro = () => localized("intro", "Intro", { kind: "text" });
const ctaLabel = (description?: string) => localized("ctaLabel", "Button label", { description });
const image = (title = "Image") => defineField({ name: "image", title, type: "figure" }) as FieldDefinition;

function page(name: string, title: string, fields: FieldDefinition[], icon = DocumentIcon) {
  return defineType({
    name,
    title,
    type: "document",
    icon,
    fields: [...fields, defineField({ name: "seo", type: "seo" })],
    preview: { prepare: () => ({ title }) },
  });
}

/* ---------- Pages ---------- */

export const homePage = page(
  "homePage",
  "Home",
  [
    section("hero", "Hero", [
      localized("tagline", "Tagline", { description: "“Residential & HORECA interior design”." }),
      ctaLabel(),
      refs("projects", "Projects in the hero", "caseStudy", { description: "The stack of project photos; empty = featured case studies." }),
    ]),
    section("categories", "Residential / HORECA", [
      refs("residential", "Residential projects", "caseStudy", { max: 3 }),
      refs("horeca", "HORECA projects", "caseStudy", { max: 3 }),
    ]),
    section("customElements", "Custom elements", [
      titleField(),
      defineField({
        name: "items",
        type: "array",
        of: [
          defineArrayMember({
            name: "customElement",
            type: "object",
            fields: [localized("title", "Title", { required: true }), image("Detail photo (3:4)")],
            preview: { select: { title: "title.ro", media: "image.photo.image" } },
          }),
        ],
      }) as FieldDefinition,
    ]),
    section("process", "Our process", [
      titleField(),
      defineField({ name: "paragraphs", type: "array", of: [defineArrayMember({ type: "localeText" })] }) as FieldDefinition,
      ctaLabel("Links to the Process page."),
      image("Showcase image"),
    ]),
    section("testimonials", "Testimonials", [titleField(), refs("items", "Testimonials", "testimonial")]),
  ],
  HomeIcon,
);

export const residentialPage = page("residentialPage", "Residential", [
  section("hero", "Hero", [
    eyebrow(),
    titleField(),
    intro(),
    defineField({ name: "services", title: "What we do", type: "localeStringList" }) as FieldDefinition,
    ctaLabel(),
    image("Hero image"),
  ]),
  section("projects", "Completed projects", [
    titleField(),
    refs("items", "Projects", "caseStudy", { description: "Order on the page; empty = all residential case studies." }),
  ]),
  section("onSite", "On-site consultancy band", [titleField(), ctaLabel(), image("Background image")]),
  defineField({ name: "testimonial", type: "reference", to: [{ type: "testimonial" }] }) as FieldDefinition,
]);

export const horecaPage = page("horecaPage", "HORECA", [
  section("hero", "Hero", [eyebrow(), titleField(), intro(), ctaLabel(), image("Portrait image")]),
  section("venues", "Venues", [
    titleField(false),
    defineField({
      name: "items",
      type: "array",
      description: "Shown in two staggered columns. Link a case study when the venue has one.",
      of: [
        defineArrayMember({
          name: "venue",
          type: "object",
          fields: [
            localized("title", "Title", { required: true }),
            defineField({ name: "caseStudy", title: "Case study", type: "reference", to: [{ type: "caseStudy" }] }),
            image(),
            defineField({ name: "tall", title: "Tall image", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "title.ro", media: "image.photo.image" } },
        }),
      ],
    }) as FieldDefinition,
  ]),
  section("services", "What's included", [titleField(false), localized("text", "Paragraph", { kind: "text" })], "The stages come from Site settings → Services."),
  section("testimonial", "Testimonial", [eyebrow(), defineField({ name: "testimonial", type: "reference", to: [{ type: "testimonial" }] }) as FieldDefinition]),
]);

export const processPage = page("processPage", "Process", [
  section("hero", "Hero", [eyebrow(), titleField(), intro(), localized("note", "Note", { kind: "text" }), ctaLabel()]),
  defineField({
    name: "steps",
    type: "array",
    of: [
      defineArrayMember({
        name: "processStep",
        type: "object",
        fields: [
          localized("title", "Title", { required: true }),
          localized("text", "Text", { kind: "text" }),
          defineField({ name: "receive", title: "What you receive", type: "localeStringList" }),
        ],
        preview: { select: { title: "title.ro", subtitle: "text.ro" } },
      }),
    ],
  }) as FieldDefinition,
  section("services", "All our services", [titleField(false), localized("text", "Paragraph", { kind: "text" })], "The stages come from Site settings → Services."),
  section("faq", "FAQ", [titleField(false), refs("items", "Questions", "faq")]),
]);

export const studioPage = page("studioPage", "Studio", [
  section("hero", "Hero", [eyebrow(), titleField(), intro(), image("Studio portrait"), localized("since", "Since", { description: "“Since 2015”." })]),
  section("philosophy", "Our philosophy", [
    eyebrow(),
    intro(),
    defineField({ name: "principles", type: "array", of: [defineArrayMember({ type: "titledText" })] }) as FieldDefinition,
  ]),
  section("work", "Our work", [
    titleField(false),
    defineField({
      name: "images",
      type: "array",
      description: "Three staggered columns of two, filled left to right.",
      of: [
        defineArrayMember({
          name: "workImage",
          type: "object",
          fields: [image(), defineField({ name: "tall", title: "Tall", type: "boolean", initialValue: false })],
          preview: { select: { title: "image.photo.name", media: "image.photo.image" } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }) as FieldDefinition,
    ctaLabel("“See all projects”."),
  ]),
  section("team", "Team", [titleField(false), refs("members", "Members", "teamMember")]),
]);

export const onSitePage = page("onSitePage", "On-site consultancy", [
  section("hero", "Hero", [eyebrow(), titleField(), intro(), ctaLabel(), image()]),
  section(
    "visit",
    "How a visit works",
    [titleField(), defineField({ name: "steps", type: "array", of: [defineArrayMember({ type: "titledText" })] }) as FieldDefinition],
    "Duration and fee come from Site settings → Services.",
  ),
  section("faq", "FAQ", [titleField(false), refs("items", "Questions", "faq")]),
]);

export const bookPage = page("bookPage", "Book a consultation", [
  section("hero", "Hero", [titleField(), intro(), image()], "Form labels are interface text (message files), not content."),
  refs("testimonials", "Testimonials", "testimonial", { description: "The slider beside the form." }) as FieldDefinition,
  section("faq", "FAQ", [eyebrow(), refs("items", "Questions", "faq")]),
]);

export const privacyPage = page("privacyPage", "Privacy policy", [
  titleField(),
  defineField({ name: "updated", title: "Last updated", type: "date" }) as FieldDefinition,
  defineField({
    name: "sections",
    type: "array",
    of: [
      defineArrayMember({
        name: "privacySection",
        type: "object",
        fields: [
          localized("title", "Title", { required: true }),
          defineField({
            name: "anchor",
            type: "slug",
            description: "The #link in the contents list.",
            options: { source: (_doc, ctx) => (ctx.parent as { title?: { en?: string } })?.title?.en ?? "" },
          }),
          localized("body", "Text", { kind: "blocks", required: true }),
        ],
        preview: { select: { title: "title.ro" } },
      }),
    ],
  }) as FieldDefinition,
]);

export const pageTypes = [homePage, residentialPage, horecaPage, processPage, studioPage, onSitePage, bookPage, privacyPage];

import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";

/**
 * Field-level localization: every translatable field holds both languages,
 * side by side (`{ ro, en }`), so the owner writes Romanian and English in
 * the same place and reordering a list changes both at once.
 *
 * Romanian is the site's default language and is required wherever the
 * field is required; a missing English translation is a warning, so a
 * page can be published in Romanian first.
 */
export const LOCALES = [
  { id: "ro", title: "Română" },
  { id: "en", title: "English" },
] as const;

export type SchemaLocale = (typeof LOCALES)[number]["id"];
export const DEFAULT_LOCALE: SchemaLocale = "ro";

/* ---------- The localized value types ---------- */

export const localeString = defineType({
  name: "localeString",
  title: "Text (RO + EN)",
  type: "object",
  options: { columns: 2 },
  fields: LOCALES.map((l) => defineField({ name: l.id, title: l.title, type: "string" })),
  preview: { select: { title: "ro", subtitle: "en" } },
});

export const localeText = defineType({
  name: "localeText",
  title: "Paragraph (RO + EN)",
  type: "object",
  options: { columns: 2 },
  fields: LOCALES.map((l) => defineField({ name: l.id, title: l.title, type: "text", rows: 4 })),
  preview: { select: { title: "ro", subtitle: "en" } },
});

/** Rich text (Portable Text) per language. Stacked, since rich text needs the width. */
export const localeBlocks = defineType({
  name: "localeBlocks",
  title: "Rich text (RO + EN)",
  type: "object",
  fields: LOCALES.map((l) =>
    defineField({
      name: l.id,
      title: l.title,
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Subheading", value: "h3" },
          ],
          lists: [
            { title: "Bullets", value: "bullet" },
            { title: "Numbers", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              defineArrayMember({
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    type: "url",
                    validation: (rule) => rule.required().uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
                  }),
                ],
              }),
            ],
          },
        }),
      ],
    }),
  ),
});

/** A slug per language (translated URLs, decision 0.2), generated from the Romanian / English title. */
export const localeSlug = defineType({
  name: "localeSlug",
  title: "URL (RO + EN)",
  type: "object",
  options: { columns: 2 },
  fields: LOCALES.map((l) =>
    defineField({
      name: l.id,
      title: l.title,
      type: "slug",
      options: {
        source: (doc) => (doc as { title?: Record<string, string> }).title?.[l.id] ?? "",
        maxLength: 96,
      },
    }),
  ),
});

export const localizedTypes = [localeString, localeText, localeBlocks, localeSlug];

/* ---------- Helper for document fields ---------- */

type Kind = "string" | "text" | "blocks" | "slug";
const TYPE_FOR: Record<Kind, string> = {
  string: "localeString",
  text: "localeText",
  blocks: "localeBlocks",
  slug: "localeSlug",
};

function isFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object" && "current" in value) return isFilled((value as { current?: string }).current);
  return true;
}

type LocalizedFieldOptions = {
  kind?: Kind;
  required?: boolean;
  description?: string;
  group?: string | string[];
  fieldset?: string;
  initialValue?: Partial<Record<SchemaLocale, string>>;
};

/**
 * A translatable field: `localized("title", "Title", { required: true })`.
 * Romanian missing on a required field is an error; English missing (when
 * Romanian is filled in) is a warning.
 */
export function localized(name: string, title: string, options: LocalizedFieldOptions = {}): FieldDefinition {
  const { kind = "string", required = false, ...rest } = options;
  return defineField({
    name,
    title,
    type: TYPE_FOR[kind],
    ...rest,
    validation: (rule) => [
      rule
        .custom((value: Record<string, unknown> | undefined) =>
          required && !isFilled(value?.ro) ? "Romanian is required" : true,
        )
        .error(),
      rule
        .custom((value: Record<string, unknown> | undefined) =>
          isFilled(value?.ro) && !isFilled(value?.en) ? "English translation missing" : true,
        )
        .warning(),
    ],
  }) as FieldDefinition;
}

/** Read the Romanian (default) value for previews. */
export function ro(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = (value as Record<string, unknown>).ro;
  return typeof v === "string" ? v : undefined;
}

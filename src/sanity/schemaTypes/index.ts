import type { SchemaTypeDefinition } from "sanity";
import { caseStudy, caseStudySectionTypes } from "./documents/caseStudy";
import { faq, teamMember, testimonial } from "./documents/library";
import { photo } from "./documents/photo";
import { localizedTypes } from "./localized";
import { objectTypes } from "./objects";
import { pageTypes } from "./pages/pages";
import { siteSettings } from "./pages/settings";

/**
 * All content types. Every translatable field is RO + EN side by side
 * (see localized.ts). Page singletons and Site settings are opened from
 * the Content structure (src/sanity/structure.ts) under fixed ids.
 */
export const SINGLETON_TYPES = [siteSettings, ...pageTypes].map((t) => t.name);

export const schemaTypes: SchemaTypeDefinition[] = [
  ...localizedTypes,
  ...objectTypes,
  ...caseStudySectionTypes,
  // Documents
  caseStudy,
  photo,
  testimonial,
  faq,
  teamMember,
  // Singletons
  siteSettings,
  ...pageTypes,
];

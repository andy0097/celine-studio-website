"use client";

/**
 * The backend: Sanity Studio mounted at /admin (src/app/admin/[[...tool]]).
 * It opens on the Dashboard tool. Navigation is a left sidebar
 * (src/sanity/navigation.ts): Dashboard, the content areas (one tool each),
 * the planned admin tools, Site settings. One login (Sanity), one look (Sanity UI).
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { StudioLogo } from "./src/sanity/components/StudioLogo";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETON_TYPES } from "./src/sanity/schemaTypes";
import { resolve } from "./src/sanity/presentation/resolve";
import { StudioLayout, StudioToolMenu } from "./src/sanity/components/StudioLayout";
import { pagesStructure, settingsStructure, typeStructure } from "./src/sanity/structure";
import { dashboardTool } from "./src/sanity/tools/dashboard";

/** Singletons can be edited and published, never created again, duplicated or deleted. */
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "celine-studio",
  title: "Celine Studio",
  basePath: "/admin",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => !SINGLETON_TYPES.includes(t.schemaType)),
      // New case study already filed under Residential or HORECA.
      { id: "caseStudy-residential", title: "Residential case study", schemaType: "caseStudy", value: { category: "residential" } },
      { id: "caseStudy-horeca", title: "HORECA case study", schemaType: "caseStudy", value: { category: "horeca" } },
    ],
  },
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.includes(schemaType) ? prev.filter((a) => a.action && SINGLETON_ACTIONS.has(a.action)) : prev,
    newDocumentOptions: (prev) =>
      prev.filter((item) => !SINGLETON_TYPES.includes(item.templateId) && !item.templateId.startsWith("caseStudy-")),
  },
  plugins: [
    // One tool per sidebar entry (src/sanity/navigation.ts): each screen is a list and the open document.
    structureTool({ name: "pages", title: "Pages", structure: pagesStructure }),
    structureTool({
      name: "projects",
      title: "Case studies",
      structure: typeStructure("caseStudy", "Case studies", ["caseStudy-residential", "caseStudy-horeca"]),
    }),
    structureTool({ name: "testimonials", title: "Testimonials", structure: typeStructure("testimonial", "Testimonials") }),
    structureTool({ name: "faq", title: "FAQ", structure: typeStructure("faq", "FAQ") }),
    structureTool({ name: "team", title: "Team", structure: typeStructure("teamMember", "Team") }),
    structureTool({ name: "images", title: "Images", structure: typeStructure("photo", "Images") }),
    structureTool({ name: "settings", title: "Site settings", structure: settingsStructure }),
    // Live preview: browse the site and click any text or image to edit it.
    presentationTool({
      name: "preview",
      title: "Live preview",
      resolve,
      previewUrl: { initial: "/", previewMode: { enable: "/api/draft-mode/enable", disable: "/api/draft-mode/disable" } },
    }),
    // GROQ playground: only for developers, hidden in production.
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
  // Dashboard first, so /admin opens on it.
  tools: (prev) => [dashboardTool(), ...prev],
  studio: { components: { logo: StudioLogo, layout: StudioLayout, toolMenu: StudioToolMenu } },
});

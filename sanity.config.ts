"use client";

/**
 * The backend: Sanity Studio mounted at /admin (src/app/admin/[[...tool]]).
 * It opens on the Dashboard tool; Content (structure), and later Leads,
 * Components, Assets, Style guide, Drawing generator and Agent, sit beside
 * it in the top bar. One login (Sanity), one look (Sanity UI).
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { StudioLogo } from "./src/sanity/components/StudioLogo";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETON_TYPES } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
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
    structureTool({ title: "Content", structure }),
    // GROQ playground: only for developers, hidden in production.
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
  // Dashboard first, so /admin opens on it.
  tools: (prev) => [dashboardTool(), ...prev],
  studio: { components: { logo: StudioLogo } },
});

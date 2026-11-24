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
import { schemaTypes } from "./src/sanity/schemaTypes";
import { dashboardTool } from "./src/sanity/tools/dashboard";

export default defineConfig({
  name: "celine-studio",
  title: "Celine Studio",
  basePath: "/admin",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ title: "Content" }),
    // GROQ playground: only for developers, hidden in production.
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
  // Dashboard first, so /admin opens on it.
  tools: (prev) => [dashboardTool(), ...prev],
  studio: { components: { logo: StudioLogo } },
});

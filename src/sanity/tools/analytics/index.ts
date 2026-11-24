import { ChartUpwardIcon } from "@sanity/icons/ChartUpward";
import type { Tool } from "sanity";
import { AnalyticsTool } from "./AnalyticsTool";

/** Visitors, top pages and sources (GA4) plus enquiries and conversion (Supabase leads). */
export function analyticsTool(): Tool {
  return { name: "analytics", title: "Analytics", icon: ChartUpwardIcon, component: AnalyticsTool };
}

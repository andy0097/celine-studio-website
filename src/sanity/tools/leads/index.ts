import { EnvelopeIcon } from "@sanity/icons/Envelope";
import type { Tool } from "sanity";
import { LeadsTool } from "./LeadsTool";

/** Consultation requests from the booking form (stored in Supabase). */
export function leadsTool(): Tool {
  return { name: "leads", title: "Leads", icon: EnvelopeIcon, component: LeadsTool };
}

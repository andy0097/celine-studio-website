"use server";

import { getLocale } from "next-intl/server";
import { parseLead } from "@/lib/leads/lead";
import { emailConfigured, notifyStudio } from "@/lib/leads/notify";
import { markEmailed, saveLead, storeConfigured } from "@/lib/leads/store";
import { getSettings } from "@/sanity/lib/site";

export type LeadState = { status: "idle" | "sent" | "invalid" | "error" };

/**
 * The booking form's action: save the lead in Supabase and email the studio.
 * Counts as sent when either step worked, so a lead is never lost to one
 * failing service; fails only when both did.
 */
export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // Spam trap: a field people never see, so only bots fill it in. Pretend it worked.
  if (form.get("hp_leave_empty")) {
    console.warn("[leads] spam trap filled, enquiry dropped");
    return { status: "sent" };
  }

  const locale = (await getLocale()) === "en" ? "en" : "ro";
  const lead = parseLead(form, locale);
  if (!lead) return { status: "invalid" };

  let id: string | null = null;
  if (storeConfigured) {
    try {
      id = await saveLead(lead);
      console.info(`[leads] saved ${id}`);
    } catch (error) {
      console.error("[leads] save failed", error);
    }
  }

  let emailed = false;
  const to = process.env.LEADS_NOTIFY_EMAIL || (await getSettings(locale))?.contact?.email;
  if (emailConfigured && to) {
    try {
      await notifyStudio(lead, to);
      emailed = true;
      if (id) await markEmailed(id).catch((error) => console.error("[leads] mark emailed failed", error));
    } catch (error) {
      console.error("[leads] email failed", error);
    }
  }

  if (!id && !emailed) {
    if (!storeConfigured && !emailConfigured) console.error("[leads] neither Supabase nor Resend is configured");
    return { status: "error" };
  }
  return { status: "sent" };
}

import type { Lead } from "./lead";

/**
 * Emails the studio about a new lead, through Resend's API. The sender
 * (LEADS_FROM_EMAIL) must be on a domain verified in Resend; until then
 * Resend's test sender only delivers to the Resend account's own address.
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.LEADS_FROM_EMAIL || "Celine Studio <onboarding@resend.dev>";

export const emailConfigured = Boolean(apiKey);

const TYPE_LABEL: Record<Lead["projectType"], string> = { residential: "Residential", horeca: "HORECA", onSite: "On-site visit" };

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Sends the email to `to`. Throws when Resend is not configured or refuses. */
export async function notifyStudio(lead: Lead, to: string) {
  if (!apiKey) throw new Error("Resend is not configured (RESEND_API_KEY)");
  const rows: [string, string | null][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Project type", TYPE_LABEL[lead.projectType]],
    ["City", lead.city],
    ["About the project", lead.about],
    ["Language", lead.locale.toUpperCase()],
    ["Sent from", lead.sourcePage],
  ];
  const filled = rows.filter((r): r is [string, string] => Boolean(r[1]));
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `New enquiry: ${lead.name} (${TYPE_LABEL[lead.projectType]})`,
      text: filled.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `<table cellpadding="6" style="font-family:sans-serif;font-size:14px">${filled
        .map(([k, v]) => `<tr><td style="color:#777;vertical-align:top">${k}</td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`)
        .join("")}</table>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

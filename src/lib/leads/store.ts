import type { Lead, ProjectType } from "./lead";

/**
 * The leads table in Supabase (migration in supabase/migrations). Written
 * from the server only, with the service-role key, through Supabase's REST
 * API (no client library needed for one insert and one update).
 */
// Tolerates a pasted REST URL (…/rest/v1/) or a trailing slash
const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(); // the secret key (sb_secret_…) or the legacy service_role key

export const storeConfigured = Boolean(url && key);

function request(path: string, init: RequestInit) {
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key!,
      // Legacy service_role keys are JWTs and go in Authorization too; new secret keys (sb_secret_…) only in apikey
      ...(key!.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

/** Saves the lead; returns its id. Throws when Supabase is not configured or refuses. */
export async function saveLead(lead: Lead): Promise<string> {
  if (!storeConfigured) throw new Error("Supabase is not configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  const res = await request("leads?select=id", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      project_type: lead.projectType,
      city: lead.city,
      about: lead.about,
      locale: lead.locale,
      source_page: lead.sourcePage,
    }),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
  const [row] = (await res.json()) as { id: string }[];
  return row.id;
}

/** Records that the studio was emailed about the lead. */
export async function markEmailed(id: string) {
  const res = await request(`leads?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ email_sent: true }),
  });
  if (!res.ok) throw new Error(`Supabase update failed: ${res.status} ${await res.text()}`);
}

/* ---------- Admin (Leads tool) ---------- */

export const LEAD_STATUSES = ["new", "contacted", "meeting", "proposal", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** A row of the leads table, as the admin shows it. */
export type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: ProjectType;
  city: string | null;
  about: string | null;
  locale: "ro" | "en";
  source_page: string | null;
  status: LeadStatus;
  notes: string | null;
  email_sent: boolean;
};

/** The latest leads, newest first. */
export async function listLeads(limit = 500): Promise<LeadRow[]> {
  if (!storeConfigured) throw new Error("Supabase is not configured");
  const res = await request(`leads?select=*&order=created_at.desc&limit=${limit}`, { method: "GET" });
  if (!res.ok) throw new Error(`Supabase select failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as LeadRow[];
}

/** Changes a lead's status and/or notes; returns the updated row, or null when there is no such lead. */
export async function updateLead(id: string, patch: { status?: LeadStatus; notes?: string | null }): Promise<LeadRow | null> {
  if (!storeConfigured) throw new Error("Supabase is not configured");
  const res = await request(`leads?id=eq.${encodeURIComponent(id)}&select=*`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase update failed: ${res.status} ${await res.text()}`);
  const [row] = (await res.json()) as LeadRow[];
  return row ?? null;
}

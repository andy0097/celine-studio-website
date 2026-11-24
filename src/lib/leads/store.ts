import type { Lead } from "./lead";

/**
 * The leads table in Supabase (migration in supabase/migrations). Written
 * from the server only, with the service-role key, through Supabase's REST
 * API (no client library needed for one insert and one update).
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const storeConfigured = Boolean(url && key);

function request(path: string, init: RequestInit) {
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
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

import { getAdmin, unauthorized } from "@/lib/admin/auth";
import { listLeads, storeConfigured } from "@/lib/leads/store";

/** Leads for the admin's Leads tool (signed-in editors and administrators only). */
export async function GET(request: Request) {
  if (!(await getAdmin(request))) return unauthorized();
  if (!storeConfigured) return Response.json({ error: "Supabase is not connected (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)." }, { status: 503 });
  try {
    return Response.json({ leads: await listLeads() });
  } catch (error) {
    console.error("[admin/leads]", error);
    // Admins only: show Supabase's own message so a setup problem can be fixed without reading server logs
    return Response.json({ error: `Could not load the leads from Supabase. ${(error as Error).message}` }, { status: 502 });
  }
}

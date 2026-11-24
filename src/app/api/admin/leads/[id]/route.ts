import { getAdmin, unauthorized } from "@/lib/admin/auth";
import { LEAD_STATUSES, storeConfigured, updateLead, type LeadStatus } from "@/lib/leads/store";

/** Changes a lead's status or notes from the admin's Leads tool. */
export async function PATCH(request: Request, { params }: RouteContext<"/api/admin/leads/[id]">) {
  if (!(await getAdmin(request))) return unauthorized();
  if (!storeConfigured) return Response.json({ error: "Supabase is not connected." }, { status: 503 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "No such lead." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { status?: unknown; notes?: unknown } | null;
  const patch: { status?: LeadStatus; notes?: string | null } = {};
  if (body?.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status as LeadStatus)) return Response.json({ error: "Unknown status." }, { status: 400 });
    patch.status = body.status as LeadStatus;
  }
  if (body?.notes !== undefined) {
    if (body.notes !== null && typeof body.notes !== "string") return Response.json({ error: "Notes must be text." }, { status: 400 });
    patch.notes = body.notes ? body.notes.slice(0, 10000) : null;
  }
  if (!Object.keys(patch).length) return Response.json({ error: "Nothing to change." }, { status: 400 });
  try {
    const lead = await updateLead(id, patch);
    return lead ? Response.json({ lead }) : Response.json({ error: "No such lead." }, { status: 404 });
  } catch (error) {
    console.error("[admin/leads/:id]", error);
    return Response.json({ error: "Could not save the change in Supabase." }, { status: 502 });
  }
}

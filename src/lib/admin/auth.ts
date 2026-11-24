import { apiVersion, projectId } from "@/sanity/env";

/**
 * Admin API routes are called by the Studio tools with the signed-in user's
 * Sanity token. Sanity says who the token belongs to and their role in the
 * project; only these roles may use the admin routes.
 */
const ALLOWED_ROLES = (process.env.ADMIN_ROLES || "administrator,editor").split(",").map((r) => r.trim());

export type AdminUser = { id: string; name: string; email: string | null };

type SanityMe = { id: string; name: string; email?: string; role?: string; roles?: { name: string }[] };

/** The signed-in admin behind the request, or null (no token, invalid token, or a role without access). */
export async function getAdmin(request: Request): Promise<AdminUser | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  try {
    const res = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const me = (await res.json()) as SanityMe;
    const roles = [me.role, ...(me.roles ?? []).map((r) => r.name)].filter(Boolean) as string[];
    if (!me.id || !roles.some((r) => ALLOWED_ROLES.includes(r))) return null;
    return { id: me.id, name: me.name, email: me.email ?? null };
  } catch {
    return null;
  }
}

export const unauthorized = () => Response.json({ error: "Sign in to the admin with an editor or administrator account." }, { status: 401 });

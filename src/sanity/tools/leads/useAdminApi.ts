"use client";

import { useCallback } from "react";
import { useClient } from "sanity";
import { apiVersion } from "../../env";

/**
 * fetch() for the site's admin API routes (/api/admin/…), signed with the
 * current Studio user's Sanity token so the route can check who is asking.
 * Needs `auth.loginMethod: "token"` in sanity.config.ts (a cookie login has
 * no token the Studio can hand on).
 */
export function useAdminApi() {
  const client = useClient({ apiVersion });
  return useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const token = client.config().token;
      const res = await fetch(`/api/admin/${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
      return body as T;
    },
    [client],
  );
}

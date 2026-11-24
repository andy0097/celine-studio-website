"use client";

/**
 * Remembers the last admin page the person had open before switching to the
 * Agent tool, so the agent knows what "this page" means (plan 5.2). The
 * Studio routes with the History API, so this samples the URL instead of
 * hooking into the shared layout.
 */
const KEY = "celine-agent-last-page";
const AGENT_PATH = /^\/admin\/agent(\/|$)/;

export type LastPage = { path: string; title: string };

let started = false;

export function trackLastPage() {
  if (started || typeof window === "undefined") return;
  started = true;
  const record = () => {
    const path = window.location.pathname + window.location.search;
    if (!path.startsWith("/admin") || AGENT_PATH.test(window.location.pathname)) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ path, title: document.title } satisfies LastPage));
    } catch {
      // storage unavailable: the agent just won't know the page
    }
  };
  record();
  window.setInterval(record, 1000);
}

export function readLastPage(): LastPage | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastPage) : null;
  } catch {
    return null;
  }
}

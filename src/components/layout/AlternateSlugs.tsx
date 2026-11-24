"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/routing";

/**
 * The current page's slug in each language, for pages whose URL has a
 * translated slug (case studies). The page renders <AlternateSlugs/>;
 * LanguageSwitch reads them to link to the same case study in the other
 * language.
 */
type Slugs = Partial<Record<Locale, string>>;
let current: Slugs = {};
const listeners = new Set<() => void>();

function set(slugs: Slugs) {
  current = slugs;
  listeners.forEach((l) => l());
}

export function useAlternateSlugs() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}

export default function AlternateSlugs({ slugs }: { slugs: Slugs }) {
  const key = JSON.stringify(slugs);
  useEffect(() => {
    set(JSON.parse(key));
    return () => set({});
  }, [key]);
  return null;
}

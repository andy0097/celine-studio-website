"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Cookie consent (plan 3.6, decision 0.8). Google Analytics 4 and Microsoft
 * Clarity load only after the visitor accepts; declining (or not answering)
 * loads nothing. The choice is kept for six months in localStorage.
 *
 * Reopen the banner from anywhere with a link to `#cookie-settings`
 * (e.g. a legal link in Site settings → Footer), or by dispatching the
 * `cookie-settings` window event.
 */
// Only well-formed ids: they are written into the inline scripts below.
const GA_ID = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "") ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined;
const CLARITY_ID = /^[a-z0-9]+$/.test(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "") ? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID : undefined;
const STORAGE_KEY = "celine-consent";
const MAX_AGE = 182 * 86_400_000;

type Choice = "granted" | "denied";

function readChoice(): Choice | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { choice: Choice; at: number } | null;
    if (saved && Date.now() - saved.at < MAX_AGE && (saved.choice === "granted" || saved.choice === "denied")) return saved.choice;
  } catch {
    // Storage blocked or corrupted: ask again.
  }
  return null;
}

function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    // Private mode: the choice lasts for this page view only.
  }
}

/** Removes the GA4 and Clarity cookies after consent is withdrawn. */
function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0].trim();
    if (!/^(_ga|_gid|_gat|_clck|_clsk|CLID|MUID)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/**
 * The saved choice as an external store, read after hydration:
 * "pending" on the server and in the admin's preview frame (nothing shown),
 * null when the visitor hasn't answered yet.
 */
const listeners = new Set<() => void>();
const consentStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  snapshot: (): Choice | null | "pending" => (window.top !== window ? "pending" : readChoice()),
  serverSnapshot: (): Choice | null | "pending" => "pending",
  set(choice: Choice) {
    saveChoice(choice);
    listeners.forEach((l) => l());
  },
};

export function CookieConsent() {
  const t = useTranslations("Consent");
  const enabled = Boolean(GA_ID || CLARITY_ID);
  const choice = useSyncExternalStore(consentStore.subscribe, consentStore.snapshot, consentStore.serverSnapshot);
  // Reopened from the footer or a #cookie-settings link.
  const [reopened, setReopened] = useState(false);
  const open = choice !== "pending" && (choice === null || reopened);

  useEffect(() => {
    if (!enabled) return;
    const reopen = () => setReopened(true);
    const onHash = () => {
      if (location.hash !== "#cookie-settings") return;
      history.replaceState(null, "", location.pathname + location.search);
      reopen();
    };
    // A page opened with #cookie-settings: handled like a later hash change.
    const initial = setTimeout(onHash);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("cookie-settings", reopen);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("cookie-settings", reopen);
    };
  }, [enabled]);

  const decide = useCallback(
    (next: Choice) => {
      const before = choice;
      consentStore.set(next);
      setReopened(false);
      if (before === "granted" && next === "denied") {
        // Scripts already running can't be unloaded: clear their cookies and reload without them.
        clearAnalyticsCookies();
        location.reload();
      }
    },
    [choice],
  );

  if (!enabled) return null;

  return (
    <>
      {choice === "granted" && <AnalyticsScripts />}
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          className="fixed inset-x-space-md bottom-space-md z-[60] max-w-[520px] border border-line bg-surface p-space-lg text-ink shadow-[0_8px_32px_rgba(25,22,24,0.12)] sm:left-space-lg sm:right-auto sm:bottom-space-lg"
        >
          <h2 id="cookie-consent-title" className="type-label">
            {t("title")}
          </h2>
          <p className="type-label-caption mt-space-sm text-ink-muted normal-case tracking-[0.04em]">
            {t("text")}{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              {t("privacy")}
            </Link>
          </p>
          <div className="mt-space-lg flex flex-wrap gap-space-sm">
            <button type="button" onClick={() => decide("granted")} className="type-link bg-ink px-[22px] py-space-md text-surface">
              {t("accept")}
            </button>
            <button type="button" onClick={() => decide("denied")} className="type-link border border-ink px-[22px] py-space-md">
              {t("decline")}
            </button>
          </div>
        </section>
      )}
    </>
  );
}

/** GA4 (gtag.js) and Microsoft Clarity, mounted only after consent. */
function AnalyticsScripts() {
  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");
window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});`}
        </Script>
      )}
    </>
  );
}

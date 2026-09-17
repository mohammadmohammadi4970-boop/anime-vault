/**
 * Records one anonymous page view per route change.
 *
 * Never records: admin pages, anyone with a signed-in session (that's you), or
 * a browser that has opted out through the admin Traffic panel.
 */
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";
import { recordPageView } from "@/lib/traffic.functions";

export const OPT_OUT_KEY = "kuragawa-traffic-opt-out";

export function isTrafficOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(OPT_OUT_KEY) === "1";
}

function deviceKind(): string {
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function referrerKind(): string {
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "direct";
    if (/google|bing|duckduckgo|yahoo|yandex|brave|ecosia/.test(host)) return "search";
    if (/t\.co|twitter|x\.com|instagram|facebook|tiktok|reddit|discord|youtube|pinterest/.test(host))
      return "social";
    return "other";
  } catch {
    return "other";
  }
}

export function TrafficTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (isTrafficOptedOut()) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      // A signed-in session means the site owner/admin is browsing.
      if (cancelled || data.session) return;
      try {
        await recordPageView({
          data: { path: pathname, device: deviceKind(), referrerKind: referrerKind() },
        });
      } catch {
        // Tracking must never break the page.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}

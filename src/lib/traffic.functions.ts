/**
 * Anonymous visitor tracking.
 *
 * recordPageView is public (anyone browsing the site calls it). It stores no IP
 * address: the visitor marker is a salted hash that rotates every day, so the
 * same person counts once per day and cannot be tracked across days.
 *
 * The reporting functions require an authenticated admin; the underlying SQL
 * helpers refuse to run for anyone else.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ViewInput = { path: string; device: string; referrerKind: string };

const DEVICES = ["mobile", "tablet", "desktop"];
const REFERRERS = ["direct", "search", "social", "other"];

/**
 * The hosting network usually tags each request with a country. When it does
 * not, we look the country up once from the connecting address; the address
 * itself is never stored.
 */
async function resolveCountry(headers: Headers, ip: string): Promise<string> {
  const fromHeaders =
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("x-country-code") ??
    headers.get("x-geo-country");
  const code = (fromHeaders ?? "").slice(0, 2).toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1") return code;

  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip === "::1") return "XX";
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return "XX";
    const body = (await res.text()).trim().slice(0, 2).toUpperCase();
    return /^[A-Z]{2}$/.test(body) ? body : "XX";
  } catch {
    return "XX";
  }
}

async function dailyVisitorHash(ip: string, userAgent: string, salt: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${ip}|${userAgent}|${day}|${salt}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const recordPageView = createServerFn({ method: "POST" })
  .inputValidator((data: ViewInput) => {
    const path = String(data?.path ?? "").slice(0, 300);
    if (!path.startsWith("/")) throw new Error("invalid path");
    return {
      path,
      device: DEVICES.includes(data?.device) ? data.device : "desktop",
      referrerKind: REFERRERS.includes(data?.referrerKind) ? data.referrerKind : "direct",
    };
  })
  .handler(async ({ data }) => {
    // Admin pages are never counted, whoever is browsing them.
    if (data.path.startsWith("/admin")) return { ok: true };

    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return { ok: false };

    const request = getRequest();
    const headers = request.headers;
    const ip =
      headers.get("cf-connecting-ip") ??
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const country = await resolveCountry(headers, ip);
    const userAgent = headers.get("user-agent") ?? "unknown";
    const salt = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "kuragawa-traffic";

    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await db.from("page_views").insert({
      path: data.path,
      country,
      device: data.device,
      referrer_kind: data.referrerKind,
      visitor_hash: await dailyVisitorHash(ip, userAgent, salt),
    });
    if (error) {
      console.error("page view insert failed", error.message);
      return { ok: false };
    }
    return { ok: true };
  });

export type TrafficReport = {
  totals: { visitors: number; pageviews: number; prevVisitors: number; prevPageviews: number };
  daily: Array<{ day: string; visitors: number; pageviews: number }>;
  pages: Array<{ label: string; value: number }>;
  countries: Array<{ label: string; value: number }>;
  devices: Array<{ label: string; value: number }>;
  sources: Array<{ label: string; value: number }>;
  clips: Array<{ title: string; slug: string; views: number; downloads: number }>;
};

export const getTrafficReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days: number }) => ({
    days: [7, 30, 90].includes(data?.days) ? data.days : 7,
  }))
  .handler(async ({ data, context }): Promise<TrafficReport> => {
    const { supabase } = context;
    const days = data.days;

    const [totals, daily, pages, countries, devices, sources, clips] = await Promise.all([
      supabase.rpc("traffic_totals", { _days: days }),
      supabase.rpc("traffic_daily", { _days: days }),
      supabase.rpc("traffic_breakdown", { _days: days, _dimension: "path" }),
      supabase.rpc("traffic_breakdown", { _days: days, _dimension: "country" }),
      supabase.rpc("traffic_breakdown", { _days: days, _dimension: "device" }),
      supabase.rpc("traffic_breakdown", { _days: days, _dimension: "referrer_kind" }),
      supabase.rpc("traffic_clip_views", { _days: days }),
    ]);

    const firstError = [totals, daily, pages, countries, devices, sources, clips].find(
      (r) => r.error,
    )?.error;
    if (firstError) throw new Error(firstError.message);

    const t = (totals.data as Array<Record<string, number>> | null)?.[0];

    return {
      totals: {
        visitors: Number(t?.["visitors"] ?? 0),
        pageviews: Number(t?.["pageviews"] ?? 0),
        prevVisitors: Number(t?.["prev_visitors"] ?? 0),
        prevPageviews: Number(t?.["prev_pageviews"] ?? 0),
      },
      daily: ((daily.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
        day: String(r["day"]),
        visitors: Number(r["visitors"] ?? 0),
        pageviews: Number(r["pageviews"] ?? 0),
      })),
      pages: (pages.data ?? []) as TrafficReport["pages"],
      countries: (countries.data ?? []) as TrafficReport["countries"],
      devices: (devices.data ?? []) as TrafficReport["devices"],
      sources: (sources.data ?? []) as TrafficReport["sources"],
      clips: (clips.data ?? []) as TrafficReport["clips"],
    };
  });

import "./lib/error-capture";

import { createClient } from "@supabase/supabase-js";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function urlTag(loc: string): string {
  return `  <url><loc>${loc}</loc></url>`;
}

/** Serves a live sitemap.xml straight from the raw request handler, before
 * anything reaches the router — so it works the same on every host
 * (Cloudflare, Vercel) and never depends on a page's HTML shell. */
async function handleSitemap(request: Request): Promise<Response> {
  const reqUrl = new URL(request.url);
  const base = `${reqUrl.protocol}//${reqUrl.host}`;
  const staticPages = ["", "/browse", "/anime", "/categories", "/requests", "/about"];
  const urls: string[] = staticPages.map((p) => urlTag(`${base}${p}`));

  const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const supabaseKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (supabaseUrl && supabaseKey) {
    try {
      const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const [anime, categories, clips] = await Promise.all([
        db.from("anime").select("slug"),
        db.from("categories").select("slug"),
        db.from("clips").select("slug").eq("published", true),
      ]);
      for (const a of anime.data ?? []) urls.push(urlTag(`${base}/anime/${a["slug"] as string}`));
      for (const c of categories.data ?? [])
        urls.push(urlTag(`${base}/categories/${c["slug"] as string}`));
      for (const c of clips.data ?? []) urls.push(urlTag(`${base}/clips/${c["slug"] as string}`));
    } catch (error) {
      console.error("sitemap: failed to load dynamic URLs", error);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const pathname = new URL(request.url).pathname;
      if (pathname === "/sitemap.xml") return await handleSitemap(request);

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

/**
 * Counting download link: /d/<clip-slug>
 *
 * Records the download, then forwards straight to the external file. This lets
 * downloads be counted even when the link is shared outside the site.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/d/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Not available", { status: 503 });

        const db = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
                h.delete("Authorization");
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const { data: clip } = await db
          .from("clips")
          .select("id, download_url")
          .eq("slug", params.slug)
          .eq("published", true)
          .maybeSingle();

        if (!clip?.download_url) return new Response("Clip not found", { status: 404 });

        await db.rpc("increment_download_count", { clip_id: clip.id });

        return new Response(null, {
          status: 302,
          headers: { Location: clip.download_url, "Cache-Control": "no-store" },
        });
      },
    },
  },
});

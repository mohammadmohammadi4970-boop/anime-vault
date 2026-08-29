/**
 * Read-only backend client used by the data-access layer.
 *
 * Safe in isomorphic route loaders: it never persists a session and only ever
 * uses the publishable key, so it can only read what the public access rules
 * allow (published clips, anime, categories, site content).
 */
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

const url = (import.meta.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]) as string;
const key = (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  process.env["SUPABASE_PUBLISHABLE_KEY"]) as string;

export const publicDb = createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
        headers.delete("Authorization");
      }
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    },
  },
});

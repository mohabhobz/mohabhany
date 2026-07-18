import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True only when both env vars are present. */
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/**
 * Created on first use, never at import time — otherwise merely importing
 * this file would throw while running with local storage and no env vars.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server.",
    );
  }
  client = createClient(url, key);
  return client;
}

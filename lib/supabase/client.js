import { createBrowserClient } from "@supabase/ssr";
import { getCleanSupabaseUrl } from "../config";

let browserClientInstance = null;

export function getSupabaseBrowserClient() {
  const supabaseUrl = getCleanSupabaseUrl();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClientInstance;
}

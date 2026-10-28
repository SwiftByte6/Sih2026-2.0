import { createClient } from "@supabase/supabase-js";
import { getCleanSupabaseUrl } from "../config";

export function getSupabaseAdminClient() {
  const supabaseUrl = getCleanSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Configuration and environment manager for AICTE FDR Portal
// Controls whether the application operates in 'demo' (mock) or 'live' (Supabase) mode.

export function getDataMode() {
  const configuredMode = process.env.NEXT_PUBLIC_DATA_MODE;
  if (configuredMode === "live") {
    // Only permit live mode if Supabase URL is also present
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return "live";
    }
    console.warn(
      "[AICTE Portal] NEXT_PUBLIC_DATA_MODE is set to 'live', but Supabase credentials are missing. Running in 'demo' mode."
    );
  }
  return "demo";
}

export function isLiveMode() {
  return getDataMode() === "live";
}

export function isDemoMode() {
  return getDataMode() === "demo";
}

export function getCleanSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}


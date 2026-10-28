import { isLiveMode } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentUser as getMockUser, setCurrentUser as setMockUser } from "@/lib/mockData";

/**
 * Resolves the active user profile and verified role.
 * In Demo Mode: returns the active simulated profile.
 * In Live Mode: fetches authenticated session from Supabase and queries public.role_assignments.
 */
export async function resolveActiveUser() {
  if (!isLiveMode()) {
    return getMockUser();
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase client is not available in Live Mode.");
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch role assignment
  const { data: roleAssignment } = await supabase
    .from("role_assignments")
    .select("role, institution_id, institutions(institution_name, aicte_institution_id)")
    .eq("user_id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.email,
    phone: profile?.phone || "",
    role: roleAssignment?.role || "institution_staff",
    institution_id: roleAssignment?.institution_id || null,
    institution_name: roleAssignment?.institutions?.institution_name || null,
    avatar_initials: (profile?.full_name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

/**
 * Sign in with credentials
 */
export async function signInUser(email, password) {
  if (!isLiveMode()) {
    // In Demo Mode: mock authentication succeeded
    return { success: true, mode: "demo" };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase client not initialized.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return { success: true, data, mode: "live" };
}

/**
 * Sign out
 */
export async function signOutUser() {
  if (isLiveMode()) {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
}

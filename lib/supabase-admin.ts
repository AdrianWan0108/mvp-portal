import { createClient } from "@supabase/supabase-js";

// Service-role client for server-only code paths (API routes) that must
// read or write tables the anon/authenticated Postgres roles can't reach,
// such as public.profiles. Never import this from a "use client" file.
export function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

// Cloudflare Workers compatibility: use process.env instead of import.meta.env
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_KEY || import.meta.env.SUPABASE_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client for public/authenticated operations (respects RLS)
export const supabaseClient = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Client for server-side operations
// If service_role_key is available, bypasses RLS (production)
// If not available, uses anon key with RLS (e.g., in tests with authenticated user)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceRoleKey || supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export type SupabaseClient = SupabaseClientType<Database>;

export const DEFAULT_USER_ID = "e57b6524-3439-4057-a683-987f26b14c12";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

/**
 * Environment variables interface for Supabase configuration
 */
export interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/**
 * Creates a Supabase client for public/authenticated operations (respects RLS)
 * Used in development with import.meta.env and in production with runtime.env
 */
export function createSupabaseClient(env?: SupabaseEnv): SupabaseClientType<Database> {
  // Try to get from passed env, then from process.env, then from import.meta.env
  const supabaseUrl =
    env?.SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined) ||
    (typeof import.meta !== "undefined" ? import.meta.env.SUPABASE_URL : undefined) ||
    "https://placeholder.supabase.co";

  const supabaseAnonKey =
    env?.SUPABASE_KEY ||
    (typeof process !== "undefined" ? process.env.SUPABASE_KEY : undefined) ||
    (typeof import.meta !== "undefined" ? import.meta.env.SUPABASE_KEY : undefined) ||
    "placeholder-key";

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a Supabase admin client for server-side operations
 * If service_role_key is available, bypasses RLS (production)
 * If not available, uses anon key with RLS (e.g., in tests with authenticated user)
 */
export function createSupabaseAdmin(env?: SupabaseEnv): SupabaseClientType<Database> {
  // Try to get from passed env, then from process.env, then from import.meta.env
  const supabaseUrl =
    env?.SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined) ||
    (typeof import.meta !== "undefined" ? import.meta.env.SUPABASE_URL : undefined) ||
    "https://placeholder.supabase.co";

  const supabaseServiceRoleKey =
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    (typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined) ||
    (typeof import.meta !== "undefined" ? import.meta.env.SUPABASE_SERVICE_ROLE_KEY : undefined);

  const supabaseAnonKey =
    env?.SUPABASE_KEY ||
    (typeof process !== "undefined" ? process.env.SUPABASE_KEY : undefined) ||
    (typeof import.meta !== "undefined" ? import.meta.env.SUPABASE_KEY : undefined) ||
    "placeholder-key";

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Legacy exports for backward compatibility in development/tests
// These will work in dev mode with import.meta.env
export const supabaseClient = createSupabaseClient();
export const supabaseAdmin = createSupabaseAdmin();

export type SupabaseClient = SupabaseClientType<Database>;

export const DEFAULT_USER_ID = "e57b6524-3439-4057-a683-987f26b14c12";

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

import type { Database } from '../db/database.types.ts';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for public/authenticated operations (respects RLS)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type SupabaseClient = SupabaseClientType<Database>;

export const DEFAULT_USER_ID = "e57b6524-3439-4057-a683-987f26b14c12";
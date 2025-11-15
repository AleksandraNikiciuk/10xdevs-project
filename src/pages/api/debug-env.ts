/**
 * Debug endpoint to check environment variables
 * DELETE THIS FILE after debugging
 */

import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime?.env || {};

  const debug = {
    runtime_available: !!locals.runtime,
    runtime_env_available: !!locals.runtime?.env,
    env_vars: {
      SUPABASE_URL: {
        available: !!env.SUPABASE_URL,
        value: env.SUPABASE_URL?.substring(0, 30) + "...",
        length: env.SUPABASE_URL?.length,
      },
      SUPABASE_KEY: {
        available: !!env.SUPABASE_KEY,
        starts_with: env.SUPABASE_KEY?.substring(0, 20) + "...",
        length: env.SUPABASE_KEY?.length,
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        available: !!env.SUPABASE_SERVICE_ROLE_KEY,
        starts_with: env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + "...",
        length: env.SUPABASE_SERVICE_ROLE_KEY?.length,
      },
      OPENROUTER_API_KEY: {
        available: !!env.OPENROUTER_API_KEY,
        starts_with: env.OPENROUTER_API_KEY?.substring(0, 20) + "...",
        length: env.OPENROUTER_API_KEY?.length,
      },
    },
    import_meta_env: {
      SUPABASE_URL: {
        available: !!import.meta.env.SUPABASE_URL,
        value: import.meta.env.SUPABASE_URL?.substring(0, 30) + "...",
      },
      OPENROUTER_API_KEY: {
        available: !!import.meta.env.OPENROUTER_API_KEY,
        starts_with: import.meta.env.OPENROUTER_API_KEY?.substring(0, 20) + "...",
      },
    },
  };

  return new Response(JSON.stringify(debug, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};


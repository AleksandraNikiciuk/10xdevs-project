/**
 * Debug endpoint to test Supabase connection
 * DELETE THIS FILE after debugging
 */

import type { APIRoute } from "astro";
import { createSupabaseAdmin } from "../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime?.env || {
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const debug: Record<string, unknown> = {
    step1_env_check: {
      SUPABASE_URL_available: !!env.SUPABASE_URL,
      SUPABASE_URL_starts: env.SUPABASE_URL?.substring(0, 30),
      SUPABASE_KEY_available: !!env.SUPABASE_KEY,
      SUPABASE_KEY_starts: env.SUPABASE_KEY?.substring(0, 20),
      SUPABASE_SERVICE_ROLE_KEY_available: !!env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SERVICE_ROLE_KEY_starts: env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
    },
  };

  try {
    // Step 2: Create admin client
    const supabase = createSupabaseAdmin({
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_KEY: env.SUPABASE_KEY,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    });

    debug.step2_client_created = true;

    // Step 3: Test simple query
    const { data, error } = await supabase.from("generations").select("id").limit(1);

    debug.step3_test_query = {
      success: !error,
      error: error ? { message: error.message, details: error.details, hint: error.hint, code: error.code } : null,
      data_exists: !!data,
      data_length: data?.length,
    };

    // Step 4: Test insert with DEFAULT_USER_ID
    const testInsert = {
      user_id: "e57b6524-3439-4057-a683-987f26b14c12", // DEFAULT_USER_ID
      model: "test-model",
      source_text_length: 100,
      source_text_hash: "test-hash-" + Date.now(),
      generated_count: 1,
      generation_duration: 0,
    };

    const { data: insertData, error: insertError } = await supabase
      .from("generations")
      .insert(testInsert)
      .select()
      .single();

    debug.step4_test_insert = {
      success: !insertError,
      error: insertError
        ? { message: insertError.message, details: insertError.details, hint: insertError.hint, code: insertError.code }
        : null,
      inserted_id: insertData?.id,
    };

    // Step 5: Delete test record if inserted
    if (insertData?.id) {
      await supabase.from("generations").delete().eq("id", insertData.id);
      debug.step5_test_cleanup = "deleted";
    }
  } catch (error: unknown) {
    debug.error = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined,
    };
  }

  return new Response(JSON.stringify(debug, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

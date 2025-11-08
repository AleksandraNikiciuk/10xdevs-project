/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

/**
 * Global teardown for Playwright E2E tests.
 * Cleans up test data from Supabase database after all tests complete.
 *
 * Strategy: Login as E2E test user and delete their data.
 * This respects Row Level Security and is safer than using Service Role Key.
 */
async function globalTeardown() {
  console.log("\n🧹 Starting database cleanup after E2E tests...\n");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const e2eUsername = process.env.E2E_USERNAME;
  const e2ePassword = process.env.E2E_PASSWORD;
  const e2eUserId = process.env.E2E_USERNAME_ID;

  // Check required environment variables
  if (!supabaseUrl) {
    console.error("❌ Missing SUPABASE_URL in .env.test file");
    throw new Error("SUPABASE_URL is required for database cleanup");
  }

  if (!supabaseKey) {
    console.error("❌ Missing SUPABASE_KEY in .env.test file");
    throw new Error("SUPABASE_KEY is required for database cleanup");
  }

  if (!e2eUsername || !e2ePassword) {
    console.error(
      "❌ Missing E2E_USERNAME or E2E_PASSWORD in .env.test file\n" +
        "   These credentials are required to login and clean up test data.\n" +
        "   This approach respects Row Level Security policies.\n"
    );
    throw new Error("E2E_USERNAME and E2E_PASSWORD are required for database cleanup");
  }

  console.log(`📍 Using Supabase URL: ${supabaseUrl}`);
  console.log(`👤 Logging in as E2E user: ${e2eUsername}`);

  // Create regular client (respects RLS)
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Login as E2E test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: e2eUsername,
    password: e2ePassword,
  });

  if (authError || !authData.user) {
    console.error("❌ Failed to login as E2E user:", authError?.message);
    throw new Error("Could not authenticate E2E user for cleanup");
  }

  console.log(`✅ Authenticated as user: ${authData.user.id}`);

  if (e2eUserId && authData.user.id !== e2eUserId) {
    console.warn(`⚠️  Warning: Logged in user ID (${authData.user.id}) doesn't match E2E_USERNAME_ID (${e2eUserId})`);
  }

  console.log("");

  try {
    // Clean up flashcards table (RLS will automatically filter to current user's data)
    console.log("📦 Cleaning up flashcards...");
    const { error: flashcardsError, count: flashcardsCount } = await supabase
      .from("flashcards")
      .delete()
      .eq("user_id", authData.user.id);

    if (flashcardsError) {
      console.error("❌ Error deleting flashcards:", flashcardsError.message);
    } else {
      console.log(`✅ Deleted ${flashcardsCount || 0} flashcard(s)`);
    }

    // Clean up generation_error_logs table (RLS will automatically filter to current user's data)
    console.log("📦 Cleaning up generation_error_logs...");
    const { error: errorLogsError, count: errorLogsCount } = await supabase
      .from("generation_error_logs")
      .delete()
      .eq("user_id", authData.user.id);

    if (errorLogsError) {
      console.error("❌ Error deleting generation_error_logs:", errorLogsError.message);
    } else {
      console.log(`✅ Deleted ${errorLogsCount || 0} error log(s)`);
    }

    // Clean up generations table (RLS will automatically filter to current user's data)
    console.log("📦 Cleaning up generations...");
    const { error: generationsError, count: generationsCount } = await supabase
      .from("generations")
      .delete()
      .eq("user_id", authData.user.id);

    if (generationsError) {
      console.error("❌ Error deleting generations:", generationsError.message);
    } else {
      console.log(`✅ Deleted ${generationsCount || 0} generation(s)`);
    }

    // Sign out after cleanup
    await supabase.auth.signOut();

    console.log("\n✨ Database cleanup completed successfully!\n");
    console.log("ℹ️  Note: Only data belonging to the E2E test user was deleted.");
    console.log("   This approach respects Row Level Security policies.");
  } catch (error) {
    console.error("\n❌ Database cleanup failed:", error);
    // Try to sign out even if cleanup failed
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout errors
    }
    throw error;
  }
}

export default globalTeardown;

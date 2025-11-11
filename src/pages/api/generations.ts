/**
 * POST /api/generations
 *
 * Endpoint for generating flashcard proposals from source text using AI
 *
 * @see .ai/generation-endpoint-implementation-plan.md
 */

import type { APIRoute } from "astro";
import { createGenerationSchema } from "../../lib/schemas/generation.schema";
import { createGeneration, type GenerationServiceError } from "../../lib/services/generation.service";
import { createSupabaseAdmin } from "../../db/supabase.client";
import { ZodError } from "zod";
import type { CreateGenerationCommand, CreateGenerationResultDTO } from "../../types";

export const prerender = false;

// ============================================================================
// ERROR RESPONSE HELPERS
// ============================================================================

interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

function createErrorResponse(status: number, error: string, message: string, details?: unknown): Response {
  const body: ErrorResponse = { error, message };
  if (details) {
    body.details = details;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// ============================================================================
// POST HANDLER
// ============================================================================

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log("[API /api/generations] POST request received");

    // Step 1: Determine if user is authenticated and choose appropriate Supabase client
    // Per PRD: Generation works for both logged-in and anonymous users
    const isAuthenticated = !!locals.user;
    console.log("[API /api/generations] User authenticated:", isAuthenticated);
    console.log("[API /api/generations] User object:", locals.user);
    console.log("[API /api/generations] User ID:", locals.user?.id);

    // Always use admin client to bypass RLS, but with appropriate user ID
    // This is necessary because:
    // 1. For authenticated users: we need to write to their user_id
    // 2. For anonymous users: we need to write to DEFAULT_USER_ID
    // Both cases require bypassing RLS since the request doesn't have Supabase auth context
    const supabase = createSupabaseAdmin({
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
      SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    if (!supabase) {
      console.error("[API /api/generations] Supabase admin client not available");
      return createErrorResponse(500, "Internal server error", "Database client not available");
    }
    console.log("[API /api/generations] Supabase admin client ready ✓");

    // Step 2: Parse and validate request body
    let body: CreateGenerationCommand;
    try {
      body = await request.json();
      console.log("[API /api/generations] Request body parsed, source_text length:", body.source_text?.length);
    } catch {
      console.error("[API /api/generations] Failed to parse JSON");
      return createErrorResponse(400, "Invalid JSON", "Request body must be valid JSON");
    }

    // Step 3: Validate with Zod schema
    let validatedData;
    try {
      validatedData = createGenerationSchema.parse(body);
      console.log("[API /api/generations] Validation passed ✓");
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("[API /api/generations] Validation failed:", error.errors);
        return createErrorResponse(400, "Validation failed", "Invalid request data", error.errors);
      }
      throw error;
    }

    // Step 4: Get OpenRouter API key from import.meta.env (works in both dev and production with Astro 5)
    const openrouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    console.log("[API /api/generations] OpenRouter API key available:", !!openrouterApiKey);
    console.log("[API /api/generations] API key starts with:", openrouterApiKey?.substring(0, 15) + "...");

    // Step 4.5: Get site URL from request headers for OpenRouter HTTP-Referer
    const origin = request.headers.get("origin") || request.headers.get("referer")?.split("/").slice(0, 3).join("/");
    const siteUrl = origin || "https://10xdevs-project-7p0.pages.dev";
    console.log("[API /api/generations] Site URL for OpenRouter:", siteUrl);

    // Step 5: Create generation
    console.log("[API /api/generations] Calling createGeneration service...");
    const result: CreateGenerationResultDTO = await createGeneration({
      sourceText: validatedData.source_text,
      supabase,
      openrouterApiKey,
      userId: isAuthenticated ? locals.user?.id : undefined, // Pass user ID if authenticated
      siteUrl, // Pass site URL for OpenRouter HTTP-Referer header
    });
    console.log("[API /api/generations] Generation service completed successfully ✓");

    // Step 6: Return success response (201 Created)
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/generations:", error);

    // Handle GenerationServiceError
    if ((error as GenerationServiceError).code) {
      const serviceError = error as GenerationServiceError;

      switch (serviceError.code) {
        case "AI_ERROR":
          // AI errors are already logged in generation_error_logs
          return createErrorResponse(
            serviceError.statusCode,
            serviceError.statusCode === 503 ? "Service unavailable" : "AI processing error",
            serviceError.message
          );

        case "DATABASE_ERROR":
          return createErrorResponse(500, "Internal server error", "An error occurred while processing your request");

        case "VALIDATION_ERROR":
          return createErrorResponse(400, "Validation failed", serviceError.message, serviceError.details);

        default:
          return createErrorResponse(500, "Internal server error", "An unexpected error occurred");
      }
    }

    // Handle unknown errors
    return createErrorResponse(500, "Internal server error", "An unexpected error occurred");
  }
};

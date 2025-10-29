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
    // Step 1: Get Supabase client from locals (set by middleware)
    const supabase = locals.supabase;

    if (!supabase) {
      return createErrorResponse(500, "Internal server error", "Database client not available");
    }

    // Step 2: Parse and validate request body
    let body: CreateGenerationCommand;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, "Invalid JSON", "Request body must be valid JSON");
    }

    // Step 3: Validate with Zod schema
    let validatedData;
    try {
      validatedData = createGenerationSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return createErrorResponse(400, "Validation failed", "Invalid request data", error.errors);
      }
      throw error;
    }

    // Step 4: Create generation
    const result: CreateGenerationResultDTO = await createGeneration({
      sourceText: validatedData.source_text,
      supabase,
    });

    // Step 5: Return success response (201 Created)
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

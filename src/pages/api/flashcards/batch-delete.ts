import type { APIContext } from "astro";
import { ZodError } from "zod";
import { BatchDeleteFlashcardsSchema } from "../../../lib/schemas/flashcard.schema";
import { batchDeleteFlashcards, type FlashcardServiceError } from "../../../lib/services/flashcard.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

/**
 * POST /api/flashcards/batch-delete
 *
 * Deletes multiple flashcards at once
 *
 * Request body:
 * {
 *   flashcard_ids: number[]
 * }
 *
 * Response (200):
 * {
 *   deleted_count: number
 * }
 *
 * Errors:
 * - 400: Validation failed (empty array, invalid IDs, or more than 100 IDs)
 * - 403: One or more flashcards belong to another user
 * - 500: Internal server error
 */
export async function POST(context: APIContext) {
  try {
    const isAuthenticated = !!context.locals.user;
    const supabase = context.locals.supabase;
    const userId = isAuthenticated ? context.locals.user?.id : DEFAULT_USER_ID;

    if (!supabase || !userId) {
      console.error("[FlashcardsAPI] Supabase client or user ID not available");
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Database connection not available",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await context.request.json();
    } catch (error) {
      console.warn("[FlashcardsAPI] Failed to parse request body:", error);
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate request body
    let validated;
    try {
      validated = BatchDeleteFlashcardsSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn("[FlashcardsAPI] Validation failed:", {
          errors: error.flatten(),
        });
        return new Response(
          JSON.stringify({
            error: "Validation failed",
            details: error.flatten().fieldErrors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }

    console.info("[FlashcardsAPI] Batch deleting flashcards:", {
      userId,
      flashcardCount: validated.flashcard_ids.length,
    });

    // Call service to batch delete flashcards
    const result = await batchDeleteFlashcards({
      command: validated,
      userId,
      supabase,
    });

    console.info("[FlashcardsAPI] Successfully batch deleted flashcards:", {
      userId,
      deletedCount: result.deleted_count,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known service errors
    const serviceError = error as FlashcardServiceError;
    if (serviceError.code) {
      return new Response(
        JSON.stringify({
          error: serviceError.code,
          message: serviceError.message,
        }),
        {
          status: serviceError.statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors
    console.error("[FlashcardsAPI] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

import type { APIContext } from "astro";
import { ZodError } from "zod";
import { UpdateFlashcardSchema } from "../../../lib/schemas/flashcard.schema";
import {
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  type FlashcardServiceError,
} from "../../../lib/services/flashcard.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

/**
 * GET /api/flashcards/:flashcardId
 * 
 * Retrieves a specific flashcard by ID
 * 
 * Response (200):
 * {
 *   id: number,
 *   generation_id: number | null,
 *   question: string,
 *   answer: string,
 *   source: FlashcardSource,
 *   created_at: string,
 *   updated_at: string
 * }
 * 
 * Errors:
 * - 400: Invalid ID parameter
 * - 403: Flashcard belongs to another user
 * - 404: Flashcard not found
 * - 500: Internal server error
 */
export async function GET(context: APIContext) {
  try {
    const supabase = context.locals.supabase;
    const userId = DEFAULT_USER_ID;

    if (!supabase) {
      console.error("[FlashcardAPI] Supabase client not available in context");
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

    // Parse flashcard ID from URL params
    const flashcardIdParam = context.params.flashcardId;
    if (!flashcardIdParam) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardId = parseInt(flashcardIdParam, 10);
    if (isNaN(flashcardId) || flashcardId <= 0) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call service to get flashcard
    const flashcard = await getFlashcardById({
      flashcardId,
      userId,
      supabase,
    });

    return new Response(JSON.stringify(flashcard), {
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
    console.error("[FlashcardAPI] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * PATCH /api/flashcards/:flashcardId
 * 
 * Updates an existing flashcard
 * 
 * Request body:
 * {
 *   question?: string,
 *   answer?: string
 * }
 * 
 * Response (200):
 * FlashcardDTO
 * 
 * Errors:
 * - 400: Validation failed or invalid ID
 * - 403: Flashcard belongs to another user
 * - 404: Flashcard not found
 * - 500: Internal server error
 */
export async function PATCH(context: APIContext) {
  try {
    const supabase = context.locals.supabase;
    const userId = DEFAULT_USER_ID;

    if (!supabase) {
      console.error("[FlashcardAPI] Supabase client not available in context");
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

    // Parse flashcard ID from URL params
    const flashcardIdParam = context.params.flashcardId;
    if (!flashcardIdParam) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardId = parseInt(flashcardIdParam, 10);
    if (isNaN(flashcardId) || flashcardId <= 0) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await context.request.json();
    } catch (error) {
      console.warn("[FlashcardAPI] Failed to parse request body:", error);
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
      validated = UpdateFlashcardSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn("[FlashcardAPI] Validation failed:", {
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

    console.info("[FlashcardAPI] Updating flashcard:", {
      flashcardId,
      userId,
    });

    // Call service to update flashcard
    const updatedFlashcard = await updateFlashcard({
      flashcardId,
      command: validated,
      userId,
      supabase,
    });

    return new Response(JSON.stringify(updatedFlashcard), {
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
    console.error("[FlashcardAPI] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * DELETE /api/flashcards/:flashcardId
 * 
 * Permanently deletes a flashcard
 * 
 * Response (204): No Content
 * 
 * Errors:
 * - 400: Invalid ID parameter
 * - 403: Flashcard belongs to another user
 * - 404: Flashcard not found
 * - 500: Internal server error
 */
export async function DELETE(context: APIContext) {
  try {
    const supabase = context.locals.supabase;
    const userId = DEFAULT_USER_ID;

    if (!supabase) {
      console.error("[FlashcardAPI] Supabase client not available in context");
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

    // Parse flashcard ID from URL params
    const flashcardIdParam = context.params.flashcardId;
    if (!flashcardIdParam) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardId = parseInt(flashcardIdParam, 10);
    if (isNaN(flashcardId) || flashcardId <= 0) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.info("[FlashcardAPI] Deleting flashcard:", {
      flashcardId,
      userId,
    });

    // Call service to delete flashcard
    await deleteFlashcard({
      flashcardId,
      userId,
      supabase,
    });

    // Return 204 No Content
    return new Response(null, {
      status: 204,
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
    console.error("[FlashcardAPI] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


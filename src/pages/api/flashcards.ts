import type { APIContext } from "astro";
import { ZodError } from "zod";
import { CreateFlashcardsSchema, ListFlashcardsQuerySchema } from "../../lib/schemas/flashcard.schema";
import { createFlashcards, listFlashcards, type FlashcardServiceError } from "../../lib/services/flashcard.service";
import { DEFAULT_USER_ID, createSupabaseAdmin } from "../../db/supabase.client";

export const prerender = false;

/**
 * GET /api/flashcards
 *
 * Retrieves paginated list of user's flashcards with optional filtering and sorting
 *
 * Query parameters:
 * - page (optional, default: 1): Page number
 * - limit (optional, default: 50, max: 200): Items per page
 * - source (optional): Filter by source (manual, ai-full, ai-edited)
 * - generation_id (optional): Filter by generation ID
 * - sort (optional, default: created_at): Sort field
 * - order (optional, default: desc): Sort order (asc, desc)
 *
 * Response (200):
 * {
 *   data: FlashcardDTO[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number
 *   }
 * }
 *
 * Errors:
 * - 400: Invalid query parameters
 * - 500: Internal server error
 */
export async function GET(context: APIContext) {
  try {
    // Check if user is authenticated
    const isAuthenticated = !!context.locals.user;
    console.log("[FlashcardsAPI GET] User authenticated:", isAuthenticated);

    // Use admin client with appropriate user ID (same as POST endpoint)
    const supabase = createSupabaseAdmin({
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
      SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    // Determine user ID: authenticated user's ID or DEFAULT_USER_ID
    const userId = isAuthenticated ? context.locals.user?.id : DEFAULT_USER_ID;

    if (!supabase || !userId) {
      console.error("[FlashcardsAPI GET] Supabase client or user ID not available");
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

    console.log("[FlashcardsAPI GET] Using user ID:", userId);

    // Parse query parameters
    const url = new URL(context.request.url);
    const queryParams = {
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      source: url.searchParams.get("source") ?? undefined,
      generation_id: url.searchParams.get("generation_id") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
      order: url.searchParams.get("order") ?? undefined,
    };

    // Validate query parameters
    let validated;
    try {
      validated = ListFlashcardsQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn("[FlashcardsAPI] Query validation failed:", {
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

    console.info("[FlashcardsAPI] Listing flashcards:", {
      userId,
      query: validated,
    });

    // Call service to list flashcards
    const result = await listFlashcards({
      query: validated,
      userId,
      supabase,
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
        message: "An unexpected error occurred while listing flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * POST /api/flashcards
 *
 * Creates one or more flashcards (manual or from AI generation)
 *
 * Request body:
 * {
 *   flashcards: Array<{ question: string, answer: string, source: FlashcardSource }>,
 *   generation_id?: number | null
 * }
 *
 * Response (201):
 * {
 *   created_count: number,
 *   flashcards: FlashcardDTO[]
 * }
 *
 * Errors:
 * - 400: Validation failed
 * - 403: Generation does not belong to user
 * - 404: Generation not found
 * - 500: Internal server error
 */
export async function POST(context: APIContext) {
  try {
    // Step 1: Check authentication - saving flashcards requires login
    const isAuthenticated = !!context.locals.user;
    console.log("[FlashcardsAPI] User authenticated:", isAuthenticated);

    if (!isAuthenticated) {
      console.warn("[FlashcardsAPI] Unauthenticated user attempted to save flashcards");
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to save flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use admin client with authenticated user's ID to bypass RLS
    // (same approach as generations endpoint)
    const supabase = createSupabaseAdmin({
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
      SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    const userId = context.locals.user?.id;

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
    console.log("[FlashcardsAPI] Using user ID:", userId);

    // Step 2: Parse request body
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

    // Step 3: Validate request body with Zod schema
    let validated;
    try {
      validated = CreateFlashcardsSchema.parse(body);
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
      throw error; // Re-throw non-Zod errors
    }

    console.info("[FlashcardsAPI] Creating flashcards:", {
      userId,
      flashcardCount: validated.flashcards.length,
      generationId: validated.generation_id,
    });

    // Step 4: Call service to create flashcards
    const result = await createFlashcards({
      command: validated,
      userId,
      supabase,
    });

    // Step 5: Return success response
    console.info("[FlashcardsAPI] Successfully created flashcards:", {
      userId,
      createdCount: result.created_count,
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known service errors
    const serviceError = error as FlashcardServiceError;
    if (serviceError.code) {
      console.warn("[FlashcardsAPI] Service error:", {
        code: serviceError.code,
        message: serviceError.message,
        statusCode: serviceError.statusCode,
      });

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
        message: "An unexpected error occurred while creating flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

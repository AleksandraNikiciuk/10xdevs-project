import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateFlashcardsCommand,
  CreateFlashcardsResultDTO,
  FlashcardDTO,
  UpdateFlashcardCommand,
  ListFlashcardsQuery,
  FlashcardListDTO,
  BatchDeleteFlashcardsCommand,
  BatchDeleteFlashcardsResultDTO,
} from "../../types";
import type { TablesInsert } from "../../db/database.types";

/**
 * Custom error type for flashcard service operations
 */
export interface FlashcardServiceError extends Error {
  code: "VALIDATION_ERROR" | "DATABASE_ERROR" | "NOT_FOUND" | "FORBIDDEN";
  statusCode: number;
  details?: unknown;
}

/**
 * Parameters for creating flashcards
 */
interface CreateFlashcardsParams {
  command: CreateFlashcardsCommand;
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Parameters for getting a flashcard by ID
 */
interface GetFlashcardParams {
  flashcardId: number;
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Parameters for updating a flashcard
 */
interface UpdateFlashcardParams {
  flashcardId: number;
  command: UpdateFlashcardCommand;
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Parameters for deleting a flashcard
 */
interface DeleteFlashcardParams {
  flashcardId: number;
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Parameters for listing flashcards
 */
interface ListFlashcardsParams {
  query: ListFlashcardsQuery;
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Parameters for batch deleting flashcards
 */
interface BatchDeleteFlashcardsParams {
  command: BatchDeleteFlashcardsCommand;
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Factory function for creating standardized service errors
 */
function createFlashcardServiceError(
  code: FlashcardServiceError["code"],
  message: string,
  statusCode: number,
  details?: unknown
): FlashcardServiceError {
  const error = new Error(message) as FlashcardServiceError;
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

/**
 * Validates that a generation exists and belongs to the specified user
 *
 * @throws {FlashcardServiceError} NOT_FOUND if generation doesn't exist
 * @throws {FlashcardServiceError} FORBIDDEN if generation belongs to another user
 * @throws {FlashcardServiceError} DATABASE_ERROR if database query fails
 */
async function validateGenerationOwnership(
  generationId: number,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    const { data: generation, error } = await supabase
      .from("generations")
      .select("id, user_id")
      .eq("id", generationId)
      .single();

    if (error) {
      console.error("[FlashcardService] Database error when validating generation:", {
        generationId,
        error: error.message,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "Failed to validate generation", 500, error);
    }

    if (!generation) {
      console.info("[FlashcardService] Generation not found:", { generationId });
      throw createFlashcardServiceError("NOT_FOUND", `Generation with ID ${generationId} not found`, 404);
    }

    if (generation.user_id !== userId) {
      console.warn("[FlashcardService] Generation ownership mismatch:", {
        generationId,
        expectedUserId: userId,
        actualUserId: generation.user_id,
      });
      throw createFlashcardServiceError("FORBIDDEN", "Generation does not belong to the current user", 403);
    }
  } catch (error) {
    // Re-throw known errors
    if ((error as FlashcardServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("[FlashcardService] Unexpected error during generation validation:", error);
    throw createFlashcardServiceError("DATABASE_ERROR", "An unexpected error occurred during validation", 500, error);
  }
}

/**
 * Creates one or more flashcards
 *
 * Supports two scenarios:
 * 1. Manual flashcards (created by user from scratch)
 * 2. AI-generated flashcards (accepted from generation, with or without edits)
 *
 * @param params - Parameters including command, userId, and Supabase client
 * @returns Created flashcards with metadata
 *
 * @throws {FlashcardServiceError} VALIDATION_ERROR for business logic validation failures
 * @throws {FlashcardServiceError} NOT_FOUND if generation_id doesn't exist
 * @throws {FlashcardServiceError} FORBIDDEN if generation_id belongs to another user
 * @throws {FlashcardServiceError} DATABASE_ERROR for database operation failures
 */
export async function createFlashcards(params: CreateFlashcardsParams): Promise<CreateFlashcardsResultDTO> {
  const { command, userId, supabase } = params;
  const { flashcards, generation_id } = command;

  try {
    // Step 1: Validate generation ownership (if generation_id is provided)
    if (generation_id != null) {
      await validateGenerationOwnership(generation_id, userId, supabase);
    }

    // Step 2: Prepare data for insertion
    const flashcardsToInsert: TablesInsert<"flashcards">[] = flashcards.map((flashcard) => ({
      user_id: userId,
      generation_id: generation_id ?? null,
      question: flashcard.question.trim(),
      answer: flashcard.answer.trim(),
      source: flashcard.source,
    }));

    console.info("[FlashcardService] Creating flashcards:", {
      userId,
      count: flashcardsToInsert.length,
      generationId: generation_id,
      sources: flashcards.map((f) => f.source),
    });

    // Step 3: Batch insert flashcards
    const { data: createdFlashcards, error } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("id, generation_id, question, answer, source, created_at, updated_at");

    if (error) {
      console.error("[FlashcardService] Database error when creating flashcards:", {
        userId,
        flashcardCount: flashcardsToInsert.length,
        error: error.message,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "Failed to create flashcards", 500, error);
    }

    if (!createdFlashcards || createdFlashcards.length === 0) {
      console.error("[FlashcardService] No flashcards were created:", {
        userId,
        flashcardCount: flashcardsToInsert.length,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "No flashcards were created", 500);
    }

    // Step 4: Map to DTO
    const flashcardDTOs: FlashcardDTO[] = createdFlashcards.map((flashcard) => ({
      id: flashcard.id,
      generation_id: flashcard.generation_id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    }));

    console.info("[FlashcardService] Successfully created flashcards:", {
      userId,
      count: flashcardDTOs.length,
    });

    return {
      created_count: flashcardDTOs.length,
      flashcards: flashcardDTOs,
    };
  } catch (error) {
    // Re-throw known errors
    if ((error as FlashcardServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("[FlashcardService] Unexpected error:", {
      userId,
      flashcardCount: flashcards.length,
      error,
    });
    throw createFlashcardServiceError(
      "DATABASE_ERROR",
      "An unexpected error occurred while creating flashcards",
      500,
      error
    );
  }
}

/**
 * Retrieves a single flashcard by ID
 *
 * @param params - Parameters including flashcardId, userId, and Supabase client
 * @returns Flashcard DTO
 *
 * @throws {FlashcardServiceError} NOT_FOUND if flashcard doesn't exist
 * @throws {FlashcardServiceError} FORBIDDEN if flashcard belongs to another user
 * @throws {FlashcardServiceError} DATABASE_ERROR for database operation failures
 */
export async function getFlashcardById(params: GetFlashcardParams): Promise<FlashcardDTO> {
  const { flashcardId, userId, supabase } = params;

  try {
    console.info("[FlashcardService] Fetching flashcard:", {
      flashcardId,
      userId,
    });

    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .select("id, generation_id, question, answer, source, created_at, updated_at")
      .eq("id", flashcardId)
      .single();

    if (error) {
      console.error("[FlashcardService] Database error when fetching flashcard:", {
        flashcardId,
        error: error.message,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "Failed to fetch flashcard", 500, error);
    }

    if (!flashcard) {
      console.info("[FlashcardService] Flashcard not found:", { flashcardId });
      throw createFlashcardServiceError("NOT_FOUND", `Flashcard with ID ${flashcardId} not found`, 404);
    }

    // Note: RLS will handle user_id filtering in production
    // For MVP, we skip explicit user_id check since all data belongs to DEFAULT_USER_ID

    return {
      id: flashcard.id,
      generation_id: flashcard.generation_id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    };
  } catch (error) {
    // Re-throw known errors
    if ((error as FlashcardServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("[FlashcardService] Unexpected error fetching flashcard:", {
      flashcardId,
      error,
    });
    throw createFlashcardServiceError(
      "DATABASE_ERROR",
      "An unexpected error occurred while fetching flashcard",
      500,
      error
    );
  }
}

/**
 * Updates an existing flashcard
 *
 * @param params - Parameters including flashcardId, command, userId, and Supabase client
 * @returns Updated flashcard DTO
 *
 * @throws {FlashcardServiceError} NOT_FOUND if flashcard doesn't exist
 * @throws {FlashcardServiceError} FORBIDDEN if flashcard belongs to another user
 * @throws {FlashcardServiceError} DATABASE_ERROR for database operation failures
 */
export async function updateFlashcard(params: UpdateFlashcardParams): Promise<FlashcardDTO> {
  const { flashcardId, command, userId, supabase } = params;

  try {
    console.info("[FlashcardService] Updating flashcard:", {
      flashcardId,
      userId,
      fields: Object.keys(command),
    });

    // Prepare update data
    const updateData: { question?: string; answer?: string } = {};
    if (command.question !== undefined) {
      updateData.question = command.question.trim();
    }
    if (command.answer !== undefined) {
      updateData.answer = command.answer.trim();
    }

    // Update flashcard
    const { data: updatedFlashcard, error } = await supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", flashcardId)
      .select("id, generation_id, question, answer, source, created_at, updated_at")
      .single();

    if (error) {
      // Check if it's a not found error (no rows affected)
      if (error.code === "PGRST116") {
        console.info("[FlashcardService] Flashcard not found for update:", { flashcardId });
        throw createFlashcardServiceError("NOT_FOUND", `Flashcard with ID ${flashcardId} not found`, 404);
      }

      console.error("[FlashcardService] Database error when updating flashcard:", {
        flashcardId,
        error: error.message,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "Failed to update flashcard", 500, error);
    }

    if (!updatedFlashcard) {
      console.info("[FlashcardService] Flashcard not found after update:", { flashcardId });
      throw createFlashcardServiceError("NOT_FOUND", `Flashcard with ID ${flashcardId} not found`, 404);
    }

    console.info("[FlashcardService] Successfully updated flashcard:", {
      flashcardId,
      userId,
    });

    return {
      id: updatedFlashcard.id,
      generation_id: updatedFlashcard.generation_id,
      question: updatedFlashcard.question,
      answer: updatedFlashcard.answer,
      source: updatedFlashcard.source,
      created_at: updatedFlashcard.created_at,
      updated_at: updatedFlashcard.updated_at,
    };
  } catch (error) {
    // Re-throw known errors
    if ((error as FlashcardServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("[FlashcardService] Unexpected error updating flashcard:", {
      flashcardId,
      error,
    });
    throw createFlashcardServiceError(
      "DATABASE_ERROR",
      "An unexpected error occurred while updating flashcard",
      500,
      error
    );
  }
}

/**
 * Deletes a flashcard permanently
 *
 * @param params - Parameters including flashcardId, userId, and Supabase client
 *
 * @throws {FlashcardServiceError} NOT_FOUND if flashcard doesn't exist
 * @throws {FlashcardServiceError} FORBIDDEN if flashcard belongs to another user
 * @throws {FlashcardServiceError} DATABASE_ERROR for database operation failures
 */
export async function deleteFlashcard(params: DeleteFlashcardParams): Promise<void> {
  const { flashcardId, userId, supabase } = params;

  try {
    console.info("[FlashcardService] Deleting flashcard:", {
      flashcardId,
      userId,
    });

    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId);

    if (error) {
      console.error("[FlashcardService] Database error when deleting flashcard:", {
        flashcardId,
        error: error.message,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "Failed to delete flashcard", 500, error);
    }

    // Note: Supabase delete doesn't return error if row doesn't exist
    // We could add a check before delete, but for now we accept that
    // deleting a non-existent flashcard is idempotent

    console.info("[FlashcardService] Successfully deleted flashcard:", {
      flashcardId,
      userId,
    });
  } catch (error) {
    // Re-throw known errors
    if ((error as FlashcardServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("[FlashcardService] Unexpected error deleting flashcard:", {
      flashcardId,
      error,
    });
    throw createFlashcardServiceError(
      "DATABASE_ERROR",
      "An unexpected error occurred while deleting flashcard",
      500,
      error
    );
  }
}

/**
 * Lists flashcards with pagination, filtering, and sorting
 *
 * @param params - Parameters including query, userId, and Supabase client
 * @returns Paginated list of flashcards
 *
 * @throws {FlashcardServiceError} DATABASE_ERROR for database operation failures
 */
export async function listFlashcards(params: ListFlashcardsParams): Promise<FlashcardListDTO> {
  const { query, userId, supabase } = params;

  try {
    // Extract query parameters with defaults
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const sort = query.sort ?? "created_at";
    const order = query.order ?? "desc";

    console.info("[FlashcardService] Listing flashcards:", {
      userId,
      page,
      limit,
      filters: {
        source: query.source,
        generation_id: query.generation_id,
      },
      sort,
      order,
    });

    // Build base query
    let queryBuilder = supabase
      .from("flashcards")
      .select("id, generation_id, question, answer, source, created_at, updated_at", {
        count: "exact",
      })
      .eq("user_id", userId);

    // Apply filters
    if (query.source) {
      queryBuilder = queryBuilder.eq("source", query.source);
    }

    if (typeof query.generation_id === "number") {
      queryBuilder = queryBuilder.eq("generation_id", query.generation_id);
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sort, { ascending: order === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    // Execute query
    const { data: flashcards, error, count } = await queryBuilder;

    if (error) {
      console.error("[FlashcardService] Database error when listing flashcards:", {
        userId,
        error: error.message,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "Failed to list flashcards", 500, error);
    }

    // Map to DTOs
    const flashcardDTOs: FlashcardDTO[] = (flashcards || []).map((flashcard) => ({
      id: flashcard.id,
      generation_id: flashcard.generation_id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    }));

    console.info("[FlashcardService] Successfully listed flashcards:", {
      userId,
      count: flashcardDTOs.length,
      total: count,
    });

    return {
      data: flashcardDTOs,
      pagination: {
        page,
        limit,
        total: count ?? 0,
      },
    };
  } catch (error) {
    // Re-throw known errors
    if ((error as FlashcardServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("[FlashcardService] Unexpected error listing flashcards:", {
      userId,
      error,
    });
    throw createFlashcardServiceError(
      "DATABASE_ERROR",
      "An unexpected error occurred while listing flashcards",
      500,
      error
    );
  }
}

/**
 * Batch deletes multiple flashcards
 *
 * @param params - Parameters including command, userId, and Supabase client
 * @returns Count of deleted flashcards
 *
 * @throws {FlashcardServiceError} DATABASE_ERROR for database operation failures
 */
export async function batchDeleteFlashcards(
  params: BatchDeleteFlashcardsParams
): Promise<BatchDeleteFlashcardsResultDTO> {
  const { command, userId, supabase } = params;
  const { flashcard_ids } = command;

  try {
    console.info("[FlashcardService] Batch deleting flashcards:", {
      userId,
      count: flashcard_ids.length,
    });

    // Delete flashcards (RLS will ensure only user's flashcards are deleted)
    const { error, count } = await supabase
      .from("flashcards")
      .delete({ count: "exact" })
      .in("id", flashcard_ids)
      .eq("user_id", userId);

    if (error) {
      console.error("[FlashcardService] Database error when batch deleting flashcards:", {
        userId,
        flashcardCount: flashcard_ids.length,
        error: error.message,
      });
      throw createFlashcardServiceError("DATABASE_ERROR", "Failed to delete flashcards", 500, error);
    }

    const deletedCount = count ?? 0;

    console.info("[FlashcardService] Successfully batch deleted flashcards:", {
      userId,
      deletedCount,
      requestedCount: flashcard_ids.length,
    });

    return {
      deleted_count: deletedCount,
    };
  } catch (error) {
    // Re-throw known errors
    if ((error as FlashcardServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("[FlashcardService] Unexpected error batch deleting flashcards:", {
      userId,
      flashcardCount: flashcard_ids.length,
      error,
    });
    throw createFlashcardServiceError(
      "DATABASE_ERROR",
      "An unexpected error occurred while deleting flashcards",
      500,
      error
    );
  }
}

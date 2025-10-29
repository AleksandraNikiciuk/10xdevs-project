/**
 * Generation Service
 * Handles business logic for flashcard generation
 */

import crypto from "node:crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { CreateGenerationResultDTO } from "../../types";
import { generateFlashcards, type AIServiceError } from "./ai.service";

// ============================================================================
// TYPES
// ============================================================================

export interface GenerationServiceError extends Error {
  code: "VALIDATION_ERROR" | "DATABASE_ERROR" | "AI_ERROR";
  statusCode: number;
  details?: unknown;
}

interface CreateGenerationParams {
  sourceText: string;
  supabase: SupabaseClient;
}

// ============================================================================
// ERROR FACTORY
// ============================================================================

function createGenerationServiceError(
  code: GenerationServiceError["code"],
  message: string,
  statusCode: number,
  details?: unknown
): GenerationServiceError {
  const error = new Error(message) as GenerationServiceError;
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate MD5 hash of source text
 */
function calculateHash(text: string): string {
  return crypto.createHash("md5").update(text, "utf8").digest("hex");
}

/**
 * Calculate generation duration in seconds
 */
function calculateDuration(startTime: number): number {
  return Math.round((Date.now() - startTime) / 1000);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Create a new generation with AI-generated flashcard proposals
 *
 * This function:
 * 1. Calculates source text metadata (length, hash)
 * 2. Calls AI service to generate flashcards
 * 3. Saves generation metadata and flashcards to database
 * 4. Returns the complete generation result
 *
 * @param params - Generation parameters
 * @returns Generation result with flashcard proposals
 * @throws {GenerationServiceError} When generation fails
 *
 * @example
 * const result = await createGeneration({
 *   sourceText: "Long educational text...",
 *   supabase: supabaseClient
 * });
 */
export async function createGeneration(params: CreateGenerationParams): Promise<CreateGenerationResultDTO> {
  const { sourceText, supabase } = params;
  const userId = DEFAULT_USER_ID;

  // Start timer for generation duration
  const startTime = Date.now();

  try {
    // Step 1: Calculate source text metadata
    const sourceTextLength = sourceText.length;
    const sourceTextHash = calculateHash(sourceText);

    // Step 2: Generate flashcards using AI
    let aiResponse;
    try {
      aiResponse = await generateFlashcards(sourceText);
    } catch (error) {
      const aiError = error as AIServiceError;

      // Log AI errors to generation_error_logs
      await supabase.from("generation_error_logs").insert({
        user_id: userId,
        error_code: aiError.code,
        error_message: aiError.message,
        model: "gpt-4o-mini", // Default model
        source_text_length: sourceTextLength,
        source_text_hash: sourceTextHash,
      });

      throw createGenerationServiceError("AI_ERROR", aiError.message, aiError.statusCode, { code: aiError.code });
    }

    const generationDuration = calculateDuration(startTime);

    // Step 3: Save to database in a transaction
    // Insert generation metadata
    const { data: generationData, error: generationError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        model: aiResponse.model,
        source_text_length: sourceTextLength,
        source_text_hash: sourceTextHash,
        generated_count: aiResponse.flashcards.length,
        generation_duration: generationDuration,
      })
      .select()
      .single();

    if (generationError || !generationData) {
      console.error("Database error (generations):", generationError);
      throw createGenerationServiceError("DATABASE_ERROR", "Failed to save generation metadata", 500, generationError);
    }

    // Insert flashcard proposals
    const flashcardsToInsert = aiResponse.flashcards.map((flashcard) => ({
      user_id: userId,
      generation_id: generationData.id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: "ai-full" as const,
    }));

    const { data: flashcardsData, error: flashcardsError } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("id, question, answer, source, generation_id, created_at");

    if (flashcardsError || !flashcardsData) {
      console.error("Database error (flashcards):", flashcardsError);
      throw createGenerationServiceError("DATABASE_ERROR", "Failed to save flashcard proposals", 500, flashcardsError);
    }

    // Step 4: Build and return response DTO
    const result: CreateGenerationResultDTO = {
      generation: {
        id: generationData.id,
        user_id: generationData.user_id,
        model: generationData.model,
        source_text_length: generationData.source_text_length,
        source_text_hash: generationData.source_text_hash,
        generated_count: generationData.generated_count,
        generation_duration: generationData.generation_duration,
        created_at: generationData.created_at,
        flashcardsProposals: flashcardsData,
      },
    };

    return result;
  } catch (error) {
    // Re-throw GenerationServiceError as-is
    if ((error as GenerationServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    console.error("Unexpected error in createGeneration:", error);
    throw createGenerationServiceError("DATABASE_ERROR", "An unexpected error occurred", 500, error);
  }
}

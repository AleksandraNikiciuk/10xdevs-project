/**
 * Generation Service
 * Handles business logic for flashcard generation using OpenRouter AI
 */

import crypto from "node:crypto";
import { z } from "zod";
import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { CreateGenerationResultDTO } from "../../types";
import {
  OpenRouterService,
  ConfigurationError,
  OpenRouterApiError,
  NetworkError,
  InvalidResponseJsonError,
  SchemaValidationError,
} from "./openrouter.service";

// ============================================================================
// CONFIGURATION
// ============================================================================

// Models that support function calling (structured output):
// FREE options (may require OpenRouter account setup):
// - "google/gemini-flash-1.5-8b-exp:free" - Fast, supports function calling
// - "meta-llama/llama-3.1-8b-instruct:free" - Supports tools
// 
// PAID but CHEAP options (work immediately):
// - "gpt-4o-mini" - $0.15/1M tokens, excellent quality
// - "anthropic/claude-3-haiku" - $0.25/1M tokens, very good
// - "google/gemini-flash-1.5" - $0.075/1M tokens, fastest
//
// Using gpt-4o-mini as reliable default (very low cost ~$0.01 per generation)
const AI_MODEL = "openai/gpt-4o-mini";

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema for a single flashcard proposal from AI
 */
const FlashcardProposalSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
});

/**
 * Schema for AI response containing flashcards array
 */
const FlashcardsResponseSchema = z.object({
  flashcards: z
    .array(FlashcardProposalSchema)
    .min(1, "At least one flashcard is required")
    .max(20, "Maximum 20 flashcards allowed"),
});

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

/**
 * Generate flashcards using OpenRouter AI
 * @throws {Error} Various OpenRouter errors that need to be caught and mapped
 */
async function generateFlashcardsWithAI(
  sourceText: string
): Promise<{ flashcards: Array<{ question: string; answer: string }>; model: string }> {
  // Initialize OpenRouter service
  const openRouter = new OpenRouterService();

  // Create system prompt for flashcard generation
  const systemPrompt = `You are an expert educational content creator specializing in flashcard generation.

Your task is to analyze the provided text and create high-quality flashcards that:
1. Extract key concepts, facts, and important information
2. Formulate clear, concise questions
3. Provide accurate, comprehensive answers
4. Cover different aspects of the material
5. Are suitable for effective learning and memorization

Generate between 3 and 15 flashcards depending on the content length and complexity.
Each flashcard should be self-contained and understandable without additional context.

Important guidelines:
- Focus on the most important information
- Make questions specific and answerable
- Keep answers clear, complete, and accurate
- Ensure variety in question types (what, how, why, when, etc.)
- Don't create duplicate or overly similar questions`;

  const userPrompt = `Create flashcards from the following text:

${sourceText}`;

  // Call OpenRouter API with structured output
  const result = await openRouter.structuredChatCompletion({
    schema: FlashcardsResponseSchema,
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    params: {
      temperature: 0.7,
      max_tokens: 3000,
    },
  });

  return {
    flashcards: result.flashcards,
    model: AI_MODEL,
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Create a new generation with AI-generated flashcard proposals
 *
 * This function:
 * 1. Calculates source text metadata (length, hash)
 * 2. Calls OpenRouter AI to generate flashcards using structured output
 * 3. Saves generation metadata and flashcards to database
 * 4. Returns the complete generation result
 *
 * Uses OpenRouter with gpt-4o-mini model for flashcard generation.
 * All responses are validated against Zod schema for type safety.
 *
 * @param params - Generation parameters (sourceText, supabase client)
 * @returns Generation result with flashcard proposals
 * @throws {GenerationServiceError} When generation fails (AI_ERROR, DATABASE_ERROR)
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

    // Step 2: Generate flashcards using OpenRouter AI
    let aiResponse;
    try {
      aiResponse = await generateFlashcardsWithAI(sourceText);
    } catch (error) {
      // Map OpenRouter errors to GenerationServiceError
      let errorCode = "AI_SERVICE_ERROR";
      let errorMessage = "Failed to generate flashcards";
      let statusCode = 500;

      if (error instanceof ConfigurationError) {
        errorCode = "AI_CONFIGURATION_ERROR";
        errorMessage = "AI service configuration error: Missing API key";
        statusCode = 500;
      } else if (error instanceof OpenRouterApiError) {
        errorCode = "AI_API_ERROR";
        errorMessage = `AI API error: ${error.message}`;
        statusCode = error.statusCode;
      } else if (error instanceof NetworkError) {
        errorCode = "AI_TIMEOUT";
        errorMessage = "AI service connection timeout";
        statusCode = 504;
      } else if (error instanceof InvalidResponseJsonError) {
        errorCode = "AI_INVALID_RESPONSE";
        errorMessage = "AI service returned invalid response format";
        statusCode = 422;
      } else if (error instanceof SchemaValidationError) {
        errorCode = "AI_INVALID_RESPONSE";
        errorMessage = `AI service returned invalid data structure: ${error.validationIssues}`;
        statusCode = 422;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Log AI errors to generation_error_logs
      await supabase.from("generation_error_logs").insert({
        user_id: userId,
        error_code: errorCode,
        error_message: errorMessage,
        model: AI_MODEL,
        source_text_length: sourceTextLength,
        source_text_hash: sourceTextHash,
      });

      throw createGenerationServiceError("AI_ERROR", errorMessage, statusCode, { code: errorCode });
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

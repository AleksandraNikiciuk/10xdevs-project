/**
 * AI Service for generating flashcard proposals
 * 
 * Development mode: Uses mock data
 * Production mode: Integrates with OpenRouter.ai API
 */

import type { AIGenerationResponse, AIFlashcardProposal, AIErrorCode } from "../../types";

// ============================================================================
// TYPES
// ============================================================================

export interface AIServiceError extends Error {
  code: AIErrorCode;
  statusCode: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const AI_SERVICE_TIMEOUT = 60000; // 60 seconds
const AI_MODEL = "gpt-4o-mini";

// ============================================================================
// ERROR FACTORY
// ============================================================================

function createAIServiceError(
  code: AIServiceError["code"],
  message: string,
  statusCode: number
): AIServiceError {
  const error = new Error(message) as AIServiceError;
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

// ============================================================================
// MOCK IMPLEMENTATION (Development)
// ============================================================================

/**
 * Mock AI service for development
 * Simulates API delay and returns sample flashcards
 */
async function generateFlashcardsMock(
  sourceText: string
): Promise<AIGenerationResponse> {
  // Simulate API delay (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generate 3-5 mock flashcards based on text length
  const count = Math.min(5, Math.max(3, Math.floor(sourceText.length / 2000)));
  const flashcards: AIFlashcardProposal[] = [];

  for (let i = 1; i <= count; i++) {
    flashcards.push({
      question: `Mock Question ${i} based on provided text?`,
      answer: `Mock Answer ${i} with relevant information from the source.`,
    });
  }

  return {
    model: AI_MODEL,
    flashcards,
  };
}

// ============================================================================
// REAL IMPLEMENTATION (Production) - TODO
// ============================================================================

/**
 * Real AI service using OpenRouter.ai API
 * @throws {AIServiceError} When AI service fails or times out
 */
async function generateFlashcardsReal(
  sourceText: string
): Promise<AIGenerationResponse> {
  // TODO: Implement OpenRouter.ai integration
  // This will be implemented in production phase
  
  throw createAIServiceError(
    "AI_SERVICE_ERROR",
    "Real AI service not yet implemented",
    503
  );
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate flashcard proposals from source text using AI
 * 
 * @param sourceText - The source text to generate flashcards from
 * @returns AI generation response with flashcards and model info
 * @throws {AIServiceError} When AI service fails or times out
 * 
 * @example
 * const result = await generateFlashcards(sourceText);
 * console.log(`Generated ${result.flashcards.length} flashcards using ${result.model}`);
 */
export async function generateFlashcards(
  sourceText: string
): Promise<AIGenerationResponse> {
  // Use mock in development, real service in production
  const isDevelopment = import.meta.env.DEV;

  try {
    const result = isDevelopment
      ? await generateFlashcardsMock(sourceText)
      : await generateFlashcardsReal(sourceText);

    // Validate AI response
    if (!result.flashcards || result.flashcards.length === 0) {
      throw createAIServiceError(
        "AI_INVALID_RESPONSE",
        "AI returned no flashcards",
        422
      );
    }

    // Validate each flashcard
    for (const flashcard of result.flashcards) {
      if (!flashcard.question?.trim() || !flashcard.answer?.trim()) {
        throw createAIServiceError(
          "AI_INVALID_RESPONSE",
          "AI returned invalid flashcard format",
          422
        );
      }
    }

    return result;
  } catch (error) {
    // Re-throw AIServiceError as-is
    if ((error as AIServiceError).code) {
      throw error;
    }

    // Wrap unknown errors
    throw createAIServiceError(
      "AI_SERVICE_ERROR",
      error instanceof Error ? error.message : "Unknown AI service error",
      500
    );
  }
}


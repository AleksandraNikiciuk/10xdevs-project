/**
 * AI Service for generating flashcard proposals
 * 
 * Development mode: Uses mock data
 * Production mode: Integrates with OpenRouter.ai API
 */

import { z } from "zod";
import type { AIGenerationResponse, AIFlashcardProposal, AIErrorCode } from "../../types";
import { 
  OpenRouterService, 
  ConfigurationError, 
  OpenRouterApiError, 
  NetworkError, 
  InvalidResponseJsonError, 
  SchemaValidationError 
} from "./openrouter.service";

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
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema for a single flashcard proposal
 */
const FlashcardProposalSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
});

/**
 * Schema for AI response containing flashcards
 */
const AIResponseSchema = z.object({
  flashcards: z.array(FlashcardProposalSchema).min(1, "At least one flashcard is required"),
});

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
// REAL IMPLEMENTATION (Production)
// ============================================================================

/**
 * Real AI service using OpenRouter.ai API
 * @throws {AIServiceError} When AI service fails or times out
 */
async function generateFlashcardsReal(
  sourceText: string
): Promise<AIGenerationResponse> {
  try {
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

Generate between 3 and 10 flashcards depending on the content length and complexity.
Each flashcard should be self-contained and understandable without additional context.`;

    const userPrompt = `Create flashcards from the following text:

${sourceText}

Remember to:
- Focus on the most important information
- Make questions specific and answerable
- Keep answers clear and complete
- Ensure variety in question types`;

    // Call OpenRouter API with structured output
    const result = await openRouter.structuredChatCompletion({
      schema: AIResponseSchema,
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      params: {
        temperature: 0.7,
        max_tokens: 2000,
      },
    });

    return {
      flashcards: result.flashcards,
      model: AI_MODEL,
    };
  } catch (error) {
    // Handle OpenRouter-specific errors
    if (error instanceof ConfigurationError) {
      throw createAIServiceError(
        "AI_SERVICE_ERROR",
        "AI service configuration error: Missing API key",
        500
      );
    }

    if (error instanceof OpenRouterApiError) {
      // Map API errors to AI service errors
      const statusCode = error.statusCode;
      if (statusCode === 401 || statusCode === 403) {
        throw createAIServiceError(
          "AI_SERVICE_ERROR",
          "AI service authentication failed",
          statusCode
        );
      }
      if (statusCode === 429) {
        throw createAIServiceError(
          "AI_SERVICE_ERROR",
          "AI service rate limit exceeded",
          statusCode
        );
      }
      throw createAIServiceError(
        "AI_SERVICE_ERROR",
        `AI service error: ${error.message}`,
        statusCode
      );
    }

    if (error instanceof NetworkError) {
      throw createAIServiceError(
        "AI_TIMEOUT",
        "AI service connection timeout",
        504
      );
    }

    if (error instanceof InvalidResponseJsonError) {
      throw createAIServiceError(
        "AI_INVALID_RESPONSE",
        "AI service returned invalid response format",
        422
      );
    }

    if (error instanceof SchemaValidationError) {
      throw createAIServiceError(
        "AI_INVALID_RESPONSE",
        `AI service returned data that doesn't match expected format: ${error.validationIssues}`,
        422
      );
    }

    // Unknown error
    throw createAIServiceError(
      "AI_SERVICE_ERROR",
      error instanceof Error ? error.message : "Unknown AI service error",
      500
    );
  }
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


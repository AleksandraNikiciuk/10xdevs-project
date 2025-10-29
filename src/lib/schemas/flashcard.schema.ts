import { z } from "zod";

/**
 * Schema for a single flashcard item in the create request
 */
const FlashcardItemSchema = z.object({
  question: z.string().trim().min(1, "Question cannot be empty").max(200, "Question cannot exceed 200 characters"),
  answer: z.string().trim().min(1, "Answer cannot be empty").max(500, "Answer cannot exceed 500 characters"),
  source: z.enum(["manual", "ai-full", "ai-edited"], {
    errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
  }),
});

/**
 * Schema for creating flashcards
 *
 * Validation rules:
 * - flashcards: array of 1-100 items
 * - generation_id: optional, but required for AI sources
 * - Custom validation ensures generation_id is present for AI sources and absent for manual
 */
export const CreateFlashcardsSchema = z
  .object({
    flashcards: z
      .array(FlashcardItemSchema)
      .min(1, "At least one flashcard is required")
      .max(100, "Cannot create more than 100 flashcards at once"),
    generation_id: z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => {
      const hasAISource = data.flashcards.some((f) => f.source === "ai-full" || f.source === "ai-edited");
      const hasGenerationId = data.generation_id != null;

      // AI source requires generation_id
      if (hasAISource && !hasGenerationId) {
        return false;
      }

      // Manual source forbids generation_id
      if (!hasAISource && hasGenerationId) {
        return false;
      }

      return true;
    },
    {
      message:
        "generation_id is required for AI sources (ai-full, ai-edited) and must not be present for manual sources",
    }
  );

export type CreateFlashcardsInput = z.infer<typeof CreateFlashcardsSchema>;

/**
 * Schema for updating a flashcard
 *
 * Validation rules:
 * - At least one field must be provided
 * - question: optional, 1-200 characters if provided
 * - answer: optional, 1-500 characters if provided
 */
export const UpdateFlashcardSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "Question cannot be empty")
      .max(200, "Question cannot exceed 200 characters")
      .optional(),
    answer: z
      .string()
      .trim()
      .min(1, "Answer cannot be empty")
      .max(500, "Answer cannot exceed 500 characters")
      .optional(),
  })
  .refine((data) => data.question !== undefined || data.answer !== undefined, {
    message: "At least one field (question or answer) must be provided",
  });

export type UpdateFlashcardInput = z.infer<typeof UpdateFlashcardSchema>;

/**
 * Schema for listing flashcards query parameters
 *
 * Validation rules:
 * - page: optional, positive integer, defaults to 1
 * - limit: optional, positive integer between 1-200, defaults to 50
 * - source: optional, filter by flashcard source
 * - generation_id: optional, filter by generation ID
 * - sort: optional, field to sort by
 * - order: optional, sort order (asc/desc)
 */
export const ListFlashcardsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().min(1).max(200)),
  source: z.enum(["manual", "ai-full", "ai-edited"]).optional(),
  generation_id: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive().optional()),
  sort: z.enum(["created_at", "updated_at", "question"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type ListFlashcardsQueryInput = z.infer<typeof ListFlashcardsQuerySchema>;

/**
 * Schema for batch delete flashcards command
 *
 * Validation rules:
 * - flashcard_ids: array of positive integers, minimum 1, maximum 100
 */
export const BatchDeleteFlashcardsSchema = z.object({
  flashcard_ids: z
    .array(z.number().int().positive())
    .min(1, "At least one flashcard ID is required")
    .max(100, "Cannot delete more than 100 flashcards at once"),
});

export type BatchDeleteFlashcardsInput = z.infer<typeof BatchDeleteFlashcardsSchema>;

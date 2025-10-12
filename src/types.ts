/**
 * DTOs and Command Models for 10xdevs Flashcards API
 * 
 * Naming convention:
 * - *Command: Request body types (input)
 * - *Query: URL query parameters
 * - *DTO: Response data types (output)
 */

import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types"

// ============================================================================
// DATABASE ALIASES (internal use only)
// ============================================================================

type GenerationRow = Tables<"generations">
type FlashcardRow = Tables<"flashcards">
type FlashcardInsert = TablesInsert<"flashcards">
type FlashcardUpdate = TablesUpdate<"flashcards">
type ErrorLogRow = Tables<"generation_error_logs">

// ============================================================================
// SHARED TYPES
// ============================================================================

export type FlashcardSource = "manual" | "ai-full" | "ai-edited"
export type SortOrder = "asc" | "desc"

export type PaginationMeta = {
  page: number
  limit: number
  total: number
}

// ============================================================================
// AI SERVICE TYPES (internal use)
// ============================================================================

export type AIFlashcardProposal = {
  question: string
  answer: string
}

export type AIGenerationResponse = {
  flashcards: AIFlashcardProposal[]
  model: string
}

export type AIErrorCode = "AI_TIMEOUT" | "AI_INVALID_RESPONSE" | "AI_SERVICE_ERROR"

// ============================================================================
// POST /api/generations
// ============================================================================

export type CreateGenerationCommand = {
  source_text: string
}

export type CreateGenerationResultDTO = {
  generation: Pick<
    GenerationRow,
    | "id"
    | "user_id"
    | "model"
    | "source_text_length"
    | "source_text_hash"
    | "generated_count"
    | "generation_duration"
    | "created_at"
  > & {
    flashcardsProposals: Pick<
      FlashcardRow,
      "id" | "question" | "answer" | "source" | "generation_id" | "created_at"
    >[]
  }
}

// ============================================================================
// GET /api/generations/:id
// ============================================================================

export type GenerationDetailDTO = Pick<
  GenerationRow,
  | "id"
  | "user_id"
  | "model"
  | "source_text_length"
  | "source_text_hash"
  | "generated_count"
  | "accepted_unedited_count"
  | "accepted_edited_count"
  | "generation_duration"
  | "created_at"
  | "updated_at"
>

// ============================================================================
// GET /api/generations
// ============================================================================

export type ListGenerationsQuery = {
  page?: number
  limit?: number
  sort?: "created_at" | "generated_count"
  order?: SortOrder
}

export type GenerationListDTO = {
  data: Pick<
    GenerationRow,
    | "id"
    | "model"
    | "source_text_length"
    | "generated_count"
    | "accepted_unedited_count"
    | "accepted_edited_count"
    | "generation_duration"
    | "created_at"
  >[]
  pagination: PaginationMeta
}

// ============================================================================
// POST /api/flashcards
// ============================================================================

export type CreateFlashcardsCommand = {
  generation_id?: number | null
  flashcards: Pick<FlashcardInsert, "question" | "answer" | "source">[]
}

export type FlashcardDTO = Pick<
  FlashcardRow,
  | "id"
  | "generation_id"
  | "question"
  | "answer"
  | "source"
  | "created_at"
  | "updated_at"
>

export type CreateFlashcardsResultDTO = {
  created_count: number
  flashcards: FlashcardDTO[]
}

// ============================================================================
// GET /api/flashcards/:id → returns FlashcardDTO
// ============================================================================

// ============================================================================
// GET /api/flashcards
// ============================================================================

export type ListFlashcardsQuery = {
  page?: number
  limit?: number
  source?: FlashcardSource
  generation_id?: number | null
  sort?: "created_at" | "updated_at" | "question"
  order?: SortOrder
}

export type FlashcardListDTO = {
  data: FlashcardDTO[]
  pagination: PaginationMeta
}

// ============================================================================
// PATCH /api/flashcards/:id → returns FlashcardDTO
// ============================================================================

export type UpdateFlashcardCommand = Partial<
  Pick<FlashcardUpdate, "question" | "answer">
>

// ============================================================================
// DELETE /api/flashcards/:id → returns 204 No Content
// ============================================================================

// ============================================================================
// POST /api/flashcards/batch-delete
// ============================================================================

export type BatchDeleteFlashcardsCommand = {
  flashcard_ids: number[]
}

export type BatchDeleteFlashcardsResultDTO = {
  deleted_count: number
}

// ============================================================================
// GET /api/errors/generation
// ============================================================================

export type GenerationErrorLogsQuery = {
  page?: number
  limit?: number
  error_code?: string
  model?: string
  from_date?: string
  to_date?: string
  sort?: "created_at" | "source_text_length"
  order?: SortOrder
}

export type GenerationErrorLogListDTO = {
  data: Pick<
    ErrorLogRow,
    | "id"
    | "user_id"
    | "error_code"
    | "error_message"
    | "model"
    | "source_text_length"
    | "source_text_hash"
    | "created_at"
  >[]
  pagination: PaginationMeta
}


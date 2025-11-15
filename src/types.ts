/**
 * DTOs and Command Models for 10xdevs Flashcards API
 *
 * Naming convention:
 * - *Command: Request body types (input)
 * - *Query: URL query parameters
 * - *DTO: Response data types (output)
 */

import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// ============================================================================
// DATABASE ALIASES (internal use only)
// ============================================================================

type GenerationRow = Tables<"generations">;
type FlashcardRow = Tables<"flashcards">;
type FlashcardInsert = TablesInsert<"flashcards">;
type FlashcardUpdate = TablesUpdate<"flashcards">;
type ErrorLogRow = Tables<"generation_error_logs">;

// ============================================================================
// SHARED TYPES
// ============================================================================

export type FlashcardSource = "manual" | "ai-full" | "ai-edited";
export type SortOrder = "asc" | "desc";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

// ============================================================================
// AI SERVICE TYPES (internal use)
// ============================================================================

export interface AIFlashcardProposal {
  question: string;
  answer: string;
}

export interface AIGenerationResponse {
  flashcards: AIFlashcardProposal[];
  model: string;
}

export type AIErrorCode = "AI_TIMEOUT" | "AI_INVALID_RESPONSE" | "AI_SERVICE_ERROR";

// ============================================================================
// POST /api/generations
// ============================================================================

export interface CreateGenerationCommand {
  source_text: string;
}

export interface CreateGenerationResultDTO {
  // For authenticated users: full generation metadata with saved flashcards
  // For anonymous users: null (flashcards only returned in flashcardsProposals)
  generation:
    | (Pick<
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
        >[];
      })
    | null;
  // Flashcard proposals (always present, with or without IDs)
  flashcardsProposals: {
    id?: number; // Present only for authenticated users
    question: string;
    answer: string;
    source: FlashcardSource;
    generation_id?: number | null; // Present only for authenticated users
    created_at?: string; // Present only for authenticated users
  }[];
  // Indicates if the flashcards were saved to database
  saved: boolean;
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
  | "generation_duration"
  | "created_at"
  | "updated_at"
>;

// ============================================================================
// GET /api/generations
// ============================================================================

export interface ListGenerationsQuery {
  page?: number;
  limit?: number;
  sort?: "created_at" | "generated_count";
  order?: SortOrder;
}

export interface GenerationListDTO {
  data: Pick<
    GenerationRow,
    "id" | "model" | "source_text_length" | "generated_count" | "generation_duration" | "created_at"
  >[];
  pagination: PaginationMeta;
}

// ============================================================================
// POST /api/flashcards
// ============================================================================

export interface CreateFlashcardsCommand {
  generation_id?: number | null;
  flashcards: Pick<FlashcardInsert, "question" | "answer" | "source">[];
}

export type FlashcardDTO = Pick<
  FlashcardRow,
  "id" | "generation_id" | "question" | "answer" | "source" | "created_at" | "updated_at"
>;

export interface CreateFlashcardsResultDTO {
  created_count: number;
  flashcards: FlashcardDTO[];
}

// ============================================================================
// GET /api/flashcards/:id → returns FlashcardDTO
// ============================================================================

// ============================================================================
// GET /api/flashcards
// ============================================================================

export interface ListFlashcardsQuery {
  page?: number;
  limit?: number;
  source?: FlashcardSource;
  generation_id?: number | null;
  sort?: "created_at" | "updated_at" | "question";
  order?: SortOrder;
}

export interface FlashcardListDTO {
  data: FlashcardDTO[];
  pagination: PaginationMeta;
}

// ============================================================================
// PATCH /api/flashcards/:id → returns FlashcardDTO
// ============================================================================

export type UpdateFlashcardCommand = Partial<Pick<FlashcardUpdate, "question" | "answer">>;

// ============================================================================
// DELETE /api/flashcards/:id → returns 204 No Content
// ============================================================================

// ============================================================================
// POST /api/flashcards/batch-delete
// ============================================================================

export interface BatchDeleteFlashcardsCommand {
  flashcard_ids: number[];
}

export interface BatchDeleteFlashcardsResultDTO {
  deleted_count: number;
}

// ============================================================================
// GET /api/errors/generation
// ============================================================================

export interface GenerationErrorLogsQuery {
  page?: number;
  limit?: number;
  error_code?: string;
  model?: string;
  from_date?: string;
  to_date?: string;
  sort?: "created_at" | "source_text_length";
  order?: SortOrder;
}

export interface GenerationErrorLogListDTO {
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
  >[];
  pagination: PaginationMeta;
}

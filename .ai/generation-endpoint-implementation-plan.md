# API Endpoint Implementation Plan: POST /api/generations

Endpoint do generowania propozycji fiszek z tekstu źródłowego przy użyciu AI (OpenRouter.ai).

---

## ============================================================================

## PRZEGLĄD ENDPOINTU

## ============================================================================

### Cel

Inicjowanie procesu generowania propozycji fiszek przez AI na podstawie tekstu dostarczonego przez użytkownika.

### Zadania

1. Walidacja danych wejściowych (długość source_text: 1000-10000 znaków)
2. Wywołanie zewnętrznego serwisu AI generującego propozycje fiszek
3. Zapisanie metadanych generacji w bazie danych (tabela `generations`)
4. Zwrot wygenerowanych propozycji fiszek oraz liczby wygenerowanych pozycji

---

## ============================================================================

## REQUEST SPECIFICATION

## ============================================================================

### HTTP Method & URL

```
POST /api/generations
```

### Headers

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body

```typescript
{
  source_text: string; // 1000-10000 znaków
}
```

### Validation Schema (Zod)

```typescript
// src/lib/schemas/generation.schema.ts
import { z } from "zod";

export const createGenerationSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Tekst źródłowy musi zawierać co najmniej 1000 znaków")
    .max(10000, "Tekst źródłowy nie może przekraczać 10000 znaków")
    .trim(),
});
```

---

## ============================================================================

## RESPONSE SPECIFICATION

## ============================================================================

### Success Response (201 Created)

```typescript
{
  generation: {
    id: number;
    user_id: string;
    model: string;
    source_text_length: number;
    source_text_hash: string;
    generated_count: number;
    generation_duration: number; // seconds
    created_at: string;
    flashcardsProposals: [
      {
        id: number;
        question: string;
        answer: string;
        source: "ai-full";
        generation_id: number;
        created_at: string;
      }
    ];
  }
}
```

### Error Responses

| Status | Error                 | Opis                                                     |
| ------ | --------------------- | -------------------------------------------------------- |
| 400    | Validation failed     | Nieprawidłowa długość source_text (1000-10000 znaków)    |
| 401    | Unauthorized          | Brak lub nieprawidłowy token autoryzacji (Supabase Auth) |
| 422    | AI processing error   | AI zwróciło nieprawidłową odpowiedź                      |
| 500    | Internal server error | Błąd bazy danych, serwisu AI lub serwera                 |
| 503    | Service unavailable   | AI service jest niedostępny (timeout)                    |

---

## ============================================================================

## TYPES

## ============================================================================

### Command (Input)

```typescript
// src/types.ts
export type CreateGenerationCommand = {
  source_text: string;
};
```

### Response DTO (Output)

```typescript
// src/types.ts
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
    flashcardsProposals: Pick<FlashcardRow, "id" | "question" | "answer" | "source" | "generation_id" | "created_at">[];
  };
};
```

### Internal Types (AI Service)

```typescript
// src/lib/services/ai.service.ts
interface AIFlashcardProposal {
  question: string;
  answer: string;
}

interface AIGenerationResponse {
  flashcards: AIFlashcardProposal[];
  model: string;
}
```

---

## ============================================================================

## DATA FLOW

## ============================================================================

### High-Level Flow

```
1. Client → POST /api/generations {source_text}
2. Middleware → Supabase Auth (JWT token verification)
3. Endpoint → Zod validation (1000-10000 chars)
4. Generation Service:
   - Obliczenie: source_text_length, source_text_hash (SHA-256)
   - Start timer dla generation_duration
   - Wywołanie AI Service
5. AI Service → OpenRouter.ai API (timeout: 60s)
6. Generation Service → Database transaction:
   - INSERT INTO generations (metadata)
   - INSERT INTO flashcards (proposals, source: 'ai-full')
7. Response → 201 Created z CreateGenerationResultDTO
```

## ============================================================================

## ERROR HANDLING

## ============================================================================

### Error Categories

| Error Type          | Status | Logowanie             | Akcja                                     |
| ------------------- | ------ | --------------------- | ----------------------------------------- |
| Invalid input       | 400    | -                     | Zwróć Zod validation errors               |
| No/invalid token    | 401    | -                     | Zwróć "Unauthorized"                      |
| AI invalid response | 422    | generation_error_logs | Zwróć "AI processing error"               |
| Database error      | 500    | console.error         | Zwróć generic error (bez szczegółów)      |
| AI timeout/unavail  | 503    | generation_error_logs | Zwróć "Service unavailable" + Retry-After |

### Error Logging (generation_error_logs)

```typescript
interface GenerationErrorLog {
  user_id: string;
  error_code: "AI_TIMEOUT" | "AI_INVALID_RESPONSE" | "AI_SERVICE_ERROR";
  error_message: string;
  model: string;
  source_text_length: number;
  source_text_hash: string;
  created_at: timestamp;
}
```

**Zasady logowania:**

- Błędy AI → zapisz do `generation_error_logs`
- Błędy systemowe → console.error (nie do tabeli)
- NIE loguj pełnego `source_text` (tylko hash i length)

## ============================================================================

## DEVELOPMENT NOTE

## ============================================================================

**Na etapie developmentu:** Zamiast wywoływania OpenRouter.ai, użyj **mocka** w AI Service:

```typescript
export async function generateFlashcards(sourceText: string): Promise<AIGenerationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay

  return {
    model: "gpt-4o-mini",
    flashcards: [
      { question: "Mock Question 1?", answer: "Mock Answer 1" },
      { question: "Mock Question 2?", answer: "Mock Answer 2" },
      { question: "Mock Question 3?", answer: "Mock Answer 3" },
    ],
  };
}
```

---

## ============================================================================

## SUMMARY

## ============================================================================

**Architecture:** Endpoint → Generation Service → AI Service (Mock/Real) + Database

**Key Features:**

- Supabase Auth (JWT Bearer token)
- Zod validation (1000-10000 znaków)
- AI integration z timeout 60s
- Comprehensive error handling + logging
- Batch database operations

**Production Ready:**

- Security: JWT auth, input validation, data protection
- Reliability: Timeout handling, error logging, transaction safety
- Performance: Batch inserts, indexed queries, <20s p95 response time
- Observability: Error logging (generation_error_logs), metrics, monitoring

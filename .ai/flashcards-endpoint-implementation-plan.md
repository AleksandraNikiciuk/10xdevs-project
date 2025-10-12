# API Endpoint Implementation Plan: Create Flashcards

## 1. Przegląd punktu końcowego

Endpoint `POST /api/flashcards` umożliwia tworzenie jednej lub wielu fiszek (flashcards) w systemie. Obsługuje dwa główne scenariusze:

1. **Tworzenie ręcznych fiszek** - użytkownik tworzy fiszki od zera bez powiązania z generacją AI
2. **Akceptacja fiszek wygenerowanych przez AI** - użytkownik akceptuje propozycje z generacji AI (z lub bez edycji)

Jest to kluczowy element przepływu pracy aplikacji, łączący proces generacji AI z finalną kolekcją fiszek użytkownika.

## 2. Szczegóły żądania

### Metoda HTTP

`POST`

### Struktura URL

`/api/flashcards`

### Nagłówki

- `Authorization: Bearer {access_token}` (dla przyszłej implementacji auth)
- `Content-Type: application/json`

### Parametry

#### Request Body (wymagany)

**Struktura dla ręcznych fiszek:**

```json
{
  "flashcards": [
    {
      "question": "Pytanie na fiszce",
      "answer": "Odpowiedź na fiszce",
      "source": "manual"
    }
  ]
}
```

**Struktura dla fiszek AI (zaakceptowanych bez edycji):**

```json
{
  "generation_id": 123,
  "flashcards": [
    {
      "question": "Pytanie wygenerowane przez AI",
      "answer": "Odpowiedź wygenerowana przez AI",
      "source": "ai-full"
    }
  ]
}
```

**Struktura dla fiszek AI (zaakceptowanych z edycją):**

```json
{
  "generation_id": 123,
  "flashcards": [
    {
      "question": "Pytanie wygenerowane przez AI (edytowane)",
      "answer": "Odpowiedź wygenerowana przez AI (edytowana)",
      "source": "ai-edited"
    }
  ]
}
```

#### Parametry wymagane:

- `flashcards` (array): Tablica obiektów fiszek, minimum 1 element
  - `question` (string): Pytanie na fiszce (1-200 znaków, po trim)
  - `answer` (string): Odpowiedź na fiszce (1-500 znaków, po trim)
  - `source` (enum): Źródło fiszki - "manual", "ai-full", "ai-edited"

#### Parametry opcjonalne:

- `generation_id` (number | null):
  - **Wymagany** gdy `source` = "ai-full" lub "ai-edited"
  - **Musi być null/undefined** gdy `source` = "manual"
  - Referencja do sesji generacji AI

### Walidacja Request Body

**Reguły walidacji:**

1. `flashcards` musi być niepustą tablicą (min. 1, max. 100 elementów)
2. Każda fiszka musi zawierać wszystkie wymagane pola
3. `question`: niepusty string po trim, max 200 znaków
4. `answer`: niepusty string po trim, max 500 znaków
5. `source` musi być jedną z wartości: "manual", "ai-full", "ai-edited"
6. `generation_id`:
   - Dla source = "manual": musi być null/undefined
   - Dla source = "ai-full" lub "ai-edited": musi być liczbą > 0

**Walidacja biznesowa:**

1. Jeśli `generation_id` jest podany, musi istnieć w bazie danych
2. Jeśli `generation_id` jest podany, musi należeć do aktualnego użytkownika
3. Wszystkie fiszki w jednym żądaniu muszą mieć spójne źródło (nie mieszamy manual z AI w jednym batch)

## 3. Wykorzystywane typy

### Typy z `src/types.ts`:

**Input (Command):**

```typescript
export type CreateFlashcardsCommand = {
  generation_id?: number | null;
  flashcards: Pick<FlashcardInsert, "question" | "answer" | "source">[];
};
```

**Output (DTO):**

```typescript
export type FlashcardDTO = Pick<
  FlashcardRow,
  "id" | "generation_id" | "question" | "answer" | "source" | "created_at" | "updated_at"
>;

export type CreateFlashcardsResultDTO = {
  created_count: number;
  flashcards: FlashcardDTO[];
};
```

**Shared:**

```typescript
export type FlashcardSource = "manual" | "ai-full" | "ai-edited";
```

### Typy z `src/db/database.types.ts`:

```typescript
type FlashcardInsert = TablesInsert<"flashcards">;
type FlashcardRow = Tables<"flashcards">;
```

### Typy serwisu (do utworzenia):

```typescript
export interface FlashcardServiceError extends Error {
  code: "VALIDATION_ERROR" | "DATABASE_ERROR" | "NOT_FOUND" | "FORBIDDEN";
  statusCode: number;
  details?: unknown;
}

interface CreateFlashcardsParams {
  command: CreateFlashcardsCommand;
  userId: string;
  supabase: SupabaseClient;
}
```

## 4. Szczegóły odpowiedzi

### Sukces (201 Created)

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "created_count": 2,
  "flashcards": [
    {
      "id": 42,
      "generation_id": 123,
      "question": "What is TypeScript?",
      "answer": "A typed superset of JavaScript",
      "source": "ai-full",
      "created_at": "2025-10-12T10:00:00Z",
      "updated_at": "2025-10-12T10:00:00Z"
    },
    {
      "id": 43,
      "generation_id": 123,
      "question": "What is React?",
      "answer": "A JavaScript library for building UIs",
      "source": "ai-edited",
      "created_at": "2025-10-12T10:00:00Z",
      "updated_at": "2025-10-12T10:00:00Z"
    }
  ]
}
```

### Błędy

#### 400 Bad Request

**Scenariusze:**

- Pusta tablica `flashcards`
- Brak wymaganego pola (`question`, `answer`, `source`)
- `question` jest pusty lub > 200 znaków
- `answer` jest pusty lub > 500 znaków
- `source` ma nieprawidłową wartość
- `generation_id` brakuje dla source = "ai-full" lub "ai-edited"
- `generation_id` jest obecny dla source = "manual"
- Tablica `flashcards` ma więcej niż 100 elementów

**Przykład odpowiedzi:**

```json
{
  "error": "Validation failed",
  "details": {
    "flashcards[0].question": "Question must be between 1 and 255 characters",
    "flashcards[1].answer": "Answer cannot be empty"
  }
}
```

#### 401 Unauthorized

**Scenariusz:** Brak tokenu autoryzacji lub token wygasły (przyszła implementacja)

**Przykład odpowiedzi:**

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden

**Scenariusz:** `generation_id` istnieje, ale należy do innego użytkownika

**Przykład odpowiedzi:**

```json
{
  "error": "Forbidden",
  "message": "Generation does not belong to the current user"
}
```

#### 404 Not Found

**Scenariusz:** Podany `generation_id` nie istnieje w bazie danych

**Przykład odpowiedzi:**

```json
{
  "error": "Not Found",
  "message": "Generation with ID 123 not found"
}
```

#### 500 Internal Server Error

**Scenariusze:**

- Błąd podczas zapisu do bazy danych
- Nieoczekiwany błąd aplikacji

**Przykład odpowiedzi:**

```json
{
  "error": "Internal Server Error",
  "message": "Failed to create flashcards"
}
```

## 5. Przepływ danych

### Diagram przepływu

```
1. REQUEST → API Endpoint (/api/flashcards)
   ↓
2. Middleware (future: auth check)
   ↓
3. Zod Schema Validation
   ↓
4. FlashcardService.createFlashcards()
   ↓
   4a. Walidacja biznesowa:
       - Sprawdzenie spójności generation_id z source
       - Jeśli generation_id: weryfikacja istnienia i ownership
   ↓
   4b. Przygotowanie danych do wstawienia:
       - Mapowanie command → database inserts
       - Dodanie user_id do każdej fiszki
   ↓
   4c. INSERT do tabeli flashcards (batch)
   ↓
   4d. Pobranie utworzonych fiszek (z ID)
   ↓
   4e. Mapowanie do DTO
   ↓
5. Response (201 Created) → CLIENT
```

### Szczegóły interakcji z bazą danych

#### 1. Walidacja generation_id (jeśli dotyczy)

```sql
SELECT id, user_id
FROM generations
WHERE id = :generation_id
```

**Sprawdzenie:**

- Czy rekord istnieje (404 jeśli nie)
- Czy user_id = current_user_id (403 jeśli nie)

#### 2. Wstawienie fiszek (batch insert)

```sql
INSERT INTO flashcards (user_id, generation_id, question, answer, source)
VALUES
  (:user_id, :generation_id, :question1, :answer1, :source1),
  (:user_id, :generation_id, :question2, :answer2, :source2),
  ...
RETURNING id, generation_id, question, answer, source, created_at, updated_at
```

## 6. Względy bezpieczeństwa

### Uwierzytelnianie (Authentication)

**MVP (obecna implementacja):**

- Wszystkie operacje używają `DEFAULT_USER_ID` z `src/db/supabase.client.ts`
- Brak sprawdzania tokenu autoryzacji
- Endpoint publicznie dostępny

**Przyszła implementacja:**

- Weryfikacja JWT tokenu w middleware Astro
- Wyciągnięcie `user_id` z `context.locals.user`
- Użycie `supabase` z `context.locals.supabase` (z tokenem użytkownika)

### Autoryzacja (Authorization)

**Zasady dostępu:**

1. Użytkownik może tworzyć fiszki tylko dla siebie
2. Użytkownik może używać tylko własnych `generation_id`
3. Row-Level Security (RLS) w bazie danych zapewnia dodatkową warstwę ochrony

**Implementacja:**

- **Application-level**: Sprawdzenie ownership generation
- **Database-level**: RLS policy na tabeli `flashcards` (user_id = auth.uid())

### Walidacja danych wejściowych

## 7. Obsługa błędów

### Kategorie błędów

#### 1. Błędy walidacji (400)

**Typ:** `VALIDATION_ERROR`

**Scenariusze:**

- Brak wymaganych pól
- Nieprawidłowy format danych
- Przekroczenie limitów długości
- Nieprawidłowa wartość enum
- Niespójność generation_id z source

**Obsługa:**

```typescript
try {
  const validated = CreateFlashcardsSchema.parse(body);
} catch (error) {
  if (error instanceof ZodError) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: error.flatten(),
      }),
      { status: 400 }
    );
  }
}
```

**Logowanie:** Console.warn z detalami walidacji

#### 2. Błędy autoryzacji (401, 403)

**Typ:** `FORBIDDEN`

**Scenariusze:**

- generation_id należy do innego użytkownika (403)
- Brak tokenu autoryzacji (401, przyszłość)

**Obsługa:**

```typescript
if (generation.user_id !== userId) {
  throw createFlashcardServiceError("FORBIDDEN", "Generation does not belong to the current user", 403);
}
```

**Logowanie:** Console.warn z user_id i generation_id

#### 3. Błędy zasobów (404)

**Typ:** `NOT_FOUND`

**Scenariusze:**

- generation_id nie istnieje w bazie

**Obsługa:**

```typescript
if (!generation) {
  throw createFlashcardServiceError("NOT_FOUND", `Generation with ID ${generationId} not found`, 404);
}
```

**Logowanie:** Console.info z generation_id

#### 4. Błędy bazy danych (500)

**Typ:** `DATABASE_ERROR`

**Scenariusze:**

- Błąd podczas INSERT flashcards
- Timeout połączenia
- Naruszenie constraints

**Obsługa:**

```typescript
const { data, error } = await supabase.from("flashcards").insert(flashcardsToInsert).select();

if (error) {
  console.error("Database error (flashcards):", error);
  throw createFlashcardServiceError("DATABASE_ERROR", "Failed to create flashcards", 500, error);
}
```

**Logowanie:** Console.error z pełnymi detalami błędu

#### 5. Nieoczekiwane błędy (500)

**Typ:** Nieznany

**Scenariusze:**

- Błędy runtime
- Wyjątki JavaScript
- Błędy sieci

**Obsługa:**

```typescript
} catch (error) {
  // Re-throw known errors
  if ((error as FlashcardServiceError).code) {
    throw error;
  }

  // Wrap unknown errors
  console.error("Unexpected error:", error);
  throw createFlashcardServiceError(
    "DATABASE_ERROR",
    "An unexpected error occurred",
    500,
    error
  );
}
```

**Logowanie:** Console.error z pełnym stack trace

### Strategia logowania

**Poziomy logów:**

- `console.error`: Błędy 500, nieoczekiwane wyjątki
- `console.warn`: Błędy 400, 403 (problemy użytkownika)
- `console.info`: Błędy 404, operacje biznesowe
- `console.debug`: Szczegółowe informacje (dev only)

**Format logów:**

```typescript
console.error("[FlashcardService] Failed to create flashcards", {
  userId,
  flashcardCount: flashcards.length,
  generationId: generation_id,
  error: error.message,
});
```

### Error Response Format

Wszystkie błędy zwracane w jednolitym formacie:

```typescript
{
  error: string;        // Krótki opis błędu
  message: string;      // Szczegółowy komunikat dla użytkownika
  details?: unknown;    // Dodatkowe informacje (tylko dev/debug)
}
```

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła

#### 1. Batch Insert dużej liczby fiszek

**Problem:**

- Wstawianie 100 fiszek w jednym zapytaniu może być wolne
- Zwiększone ryzyko timeout dla dużych batchów

**Optymalizacja:**

- Supabase batch insert jest zoptymalizowany
- Limit 100 fiszek jest rozsądny
- Future: rozważyć chunking dla większych batchów (np. po 50)

#### 2. Pobranie utworzonych fiszek z SELECT

**Problem:**

- Supabase wymaga dodatkowego SELECT po INSERT dla pełnych danych

**Optymalizacja:**

- Używać `.select()` od razu w chainzie INSERT
- Zwracać tylko potrzebne kolumny (już robione w DTO)

### Strategie optymalizacji

#### 1. Database Indexes

**Istniejące (z db-plan.md):**

- `PRIMARY KEY` na `flashcards.id`
- `idx_flashcards_on_user_id` na `flashcards(user_id)`
- `idx_flashcards_on_generation_id` na `flashcards(generation_id)`

**Wystarczające dla tego endpointu** - brak potrzeby dodatkowych indexów.

#### 2. Query Optimization

**Best practices:**

- Używać `.select()` z konkretnymi kolumnami (unikać `SELECT *`)
- Batch insert zamiast pojedynczych INSERT

#### 3. Connection Pooling

Supabase automatycznie zarządza connection pooling - brak dodatkowej konfiguracji.

#### 4. Caching

**Nie dotyczy tego endpointu** - POST endpoint nie korzysta z cache.

### Monitoring wydajności

**Metryki do śledzenia:**

- Średni czas odpowiedzi endpointu
- Średnia liczba fiszek w żądaniu
- Częstotliwość błędów 500
- Czas wykonania INSERT flashcards

**Alerty:**

- Response time > 2 sekundy
- Error rate > 5%
- Database timeout errors

## 9. Etapy wdrożenia

### Krok 1: Utworzenie schematu walidacji Zod

**Plik:** `src/lib/schemas/flashcard.schema.ts`

**Zadania:**

- [ ] Utworzyć plik `flashcard.schema.ts`
- [ ] Zdefiniować `FlashcardItemSchema` dla pojedynczej fiszki
  - question: string().trim().min(1).max(255)
  - answer: string().trim().min(1).max(1000)
  - source: enum(["manual", "ai-full", "ai-edited"])
- [ ] Zdefiniować `CreateFlashcardsSchema` dla całego requestu
  - flashcards: array(FlashcardItemSchema).min(1).max(100)
  - generation_id: number().int().positive().optional().nullable()
- [ ] Dodać custom validation dla spójności generation_id z source
- [ ] Wyeksportować oba schematy

**Przykład:**

```typescript
import { z } from "zod";

const FlashcardItemSchema = z.object({
  question: z.string().trim().min(1).max(255),
  answer: z.string().trim().min(1).max(1000),
  source: z.enum(["manual", "ai-full", "ai-edited"]),
});

export const CreateFlashcardsSchema = z
  .object({
    flashcards: z.array(FlashcardItemSchema).min(1).max(100),
    generation_id: z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => {
      const hasAISource = data.flashcards.some((f) => f.source === "ai-full" || f.source === "ai-edited");
      const hasGenerationId = data.generation_id != null;

      // AI source requires generation_id
      if (hasAISource && !hasGenerationId) return false;
      // Manual source forbids generation_id
      if (!hasAISource && hasGenerationId) return false;

      return true;
    },
    {
      message: "generation_id is required for AI sources and forbidden for manual source",
    }
  );
```

### Krok 2: Utworzenie serwisu fiszek

**Plik:** `src/lib/services/flashcard.service.ts`

**Zadania:**

- [ ] Utworzyć plik `flashcard.service.ts`
- [ ] Zdefiniować typy serwisu:
  - `FlashcardServiceError` interface
  - `CreateFlashcardsParams` interface
- [ ] Utworzyć `createFlashcardServiceError` error factory
- [ ] Implementować funkcję `validateGenerationOwnership()`
  - Sprawdza czy generation istnieje
  - Sprawdza czy należy do użytkownika
  - Zwraca generation_id lub rzuca błąd
- [ ] Implementować główną funkcję `createFlashcards()`
  - Walidacja biznesowa (generation ownership)
  - Przygotowanie danych do INSERT
  - Batch insert fiszek
  - Mapowanie do DTO
  - Obsługa błędów

**Struktura:**

```typescript
export async function createFlashcards(params: CreateFlashcardsParams): Promise<CreateFlashcardsResultDTO> {
  // 1. Walidacja generation ownership (jeśli dotyczy)
  // 2. Przygotowanie danych
  // 3. INSERT flashcards
  // 4. Return DTO
}
```

### Krok 3: Utworzenie endpointu API

**Plik:** `src/pages/api/flashcards.ts`

**Zadania:**

- [ ] Utworzyć plik `flashcards.ts`
- [ ] Dodać `export const prerender = false`
- [ ] Implementować handler `POST`
  - Pobrać Supabase client z `context.locals`
  - Pobrać user_id (MVP: DEFAULT_USER_ID)
  - Parse request body jako JSON
  - Walidacja Zod schema
  - Wywołanie `createFlashcards()` z serwisu
  - Zwrócenie odpowiedzi 201 z DTO
- [ ] Implementować obsługę błędów
  - ZodError → 400
  - FlashcardServiceError → odpowiedni kod statusu
  - Unknown errors → 500
- [ ] Dodać logowanie requestów

**Struktura:**

```typescript
export const prerender = false;

export async function POST(context: APIContext) {
  try {
    // 1. Get dependencies
    const supabase = context.locals.supabase;
    const userId = DEFAULT_USER_ID; // MVP

    // 2. Parse and validate
    const body = await context.request.json();
    const validated = CreateFlashcardsSchema.parse(body);

    // 3. Call service
    const result = await createFlashcards({
      command: validated,
      userId,
      supabase,
    });

    // 4. Return response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Error handling
  }
}
```

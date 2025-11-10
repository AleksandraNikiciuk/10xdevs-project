# Changelog: Integracja OpenRouter z Generation Service

## Data: 2025-10-29

## Opis Zmiany

Zintegrowano `OpenRouterService` bezpośrednio z `generation.service.ts`, eliminując warstwę pośrednią `ai.service.ts` oraz mockowe dane. Generowanie fiszek odbywa się teraz bezpośrednio poprzez OpenRouter API z modelem `gpt-4o-mini`.

---

## Zmodyfikowane Pliki

### 1. `/src/lib/services/generation.service.ts`

**Status:** ✅ Zaktualizowany

**Główne zmiany:**

#### Dodane importy:

```typescript
import { z } from "zod";
import {
  OpenRouterService,
  ConfigurationError,
  OpenRouterApiError,
  NetworkError,
  InvalidResponseJsonError,
  SchemaValidationError,
} from "./openrouter.service";
```

#### Usunięte importy:

```typescript
import { generateFlashcards, type AIServiceError } from "./ai.service";
```

#### Dodane: Konfiguracja modelu AI

```typescript
const AI_MODEL = "gpt-4o-mini";
```

#### Dodane: Schematy Zod

```typescript
const FlashcardProposalSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
});

const FlashcardsResponseSchema = z.object({
  flashcards: z
    .array(FlashcardProposalSchema)
    .min(1, "At least one flashcard is required")
    .max(20, "Maximum 20 flashcards allowed"),
});
```

#### Dodana: Funkcja `generateFlashcardsWithAI()`

Nowa funkcja pomocnicza, która:

- Inicjalizuje `OpenRouterService`
- Tworzy profesjonalne prompty systemowe dla generowania fiszek
- Wywołuje API OpenRouter z pełną walidacją schematem Zod
- Zwraca typowany wynik z flashcardami

**Parametry:**

- `temperature: 0.7` - balans między kreatywnością a spójnością
- `max_tokens: 3000` - wystarczająco dużo dla 15 fiszek

#### Zaktualizowana: Funkcja `createGeneration()`

**Przed:**

```typescript
try {
  aiResponse = await generateFlashcards(sourceText);
} catch (error) {
  const aiError = error as AIServiceError;
  // ... obsługa błędów
}
```

**Po:**

```typescript
try {
  aiResponse = await generateFlashcardsWithAI(sourceText);
} catch (error) {
  // Mapowanie błędów OpenRouter na GenerationServiceError
  if (error instanceof ConfigurationError) { ... }
  else if (error instanceof OpenRouterApiError) { ... }
  else if (error instanceof NetworkError) { ... }
  else if (error instanceof InvalidResponseJsonError) { ... }
  else if (error instanceof SchemaValidationError) { ... }

  // Log do generation_error_logs
  await supabase.from("generation_error_logs").insert({ ... });

  throw createGenerationServiceError("AI_ERROR", errorMessage, statusCode, { code: errorCode });
}
```

**Nowe kody błędów zapisywane do bazy:**

- `AI_CONFIGURATION_ERROR` - brak klucza API
- `AI_API_ERROR` - błąd API OpenRouter
- `AI_TIMEOUT` - timeout połączenia
- `AI_INVALID_RESPONSE` - niepoprawny format lub walidacja

---

## Architektura Po Zmianach

### Przed (z ai.service.ts):

```
API Route (generations.ts)
    ↓
Generation Service
    ↓
AI Service (z mockami/OpenRouter)
    ↓ (production)
OpenRouter Service
    ↓
OpenRouter API
```

### Po (bezpośrednia integracja):

```
API Route (generations.ts)
    ↓
Generation Service
    ↓
OpenRouter Service
    ↓
OpenRouter API (gpt-4o-mini)
```

---

## Korzyści Ze Zmian

### 1. **Uproszczona Architektura**

- Eliminacja niepotrzebnej warstwy pośredniej
- Mniej kodu do utrzymania
- Łatwiejsze debugowanie

### 2. **Bezpośrednia Kontrola**

- Pełna kontrola nad promptami w kontekście generowania
- Bezpośrednie mapowanie błędów na kody specyficzne dla generacji
- Lepsza obsługa błędów w kontekście biznesowym

### 3. **Typowanie i Walidacja**

- Pełne typowanie end-to-end
- Walidacja Zod na poziomie serwisu generacji
- Jasne schematy dla odpowiedzi AI

### 4. **Brak Mocków**

- Zawsze używa prawdziwego AI (gpt-4o-mini)
- Konsystentne zachowanie w dev/prod
- Prawdziwe testy integracji już w developmencie

---

## Parametry Generowania Fiszek

### Model

- **gpt-4o-mini** - szybki, ekonomiczny model OpenAI
- Dobry balans między jakością a kosztami

### Temperatura: 0.7

- Balans między kreatywnością a spójnością
- Wystarczająco kreatywny dla różnorodnych pytań
- Wystarczająco deterministyczny dla faktów

### Max Tokens: 3000

- Wystarczająco dużo dla 15 fiszek
- Każda fiszka ~150-200 tokenów (pytanie + odpowiedź)
- Margines bezpieczeństwa dla dłuższych odpowiedzi

### Zakres Fiszek

- Minimum: 3 fiszki (dla krótkich tekstów)
- Maksimum: 15 fiszek (dla długich tekstów)
- Limit schematu: 20 fiszek (bezpieczeństwo)

---

## Prompty Systemowe

### System Prompt

```
You are an expert educational content creator specializing in flashcard generation.

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
- Don't create duplicate or overly similar questions
```

### User Prompt

```
Create flashcards from the following text:

{sourceText}
```

---

## Obsługa Błędów

### Typy Błędów OpenRouter → Kody Błędów Generacji

| Błąd OpenRouter            | Kod Błędu                | Status HTTP | Opis                     |
| -------------------------- | ------------------------ | ----------- | ------------------------ |
| `ConfigurationError`       | `AI_CONFIGURATION_ERROR` | 500         | Brak klucza API          |
| `OpenRouterApiError`       | `AI_API_ERROR`           | varies      | Błąd API (401, 429, 5xx) |
| `NetworkError`             | `AI_TIMEOUT`             | 504         | Timeout połączenia       |
| `InvalidResponseJsonError` | `AI_INVALID_RESPONSE`    | 422         | Nieparsowalne JSON       |
| `SchemaValidationError`    | `AI_INVALID_RESPONSE`    | 422         | Niezgodność ze schematem |

### Logowanie Błędów

Wszystkie błędy AI są automatycznie zapisywane do tabeli `generation_error_logs`:

```typescript
await supabase.from("generation_error_logs").insert({
  user_id: userId,
  error_code: errorCode, // np. "AI_TIMEOUT"
  error_message: errorMessage, // Szczegóły błędu
  model: AI_MODEL, // "gpt-4o-mini"
  source_text_length: sourceTextLength,
  source_text_hash: sourceTextHash,
});
```

---

## Testy i Weryfikacja

### Test Endpoint

Endpoint testowy jest nadal dostępny: `GET /api/test-openrouter`

### Główny Endpoint Generacji

`POST /api/generations`

```json
{
  "source_text": "Your educational text here..."
}
```

**Oczekiwana odpowiedź:**

```json
{
  "generation": {
    "id": 123,
    "model": "gpt-4o-mini",
    "generated_count": 5,
    "flashcardsProposals": [
      {
        "id": 1,
        "question": "What is...",
        "answer": "It is...",
        "source": "ai-full"
      }
      // ... more flashcards
    ]
  }
}
```

---

## Status ai.service.ts

### Obecny Status

- ✅ Plik pozostaje w projekcie (na razie)
- ⚠️ **Nie jest już używany** przez generation.service.ts
- 📝 Może zostać użyty w przyszłości dla innych celów
- 🗑️ Może zostać usunięty w kolejnych refaktoryzacjach

### Opcje na Przyszłość

1. **Zachować** - jako backup lub dla innych usług AI
2. **Oznaczyć jako @deprecated** - jeśli będzie używany gdzie indziej
3. **Usunąć** - jeśli nie ma innych zastosowań

---

## Wymagania Środowiska

### .env

```bash
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### Zmienne Muszą Być Ustawione

- Konstruktor `OpenRouterService` rzuci `ConfigurationError` jeśli brak klucza
- Fail-fast approach - błąd na starcie, nie w runtime

---

## Migracja

### Dla Istniejących Wdrożeń

1. **Upewnij się, że `.env` zawiera `OPENROUTER_API_KEY`**
2. **Zrestartuj aplikację** - nowa konfiguracja zostanie załadowana
3. **Przetestuj endpoint:** `POST /api/generations`
4. **Sprawdź logi** - błędy będą w `generation_error_logs`

### Dla Nowych Wdrożeń

1. Skopiuj `.env.example` do `.env`
2. Dodaj klucz API OpenRouter
3. Uruchom `npm run dev`
4. Gotowe!

---

## Podsumowanie

### Zmiany

- ✅ Bezpośrednia integracja OpenRouter z generation.service.ts
- ✅ Eliminacja warstwy ai.service.ts
- ✅ Brak mocków - zawsze prawdziwe AI
- ✅ Model: gpt-4o-mini
- ✅ Pełna walidacja Zod
- ✅ Kompleksowa obsługa błędów
- ✅ Profesjonalne prompty systemowe

### Rezultat

- 🎯 Prostsza architektura
- 🔒 Lepsza kontrola i bezpieczeństwo typów
- 🚀 Prawdziwe AI już w developmencie
- 📊 Lepsze logowanie i monitoring błędów

---

_Wygenerowano: 2025-10-29_
_Autor: AI Assistant_

# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis Usługi

`OpenRouterService` będzie stanowić dedykowany, reużywalny klient do interakcji z API OpenRouter. Jego głównym zadaniem jest uproszczenie procesu wysyłania zapytań do modeli językowych (LLM) i otrzymywania ustrukturyzowanych, w pełni typowanych odpowiedzi w formacie JSON. Usługa będzie hermetyzować logikę autentykacji, konstruowania zapytań, obsługi odpowiedzi oraz zarządzania błędami, dostarczając czysty i bezpieczny interfejs dla reszty aplikacji.

Kluczową funkcjonalnością będzie możliwość przekazania schematu `Zod` jako definicji oczekiwanej struktury odpowiedzi, co w połączeniu z generykami TypeScript zapewni pełne bezpieczeństwo typów na wyjściu.

## 2. Opis Konstruktora

Konstruktor klasy `OpenRouterService` będzie odpowiedzialny za inicjalizację usługi i walidację konfiguracji.

```typescript
// Przykładowe użycie
const openRouterService = new OpenRouterService();
```

- **Logika**:
  1.  Odczytuje klucz API z zmiennej środowiskowej `OPENROUTER_API_KEY`.
  2.  Sprawdza, czy klucz API został poprawnie załadowany.
  3.  **Fail-fast**: Jeśli zmienna `OPENROUTER_API_KEY` nie jest ustawiona, konstruktor natychmiast rzuci błąd `ConfigurationError`, uniemożliwiając działanie aplikacji w niepoprawnym stanie i ułatwiając diagnozę problemów konfiguracyjnych.

## 3. Publiczne Metody i Pola

### `public async structuredChatCompletion<T extends z.ZodTypeAny>(params: StructuredChatCompletionParams<T>): Promise<z.infer<T>>`

Jest to główna i jedyna publiczna metoda usługi. Przyjmuje obiekt konfiguracyjny i zwraca Promise, który rozwiązuje się do obiektu zgodnego z przekazanym schematem Zod.

- **Parametry (`StructuredChatCompletionParams<T>`)**:
  - `schema: T`: Schemat `Zod` definiujący oczekiwaną strukturę odpowiedzi JSON.
  - `messages: { role: 'system' | 'user' | 'assistant'; content: string }[]`: Tablica wiadomości stanowiąca kontekst rozmowy.
  - `model: string`: Nazwa modelu do użycia (np. `'anthropic/claude-3.5-sonnet'`).
  - `params?: Record<string, unknown>`: Opcjonalny obiekt z dodatkowymi parametrami modelu (np. `temperature`, `max_tokens`).

- **Zwraca**:
  - `Promise<z.infer<T>>`: Obiekt, którego typ jest automatycznie inferowany ze schematu `Zod`, co zapewnia pełne bezpieczeństwo typów.

- **Rzuca**:
  - `ConfigurationError`: Jeśli brakuje klucza API.
  - `OpenRouterApiError`: W przypadku błędów zwróconych przez API OpenRouter (np. 401, 429).
  - `NetworkError`: W przypadku problemów z połączeniem sieciowym.
  - `InvalidResponseJsonError`: Jeśli odpowiedź modelu w formacie JSON jest nieparsowalna.
  - `SchemaValidationError`: Jeśli JSON od modelu jest poprawny, ale niezgodny z przekazanym schematem `Zod`.

## 4. Prywatne Metody i Pola

- `private readonly apiKey: string`: Przechowuje klucz API odczytany z `process.env`.
- `private readonly baseUrl: string`: Przechowuje stały adres URL API OpenRouter.
- `private _buildRequestPayload(...)`: Tworzy obiekt żądania do API, konwertując schemat `Zod` na JSON Schema i osadzając go w strukturze `tools` API.
- `private async _makeApiCall(...)`: Wysyła żądanie `fetch` z odpowiednimi nagłówkami (`Authorization`, `Content-Type` etc.) i obsługuje podstawowe błędy sieciowe.
- `private _parseAndValidateResponse(...)`: Przetwarza odpowiedź z API, parsuje argumenty funkcji zwrócone przez model i waliduje je względem schematu `Zod`, używając `schema.safeParse()`.

## 5. Obsługa Błędów

Usługa będzie implementować dedykowane, niestandardowe klasy błędów, aby umożliwić warstwie wywołującej (np. API Routes) precyzyjne zarządzanie błędami i zwracanie odpowiednich kodów statusu HTTP.

- **`ConfigurationError`**: Problem z konfiguracją usługi (np. brak klucza API).
- **`OpenRouterApiError`**: Błąd zwrócony przez API OpenRouter. Będzie zawierać oryginalny kod statusu i treść błędu z API.
  - Scenariusze: Nieprawidłowy klucz (401), brak uprawnień do modelu (403), przekroczenie limitu zapytań (429), błąd serwera OpenRouter (5xx).
- **`NetworkError`**: Błąd połączenia sieciowego (np. timeout, problem z DNS).
- **`InvalidResponseJsonError`**: Odpowiedź modelu nie jest poprawnym składniowo JSON-em.
- **`SchemaValidationError`**: JSON jest poprawny, ale jego struktura nie jest zgodna z oczekiwanym schematem Zod. Błąd będzie zawierał szczegóły walidacji.

## 6. Kwestie Bezpieczeństwa

1.  **Zarządzanie Kluczem API**: Klucz API **nigdy** nie może być hardkodowany w kodzie. Musi być zarządzany wyłącznie przez zmienne środowiskowe (`.env` dla dewelopmentu, sekrety w środowisku produkcyjnym np. DigitalOcean App Platform).
2.  **Walidacja Wejścia**: Chociaż usługa sama w sobie nie jest publicznie dostępna, należy pamiętać, aby dane wejściowe przekazywane do `messages` (pochodzące od użytkowników) były odpowiednio walidowane i oczyszczane w warstwie wyższej, aby uniknąć "prompt injection".
3.  **Logowanie**: Należy unikać logowania pełnych zapytań i odpowiedzi w środowisku produkcyjnym, aby chronić wrażliwe dane, które mogą być przetwarzane przez LLM.

## 7. Plan Wdrożenia Krok po Kroku

### Krok 1: Konfiguracja Środowiska

1.  **Utwórz plik usługi**:
    ```bash
    touch src/lib/services/openrouter.service.ts
    ```
2.  **Zainstaluj zależności**:
    ```bash
    npm install zod zod-to-json-schema
    ```
3.  **Dodaj zmienną środowiskową**: W pliku `.env` (utwórz go, jeśli nie istnieje) dodaj klucz API:
    ```
    OPENROUTER_API_KEY="sk-or-..."
    ```

### Krok 2: Definicja Klasy i Typów

W pliku `src/lib/services/openrouter.service.ts` zdefiniuj szkielet klasy, niestandardowe błędy oraz typy wejściowe.

```typescript
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

// Definicje niestandardowych błędów
export class ConfigurationError extends Error { /* ... */ }
export class OpenRouterApiError extends Error { /* ... */ }
// ... (pozostałe klasy błędów)

// Typy
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type StructuredChatCompletionParams<T extends z.ZodTypeAny> = {
  schema: T;
  messages: Message[];
  model: string;
  params?: Record<string, unknown>;
};

export class OpenRouterService {
  // ... implementacja
}
```

### Krok 3: Implementacja Konstruktora

Zaimplementuj logikę fail-fast dla klucza API.

```typescript
// wewnątrz klasy OpenRouterService
private readonly apiKey: string;

constructor() {
  this.apiKey = process.env.OPENROUTER_API_KEY;
  if (!this.apiKey) {
    throw new ConfigurationError('OPENROUTER_API_KEY is not set in environment variables.');
  }
}
```

### Krok 4: Implementacja Głównej Metody Publicznej

Stwórz metodę `structuredChatCompletion`, która będzie orkiestrować wywołania metod prywatnych.

```typescript
// wewnątrz klasy OpenRouterService
public async structuredChatCompletion<T extends z.ZodTypeAny>(
  params: StructuredChatCompletionParams<T>
): Promise<z.infer<T>> {
  try {
    const payload = this._buildRequestPayload(params);
    const apiResponse = await this._makeApiCall(payload);
    return this._parseAndValidateResponse(apiResponse, params.schema);
  } catch (error) {
    // Logika do re-throwowania błędów jako odpowiednie niestandardowe typy
    // np. if (error instanceof TypeError) throw new NetworkError(...)
    throw error; // Uproszczone dla przykładu
  }
}
```

### Krok 5: Implementacja Metod Prywatnych

1.  **`_buildRequestPayload`**: Ta metoda konwertuje schemat Zod i buduje payload.

    ```typescript
    private _buildRequestPayload<T extends z.ZodTypeAny>({
        schema, messages, model, params
    }: StructuredChatCompletionParams<T>) {
        const jsonSchema = zodToJsonSchema(schema, "responseSchema");
        const functionName = "structured_response_generator";

        return {
            model,
            messages,
            tool_choice: { "type": "function", "function": { "name": functionName } },
            tools: [{
                type: 'function',
                function: {
                    name: functionName,
                    description: 'Generates a structured response based on the provided schema.',
                    parameters: jsonSchema,
                },
            }],
            ...params,
        };
    }
    ```

2.  **`_makeApiCall`**: Metoda do wysyłania żądania.

    ```typescript
    private async _makeApiCall(payload: object) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:4321', // Zmień na URL produkcyjny
          'X-Title': '10xdevs-project', // Zmień na nazwę aplikacji
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new OpenRouterApiError(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      return response.json();
    }
    ```

3.  **`_parseAndValidateResponse`**: Metoda do parsowania i walidacji odpowiedzi.

    ```typescript
    private _parseAndValidateResponse<T extends z.ZodTypeAny>(
      apiResponse: any,
      schema: T
    ): z.infer<T> {
      const toolCall = apiResponse.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.type !== 'function') {
        throw new Error('Invalid response structure: No function tool call found.');
      }

      let parsedArguments: any;
      try {
        parsedArguments = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        throw new InvalidResponseJsonError('Failed to parse model response as JSON.');
      }

      const validationResult = schema.safeParse(parsedArguments);
      if (!validationResult.success) {
        throw new SchemaValidationError(JSON.stringify(validationResult.error.issues));
      }

      return validationResult.data;
    }
    ```

### Krok 6: Integracja z Aplikacją

Użyj nowej usługi w istniejącej logice, np. w `src/lib/services/generation.service.ts`, zastępując obecne wywołania do AI nowym, ustrukturyzowanym podejściem.

```typescript
// Przykład w innym serwisie
import { OpenRouterService } from './openrouter.service';
import { z } from 'zod';

const flashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
const flashcardsResponseSchema = z.object({
  flashcards: z.array(flashcardSchema),
});

// ...

const openRouter = new OpenRouterService();
const result = await openRouter.structuredChatCompletion({
  schema: flashcardsResponseSchema,
  model: 'anthropic/claude-3.5-sonnet',
  messages: [
    { role: 'system', content: 'You are a flashcard expert.' },
    { role: 'user', content: 'Create flashcards from this text: ...' }
  ],
});

// result jest w pełni typowany jako { flashcards: { question: string, answer: string }[] }
console.log(result.flashcards);
```

# Plan implementacji widoku generowania fiszek

## 1. Przegląd

Widok `/` umożliwia:

1. Wklejenie tekstu (1000-10000 znaków)
2. Wygenerowanie propozycji fiszek przez AI
3. Przegląd, edycję i wybór propozycji
4. Zapis wybranych fiszek do bazy

**Routing:** `/` (główna) i `/generate` (alias)  
**Auth:** Wymaga zalogowania (Supabase)

---

## 2. Struktura komponentów

```
GenerateView (React)
├── GenerationForm
│   ├── SourceTextInput (textarea + CharacterCounter)
│   └── GenerateButton
│
└── ProposalsSection (warunkowo)
    ├── ProposalsHeader (licznik + akcje)
    └── ProposalsList
        └── ProposalCard[] (checkbox, badge, edytowalne pola)

ErrorAlert (warunkowo)
Toast (globalne)
```

---

## 3. Kluczowe komponenty

### GenerateView

- **Rola:** Główny kontener, orkiestracja przepływu
- **Stan:** `viewState`, `sourceText`, `proposals[]`, `error`
- **Hook:** `useGenerateFlashcards`

### GenerationForm

- **Props:** `sourceText`, `onSourceTextChange`, `onSubmit`, `isDisabled`
- **Walidacja:** 1000-10000 znaków, real-time feedback

### ProposalCard

- **Funkcje:** Checkbox, edycja inline, badge "AI"/"AI edytowane"
- **Walidacja edycji:** question (3-500), answer (3-2000)

---

## 4. Typy

### DTO (z API - `src/types.ts`)

```typescript
// POST /api/generations
CreateGenerationCommand = { source_text: string }
CreateGenerationResultDTO = { generation: { id, flashcardsProposals[] } }

// POST /api/flashcards
CreateFlashcardsCommand = { generation_id, flashcards[] }
CreateFlashcardsResultDTO = { created_count, flashcards[] }
```

### ViewModel (`src/components/generate/types.ts`)

```typescript
ViewState = "idle" | "generating" | "reviewing" | "saving" | "error"

ProposalViewModel = {
  // Z API
  id, question, answer, source, generation_id, created_at
  // UI state
  isSelected, isEditing, isModified, originalQuestion, originalAnswer
}

ValidationState = "below-min" | "valid" | "above-max"
```

---

## 5. Zarządzanie stanem

### Hook: `useGenerateFlashcards`

**Lokalizacja:** `src/hooks/useGenerateFlashcards.ts`

**Zwraca:**

- Stan: `viewState`, `sourceText`, `proposals`, `selectedCount`, `error`
- Akcje: `handleGenerate()`, `handleSaveSelected()`, `toggleProposal()`, `editProposal()`, `handleCancel()`

**Główne funkcje:**

1. `handleGenerate()` - walidacja → POST /api/generations → transform do ProposalViewModel[]
2. `handleSaveSelected()` - filtruj zaznaczone → POST /api/flashcards → toast + reset
3. `toggleProposal()` - przełącz `isSelected`
4. `editProposal()` - aktualizuj + ustaw `isModified` + zmień source na "ai-edited"

### Hook: `useCharacterValidation`

**Lokalizacja:** `src/hooks/useCharacterValidation.ts`

Real-time walidacja długości tekstu z kolorem (szary/zielony/czerwony).

---

## 6. Integracja API

### POST /api/generations

- **Input:** `{ source_text: string }` (1000-10000 znaków)
- **Output:** Generation z `flashcardsProposals[]`
- **Errors:** 400, 401, 422, 500, 503
- **Transform:** Propozycje → ProposalViewModel (wszystkie `isSelected: true`)

### POST /api/flashcards

- **Input:** `{ generation_id, flashcards: [{question, answer, source}] }`
- **Output:** `{ created_count, flashcards[] }`
- **Errors:** 400, 401, 404, 500

### Auth Headers

```typescript
import { supabase } from "@/db/supabase.client";

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Unauthorized");

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}
```

---

## 7. Przepływ użytkownika

### 7.1 Generowanie

1. Wklej tekst → real-time walidacja (licznik kolorowy)
2. Klik "Generuj" → skeleton loader → propozycje (wszystkie zaznaczone)
3. Błąd → ErrorAlert z "Spróbuj ponownie"

### 7.2 Przegląd i edycja

1. Odznacz niepotrzebne (checkbox)
2. Edytuj inline → badge zmienia się na "AI edytowane"
3. Licznik: "Wybrane: X / Y fiszek"

### 7.3 Zapis

1. Klik "Zapisz wybrane (X)" → spinner
2. Sukces → toast + link do /flashcards → reset widoku
3. Błąd → toast error, propozycje pozostają

### 7.4 Anulowanie

1. Klik "Anuluj" → dialog potwierdzenia (jeśli są zaznaczone)
2. Reset do idle state

---

## 8. Walidacja

| Co             | Warunek           | UI Feedback                                       |
| -------------- | ----------------- | ------------------------------------------------- |
| Tekst źródłowy | 1000-10000 znaków | Licznik (szary/zielony/czerwony), button disabled |
| Pytanie        | 3-500 znaków      | Inline error, character counter                   |
| Odpowiedź      | 3-2000 znaków     | Inline error, character counter                   |
| Zapis          | Min. 1 zaznaczona | Button "Zapisz" disabled                          |

---

## 9. Obsługa błędów

| Status | Komunikat                  | Recovery                         |
| ------ | -------------------------- | -------------------------------- |
| 400    | "Nieprawidłowe dane"       | Popraw i spróbuj ponownie        |
| 401    | "Sesja wygasła"            | Redirect → /login                |
| 422    | "AI nie mogło przetworzyć" | Spróbuj z innym tekstem          |
| 500    | "Błąd serwera"             | Spróbuj ponownie                 |
| 503    | "AI niedostępne"           | Spróbuj ponownie / krótszy tekst |

**Error Alert:** Widoczny komunikat + przycisk retry  
**Toast:** Dla błędów zapisu i sukcesów

---

## 10. Struktura plików

```
src/
├── pages/
│   └── index.astro                     # <GenerateView client:load />
│
├── components/generate/
│   ├── GenerateView.tsx                # główny kontener
│   ├── GenerationForm.tsx
│   ├── SourceTextInput.tsx
│   ├── CharacterCounter.tsx
│   ├── ProposalsSection.tsx
│   ├── ProposalsHeader.tsx
│   ├── ProposalsList.tsx
│   ├── ProposalCard.tsx
│   ├── ProposalsSkeletonLoader.tsx
│   ├── ErrorAlert.tsx
│   └── types.ts                        # ViewModels
│
├── hooks/
│   ├── useGenerateFlashcards.ts        # główna logika
│   └── useCharacterValidation.ts
│
└── lib/
    ├── api/
    │   ├── generations.api.ts          # generateFlashcards()
    │   └── flashcards.api.ts           # saveFlashcards()
    └── utils/
        └── validation.ts               # validateSourceText(), validateProposal()
```

---

## 11. Kroki implementacji

### Faza 1: Fundament

1. Struktura plików i folderów
2. Typy DTO i ViewModel (`types.ts`)
3. Funkcje walidacyjne (`validation.ts`)
4. API clients z error handling (`generations.api.ts`, `flashcards.api.ts`)

### Faza 2: Hooki

5. `useCharacterValidation` - real-time walidacja
6. `useGenerateFlashcards` - główna logika + state management

### Faza 3: Komponenty (bottom-up)

7. Podstawowe: CharacterCounter, ErrorAlert, ProposalsSkeletonLoader
8. Input: SourceTextInput
9. Propozycje: ProposalCard → ProposalsList → ProposalsHeader → ProposalsSection
10. Formularz: GenerationForm
11. Główny: GenerateView (orkiestracja)

### Faza 4: Integracja i finalizacja

12. Astro page (`index.astro`)
13. Stylowanie (Tailwind + shadcn/ui)
14. Testy manualne (scenariusze + edge cases)
15. Accessibility (keyboard, ARIA, focus management)
16. Code review i cleanup

---

## 12. Scenariusze testowe

**Happy path:**

- Tekst 1000-10000 → generuj → propozycje → odznacz kilka → zapisz → sukces

**Walidacja:**

- Tekst < 1000 → button disabled
- Tekst > 10000 → button disabled
- 0 zaznaczonych → "Zapisz" disabled

**Błędy:**

- 503 → ErrorAlert z retry
- Network error → komunikat + retry
- 401 → redirect do login

**Edge cases:**

- 0 propozycji z API → komunikat informacyjny
- Wszystkie odznaczone → button disabled
- Anuluj z zaznaczonymi → dialog potwierdzenia

---

## 13. Kluczowe uwagi

1. **Wszystkie propozycje domyślnie zaznaczone** po wygenerowaniu
2. **Badge "AI" → "AI edytowane"** przy modyfikacji
3. **Optimistic UI** - natychmiastowy feedback
4. **Error recovery** - zawsze możliwość retry
5. **Accessibility** - keyboard navigation, ARIA, focus trap
6. **Walidacja wielopoziomowa** - preventive (disabled) + reactive (errors)

---

## Tech Stack

- **Framework:** Astro 5 + React 19
- **Styling:** Tailwind 4 + shadcn/ui
- **State:** React hooks (custom)
- **Auth:** Supabase
- **API:** Fetch z custom clients

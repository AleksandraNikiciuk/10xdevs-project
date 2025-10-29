# Streszczenie: Plan implementacji widoku generowania fiszek

## 🎯 Cel

Widok `/` (generate) umożliwia użytkownikom:

1. Wklejenie tekstu źródłowego (1000-10000 znaków)
2. Wygenerowanie propozycji fiszek przez AI
3. Przegląd, edycję i wybór propozycji
4. Zapis wybranych fiszek do bazy

---

## 🏗️ Struktura komponentów (hierarchia)

```
GenerateView (główny kontener React)
├── GenerationForm
│   ├── SourceTextInput (textarea + CharacterCounter)
│   └── GenerateButton
│
└── ProposalsSection (po wygenerowaniu)
    ├── ProposalsHeader (licznik + przyciski akcji)
    └── ProposalsList
        └── ProposalCard[] (checkbox, badge, edytowalne pola)

ErrorAlert (warunkowo)
Toast (globalne powiadomienia)
```

---

## 📦 Kluczowe typy

### DTO (API)

- `CreateGenerationCommand` - request: `{ source_text: string }`
- `CreateGenerationResultDTO` - response z propozycjami
- `CreateFlashcardsCommand` - request: `{ generation_id, flashcards[] }`
- `CreateFlashcardsResultDTO` - response po zapisie

### ViewModel (UI)

- `ViewState` - `'idle' | 'generating' | 'reviewing' | 'saving' | 'error'`
- `ProposalViewModel` - propozycja + stan UI (isSelected, isEditing, isModified)
- `ValidationState` - `'below-min' | 'valid' | 'above-max'`

---

## 🔄 Zarządzanie stanem

### Custom Hook: `useGenerateFlashcards`

Zarządza całym widokiem:

- Stan: `viewState`, `sourceText`, `proposals[]`, `error`
- Akcje: `handleGenerate()`, `handleSaveSelected()`, `toggleProposal()`, `editProposal()`

### Custom Hook: `useCharacterValidation`

Real-time walidacja długości tekstu z wizualnym feedbackiem

---

## 🔌 Integracja API

### POST /api/generations

- **Input:** `{ source_text: string }` (1000-10000 znaków)
- **Output:** Obiekt generation z tablicą `flashcardsProposals[]`
- **Timeout:** 60s
- **Błędy:** 400, 401, 422, 500, 503

### POST /api/flashcards

- **Input:** `{ generation_id, flashcards[] }` gdzie każda fiszka ma `{question, answer, source}`
- **Output:** `{ created_count, flashcards[] }`
- **Błędy:** 400, 401, 404, 500

---

## ✅ Kluczowe walidacje

| Co                 | Warunek           | Feedback UI                                       |
| ------------------ | ----------------- | ------------------------------------------------- |
| Tekst źródłowy     | 1000-10000 znaków | Licznik (szary/zielony/czerwony), button disabled |
| Pytanie (edycja)   | 3-500 znaków      | Inline error, character counter                   |
| Odpowiedź (edycja) | 3-2000 znaków     | Inline error, character counter                   |
| Zapis fiszek       | Min. 1 zaznaczona | Button "Zapisz" disabled                          |

---

## 🎬 Przepływ użytkownika

1. **Wklejenie tekstu** → real-time walidacja → enable/disable przycisku
2. **Klik "Generuj"** → skeleton loader (30s) → wyświetlenie propozycji (wszystkie zaznaczone)
3. **Przegląd propozycji:**
   - Odznacz niepotrzebne (checkbox)
   - Edytuj inline (zmienia badge na "AI edytowane")
4. **Klik "Zapisz wybrane (X)"** → spinner → toast sukcesu → reset widoku

**Alternatywy:**

- Błąd generowania → ErrorAlert z przyciskiem "Spróbuj ponownie"
- Klik "Anuluj" → dialog potwierdzenia → reset

---

## 🚨 Obsługa błędów (skrót)

| Status | Komunikat                  | Recovery                |
| ------ | -------------------------- | ----------------------- |
| 400    | "Nieprawidłowe dane"       | Popraw dane             |
| 401    | "Sesja wygasła"            | Redirect do /login      |
| 422    | "AI nie mogło przetworzyć" | Spróbuj z innym tekstem |
| 503    | "AI niedostępne"           | Spróbuj ponownie        |
| 500    | "Błąd serwera"             | Spróbuj ponownie        |

---

## 🛠️ Kroki implementacji (high-level)

1. **Struktura** - Stwórz pliki komponentów i hooków
2. **Typy** - Zdefiniuj ViewModel types w `types.ts`
3. **Walidacja** - Funkcje walidacyjne w `utils/validation.ts`
4. **API clients** - `generations.api.ts` i `flashcards.api.ts`
5. **Hooki** - `useCharacterValidation` → `useGenerateFlashcards`
6. **Komponenty podstawowe** - CharacterCounter, SourceTextInput, ErrorAlert, Skeleton
7. **Komponenty propozycji** - ProposalCard → ProposalsList → ProposalsSection
8. **Formularz** - GenerationForm
9. **Główny widok** - GenerateView (orkiestracja)
10. **Integracja Astro** - `index.astro` z `<GenerateView client:load />`
11. **Stylowanie** - Tailwind + shadcn/ui
12. **Testy** - Manualne scenariusze + edge cases
13. **A11y** - Keyboard navigation, ARIA, focus management
14. **Finalizacja** - Code review, cleanup

---

## 📋 Checklist deweloperski

- [ ] Struktura plików i folderów
- [ ] Typy DTO i ViewModel
- [ ] Funkcje walidacyjne
- [ ] API clients z error handling
- [ ] Hook useCharacterValidation
- [ ] Hook useGenerateFlashcards
- [ ] Komponenty prezentacyjne (8 sztuk)
- [ ] Integracja Supabase Auth
- [ ] Toast notifications
- [ ] Error states
- [ ] Loading states (skeleton, spinners)
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Responsive design
- [ ] Testy scenariuszy użytkownika

---

## 🎨 Stack techniczny

- **Framework:** Astro 5 + React 19
- **Styling:** Tailwind 4 + shadcn/ui
- **Typy:** TypeScript 5
- **Auth:** Supabase
- **API:** Fetch API z custom clients
- **State:** React hooks (useState, custom hooks)

---

## 💡 Kluczowe uwagi

1. **Wszystkie propozycje domyślnie zaznaczone** po wygenerowaniu
2. **Badge zmienia się na "AI edytowane"** po modyfikacji
3. **Optimistic UI** - natychmiastowy feedback przed API call
4. **Error recovery** - zawsze możliwość retry
5. **Accessibility** - pełna obsługa klawiatury i screen readers
6. **Walidacja wielopoziomowa** - preventive (disabled) + reactive (errors)

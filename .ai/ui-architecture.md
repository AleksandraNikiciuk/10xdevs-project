# Architektura UI - 10x Cards MVP

## 1. Przegląd projektu

### 1.1 Cel

Aplikacja webowa umożliwiająca manualne oraz automatyczne generowanie fiszek edukacyjnych przy użyciu AI oraz zarządzanie nimi.

### 1.2 Zakres MVP

**W zakresie:**

- ✅ Generowanie fiszek z AI (OpenRouter/LLM)
- ✅ Przegląd i edycja propozycji AI
- ✅ Lista fiszek z paginacją
- ✅ CRUD fiszek (Create, Read, Update, Delete)
- ✅ Toggle widoku (lista/kafelki)
- ✅ Ręczne tworzenie fiszek

**Poza zakresem MVP:**

- ❌ Autentykacja użytkowników (implementacja później)
- ❌ Panel użytkownika / statystyki
- ❌ Wyszukiwanie i zaawansowane filtry
- ❌ Multi-select i batch operations
- ❌ Sesja powtórek z algorytmem
- ❌ Wersja mobilna (desktop-only)
- ❌ Dark mode

### 1.3 Stack technologiczny

- **Frontend Framework:** Astro 5 + React 19
- **Język:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn/ui
- **State Management:** React Context API + Hooks
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL + BaaS)
- **AI:** OpenRouter.ai API

---

## 2. Struktura nawigacji i routing

### 2.1 Routing

```
/ (index.astro)
  └─ Widok generowania fiszek (strona główna)

/flashcards (flashcards.astro)
  └─ Widok listy fiszek

/404 (404.astro)
  └─ Strona nie znaleziona
```

### 2.2 Nawigacja główna (Navbar)

```
┌────────────────────────────────────────────┐
│ [Logo] Generuj fiszki | Moje fiszki        │
└────────────────────────────────────────────┘
```

**Specyfikacja:**

- Logo/nazwa aplikacji po lewej (link do `/`)
- 2 linki menu: "Generuj fiszki" (`/`) | "Moje fiszki" (`/flashcards`)
- Active state dla aktywnej strony (underline lub bold)
- Sticky navbar (zawsze widoczny podczas scrollowania)
- Brak dropdown użytkownika (bez autentykacji w MVP)
- Max-width: `max-w-7xl`, centered, `px-4`

**Komponent:** `src/components/layout/Navbar.tsx` (React) lub `src/components/Navbar.astro`

---

## 3. Widok generowania fiszek (`/`)

### 3.1 Layout ogólny

```
┌─────────────────────────────────────────────┐
│ Navbar                                      │
├─────────────────────────────────────────────┤
│                                             │
│  [H1: Wygeneruj fiszki z AI]               │
│  [Podtytuł/Opis]                           │
│                                             │
│  [Textarea]                                │
│  [Character counter: X / 10000]            │
│  [Przycisk: Generuj fiszki]                │
│                                             │
│  ─────────────────────────                  │
│                                             │
│  [Sekcja: Wygenerowane propozycje]         │
│  (pojawia się po wygenerowaniu)            │
│                                             │
│  [Lista edytowalnych propozycji]           │
│                                             │
│  [Info: Zaznaczono X z Y fiszek]           │
│  [Anuluj] [Zapisz wybrane fiszki (X)]      │
│                                             │
└─────────────────────────────────────────────┘
```

**Layout:**

- Max-width: `max-w-4xl` (768px) centered
- Padding: `px-4 py-8`

### 3.2 Sekcja formularza

**Nagłówek:**

```
H1: "Wygeneruj fiszki z AI"
Podtytuł: "Wklej tekst (1000-10000 znaków), a AI wygeneruje dla Ciebie
propozycje fiszek edukacyjnych. Możesz je zaakceptować, edytować lub odrzucić."
```

**Textarea:**

- Placeholder: "Przykład: Fotosynteza jest procesem, w którym rośliny wykorzystują światło słoneczne..."
- Walidacja: 1000-10000 znaków
- Character counter: Real-time, poniżej textarea
  - Szary jeśli < 1000
  - Zielony jeśli 1000-10000
  - Czerwony jeśli > 10000
- Auto-resize lub fixed height (200-300px)
- Shadcn/ui: `Textarea`

**Przycisk "Generuj fiszki":**

- Primary button (Shadcn/ui Button)
- Disabled jeśli text poza zakresem 1000-10000
- Loading state: "Generowanie..." + spinner podczas API call
- Po wygenerowaniu: zmienia się na "Generuj kolejne fiszki"

### 3.3 Stany formularza

**Stan 1 - Początkowy:**

- Textarea: edytowalne, puste
- Przycisk: "Generuj fiszki"
- Sekcja propozycji: ukryta

**Stan 2 - Podczas generowania:**

- Textarea: disabled, read-only
- Przycisk: "Generowanie..." (disabled, spinner)
- Sekcja propozycji: skeleton loaders (3-5 placeholder cards)
- Komunikat: "Generuję fiszki przy użyciu AI... To może potrwać do 30 sekund"

**Stan 3 - Po wygenerowaniu:**

- Textarea: read-only z oryginalnym tekstem
- Przycisk: "Generuj kolejne fiszki"
- Sekcja propozycji: widoczna z listą propozycji
- Smooth scroll do sekcji propozycji

**Stan 4 - Błąd generowania:**

- Textarea: pozostaje edytowalne
- Przycisk: powraca do "Generuj fiszki"
- Alert inline (Shadcn/ui Alert - destructive):
  ```
  ┌─────────────────────────────────────┐
  │ ⚠️ Nie udało się wygenerować fiszek │
  │ [Szczegóły błędu]                   │
  │ [Spróbuj ponownie]                 │
  └─────────────────────────────────────┘
  ```
- Mapowanie błędów:
  - 503: "Usługa AI jest chwilowo niedostępna"
  - Timeout: "Przekroczono czas oczekiwania"
  - 422: "AI zwróciło nieprawidłową odpowiedź"

### 3.4 Sekcja propozycji

**Lista propozycji:**

- Vertical stack, jedna propozycja per row
- Gap: `gap-4` (16px)

**Pojedyncza propozycja - Read-only (domyślny stan):**

```
┌─────────────────────────────────────────────┐
│ [✓ Checkbox]  [Badge: AI]    [Edytuj] [X]  │
├─────────────────────────────────────────────┤
│ Pytanie:                                    │
│ Co to jest fotosynteza?                     │
│                                             │
│ Odpowiedź:                                  │
│ Proces, w którym rośliny wykorzystują...    │
└─────────────────────────────────────────────┘
```

**Komponenty:**

- Shadcn/ui: Card, Checkbox, Badge, Button
- Badge kolory:
  - "AI" (niebieski) - dla ai-full
  - "AI edytowane" (fioletowy) - dla ai-edited po edycji
- Checkbox: domyślnie zaznaczony
- [X]: odrzucenie → uncheckbox + opacity 50%
- [Edytuj]: przejście do trybu edycji

**Pojedyncza propozycja - Edit mode:**

```
┌─────────────────────────────────────────────┐
│ [✓ Checkbox]  [Badge: AI]                   │
├─────────────────────────────────────────────┤
│ Pytanie: (0/200)                            │
│ [Textarea z pytaniem]                       │
│                                             │
│ Odpowiedź: (0/500)                          │
│ [Textarea z odpowiedzią]                    │
│                                             │
│                    [Anuluj]  [Zapisz]      │
└─────────────────────────────────────────────┘
```

**Edycja inline:**

- Kliknięcie "Edytuj" → textarea zamiast tekstu
- Real-time character counter
- "Zapisz" → powrót do read-only, badge zmienia się na "AI edytowane"
- "Anuluj" → powrót do read-only, bez zmian

**Footer sekcji propozycji:**

```
[Info: Zaznaczono 8 z 10 fiszek]

[Anuluj]  [Zapisz wybrane fiszki (8)]
```

- Info: licznik zaznaczonych
- "Zapisz wybrane fiszki" - disabled jeśli 0 zaznaczonych
- Pokazuje liczbę w nawiasie
- "Anuluj" - collapse sekcji, reset formularza

### 3.5 Po zapisaniu fiszek

**Sekwencja:**

1. API call: `POST /api/flashcards` (batch create)
2. Przycisk: "Zapisywanie..." + spinner
3. **Success:**
   - Toast: "✓ Zapisano 8 fiszek" z akcją [Zobacz listę]
   - Sekcja propozycji znika/collapse
   - Formularz reset do stanu początkowego
4. **Error:**
   - Toast: "⚠️ Nie udało się zapisać fiszek. Spróbuj ponownie"
   - Propozycje pozostają

### 3.6 Komponenty React

**Struktura komponentów:**

```
src/pages/index.astro
  └─ GenerateFlashcardsView (React client:load)
       ├─ GenerateForm
       │    ├─ Textarea (Shadcn/ui)
       │    ├─ CharacterCounter
       │    └─ Button (Shadcn/ui)
       │
       └─ ProposalsList (conditional)
            ├─ ProposalCard (multiple)
            │    ├─ Checkbox (Shadcn/ui)
            │    ├─ Badge (Shadcn/ui)
            │    ├─ EditableContent
            │    └─ Actions (Edytuj, Odrzuć)
            │
            └─ ProposalsFooter
                 ├─ Counter
                 └─ Actions (Anuluj, Zapisz)
```

**Pliki:**

- `src/components/features/generation/GenerateFlashcardsView.tsx`
- `src/components/features/generation/GenerateForm.tsx`
- `src/components/features/generation/ProposalsList.tsx`
- `src/components/features/generation/ProposalCard.tsx`

**State (lokalny):**

```tsx
const [sourceText, setSourceText] = useState("");
const [proposals, setProposals] = useState<ProposalFlashcard[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

---

## 4. Widok listy fiszek (`/flashcards`)

### 4.1 Layout ogólny

```
┌─────────────────────────────────────────────┐
│ Navbar                                      │
├─────────────────────────────────────────────┤
│                                             │
│ [H1: Moje fiszki]       [+ Dodaj fiszkę]   │
│                                             │
│ [Toggle: 📋 Lista | 🎴 Kafelki]            │
│                                             │
│ Wszystkie fiszki (X)                       │
│                                             │
│ [Lista lub Grid fiszek]                    │
│                                             │
│ [Paginacja: < 1 2 3 >]                     │
│                                             │
└─────────────────────────────────────────────┘
```

**Layout:**

- Max-width: `max-w-7xl` (większa dla grid)
- Padding: `px-4 py-8`

### 4.2 Header sekcji

**Elementy:**

- H1: "Moje fiszki" (po lewej)
- Button: "+ Dodaj fiszkę" (po prawej, primary)
- Toggle widoku: Lista/Kafelki (Shadcn/ui Toggle Group)
- Licznik: "Wszystkie fiszki (X)" - z pagination total

**Toggle widoku:**

- 2 opcje: Lista (icon: List) | Kafelki (icon: Grid)
- Default: Lista
- Stan zapisany w localStorage: `flashcards_view_mode: 'list' | 'grid'`
- Zmiana → re-render bez reload

### 4.3 Widok listy (vertical)

**Layout:**

- Vertical stack, 1 fiszka per row
- Gap: `gap-4`

**Single card:**

```
┌───────────────────────────────────────────────┐
│ [Badge: AI]                    2 dni temu     │
│ Pytanie: Co to jest TypeScript?              │
│ Odpowiedź: Typed superset of JavaScript...   │
│                          [Edytuj]  [Usuń]    │
└───────────────────────────────────────────────┘
```

**Komponenty:**

- Shadcn/ui: Card, Badge, Button
- Badge: pokazuje źródło (AI, AI edytowane, Ręczne)
- Timestamp: relative time (np. "2 dni temu")
- Truncate długich tekstów (max 2-3 linie)

### 4.4 Widok kafelki (grid)

**Layout:**

- Grid: 3 kolumny desktop, 2 tablet
- Gap: `gap-4`
- Tailwind: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Single card:**

```
┌─────────────────────┐
│ [Badge: AI]         │
│                     │
│ Q: Co to jest...    │
│                     │
│ A: TypeScript jest..│
│                     │
│ 2 dni temu          │
│                     │
│ [Edytuj] [Usuń]     │
└─────────────────────┘
```

**Różnice od listy:**

- Vertical layout wewnątrz karty
- Shorter text (max 3 linie Q, 4 linie A)
- Buttons stack vertical lub horizontal (depends on space)

### 4.5 Empty state

**Gdy brak fiszek:**

```
┌─────────────────────────────────────┐
│                                     │
│         [Ikona: 📚]                 │
│                                     │
│     Nie masz jeszcze fiszek        │
│                                     │
│  Wygeneruj fiszki z AI lub dodaj   │
│  pierwszą fiszkę ręcznie           │
│                                     │
│  [Generuj z AI] [+ Dodaj fiszkę]   │
│                                     │
└─────────────────────────────────────┘
```

**Komponenty:**

- Centered vertically i horizontally
- 2 CTA buttons (primary dla obu)
- Shadcn/ui: Card z centered content

### 4.6 Paginacja

**Komponent:**

```
< Poprzednia  [1] 2 3 ... 10  Następna >
```

**Specyfikacja:**

- Shadcn/ui: Pagination (custom lub third-party)
- API: `GET /api/flashcards?page=1&limit=50`
- Default: 50 items per page
- URL param: `/flashcards?page=2` (deep linking)
- Disabled states: "Poprzednia" na page 1, "Następna" na last page
- Pokazać max 5-7 numerów (z ... dla reszty)
- Loading state: skeleton overlay podczas zmiany strony

### 4.7 Modal dodawania/edycji fiszki

**Triggered by:**

- Kliknięcie "+ Dodaj fiszkę" → mode: create
- Kliknięcie "Edytuj" na fiszce → mode: edit

**Struktura modalu:**

```
┌─────────────────────────────────────┐
│ [Dodaj/Edytuj fiszkę]           [X] │
├─────────────────────────────────────┤
│                                     │
│ Pytanie *                          │
│ [Textarea]                         │
│ 0 / 200                            │
│                                     │
│ Odpowiedź *                        │
│ [Textarea]                         │
│ 0 / 500                            │
│                                     │
│         [Anuluj]  [Zapisz]         │
└─────────────────────────────────────┘
```

**Komponenty:**

- Shadcn/ui: Dialog, Form, Textarea, Button
- Max-width: `max-w-2xl`
- Auto-focus na pierwszym polu
- ESC zamyka modal
- Click outside zamyka (z konfirmacją jeśli są zmiany)

**Walidacja (React Hook Form + Zod):**

```tsx
const flashcardSchema = z.object({
  question: z.string().min(1, "Pytanie jest wymagane").max(200),
  answer: z.string().min(1, "Odpowiedź jest wymagana").max(500),
});
```

**Error states:**

- Inline errors pod polami (text-sm, red)
- Czerwona obwódka pola z błędem
- Real-time character counter

**Po zapisaniu:**

- **Create mode:**
  1. API: `POST /api/flashcards`
  2. Success: modal zamyka się, toast "✓ Fiszka dodana", refresh listy
  3. Error: toast "⚠️ Nie udało się dodać", modal pozostaje
- **Edit mode:**
  1. API: `PATCH /api/flashcards/:id`
  2. Success: modal zamyka się, toast "✓ Fiszka zaktualizowana", refresh listy
  3. Error: toast "⚠️ Nie udało się zaktualizować", modal pozostaje

### 4.8 Usuwanie fiszki

**Flow:**

1. Kliknięcie "Usuń" → Confirmation dialog (Shadcn/ui Alert Dialog)
   ```
   ┌─────────────────────────────────┐
   │ Usunąć fiszkę?                  │
   ├─────────────────────────────────┤
   │ [Pokaż pytanie fiszki]          │
   │ Ta operacja jest nieodwracalna. │
   │                                 │
   │      [Anuluj]  [Usuń]          │
   └─────────────────────────────────┘
   ```
2. Potwierdzenie → Optimistic update (fiszka znika z UI)
3. API: `DELETE /api/flashcards/:id`
4. **Success:** Toast "✓ Fiszka usunięta"
5. **Error:** Rollback (fiszka wraca), Toast "⚠️ Nie udało się usunąć"

### 4.9 Komponenty React

**Struktura komponentów:**

```
src/pages/flashcards.astro
  └─ FlashcardsView (React client:load)
       ├─ FlashcardsProvider (Context)
       │
       ├─ FlashcardsHeader
       │    ├─ Title + AddButton
       │    └─ ViewToggle (Shadcn/ui Toggle Group)
       │
       ├─ FlashcardsList | FlashcardsGrid (conditional)
       │    └─ FlashcardCard (multiple)
       │         ├─ Badge (Shadcn/ui)
       │         └─ Actions (Edytuj, Usuń)
       │
       ├─ EmptyState (conditional)
       │
       ├─ Pagination (Shadcn/ui)
       │
       ├─ FlashcardModal (Dialog)
       │    └─ FlashcardForm (React Hook Form)
       │
       └─ DeleteConfirmDialog (Alert Dialog)
```

**Pliki:**

- `src/components/features/flashcards/FlashcardsView.tsx`
- `src/components/features/flashcards/FlashcardsContext.tsx`
- `src/components/features/flashcards/FlashcardsHeader.tsx`
- `src/components/features/flashcards/FlashcardsList.tsx`
- `src/components/features/flashcards/FlashcardCard.tsx`
- `src/components/features/flashcards/FlashcardModal.tsx`
- `src/components/features/flashcards/EmptyState.tsx`

---

## 5. State Management

### 5.1 FlashcardsContext

**Zakres:** Tylko dla widoku `/flashcards`

**State:**

```tsx
interface FlashcardsContextType {
  flashcards: Flashcard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  viewMode: "list" | "grid";
  loading: boolean;
  error: Error | null;

  // Actions
  fetchFlashcards: (page: number) => Promise<void>;
  createFlashcard: (data: CreateFlashcardDTO) => Promise<void>;
  updateFlashcard: (id: number, data: UpdateFlashcardDTO) => Promise<void>;
  deleteFlashcard: (id: number) => Promise<void>;
  setViewMode: (mode: "list" | "grid") => void;
}
```

**Provider lokalizacja:**

```tsx
// src/components/features/flashcards/FlashcardsContext.tsx
export const FlashcardsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // State + logic
  return <FlashcardsContext.Provider value={value}>{children}</FlashcardsContext.Provider>;
};
```

### 5.2 Generowanie fiszek (lokalny state)

**Brak global state**, tylko lokalny w komponencie:

```tsx
// W GenerateFlashcardsView.tsx
const [sourceText, setSourceText] = useState("");
const [proposals, setProposals] = useState<ProposalFlashcard[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

### 5.3 localStorage

**Zapisywane dane:**

```typescript
localStorage.setItem("flashcards_view_mode", "list" | "grid");
```

**Odczyt przy mount:**

```tsx
useEffect(() => {
  const savedMode = localStorage.getItem("flashcards_view_mode");
  if (savedMode === "list" || savedMode === "grid") {
    setViewMode(savedMode);
  }
}, []);
```

---

## 6. Obsługa błędów i loading states

### 6.1 Strategia error handling

**Inline errors (ważne, blokujące):**

- Walidacja formularzy (pod polami)
- Błąd generowania fiszek (Alert box pod przyciskiem)
- Błąd ładowania listy fiszek (w miejscu listy)

**Toast errors (mniej ważne, informacyjne):**

- Błąd zapisu/edycji/usuwania fiszki
- Błędy sieciowe (timeout, brak połączenia)

### 6.2 Inline errors - przykłady

**Walidacja formularza:**

```
[Textarea z błędem - czerwona obwódka]
⚠️ Pytanie nie może być puste
```

**Błąd generowania:**

```
┌─────────────────────────────────────┐
│ ⚠️ Nie udało się wygenerować fiszek │
│ Usługa AI jest chwilowo niedostępna│
│ [Spróbuj ponownie]                 │
└─────────────────────────────────────┘
```

- Shadcn/ui: Alert component (destructive variant)

**Błąd ładowania listy:**

```
┌─────────────────────────────────────┐
│ ⚠️ Nie udało się załadować fiszek   │
│ [Odśwież stronę] [Spróbuj ponownie] │
└─────────────────────────────────────┘
```

### 6.3 Toast notifications

**Implementacja:** Shadcn/ui Toast (Sonner)

**Konfiguracja:**

- Position: `top-right` lub `bottom-right`
- Auto-dismiss: 5 sekund
- Max visible: 3 toasty jednocześnie
- Closeable: tak (X button)

**Typy:**

```tsx
// Success
toast.success("✓ Zapisano 8 fiszek");

// Error
toast.error("⚠️ Nie udało się usunąć fiszki. Spróbuj ponownie");

// Info
toast.info("ℹ️ Sesja wygasła. Zaloguj się ponownie");
```

**Z akcją:**

```tsx
toast.success("✓ Zapisano 8 fiszek", {
  action: {
    label: "Zobacz listę",
    onClick: () => navigate("/flashcards"),
  },
});
```

### 6.4 Loading states

**Przyciski:**

```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Spinner className="mr-2" />
      Generowanie...
    </>
  ) : (
    "Generuj fiszki"
  )}
</Button>
```

**Lista fiszek (skeleton):**

```tsx
{
  loading ? (
    <>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </>
  ) : (
    flashcards.map((card) => <FlashcardCard key={card.id} {...card} />)
  );
}
```

**Podczas generowania propozycji:**

- 3-5 skeleton cards
- Komunikat: "Generuję fiszki... To może potrwać do 30 sekund"

**Zmiana strony paginacji:**

- Skeleton overlay na liście
- Lub spinner na środku

### 6.5 Optimistic updates

**Zastosowanie:**

- Usuwanie fiszki: natychmiastowe usunięcie z UI
- Edycja fiszki: natychmiastowa aktualizacja
- Toggle checkbox w propozycjach

**Implementacja z rollback:**

```tsx
const deleteFlashcard = async (id: number) => {
  // Optimistic update
  const previousFlashcards = [...flashcards];
  setFlashcards(flashcards.filter((f) => f.id !== id));

  try {
    await api.deleteFlashcard(id);
    toast.success("✓ Fiszka usunięta");
  } catch (error) {
    // Rollback
    setFlashcards(previousFlashcards);
    toast.error("⚠️ Nie udało się usunąć fiszki");
  }
};
```

### 6.6 Mapowanie błędów API

```tsx
const getErrorMessage = (error: ApiError): string => {
  const errorMap: Record<number, string> = {
    400: "Nieprawidłowe dane. Sprawdź formularz.",
    401: "Sesja wygasła. Zaloguj się ponownie.",
    403: "Brak uprawnień do tej operacji.",
    404: "Nie znaleziono zasobu.",
    422: "AI zwróciło nieprawidłową odpowiedź. Spróbuj z innym tekstem.",
    429: "Zbyt wiele żądań. Spróbuj ponownie za chwilę.",
    500: "Wystąpił błąd serwera. Spróbuj ponownie.",
    503: "Usługa AI jest chwilowo niedostępna.",
  };

  return errorMap[error.status] || "Wystąpił nieoczekiwany błąd.";
};
```

---

## 7. Design System i Shadcn/ui

### 7.1 Komponenty Shadcn/ui do zainstalowania

**Już zainstalowany:**

- ✅ Button

**Do zainstalowania:**

```bash
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add toggle-group
npx shadcn@latest add alert-dialog
npx shadcn@latest add form
```

**Opcjonalnie:**

- Tooltip (na badge hover)
- Separator (visual dividers)

### 7.2 Theme i kolory

**Wykorzystanie:** Shadcn/ui default theme (Tailwind)

**Kolory semantyczne:**

- **Primary:** Niebieski - główne akcje (Generuj, Zapisz, Dodaj)
- **Destructive:** Czerwony - usuwanie, błędy krytyczne
- **Muted:** Szary - mniej ważne elementy, disabled states
- **Success:** Zielony - sukces, zaakceptowane fiszki (via Tailwind green-\*)
- **Warning:** Żółty - ostrzeżenia (via Tailwind yellow-\*)

**Badge kolory (custom):**

```tsx
// AI (ai-full)
<Badge variant="default" className="bg-blue-500">AI</Badge>

// AI edytowane (ai-edited)
<Badge variant="default" className="bg-purple-500">AI edytowane</Badge>

// Ręczne (manual)
<Badge variant="secondary">Ręczne</Badge>
```

### 7.3 Typografia

**Font:**

- System font stack (najszybszy):
  ```css
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
    sans-serif;
  ```

**Hierarchia:**

- **H1:** `text-3xl font-bold` (30px) - tytuły stron
- **H2:** `text-2xl font-semibold` (24px) - sekcje
- **H3:** `text-xl font-semibold` (20px) - card headers
- **Body:** `text-base` (16px) - tekst główny
- **Small:** `text-sm` (14px) - metadata, helpery, errors
- **Tiny:** `text-xs` (12px) - timestamps, counters

### 7.4 Spacing i sizing

**Spacing (Tailwind scale):**

- Container padding: `px-4 py-8`
- Gap w grid/stack: `gap-4` (16px)
- Margin między sekcjami: `my-8` (32px)
- Card padding: `p-4` lub `p-6`

**Sizing:**

- Przyciski: `h-10` (40px) standard, `h-12` (48px) prominent
- Input/Textarea: `h-10` (40px) single line
- Max-width content: `max-w-4xl` (768px) formularze, `max-w-7xl` (1280px) listy

**Breakpoints:**

- `sm:` 640px (tablet portrait)
- `md:` 768px (tablet landscape)
- `lg:` 1024px (desktop)
- `xl:` 1280px (large desktop)

### 7.5 Buttons hierarchy

**Variants:**

```tsx
// Primary (główne akcje)
<Button variant="default">Generuj fiszki</Button>

// Secondary (akcje alternatywne)
<Button variant="secondary">Anuluj</Button>

// Destructive (usuwanie)
<Button variant="destructive">Usuń</Button>

// Ghost (subtelne akcje)
<Button variant="ghost">Edytuj</Button>

// Outline
<Button variant="outline">Więcej</Button>
```

### 7.6 Animacje i transitions

**Zasady:**

- Subtelne, nie rozpraszające
- Wykorzystać Tailwind `transition-*` utilities

**Zastosowanie:**

```tsx
// Fade in dla modali
className="animate-in fade-in-0 duration-200"

// Hover states
className="hover:scale-105 transition-transform"

// Slide down dla dropdown
className="animate-in slide-in-from-top-2 duration-200"

// Skeleton shimmer (Shadcn/ui built-in)
<Skeleton />
```

### 7.7 Dark mode

**MVP:** Nie implementujemy
**Przygotowanie:** Shadcn/ui wspiera dark mode out-of-the-box
**Przyszłość:** Dodać toggle w navbar + persist w localStorage

---

## 8. Integracja z API

### 8.1 Service Layer

**Lokalizacja:** `src/lib/services/`

**Pliki:**

```
src/lib/services/
  ├── flashcard.service.ts   # CRUD fiszek
  ├── generation.service.ts  # Generowanie AI
  └── ai.service.ts          # Już istnieje
```

### 8.2 Flashcard Service

**Przykład implementacji:**

```typescript
// src/lib/services/flashcard.service.ts

export interface GetFlashcardsParams {
  page?: number;
  limit?: number;
}

export interface CreateFlashcardDTO {
  question: string;
  answer: string;
  source: "manual" | "ai-full" | "ai-edited";
  generation_id?: number;
}

export const flashcardService = {
  async getFlashcards(params: GetFlashcardsParams = {}) {
    const { page = 1, limit = 50 } = params;
    const response = await fetch(`/api/flashcards?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch flashcards");
    return response.json();
  },

  async getFlashcard(id: number) {
    const response = await fetch(`/api/flashcards/${id}`);
    if (!response.ok) throw new Error("Failed to fetch flashcard");
    return response.json();
  },

  async createFlashcards(flashcards: CreateFlashcardDTO[]) {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcards }),
    });
    if (!response.ok) throw new Error("Failed to create flashcards");
    return response.json();
  },

  async updateFlashcard(id: number, data: Partial<CreateFlashcardDTO>) {
    const response = await fetch(`/api/flashcards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update flashcard");
    return response.json();
  },

  async deleteFlashcard(id: number) {
    const response = await fetch(`/api/flashcards/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete flashcard");
    return response.json();
  },
};
```

### 8.3 Generation Service

```typescript
// src/lib/services/generation.service.ts

export interface GenerateFlashcardsDTO {
  source_text: string;
}

export const generationService = {
  async generateFlashcards(data: GenerateFlashcardsDTO) {
    const response = await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message);
    }
    return response.json();
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

### 8.4 API Endpoints (istniejące)

**Flashcards:**

- `GET /api/flashcards` - Lista fiszek (z paginacją)
- `GET /api/flashcards/:id` - Pojedyncza fiszka
- `POST /api/flashcards` - Tworzenie fiszek (batch)
- `PATCH /api/flashcards/:id` - Aktualizacja fiszki
- `DELETE /api/flashcards/:id` - Usunięcie fiszki

**Generations:**

- `POST /api/generations` - Generowanie propozycji

---

## 9. File Structure

### 9.1 Struktura katalogów

```
src/
├── components/
│   ├── ui/                          # Shadcn/ui components
│   │   ├── button.tsx               # ✅ Już istnieje
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── alert.tsx
│   │   ├── toast.tsx
│   │   ├── textarea.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── toggle-group.tsx
│   │   ├── alert-dialog.tsx
│   │   └── form.tsx
│   │
│   ├── layout/                      # Layout components
│   │   ├── Navbar.tsx               # Główna nawigacja
│   │   └── Layout.tsx               # Wrapper (opcjonalnie)
│   │
│   ├── features/                    # Feature-specific components
│   │   ├── generation/              # Generowanie fiszek
│   │   │   ├── GenerateFlashcardsView.tsx
│   │   │   ├── GenerateForm.tsx
│   │   │   ├── CharacterCounter.tsx
│   │   │   ├── ProposalsList.tsx
│   │   │   ├── ProposalCard.tsx
│   │   │   └── ProposalsFooter.tsx
│   │   │
│   │   └── flashcards/              # Lista i zarządzanie fiszkami
│   │       ├── FlashcardsView.tsx
│   │       ├── FlashcardsContext.tsx
│   │       ├── FlashcardsHeader.tsx
│   │       ├── ViewToggle.tsx
│   │       ├── FlashcardsList.tsx
│   │       ├── FlashcardsGrid.tsx
│   │       ├── FlashcardCard.tsx
│   │       ├── FlashcardModal.tsx
│   │       ├── FlashcardForm.tsx
│   │       ├── DeleteConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       └── Pagination.tsx
│   │
│   └── Welcome.astro                # Można usunąć (demo)
│
├── pages/
│   ├── index.astro                  # Strona generowania
│   ├── flashcards.astro             # Strona listy fiszek
│   ├── 404.astro                    # Not found
│   └── api/                         # ✅ Już istnieje
│
├── lib/
│   ├── services/                    # API services
│   │   ├── flashcard.service.ts     # DO UTWORZENIA
│   │   ├── generation.service.ts    # DO UTWORZENIA
│   │   └── ai.service.ts            # ✅ Już istnieje
│   │
│   ├── schemas/                     # Zod schemas
│   │   ├── flashcard.schema.ts      # ✅ Już istnieje
│   │   └── generation.schema.ts     # ✅ Już istnieje
│   │
│   └── utils.ts                     # Helper functions
│
├── types.ts                         # ✅ Shared types
├── styles/
│   └── global.css                   # ✅ Tailwind imports
└── layouts/
    └── Layout.astro                 # ✅ Główny layout
```

### 9.2 Przykład struktury pliku Astro

**`src/pages/index.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import GenerateFlashcardsView from "../components/features/generation/GenerateFlashcardsView";
---

<Layout title="Generuj fiszki - 10x Cards">
  <GenerateFlashcardsView client:load />
</Layout>
```

**`src/pages/flashcards.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import FlashcardsView from "../components/features/flashcards/FlashcardsView";
---

<Layout title="Moje fiszki - 10x Cards">
  <FlashcardsView client:load />
</Layout>
```

### 9.3 Przykład komponentu React

**`src/components/features/generation/GenerateFlashcardsView.tsx`**

```tsx
import { useState } from "react";
import { GenerateForm } from "./GenerateForm";
import { ProposalsList } from "./ProposalsList";
import type { ProposalFlashcard } from "@/types";

export default function GenerateFlashcardsView() {
  const [proposals, setProposals] = useState<ProposalFlashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (sourceText: string) => {
    // Logic
  };

  const handleSaveProposals = async (selectedProposals: ProposalFlashcard[]) => {
    // Logic
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Wygeneruj fiszki z AI</h1>
      <p className="text-muted-foreground mb-8">
        Wklej tekst (1000-10000 znaków), a AI wygeneruje dla Ciebie propozycje fiszek...
      </p>

      <GenerateForm onGenerate={handleGenerate} loading={loading} />

      {proposals.length > 0 && (
        <ProposalsList proposals={proposals} onSave={handleSaveProposals} onCancel={() => setProposals([])} />
      )}
    </div>
  );
}
```

---

## 10. Plan implementacji

### 10.1 Kolejność implementacji (Bottom-up + Critical path)

**Faza 1: Foundation (1-2 dni)**

1. ✅ Setup projektu (już zrobione)
2. Install Shadcn/ui components (wszystkie potrzebne)
3. Utworzyć Navbar + Layout
4. Utworzyć pages: `index.astro`, `flashcards.astro`, `404.astro`
5. Utworzyć services: `flashcard.service.ts`, `generation.service.ts`

**Faza 2: Widok generowania (2-3 dni)** 6. GenerateForm (textarea + walidacja + character counter) 7. Integracja z API generowania (`POST /api/generations`) 8. ProposalsList + ProposalCard (read-only view) 9. Inline edit w ProposalCard 10. ProposalsFooter (counter + akcje) 11. Zapis wybranych propozycji (`POST /api/flashcards`) 12. Error handling (inline alerts) 13. Loading states (skeleton, spinner)

**Faza 3: Widok listy fiszek (2-3 dni)** 14. FlashcardsContext (state + actions) 15. FlashcardsHeader (title + toggle + add button) 16. FlashcardCard (lista + kafelki variants) 17. FlashcardsList + FlashcardsGrid 18. Paginacja 19. EmptyState 20. Fetch + display z API (`GET /api/flashcards`)

**Faza 4: CRUD Operations (2 dni)** 21. FlashcardModal (dodawanie/edycja) 22. FlashcardForm (React Hook Form + Zod) 23. Create flashcard (`POST /api/flashcards`) 24. Update flashcard (`PATCH /api/flashcards/:id`) 25. DeleteConfirmDialog 26. Delete flashcard (`DELETE /api/flashcards/:id`) 27. Optimistic updates + rollback

**Faza 5: Polish & Testing (1-2 dni)** 28. Error handling finalizacja (toasty + inline) 29. Loading states refinement 30. localStorage dla view mode 31. Responsive tweaks (desktop-only, ale różne szerokości) 32. Accessibility (keyboard nav, ARIA labels, focus states) 33. Manual testing wszystkich flows 34. Bug fixes

**Szacowany czas total: 8-12 dni**

### 10.2 Milestones

**M1: Można wygenerować fiszki i zobaczyć propozycje**

- Widok generowania działa
- API integracja dla POST /api/generations
- Propozycje wyświetlane

**M2: Można zapisać propozycje jako fiszki**

- Checkbox + edycja propozycji działa
- Zapisywanie do bazy przez POST /api/flashcards

**M3: Można przeglądać listę fiszek**

- Widok listy działa
- Fetch z GET /api/flashcards
- Paginacja działa
- Toggle lista/kafelki

**M4: Pełny CRUD fiszek**

- Dodawanie ręczne (modal)
- Edycja (modal)
- Usuwanie (z konfirmacją)
- Wszystkie operacje działają

**M5: Production-ready MVP**

- Error handling kompletny
- Loading states wszędzie
- Polish + accessibility
- Tested + bug-free

### 10.3 Testing checklist

**Widok generowania:**

- [ ] Walidacja textarea (< 1000, 1000-10000, > 10000 znaków)
- [ ] Character counter aktualizuje się real-time
- [ ] Generowanie wywołuje API i pokazuje loading
- [ ] Propozycje wyświetlają się po wygenerowaniu
- [ ] Można edytować propozycje inline
- [ ] Checkbox toggle działa
- [ ] Counter "Zaznaczono X z Y" aktualizuje się
- [ ] Zapis wybranych fiszek działa
- [ ] Toast po zapisaniu
- [ ] Błąd generowania pokazuje inline alert
- [ ] "Generuj kolejne" resetuje formularz

**Widok listy fiszek:**

- [ ] Fiszki ładują się z paginacją
- [ ] Paginacja zmienia strony
- [ ] Toggle lista/kafelki działa i zapisuje w localStorage
- [ ] Empty state pokazuje się gdy brak fiszek
- [ ] Badge pokazuje poprawne źródło (AI, AI edytowane, Ręczne)
- [ ] Timestamp (relative time) wyświetla się
- [ ] Przycisk "+ Dodaj fiszkę" otwiera modal
- [ ] Modal dodawania zapisuje nową fiszkę
- [ ] Przycisk "Edytuj" otwiera modal z danymi
- [ ] Modal edycji aktualizuje fiszkę
- [ ] Przycisk "Usuń" pokazuje konfirmację
- [ ] Usuwanie działa (optimistic update + rollback on error)
- [ ] Loading states podczas fetch i mutations
- [ ] Toasty dla success/error

**Globalne:**

- [ ] Navbar active state działa
- [ ] Routing między stronami
- [ ] 404 page działa
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus states widoczne
- [ ] Error handling dla błędów API (wszystkie kody)
- [ ] Responsive (różne szerokości desktop)

---

## 11. Accessibility (a11y)

### 11.1 Standardy do implementacji

**WCAG 2.1 Level AA minimum**

**Keyboard Navigation:**

- Tab: poruszanie między interaktywnymi elementami
- Enter: aktywacja przycisków/linków
- Escape: zamykanie modali/dropdownów
- Space: toggle checkboxów

**Focus Management:**

- Widoczne focus states (ring-2 ring-primary)
- Modal: focus trap (nie można tabbować poza modal)
- Modal: auto-focus na pierwszym polu
- Po zamknięciu modala: focus wraca do trigger button

**ARIA:**

```tsx
// Przyciski
<Button aria-label="Dodaj fiszkę">+</Button>

// Dialogi
<Dialog aria-labelledby="dialog-title" aria-describedby="dialog-description">

// Alerts
<Alert role="alert" aria-live="polite">

// Loading states
<Button disabled aria-busy="true">Zapisywanie...</Button>
```

**Semantic HTML:**

- Używać `<button>` nie `<div>` dla przycisków
- `<form>` dla formularzy
- `<nav>` dla nawigacji
- Headings hierarchy (H1 → H2 → H3)

**Kontrast kolorów:**

- Tekst na tle: minimum 4.5:1
- Wykorzystać Shadcn/ui defaults (już spełnia)
- Testować z narzędziami (Chrome DevTools, axe)

**Screen readers:**

- Testować z NVDA (Windows) lub VoiceOver (Mac)
- Alt texts (jeśli będą obrazy)
- Skip to main content link (opcjonalnie)

### 11.2 Implementacja w komponentach

**Modal:**

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-labelledby="modal-title" aria-describedby="modal-desc">
    <DialogTitle id="modal-title">Dodaj fiszkę</DialogTitle>
    <DialogDescription id="modal-desc">Wprowadź pytanie i odpowiedź dla nowej fiszki</DialogDescription>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Przyciski z loading:**

```tsx
<Button disabled={loading} aria-busy={loading} aria-live="polite">
  {loading ? "Zapisywanie..." : "Zapisz"}
</Button>
```

---

## 12. Definicje typów

### 12.1 Flashcard types

```typescript
// src/types.ts (rozszerzyć istniejące)

export interface Flashcard {
  id: number;
  user_id: string;
  generation_id: number | null;
  question: string;
  answer: string;
  source: "manual" | "ai-full" | "ai-edited";
  created_at: string;
  updated_at: string;
}

export interface ProposalFlashcard {
  id: string; // temporary ID (frontend only)
  question: string;
  answer: string;
  source: "ai-full" | "ai-edited";
  selected: boolean; // for checkbox
  editing: boolean; // for inline edit mode
}

export interface CreateFlashcardDTO {
  question: string;
  answer: string;
  source: "manual" | "ai-full" | "ai-edited";
  generation_id?: number;
}

export interface UpdateFlashcardDTO {
  question?: string;
  answer?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### 12.2 Generation types

```typescript
export interface Generation {
  id: number;
  user_id: string;
  model: string;
  source_text_length: number;
  source_text_hash: string;
  generated_count: number;
  generation_duration: number;
  created_at: string;
  updated_at: string;
}

export interface GenerateFlashcardsResponse {
  generation: Generation & {
    flashcards_proposals: ProposalFlashcard[];
  };
}
```

---

## 13. Notatki końcowe

### 13.1 Co NIE jest w MVP (przypomnienie)

- Autentykacja (default user ID w backend)
- Panel użytkownika
- Statystyki
- Search/filtry zaawansowane
- Multi-select
- Sesja powtórek
- Mobile responsive (desktop-only)
- Dark mode
- Internationalization (i18n)
- Analytics
- Error logging (external service)

### 13.2 Tech debt / Future improvements

- React Query zamiast Context API (lepszy cache + sync)
- Zustand jeśli state rośnie
- Virtualizacja dla bardzo długich list (react-window)
- Debounced auto-save dla edycji
- Undo/Redo dla operacji
- Eksport fiszek (CSV, Anki format)
- Import fiszek
- Rich text editor dla odpowiedzi (markdown)
- Obrazy w fiszkach
- Tagi/kategorie
- Foldery/decks

### 13.3 Performance considerations

- Code splitting per route (Astro automatic)
- Lazy load React components (client:visible, client:idle)
- Optimize images (jeśli będą)
- Prefetch next page data (on hover pagination)
- Debounce character counter update (minor)
- Memoize expensive computations (React.memo, useMemo)

### 13.4 Security considerations

- Input sanitization (backend handles, ale frontend też może strip XSS)
- CSRF protection (Supabase handles)
- Rate limiting (backend/Supabase)
- SQL injection prevention (Supabase ORM)
- Validate wszystkie inputs (zod schemas)

---

## Podsumowanie

Ten dokument definiuje kompletną architekturę UI dla MVP aplikacji 10x Cards. Zawiera:

✅ **2 główne widoki** (generowanie + lista)  
✅ **6-8 głównych komponentów** React  
✅ **Jasny flow użytkownika** dla wszystkich operacji  
✅ **Określone komponenty** Shadcn/ui  
✅ **Strategię error handling** i loading states  
✅ **File structure** i organizację kodu  
✅ **Plan implementacji** z milestones  
✅ **Testing checklist**  
✅ **Accessibility guidelines**

**Czas implementacji:** 8-12 dni roboczych

**Gotowe do implementacji:** ✅

---

**Wersja dokumentu:** 1.0  
**Data:** 2025-10-13  
**Autor:** AI Assistant (na podstawie wymagań i dyskusji)

# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Aplikacja 10x-cards to webowa platforma do generowania i zarządzania fiszkami edukacyjnymi z wykorzystaniem AI. Architektura UI została zaprojektowana wokół dwóch głównych przepływów użytkownika:

1. **Generowanie fiszek z AI** - użytkownik dostarcza tekst źródłowy, system generuje propozycje, użytkownik przegląda i akceptuje wybrane fiszki
2. **Zarządzanie fiszkami** - użytkownik przegląda, edytuje, usuwa i ręcznie tworzy nowe fiszki

Interfejs skupia się na prostocie i efektywności, eliminując zbędne elementy i koncentrując się na kluczowych funkcjonalnościach MVP.

## 2. Lista widoków

### 2.1 Ekran uwierzytelniania

**Ścieżka:** /login i /register
**Główny cel:**Umożliwienie użytkownikowi logowania oraz rejestracji.
**Kluczowe informacje do wyświetlenia:** Formularze z polami e-mail i hasło; wiadomości o błędach uwierzytelniania.
**Kluczowe komponenty:** Formularz logowania/rejestracji, komponent walidacji, przyciski, komunikaty błędów.
**UX, dostępność i bezpieczeństwo:** Prosty formularz, czytelne komunikaty błędów, obsługa klawiatury, zabezpieczenia JWT.

### 2.2 Widok generowania fiszek

**Ścieżka:** `/generate`  
**Główny cel:** Umożliwia użytkownikowi generowanie propozycji fiszek przez AI i ich rewizję (zaakceptuj, edytuj lub odrzuć).

**Kluczowe informacje do wyświetlenia:**

- Formularz z polem tekstowym (1000-10000 znaków)
- Licznik znaków z walidacją wizualną
- Lista wygenerowanych propozycji fiszek
- Status każdej propozycji (zaznaczona/odrzucona)
- Licznik zaznaczonych propozycji

**Kluczowe komponenty:**

Komponent wejścia tekstowego, przycisk "Generuj fiszki", lista fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), wskaźnik ładowania (skeleton), komunikaty o błędach.

**Stany widoku:**

1. **Początkowy** - pusty formularz, brak propozycji
2. **Generowanie** - formularz zablokowany, skeleton loader propozycji
3. **Wygenerowane** - formularz read-only, propozycje do przeglądu
4. **Błąd** - formularz edytowalny, komunikat o błędzie

### 2.2 Widok listy fiszek

**Ścieżka:** `/flashcards`  
**Główny cel:** Przeglądanie, usuwanie i zarządzanie zapisanymi fiszkami

**Kluczowe informacje do wyświetlenia:**

- Lista wszystkich fiszek użytkownika
- Dla każdej fiszki: pytanie, odpowiedź, źródło (badge), data utworzenia

**Kluczowe komponenty:**

- **Header sekcji**
  - Tytuł widoku z licznikiem fiszek
  - Przycisk "Dodaj fiszkę" (otwiera modal)
  - Toggle przełączania widoku (lista/kafelki)
- **Lista/Grid fiszek**
  - Widok lista: vertical stack, 1 fiszka per row
  - Widok kafelki: responsive grid (1-3 kolumny zależnie od szerokości)
  - Każda karta fiszki zawiera: pytanie, odpowiedź (skrócone), badge źródła, timestamp, przyciski akcji
- **Empty state** (gdy brak fiszek)
  - Komunikat powitalny
  - CTA: Generuj z AI / Dodaj fiszkę ręcznie
- **Paginacja**
  - Nawigacja między stronami
  - Informacja o aktualnej stronie i liczbie stron
- **Modal dodawania/edycji fiszki**
  - Formularz z polami: pytanie, odpowiedź
  - Walidacja (długość, wymagane pola)
  - Character counter dla każdego pola
- **Dialog potwierdzenia usunięcia**
  - Wyświetlenie pytania usuwanej fiszki
  - Ostrzeżenie o nieodwracalności operacji

**Stany widoku:**

1. **Loading** - skeleton loader podczas ładowania
2. **Lista z danymi** - wyświetlenie fiszek
3. **Empty state** - brak fiszek
4. **Błąd ładowania** - komunikat o problemie z pobraniem danych

**UX, dostępność i bezpieczeństwo:**

- Paginacja zapobiega problemom z wydajnością przy dużej liczbie fiszek
- Toggle widoku zapisywany w localStorage (preferencje użytkownika)
- Truncate długich tekstów w kartach (max 2-3 linie)
- Optimistic updates dla usuwania (natychmiastowy feedback)
- Potwierdzenie przed usunięciem (dialog)
- Modal z focus trap i ESC do zamknięcia
- Auto-focus na pierwszym polu formularza
- Walidacja przed zapisem
- Keyboard navigation

**Mapowanie do API:**

- `GET /api/flashcards?page=X&limit=50` - lista fiszek
- `POST /api/flashcards` - tworzenie nowej fiszki
- `PATCH /api/flashcards/:id` - edycja fiszki
- `DELETE /api/flashcards/:id` - usunięcie fiszki

---

### 2.3 Strona 404

**Ścieżka:** `/404` (catch-all)  
**Główny cel:** Informowanie użytkownika o nieistniejącej stronie i umożliwienie nawigacji

**Kluczowe informacje:**

- Komunikat "Strona nie znaleziona"
- Linki do głównych sekcji aplikacji

**Kluczowe komponenty:**

- Centered layout z komunikatem
- Przyciski nawigacji: Strona główna, Moje fiszki

---

## 3. Mapa podróży użytkownika

### 3.1 Główny przepływ: Generowanie fiszek z AI

```
[Start: /]
  ↓
[Użytkownik wkleja tekst (1000-10000 znaków)]
  ↓
[Walidacja długości - licznik znaków pokazuje status]
  ↓
[Kliknięcie "Generuj fiszki"]
  ↓
[Loading state - skeleton loader + komunikat oczekiwania]
  ↓
[Otrzymanie propozycji od AI]
  ↓
[Przegląd listy propozycji]
  ├─ [Edycja wybranych propozycji inline]
  ├─ [Odznaczenie niepotrzebnych propozycji]
  └─ [Pozostawienie bez zmian]
  ↓
[Kliknięcie "Zapisz wybrane fiszki (X)"]
  ↓
[Zapisanie do bazy danych]
  ↓
[Toast sukcesu + link "Zobacz listę"]
  ↓
[Opcjonalnie: Przejście do /flashcards] lub [Reset formularza]
```

**Alternatywne ścieżki:**

- **Błąd generowania:** Alert z opisem błędu → Możliwość ponowienia próby
- **Anulowanie propozycji:** Przycisk "Anuluj" → Collapse sekcji → Reset formularza
- **Błąd zapisu:** Toast błędu → Propozycje pozostają → Możliwość ponowienia

### 3.2 Przepływ: Ręczne tworzenie fiszki

```
[Start: /flashcards]
  ↓
[Kliknięcie "+ Dodaj fiszkę"]
  ↓
[Otwarcie modalu z formularzem]
  ↓
[Wypełnienie pól: pytanie, odpowiedź]
  ↓
[Walidacja inline (character counter, wymagane pola)]
  ↓
[Kliknięcie "Zapisz"]
  ↓
[POST /api/flashcards]
  ↓
[Zamknięcie modalu + Toast sukcesu]
  ↓
[Odświeżenie listy fiszek]
```

**Alternatywne ścieżki:**

- **Błąd walidacji:** Inline errors pod polami → Poprawienie danych
- **Anulowanie:** Przycisk "Anuluj" lub ESC → Zamknięcie modalu (z konfirmacją jeśli są zmiany)
- **Błąd zapisu:** Toast błędu → Modal pozostaje otwarty

### 3.3 Przepływ: Edycja fiszki

```
[Start: /flashcards - lista fiszek]
  ↓
[Kliknięcie "Edytuj" na wybranej fiszce]
  ↓
[Otwarcie modalu z pre-wypełnionymi danymi]
  ↓
[Modyfikacja pytania/odpowiedzi]
  ↓
[Kliknięcie "Zapisz"]
  ↓
[PATCH /api/flashcards/:id]
  ↓
[Zamknięcie modalu + Toast sukcesu]
  ↓
[Aktualizacja fiszki na liście]
```

### 3.4 Przepływ: Usuwanie fiszki

```
[Start: /flashcards - lista fiszek]
  ↓
[Kliknięcie "Usuń" na wybranej fiszce]
  ↓
[Dialog potwierdzenia z podglądem pytania]
  ↓
[Potwierdzenie usunięcia]
  ↓
[Optimistic update - fiszka znika z UI]
  ↓
[DELETE /api/flashcards/:id]
  ↓
[Success: Toast sukcesu] lub [Error: Rollback + Toast błędu]
```

### 3.5 Przepływ: Paginacja

```
[Start: /flashcards - aktualna strona N]
  ↓
[Kliknięcie "Następna" lub numeru strony]
  ↓
[Skeleton overlay podczas ładowania]
  ↓
[GET /api/flashcards?page=N+1]
  ↓
[Aktualizacja URL: /flashcards?page=N+1]
  ↓
[Wyświetlenie nowych fiszek]
```

### 3.6 Przypadki brzegowe

**Generowanie:**

- Tekst < 1000 znaków → Przycisk disabled + czerwony licznik
- Tekst > 10000 znaków → Przycisk disabled + czerwony licznik + komunikat
- Timeout AI (>30s) → Alert błędu + możliwość ponowienia
- AI zwraca 0 propozycji → Komunikat informacyjny

**Lista fiszek:**

- Brak fiszek → Empty state z CTA
- Ostatnia fiszka na stronie usunięta → Redirect do poprzedniej strony
- Błąd ładowania → Komunikat z przyciskiem "Spróbuj ponownie"

**Operacje CRUD:**

- Duplikat pytania → Ostrzeżenie ale możliwość zapisu (backend nie blokuje)
- Utrata połączenia podczas operacji → Toast błędu + rollback (jeśli optimistic)

---

## 4. Układ i struktura nawigacji

### 4.1 Główna nawigacja (Navbar)

**Struktura:**

```
┌────────────────────────────────────────────┐
│ [10x Cards]  Generuj fiszki | Moje fiszki  │
└────────────────────────────────────────────┘
```

**Elementy:**

- **Logo/Nazwa aplikacji** (po lewej) - link do `/`
- **Linki menu:**
  - "Generuj fiszki" → `/`
  - "Moje fiszki" → `/flashcards`
- **Active state** - wizualne wskazanie aktywnej strony (underline/bold)

**Charakterystyka:**

- Sticky navbar (zawsze widoczny podczas scroll)
- Centered max-width container
- Brak menu użytkownika (brak autentykacji w MVP)
- Responsywne (desktop-first)

### 4.4 Przepływy nawigacyjne

**Z widoku generowania → lista fiszek:**

1. Kliknięcie "Moje fiszki" w navbar
2. Kliknięcie "Zobacz listę" w toast po zapisaniu fiszek

**Z listy fiszek → widok generowania:**

1. Kliknięcie "Generuj fiszki" w navbar
2. Kliknięcie "Generuj z AI" w empty state

**Wewnątrz widoku listy:**

- Paginacja: zmiana strony bez pełnego reload (SPA behavior w React)
- Toggle widoku: zmiana bez nawigacji (localStorage)
- Modals: overlay bez zmiany URL

---

## 5. Kluczowe komponenty

### 5.1 Komponenty layoutu

**Navbar**

- Występuje: We wszystkich widokach
- Odpowiedzialność: Główna nawigacja, branding
- Kluczowe cechy: Sticky positioning, active states, responsive

**Layout wrapper**

- Występuje: Opakowuje wszystkie widoki
- Odpowiedzialność: Wspólny layout, max-width, padding, meta tags
- Kluczowe cechy: Centered content, consistent spacing

### 5.2 Komponenty formularzy

**Textarea z walidacją**

- Występuje: Widok generowania, modals edycji/dodawania
- Odpowiedzialność: Input tekstu, walidacja długości, character counter
- Stany: Idle, focus, error, disabled
- Integracja: React Hook Form + Zod validation

**Character counter**

- Występuje: Przy textarea
- Odpowiedzialność: Real-time feedback o długości tekstu
- Kolory: Szary (poniżej min), zielony (ok), czerwony (przekroczenie)

**Modal formularza**

- Występuje: Dodawanie/edycja fiszki
- Odpowiedzialność: CRUD operations w overlay
- Kluczowe cechy: Focus trap, ESC close, auto-focus, validation

### 5.3 Komponenty wyświetlania danych

**Karta fiszki**

- Występuje: Lista i grid fiszek
- Odpowiedzialność: Wyświetlenie pojedynczej fiszki
- Warianty: List view, Grid view
- Elementy: Pytanie, odpowiedź (truncated), badge źródła, timestamp, akcje

**Karta propozycji**

- Występuje: Widok generowania po wygenerowaniu
- Odpowiedzialność: Wyświetlenie i edycja propozycji
- Stany: Read-only, Edit mode
- Elementy: Checkbox, badge, pytanie, odpowiedź, przyciski akcji

**Badge źródła**

- Występuje: Karty fiszek i propozycji
- Odpowiedzialność: Wizualne oznaczenie źródła fiszki
- Warianty: "AI" (niebieski), "AI edytowane" (fioletowy), "Ręczne" (szary)

### 5.4 Komponenty nawigacyjne i interakcyjne

**Paginacja**

- Występuje: Lista fiszek
- Odpowiedzialność: Nawigacja między stronami
- Elementy: Poprzednia, numery stron, Następna
- Cechy: Deep linking, disabled states, keyboard nav

**Toggle widoku**

- Występuje: Header listy fiszek
- Odpowiedzialność: Przełączanie lista/kafelki
- Stan: Zapisywany w localStorage

**Dialog potwierdzenia**

- Występuje: Przed usunięciem fiszki
- Odpowiedzialność: Uniknięcie przypadkowego usunięcia
- Cechy: Wyświetla podgląd fiszki, jasne akcje

### 5.5 Komponenty feedbacku

**Toast notifications**

- Występuje: Po wszystkich operacjach CRUD i błędach
- Odpowiedzialność: Non-blocking feedback
- Typy: Success (zielony), Error (czerwony), Info (niebieski)
- Cechy: Auto-dismiss (5s), closeable, akcje opcjonalne

**Inline alerts**

- Występuje: Błędy generowania, błędy ładowania listy
- Odpowiedzialność: Blocking feedback dla krytycznych błędów
- Cechy: W miejscu problemu, z akcją naprawczą

**Loading states**

- Skeleton loaders: Lista fiszek, propozycje podczas generowania
- Spinners: Przyciski podczas operacji
- Overlay: Paginacja podczas ładowania nowej strony

**Empty state**

- Występuje: Lista fiszek gdy brak danych
- Odpowiedzialność: Onboarding nowych użytkowników
- Cechy: Ikona, komunikat, 2 CTA (Generuj/Dodaj)

---

## 6. Względy projektowe

### 6.1 Obsługa błędów

**Strategia wielopoziomowa:**

1. **Walidacja preventive** - blokowanie nieprawidłowych akcji (disabled buttons)
2. **Inline errors** - błędy walidacji formularzy, błędy generowania
3. **Toast notifications** - błędy operacji CRUD, błędy sieciowe
4. **Error boundary** - nieoczekiwane błędy runtime

**Mapowanie błędów API:**

- 400 Bad Request → "Nieprawidłowe dane"
- 401 Unauthorized → "Sesja wygasła" (przyszłość)
- 403 Forbidden → "Brak uprawnień"
- 404 Not Found → "Nie znaleziono"
- 422 Unprocessable Entity → "AI zwróciło nieprawidłową odpowiedź"
- 429 Too Many Requests → "Zbyt wiele żądań, spróbuj za chwilę"
- 500 Internal Server Error → "Błąd serwera"
- 503 Service Unavailable → "Usługa AI niedostępna"

### 6.2 Loading states

**Zasady:**

- Każda operacja asynchroniczna ma widoczny loading state
- Skeleton loaders dla content (lepsze UX niż spinner)
- Spinners dla akcji użytkownika (przyciski)
- Disabled states podczas operacji (zapobieganie double-submit)

### 6.3 Dostępność (a11y)

**Keyboard navigation:**

- Tab: przechodzenie między elementami
- Enter: aktywacja przycisków
- Space: toggle checkboxów
- Escape: zamykanie modali

**ARIA:**

- Labels dla wszystkich interaktywnych elementów
- Role attributes dla custom components
- Live regions dla dynamicznych komunikatów
- Busy states dla loading

**Focus management:**

- Widoczne focus states (ring)
- Focus trap w modalach
- Auto-focus na pierwszym polu
- Przywrócenie focus po zamknięciu modala

**Semantic HTML:**

- Właściwe tagi (button, form, nav)
- Hierarchia headings (H1 → H2 → H3)
- Alt texts dla obrazów (jeśli będą)

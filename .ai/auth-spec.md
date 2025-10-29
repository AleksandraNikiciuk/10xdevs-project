# Specyfikacja techniczna modułu autentykacji - 10x-cards

## 1. Architektura interfejsu użytkownika

### 1.1. Nowe strony (Astro)

- **`/login`**: Strona logowania. Będzie zawierać komponent React `LoginForm`. Dostępna tylko dla niezalogowanych użytkowników. Zalogowani zostaną przekierowani do `/generate`.
- **`/register`**: Strona rejestracji. Będzie zawierać komponent React `RegisterForm`. Dostępna tylko dla niezalogowanych użytkowników. Zalogowani zostaną przekierowani do `/generate`.
- **`/reset-password`**: Strona do resetowania hasła. Będzie zawierać komponent React `ResetPasswordForm`.

### 1.2. Nowe komponenty (React)

- **`LoginForm.tsx`**:
  - Odpowiedzialność: Formularz logowania z polami "Email" i "Hasło".
  - Walidacja (client-side): Sprawdzenie formatu emaila i minimalnej długości hasła.
  - Komunikacja: Wysyła dane do endpointu `/api/auth/login`.
  - Obsługa błędów: Wyświetla komunikaty o błędach zwrócone przez API (np. "Nieprawidłowe dane logowania").
  - Scenariusze:
    - Sukces: Przekierowanie na stronę `/generate`.
    - Błąd: Wyświetlenie komunikatu pod formularzem.
- **`RegisterForm.tsx`**:
  - Odpowiedzialność: Formularz rejestracji z polami "Email", "Hasło" i "Powtórz hasło".
  - Walidacja (client-side): Sprawdzenie formatu emaila, minimalnej długości hasła i zgodności haseł.
  - Komunikacja: Wysyła dane do endpointu `/api/auth/register`.
  - Obsługa błędów: Wyświetla komunikaty o błędach (np. "Użytkownik o tym adresie email już istnieje").
  - Scenariusze:
    - Sukces: Wyświetlenie komunikatu o konieczności potwierdzenia adresu e-mail. Po kliknięciu w link weryfikacyjny w mailu, użytkownik zostaje zalogowany i przekierowany na stronę `/generate`.
- **`ResetPasswordForm.tsx`**:
  - Odpowiedzialność: Formularz do wysyłania linku do resetowania hasła.
  - Komunikacja: Wywołuje funkcję `supabase.auth.resetPasswordForEmail()`.

### 1.3. Modyfikacja istniejących elementów

- **`Layout.astro`**:
  - Logika warunkowa w nawigacji:
    - **Niezalogowany użytkownik**: Widoczne linki "Generator", "Zaloguj się" i "Zarejestruj się".
    - **Zalogowany użytkownik**: Widoczne linki "Generator", "Moje fiszki" oraz przycisk "Wyloguj się".
  - Przycisk "Wyloguj się" będzie formularzem POST wysyłającym żądanie do `/api/auth/logout`.
- **`FlashcardsView.tsx` i `FlashcardList.tsx`**:
  - Te komponenty nie wymagają bezpośrednich zmian, ponieważ ochrona trasy `/flashcards` odbędzie się na poziomie middleware'u Astro. Komponenty będą renderowane tylko dla zalogowanych użytkowników.
- **Komponenty na stronie `/generate`**:
  - Komponenty odpowiedzialne za generowanie i wyświetlanie propozycji fiszek muszą obsługiwać dwa stany:
  - **Niezalogowany użytkownik**: Może wygenerować fiszki. Próba ich zapisu powinna skutkować wyświetleniem monitu o konieczności zalogowania się lub rejestracji.
  - **Zalogowany użytkownik**: Może generować i zapisywać fiszki bezpośrednio na swoim koncie.

## 2. Logika backendowa

### 2.1. Middleware

- **`src/middleware/index.ts`**:
  - Będzie przechwytywać wszystkie żądania przychodzące do aplikacji.
  - Sprawdzi obecność i ważność tokenu sesji (ciasteczka) przy użyciu Supabase Client.
  - Na chronionych ścieżkach (`/flashcards`, `/manual-create`):
    - Jeśli użytkownik jest niezalogowany, nastąpi przekierowanie (`302`) do `/login`.
    - Jeśli użytkownik jest zalogowany, żądanie zostanie przepuszczone dalej, a dane użytkownika zostaną dodane do `Astro.locals` w celu udostępnienia ich na renderowanych stronach.
  - Na ścieżkach publicznych (`/login`, `/register`):
    - Jeśli użytkownik jest zalogowany, nastąpi przekierowanie do `/generate`.
  - Strona `/generate` jest publicznie dostępna, zgodnie z historyjką US-003. Middleware nie będzie blokować do niej dostępu dla niezalogowanych użytkowników.

### 2.2. Nowe endpointy API (Astro)

Endpointy będą umieszczone w `src/pages/api/auth/`.

- **`POST /api/auth/login`**:
  - Przyjmuje `email` i `password` w ciele żądania.
  - Walidacja (server-side): Użycie biblioteki Zod do walidacji danych wejściowych.
  - Logika: Wywołuje `supabase.auth.signInWithPassword()`.
  - Odpowiedzi:
    - `200 OK`: Sukces, sesja została utworzona (Supabase automatycznie ustawia ciasteczka).
    - `400 Bad Request`: Błąd walidacji danych.
    - `401 Unauthorized`: Nieprawidłowe dane logowania.
- **`POST /api/auth/register`**:
  - Przyjmuje `email` i `password`.
  - Walidacja (server-side): Sprawdzenie formatu emaila i wymagań dotyczących hasła (Zod).
  - Logika: Wywołuje `supabase.auth.signUp()`. Supabase domyślnie wyśle e-mail z linkiem potwierdzającym.
  - Odpowiedzi:
    - `201 Created`: Użytkownik został utworzony, oczekuje na potwierdzenie e-mail.
    - `400 Bad Request`: Błąd walidacji.
    - `409 Conflict`: Użytkownik o podanym adresie e-mail już istnieje.
- **`POST /api/auth/logout`**:
  - Logika: Wywołuje `supabase.auth.signOut()`.
  - Odpowiedzi:
    - `302 Found`: Przekierowanie na stronę główną (`/`) po wylogowaniu.

### 2.3. Renderowanie stron (SSR)

- Dzięki `output: "server"` i middleware, strony takie jak `flashcards.astro` będą mogły bezpiecznie uzyskać dostęp do danych zalogowanego użytkownika z `Astro.locals.user`. Pozwoli to na pobieranie danych specyficznych dla użytkownika (np. jego fiszek) po stronie serwera przed wyrenderowaniem strony.

## 3. System autentykacji (Integracja z Supabase)

### 3.1. Konfiguracja

- Klucze `SUPABASE_URL` i `SUPABASE_ANON_KEY` będą przechowywane w zmiennych środowiskowych (`.env`).
- Klient Supabase (`src/db/supabase.client.ts`) zostanie zainicjowany raz i będzie reużywany w całej aplikacji. Utworzymy serwerowego klienta Supabase, który będzie mógł operować na ciasteczkach w kontekście serwera.

### 3.2. Przepływ autentykacji

1.  Użytkownik wypełnia formularz logowania/rejestracji w komponencie React.
2.  Komponent wysyła żądanie `POST` do odpowiedniego endpointu API Astro (`/api/auth/...`).
3.  Endpoint API Astro wywołuje odpowiednią metodę z Supabase Auth SDK (`signInWithPassword`, `signUp`).
4.  Supabase Auth obsługuje logikę uwierzytelniania, generuje token JWT i ustawia go w ciasteczku `httpOnly` w odpowiedzi.
5.  Frontend otrzymuje odpowiedź o sukcesie i przekierowuje użytkownika na odpowiednią stronę.
6.  Przy kolejnych żądaniach do chronionych stron, middleware Astro weryfikuje ciasteczko sesji z Supabase.

### 3.3. Odzyskiwanie hasła

- Proces ten będzie w całości zarządzany przez Supabase.
- Formularz na stronie `/reset-password` wywoła `supabase.auth.resetPasswordForEmail()`.
- Supabase wyśle e-mail do użytkownika z linkiem do ustawienia nowego hasła na stronie hostowanej przez Supabase.

# Cloudflare Pages Deployment Guide

## Problem rozwiązany w tym commit

Aplikacja nie działała na produkcji (Cloudflare Pages) z błędem 500 podczas rejestracji, logowania i generowania fiszek. Wszystkie operacje wymagające zmiennych środowiskowych były niefunkcjonalne.

### Przyczyna

Z flagą `disable_nodejs_process_v2` w Cloudflare Workers/Pages:

- Zmienne środowiskowe NIE są dostępne przez `process.env` ani `import.meta.env` w runtime
- Kod próbował odczytać zmienne podczas importu modułów, co nie działa na Cloudflare
- Zmienne w Cloudflare Pages są dostępne tylko przez `context.locals.runtime.env`

### Rozwiązanie

1. **Refactoring Supabase Client** - zmieniono z globalnych instancji na factory functions
2. **Refactoring OpenRouter Service** - konstruktor przyjmuje API key jako parametr
3. **Middleware** - tworzy klientów Supabase używając `runtime.env` na produkcji
4. **API Endpoints** - przekazują zmienne z `locals.runtime.env` do serwisów

## Konfiguracja zmiennych środowiskowych

### Produkcja (Cloudflare Pages)

Zmienne są już dodane w Cloudflare Dashboard:

- **Workers & Pages** → **10xdevs-project** → **Settings** → **Variables and Secrets** → **Production**

Wymagane zmienne:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`

⚠️ **WAŻNE:** Po każdej zmianie zmiennych środowiskowych musisz zrobić **re-deploy** (Retry deployment).

### Development (lokalny)

#### Opcja 1: `.env` (dla `astro dev`)

```bash
cp .env.example .env
# Wypełnij wartości w .env
npm run dev
```

#### Opcja 2: `.dev.vars` (dla `wrangler pages dev`)

```bash
cp .dev.vars.example .dev.vars
# Wypełnij wartości w .dev.vars
npm run build
npx wrangler pages dev ./dist
```

## Jak działa teraz aplikacja

### W Development

- Używa `import.meta.env` z plików `.env`
- Fallback do legacy `process.env`
- Kompatybilne z Astro dev server

### Na Produkcji (Cloudflare)

- Middleware pobiera zmienne z `context.locals.runtime.env`
- Tworzy klientów Supabase dynamicznie z tymi zmiennymi
- Przekazuje `OPENROUTER_API_KEY` do serwisów AI

## Zmiany w kodzie

### Pliki zmodyfikowane:

1. **`src/db/supabase.client.ts`**
   - Dodano `createSupabaseClient()` i `createSupabaseAdmin()` factory functions
   - Zachowano legacy exports dla kompatybilności wstecznej

2. **`src/lib/services/openrouter.service.ts`**
   - Konstruktor przyjmuje opcjonalny `apiKey` parametr
   - Fallback do env vars jeśli nie podano

3. **`src/lib/services/generation.service.ts`**
   - Funkcja `createGeneration()` przyjmuje `openrouterApiKey` parametr
   - Przekazuje go do `OpenRouterService`

4. **`src/middleware/index.ts`**
   - Tworzy Supabase client z `context.locals.runtime.env` na produkcji
   - Fallback do legacy client w development

5. **`src/pages/api/generations.ts`**
   - Pobiera `OPENROUTER_API_KEY` z `locals.runtime.env`
   - Przekazuje do `createGeneration()`

6. **`src/pages/api/auth/*.ts`**
   - Używają `locals.supabase` zamiast importowanego `supabaseAdmin`

7. **`src/pages/flashcards.astro`**
   - Używa `Astro.locals.supabase` zamiast importowanego client

8. **`src/env.d.ts`**
   - Dodano typ `runtime.env` do `App.Locals`

9. **`wrangler.jsonc`**
   - Naprawiono trailing comma (błąd parsowania)

## Deployment

### Automatyczny deployment (GitHub)

Każdy push do `master` branch automatycznie deployuje na Cloudflare Pages.

### Sprawdzanie logów

1. Idź do **Cloudflare Dashboard**
2. **Workers & Pages** → **10xdevs-project** → **Deployments**
3. Kliknij na najnowszy deployment
4. Zobacz **Functions logs** dla real-time logów

### Testowanie po deployment

1. Otwórz aplikację na produkcji
2. Sprawdź:
   - ✅ Rejestracja nowego użytkownika
   - ✅ Logowanie
   - ✅ Generowanie fiszek z tekstu
   - ✅ Lista fiszek

## Troubleshooting

### Nadal błąd 500?

1. Sprawdź **Functions logs** w Cloudflare Dashboard
2. Upewnij się że wszystkie 4 zmienne są ustawione w Production
3. Zrób **Retry deployment** po dodaniu zmiennych

### Błąd "OPENROUTER_API_KEY is not set"?

Oznacza to że:

- Zmienna nie jest ustawiona w Cloudflare, LUB
- Nie zrobiono re-deploy po dodaniu zmiennej

### Błąd Supabase connection?

Sprawdź czy zmienne Supabase są prawidłowe:

- `SUPABASE_URL` - powinien zawierać pełny URL (https://xxx.supabase.co)
- `SUPABASE_KEY` - anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - service role key (secret)

## Dodatkowe informacje

### Flaga `disable_nodejs_process_v2`

Ta flaga jest ustawiona **świadomie** w `wrangler.jsonc`. Dzięki niej:

- Aplikacja jest bardziej kompatybilna z Cloudflare Workers runtime
- Kod jest bardziej explicitly przystosowany do serverless environment
- Zmniejsza ryzyko nieoczekiwanych zachowań związanych z `process.env`

### Kompatybilność wsteczna

Wszystkie zmiany zachowują kompatybilność wsteczną:

- Development mode działa jak wcześniej
- Testy działają bez zmian
- Legacy exports są dostępne

## Dalsze kroki (opcjonalne)

1. **Monitoring** - dodaj Cloudflare Analytics/Logging
2. **Secrets rotation** - regularnie zmieniaj klucze API
3. **Environment-specific configs** - rozważ separate configs dla staging

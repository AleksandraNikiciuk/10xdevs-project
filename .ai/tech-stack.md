Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:

- GithubActions do tworzenia pipelin'ów CI/CD
- Cloudflare Pages jako hosting aplikacji Astro

Testy jednostkowe:

- Vitest jako szybki framework testowy integrujący się z Vite (używanym przez Astro)
- Testing Library do testowania komponentów React z perspektywy użytkownika
- @testing-library/user-event do symulacji zaawansowanych interakcji użytkownika
- MSW (Mock Service Worker) do mockowania żądań API na poziomie sieci
- @faker-js/faker do generowania realistycznych danych testowych
- @vitest/coverage-v8 do generowania raportów pokrycia kodu testami

Testy E2E:

- Playwright do testów End-to-End w różnych przeglądarkach (Chromium, Firefox, WebKit)
- @axe-core/playwright do automatycznych testów dostępności (a11y)
- Możliwość rozszerzenia o Storybook do izolowanego rozwoju komponentów UI i visual testing

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD i automatycznego uruchamiania testów
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker

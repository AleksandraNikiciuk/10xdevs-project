# Cloudflare Pages Deployment

## Konfiguracja

Projekt został skonfigurowany do automatycznego wdrożenia na Cloudflare Pages za pomocą GitHub Actions.

### Instalacja zależności

Po przełączeniu z `@astrojs/node` na `@astrojs/cloudflare`, wykonaj:

```bash
npm install
```

To zainstaluje nowy adapter Cloudflare oraz zaktualizuje wszystkie zależności.

### Wrangler Configuration (WAŻNE!)

Projekt zawiera `wrangler.jsonc` z flagą `disable_nodejs_process_v2` aby naprawić problem `[object Object]` na Cloudflare Pages.

**Problem:** Od compatibility date `2025-09-15`, Cloudflare domyślnie włącza `enable_nodejs_process_v2` który powoduje konflikt z Astro.

**Rozwiązanie:** Flaga `disable_nodejs_process_v2` w `wrangler.jsonc` wyłącza problematyczną implementację.

Zobacz: [Astro Issue #14511](https://github.com/withastro/astro/issues/14511)

### Adapter Astro

Projekt wykorzystuje `@astrojs/cloudflare` adapter dla kompatybilności z Cloudflare Pages:

```javascript
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
```

### Wymagane zmienne środowiskowe

#### GitHub Secrets

Ustaw następujące sekrety w ustawieniach repozytorium GitHub (Settings → Secrets and variables → Actions):

**Cloudflare:**

- `CLOUDFLARE_API_TOKEN` - Token API z uprawnieniami do edycji Cloudflare Pages
  - Jak utworzyć: Cloudflare Dashboard → My Profile → API Tokens → Create Token
  - Wybierz template "Edit Cloudflare Workers" lub utwórz własny z uprawnieniami:
    - Account - Cloudflare Pages: Edit
- `CLOUDFLARE_ACCOUNT_ID` - ID konta Cloudflare
  - Znajdziesz w: Cloudflare Dashboard → Workers & Pages → Overview (prawy panel)

**Supabase:**

- `PUBLIC_SUPABASE_URL` - Publiczny URL projektu Supabase
- `PUBLIC_SUPABASE_ANON_KEY` - Publiczny klucz anon projektu Supabase
- `SUPABASE_URL` - URL projektu Supabase (może być taki sam jak PUBLIC_SUPABASE_URL)
- `SUPABASE_KEY` - Klucz API projektu Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Klucz Service Role projektu Supabase (tylko dla operacji backendu)

**OpenRouter:**

- `OPENROUTER_API_KEY` - Klucz API do OpenRouter.ai

#### Cloudflare Pages Environment Variables

Po pierwszym wdrożeniu, skonfiguruj również zmienne środowiskowe bezpośrednio w Cloudflare Pages:

1. Przejdź do: Cloudflare Dashboard → Workers & Pages → Twój projekt → Settings → Environment variables
2. Dodaj następujące zmienne dla środowiska **Production**:

```
PUBLIC_SUPABASE_URL=<wartość>
PUBLIC_SUPABASE_ANON_KEY=<wartość>
SUPABASE_URL=<wartość>
SUPABASE_KEY=<wartość>
SUPABASE_SERVICE_ROLE_KEY=<wartość>
OPENROUTER_API_KEY=<wartość>
```

### GitHub Actions Workflow

Workflow `.github/workflows/master.yml` wykonuje następujące kroki:

1. **Lint** - Sprawdzenie kodu za pomocą ESLint
2. **Unit Tests** - Uruchomienie testów jednostkowych z pokryciem kodu
3. **Build & Deploy** - Zbudowanie projektu i wdrożenie na Cloudflare Pages (używa `cloudflare/wrangler-action@v3`)
4. **Status Summary** - Utworzenie podsumowania wdrożenia

#### Używane GitHub Actions

- `cloudflare/wrangler-action@v3` - Oficjalna akcja Cloudflare używająca Wrangler CLI:
  - Wdraża projekt na Cloudflare Pages za pomocą `pages deploy`
  - Wspiera zarówno Workers jak i Pages
  - Pełna kontrola nad komendami Wrangler

### Uruchamianie Workflow

Workflow uruchamia się automatycznie:

- Po każdym pushu do gałęzi `master`
- Ręcznie przez GitHub Actions UI (workflow_dispatch)

### Build Configuration

**Output Directory:** `./dist`

- Astro generuje pliki do katalogu `dist/` podczas budowania
- Cloudflare Pages wdraża zawartość tego katalogu

**Node.js Version:**

- Określona w pliku `.nvmrc` w głównym katalogu projektu

### Lokalne testowanie

Przed wdrożeniem możesz przetestować build lokalnie:

```bash
# Zbuduj projekt
npm run build

# Podgląd lokalny (opcjonalnie)
npm run preview
```

### Monitoring i Logi

Po wdrożeniu możesz monitorować aplikację:

1. **Cloudflare Dashboard:** Workers & Pages → Twój projekt
   - Logi deploymentów
   - Metryki wydajności
   - Logi błędów

2. **GitHub Actions:**
   - Historia uruchomień workflow
   - Logi z każdego kroku
   - Artefakty (coverage reports)

### Troubleshooting

**Problem:** Deployment kończy się błędem "API Token not found"

- **Rozwiązanie:** Sprawdź czy `CLOUDFLARE_API_TOKEN` jest poprawnie ustawiony w GitHub Secrets

**Problem:** Błędy związane ze zmiennymi środowiskowymi

- **Rozwiązanie:** Upewnij się, że wszystkie wymagane zmienne są ustawione zarówno w GitHub Secrets jak i w Cloudflare Pages Environment Variables

**Problem:** Aplikacja nie działa poprawnie po wdrożeniu

- **Rozwiązanie:** Sprawdź logi w Cloudflare Dashboard i upewnij się, że wszystkie zmienne środowiskowe są poprawnie skonfigurowane

### Różnice między Cloudflare a DigitalOcean

Poprzednio projekt był wdrażany na DigitalOcean za pomocą Docker i Kubernetes. Główne różnice:

| Aspekt       | Cloudflare Pages     | DigitalOcean (poprzednio)     |
| ------------ | -------------------- | ----------------------------- |
| Deployment   | Bezpośredni z GitHub | Docker Image → Registry → K8s |
| Skalowanie   | Automatyczne         | Manualna konfiguracja         |
| Konfiguracja | Minimalna            | Docker + K8s manifests        |
| Koszty       | Pay-as-you-go        | Stałe (droplets + K8s)        |
| Edge Network | Globalny CDN         | Pojedyncza lokalizacja        |

### Zalecenia

1. **Zawsze testuj lokalnie** przed pushowaniem do master
2. **Monitoruj logi** po pierwszym wdrożeniu
3. **Ustaw limity kosztów** w Cloudflare Dashboard
4. **Regularnie aktualizuj** zależności projektu
5. **Backupuj** konfigurację zmiennych środowiskowych

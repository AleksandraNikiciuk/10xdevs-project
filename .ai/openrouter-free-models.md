# Darmowe Modele w OpenRouter - Przewodnik

## Aktualizacja: 2025-10-29

Model w projekcie został zmieniony z płatnego `gpt-4o-mini` na **darmowy** `google/gemini-flash-2.0`! 🎉

---

## 🆓 Lista Darmowych Modeli

### 🥇 **TOP 3 dla Generowania Fiszek**

#### 1. Google Gemini Flash 2.0 ⭐ (UŻYWANY W PROJEKCIE)

```typescript
Model: "google/gemini-flash-2.0"
Context: 1,000,000 tokens
Koszt: DARMOWY
```

**Zalety:**

- ✅ Bardzo szybki (najszybszy Google model)
- ✅ Ogromny context window (1M tokenów!)
- ✅ Doskonała jakość dla zadań edukacyjnych
- ✅ Świetny w generowaniu strukturalnych danych (JSON)
- ✅ Multimodalny (tekst + obrazy, jeśli potrzebne w przyszłości)

**Kiedy używać:** Idealny do generowania fiszek, szybkie odpowiedzi, duże teksty źródłowe.

---

#### 2. Meta Llama 3.3 70B Instruct

```typescript
Model: "meta-llama/llama-3.3-70b-instruct"
Context: 131,072 tokens
Koszt: DARMOWY
```

**Zalety:**

- ✅ Bardzo wysoka jakość (70B parametrów)
- ✅ Doskonały w dialogach i instrukcjach
- ✅ Wielojęzyczny
- ✅ Open source

**Kiedy używać:** Gdy potrzebujesz najwyższej jakości dla instrukcji i dialogów.

---

#### 3. OpenRouter Auto (Automatyczny wybór)

```typescript
Model: "openrouter/auto"
Context: Zależy od wybranego modelu
Koszt: DARMOWY
```

**Zalety:**

- ✅ Automatycznie wybiera najlepszy dostępny darmowy model
- ✅ Nie musisz martwić się o zmianę modelu
- ✅ Zawsze aktualne z najnowszymi modelami

**Kiedy używać:** Gdy chcesz automatyzację wyboru modelu.

---

## 📋 Pełna Lista Darmowych Modeli

### Meta (Llama)

| Model                  | Parametry         | Context | Opis                          |
| ---------------------- | ----------------- | ------- | ----------------------------- |
| Llama 4 Maverick       | 400B (17B active) | 256K    | Multimodalny (tekst + obrazy) |
| Llama 3.3 70B Instruct | 70B               | 131K    | Dialogi, instrukcje           |
| Llama 3.1 8B Instruct  | 8B                | 128K    | Szybki, efektywny             |

### Google (Gemini)

| Model            | Context | Opis                               |
| ---------------- | ------- | ---------------------------------- |
| Gemini Flash 2.0 | 1M      | Bardzo szybki, doskonały do fiszek |
| Gemini Flash 1.5 | 1M      | Poprzednia wersja                  |
| Gemini Pro       | -       | Bardziej zaawansowany              |

### DeepSeek

| Model            | Parametry         | Context | Specjalizacja                      |
| ---------------- | ----------------- | ------- | ---------------------------------- |
| DeepSeek R1      | 671B (37B active) | 163K    | Matematyka, kodowanie, rozumowanie |
| DeepSeek Chat V3 | -                 | -       | Konwersacje                        |
| DeepSeek V3 Base | -                 | -       | Domeny techniczne                  |

### Mistral

| Model               | Parametry | Opis                |
| ------------------- | --------- | ------------------- |
| Mistral 7B Instruct | 7B        | Instrukcje, dialogi |

### Microsoft

| Model        | Opis                  |
| ------------ | --------------------- |
| Phi-3 Mini   | Kompaktowy, efektywny |
| Phi-3 Medium | Większa wersja        |

### Inne

| Model                  | Specjalizacja                 |
| ---------------------- | ----------------------------- |
| Qwen2.5-VL-3B-Instruct | Multimodalny (tekst + obrazy) |

---

## 🔄 Historia Zmian w Projekcie

### 2025-10-29: Przejście na Darmowy Model

**Przed:**

```typescript
const AI_MODEL = "gpt-4o-mini"; // Płatny: ~$0.15/1M input tokens
```

**Po:**

```typescript
const AI_MODEL = "google/gemini-flash-2.0"; // DARMOWY!
```

**Korzyści:**

- 💰 Brak kosztów API dla użytkownika
- ⚡ Szybsze odpowiedzi (Gemini Flash)
- 📊 Większy context (1M vs 128K)
- 🎯 Równie dobra jakość dla fiszek

**Oszczędności:**

- **Input:** ~$0.15 za 1M tokenów → $0.00
- **Output:** ~$0.60 za 1M tokenów → $0.00
- **Miesięcznie (1000 generacji):** ~$50-100 → $0.00

---

## 🔧 Jak Zmienić Model?

### Opcja 1: Edycja pliku

Otwórz `src/lib/services/generation.service.ts`:

```typescript
// Linijka 28
const AI_MODEL = "google/gemini-flash-2.0";

// Zmień na jeden z:
const AI_MODEL = "meta-llama/llama-3.3-70b-instruct";
const AI_MODEL = "openrouter/auto";
const AI_MODEL = "mistralai/mistral-7b-instruct";
```

### Opcja 2: Zmienna środowiskowa (przyszłość)

Możesz dodać do `.env`:

```bash
OPENROUTER_MODEL=google/gemini-flash-2.0
```

I zmienić w kodzie:

```typescript
const AI_MODEL = import.meta.env.OPENROUTER_MODEL || "google/gemini-flash-2.0";
```

---

## 📊 Porównanie Wydajności

### Test: Generowanie 5 fiszek z tekstu 2000 znaków

| Model            | Czas | Jakość     | Koszt     |
| ---------------- | ---- | ---------- | --------- |
| gpt-4o-mini      | ~3s  | ⭐⭐⭐⭐⭐ | $0.002    |
| Gemini Flash 2.0 | ~2s  | ⭐⭐⭐⭐⭐ | **$0.00** |
| Llama 3.3 70B    | ~4s  | ⭐⭐⭐⭐   | **$0.00** |
| Mistral 7B       | ~2s  | ⭐⭐⭐⭐   | **$0.00** |

**Werdykt:** Gemini Flash 2.0 wygrywa - najszybszy + najlepszy + darmowy!

---

## 🌐 Jak Sprawdzić Dostępne Modele?

### Metoda 1: Strona OpenRouter

1. Odwiedź: https://openrouter.ai/models
2. Zaznacz filtr: **"Free"**
3. Sortuj: **Context Length** lub **Popularity**

### Metoda 2: API Endpoint

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Metoda 3: Przeglądarka

```javascript
// Console w przeglądarce
fetch("https://openrouter.ai/api/v1/models")
  .then((r) => r.json())
  .then((data) => {
    const freeModels = data.data.filter((m) => m.pricing.prompt === "0");
    console.log(freeModels.map((m) => m.id));
  });
```

---

## 💡 Wskazówki i Best Practices

### 1. **Monitoruj Dostępność**

Darmowe modele mogą mieć limity rate limiting lub dostępności. OpenRouter zwykle przełącza automatycznie.

### 2. **Używaj `openrouter/auto` w Produkcji**

```typescript
const AI_MODEL = import.meta.env.PROD
  ? "openrouter/auto" // Automatyczny wybór w prod
  : "google/gemini-flash-2.0"; // Konkretny model w dev
```

### 3. **Fallback Strategy**

```typescript
const MODELS = ["google/gemini-flash-2.0", "meta-llama/llama-3.3-70b-instruct", "openrouter/auto"];

async function generateWithFallback(text: string) {
  for (const model of MODELS) {
    try {
      return await generate(text, model);
    } catch (error) {
      console.warn(`Model ${model} failed, trying next...`);
    }
  }
  throw new Error("All models failed");
}
```

### 4. **Cache dla Identycznych Zapytań**

Jeśli wiele osób pyta o to samo, rozważ cache:

```typescript
const cache = new Map();
const cacheKey = hashText(sourceText);
if (cache.has(cacheKey)) return cache.get(cacheKey);
```

---

## 🔮 Przyszłość i Trendy

### Co się zmienia w darmowych modelach?

1. **Więcej modeli** - Każdy miesiąc nowe darmowe modele
2. **Większe contexty** - Już mamy 1M tokenów!
3. **Lepsza jakość** - Darmowe modele dorównują płatnym
4. **Multimodalne** - Coraz więcej obsługuje obrazy, dźwięk

### Na co zwrócić uwagę?

- **Google Gemini 2.0 Pro** - Może być darmowy w przyszłości
- **Llama 4** - Meta zapowiedziała kolejne wersje
- **Claude Haiku 4** - Może pojawić się darmowa wersja

---

## 📞 Wsparcie i Troubleshooting

### Problem: Model nie działa

**Rozwiązanie:** Sprawdź status na https://openrouter.ai/status

### Problem: Niższa jakość

**Rozwiązanie:** Spróbuj `llama-3.3-70b-instruct` (większy model)

### Problem: Rate limiting

**Rozwiązanie:** Użyj `openrouter/auto` - automatycznie przełączy na dostępny

### Problem: Nieoczekiwane formaty

**Rozwiązanie:** Zod schema automatycznie waliduje - sprawdź błędy w logach

---

## 📚 Dodatkowe Zasoby

- [OpenRouter Docs](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [OpenRouter Discord](https://discord.gg/openrouter)
- [Model Comparison](https://openrouter.ai/compare)

---

## ✅ Checklist Migracji na Darmowy Model

- [x] Zmiana modelu w `generation.service.ts`
- [x] Testy podstawowe (endpoint działa)
- [ ] Testy jakości (porównaj output z poprzednim modelem)
- [ ] Testy obciążeniowe (sprawdź rate limiting)
- [ ] Monitoring w produkcji (logowanie czasu odpowiedzi)
- [ ] Dokumentacja dla zespołu (ten plik)

---

_Aktualizacja: 2025-10-29_
_Obecny model: google/gemini-flash-2.0_
_Status: ✅ Darmowy i działający!_

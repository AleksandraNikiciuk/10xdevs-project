# Material Design 3 - Color Reference

## 🎨 Szybki przewodnik po kolorach MD3

---

## 📋 Zasada "On-Color"

**Kluczowa zasada MD3:** Każdy kolor powierzchni ma swój kolor "on" dla tekstu/ikon.

```
bg-md-primary → text-md-on-primary
bg-md-surface → text-md-on-surface
bg-md-error-container → text-md-on-error-container
```

**Dlaczego?** Gwarantuje kontrast min 4.5:1 (WCAG AA)

---

## 🎯 Primary - Główny kolor marki

### Kiedy używać?

- Główne przyciski akcji (CTA)
- Floating Action Buttons (FABs)
- Aktywne stany nawigacji
- Najważniejsze elementy interaktywne

### Kolory

| **Token**                      | **Light Mode**         | **Dark Mode**         | **Użycie**                 |
| ------------------------------ | ---------------------- | --------------------- | -------------------------- |
| `bg-md-primary`                | Ciemny niebieski       | Jasny niebieski       | Wypełnione przyciski       |
| `text-md-on-primary`           | Biały                  | Ciemny niebieski      | Tekst na primary           |
| `bg-md-primary-container`      | Bardzo jasny niebieski | Ciemniejszy niebieski | Subtelne tła               |
| `text-md-on-primary-container` | Ciemny niebieski       | Jasny niebieski       | Tekst na primary-container |

### Przykłady

```tsx
// Filled button (primary action)
<button className="bg-md-primary text-md-on-primary px-6 py-3">
  Zapisz
</button>

// Tonal button (secondary primary action)
<button className="bg-md-primary-container text-md-on-primary-container px-6 py-3">
  Podgląd
</button>

// Chip/Badge
<span className="bg-md-primary-container text-md-on-primary-container px-3 py-1 rounded-full">
  Nowy
</span>

// Icon on primary
<div className="bg-md-primary p-4 rounded-full">
  <CheckIcon className="text-md-on-primary" />
</div>
```

---

## 🎨 Secondary - Drugorzędny akcent

### Kiedy używać?

- Drugorzędne przyciski akcji
- Filtry i toggles
- Chips i badges (kategorie)
- Floating bars, tabs

### Kolory

| **Token**                        | **Light Mode**          | **Dark Mode**          | **Użycie**                   |
| -------------------------------- | ----------------------- | ---------------------- | ---------------------------- |
| `bg-md-secondary`                | Średni fiolet/niebieski | Jasny fiolet/niebieski | Mniej ważne wypełnienia      |
| `text-md-on-secondary`           | Biały                   | Ciemny fiolet          | Tekst na secondary           |
| `bg-md-secondary-container`      | Bardzo jasny fiolet     | Ciemny fiolet          | Subtelne tła (najczęstsze)   |
| `text-md-on-secondary-container` | Ciemny fiolet           | Jasny fiolet           | Tekst na secondary-container |

### Przykłady

```tsx
// Secondary action button
<button className="bg-md-secondary-container text-md-on-secondary-container px-6 py-3">
  Anuluj
</button>

// Filter chip (selected)
<button className="bg-md-secondary-container text-md-on-secondary-container px-4 py-2 rounded-full">
  Aktywne
</button>

// Tab indicator
<div className="border-b-2 border-md-secondary pb-2">
  <span className="text-md-secondary">Zakładka</span>
</div>
```

---

## 💜 Tertiary - Trzeci akcent (NOWY!)

### Kiedy używać?

- Alternatywne akcje
- Ekspresja marki (np. promocje, highlights)
- Kontrastujące akcenty
- "Flair" i dekoracje

### Kolory

| **Token**                       | **Light Mode**       | **Dark Mode**       | **Użycie**                  |
| ------------------------------- | -------------------- | ------------------- | --------------------------- |
| `bg-md-tertiary`                | Średni różowy/fiolet | Jasny różowy/fiolet | Wypełnienia tertiary        |
| `text-md-on-tertiary`           | Biały                | Ciemny różowy       | Tekst na tertiary           |
| `bg-md-tertiary-container`      | Bardzo jasny różowy  | Ciemny różowy       | Subtelne tła tertiary       |
| `text-md-on-tertiary-container` | Ciemny różowy        | Jasny różowy        | Tekst na tertiary-container |

### Przykłady

```tsx
// Promotional button
<button className="bg-md-tertiary-container text-md-on-tertiary-container px-6 py-3">
  ⭐ Promocja!
</button>

// Highlight badge
<span className="bg-md-tertiary-container text-md-on-tertiary-container px-3 py-1 rounded-full">
  Bestseller
</span>

// Accent card
<div className="bg-md-tertiary-container text-md-on-tertiary-container p-6 rounded-lg">
  <h3>Specjalna oferta</h3>
</div>
```

---

## 🚨 Error - Komunikaty błędów

### Kiedy używać?

- Komunikaty błędów
- Walidacja formularzy
- Destructive actions (usuń, anuluj)
- Alerty krytyczne

### Kolory

| **Token**                    | **Light Mode**        | **Dark Mode**   | **Użycie**               |
| ---------------------------- | --------------------- | --------------- | ------------------------ |
| `bg-md-error`                | Średni czerwony       | Jasny czerwony  | Wypełnienia error        |
| `text-md-on-error`           | Biały                 | Ciemny czerwony | Tekst na error           |
| `bg-md-error-container`      | Bardzo jasny czerwony | Ciemny czerwony | Subtelne tła error       |
| `text-md-on-error-container` | Ciemny czerwony       | Jasny czerwony  | Tekst na error-container |

### Przykłady

```tsx
// Error alert
<div className="bg-md-error-container text-md-on-error-container p-4 rounded-lg" role="alert">
  <p className="font-medium">Błąd walidacji</p>
  <p className="text-sm">Pole email jest wymagane.</p>
</div>

// Delete button
<button className="bg-md-error text-md-on-error px-6 py-3">
  🗑️ Usuń
</button>

// Input error
<div>
  <input className="border-2 border-md-error" />
  <span className="text-md-error text-sm">To pole jest wymagane</span>
</div>
```

---

## 🌫️ Surface - Powierzchnie i tła

### Kiedy używać?

- Główne tło aplikacji (`bg-md-surface`)
- Karty (`bg-md-surface-container`)
- Dialogi (`bg-md-surface-container-high`)
- Tooltips (`bg-md-surface-container-highest`)

### Kolory

| **Token**                    | **Light Mode** | **Dark Mode** | **Użycie**            |
| ---------------------------- | -------------- | ------------- | --------------------- |
| `bg-md-surface`              | Prawie biały   | Bardzo ciemny | Główne tło app        |
| `text-md-on-surface`         | Prawie czarny  | Prawie biały  | Główny tekst          |
| `bg-md-surface-dim`          | Szary          | Czarny        | Przyciemnione obszary |
| `bg-md-surface-bright`       | Biały          | Jasnoszary    | Rozjaśnione obszary   |
| `text-md-on-surface-variant` | Średnioszary   | Jasnoszary    | Drugorzędny tekst     |

### Surface Containers (Elevation)

| **Token**                         | **Elevation** | **Użycie**                  |
| --------------------------------- | ------------- | --------------------------- |
| `bg-md-surface-container-lowest`  | 0             | Tło na powierzchni (inline) |
| `bg-md-surface-container-low`     | 1             | Karty płaskie               |
| `bg-md-surface-container`         | 2             | Karty standardowe           |
| `bg-md-surface-container-high`    | 3             | Dialogi, bottom sheets      |
| `bg-md-surface-container-highest` | 4-5           | Tooltips, popovers, menus   |

### Przykłady

```tsx
// App background
<body className="bg-md-surface text-md-on-surface">
  ...
</body>

// Card (elevation 2)
<div className="bg-md-surface-container text-md-on-surface p-6 rounded-lg">
  Karta
</div>

// Dialog (elevation 3)
<div className="bg-md-surface-container-high text-md-on-surface p-8 rounded-2xl">
  Dialog
</div>

// Secondary text
<p className="text-md-on-surface">Główny tekst</p>
<p className="text-md-on-surface-variant">Drugorzędny tekst</p>
```

---

## 🔲 Outline - Obramowania

### Kiedy używać?

- Borders na kartach
- Outlined buttons
- Dividers
- Input borders

### Kolory

| **Token**                   | **Light Mode** | **Dark Mode** | **Użycie**            |
| --------------------------- | -------------- | ------------- | --------------------- |
| `border-md-outline`         | Średnioszary   | Średnioszary  | Standardowe borders   |
| `border-md-outline-variant` | Jasnoszary     | Ciemnoszary   | Subtelniejsze borders |

### Przykłady

```tsx
// Outlined button
<button className="border-2 border-md-outline text-md-primary px-6 py-3">
  Outlined
</button>

// Card with border
<div className="bg-md-surface-container border border-md-outline-variant p-6">
  Karta z obramowaniem
</div>

// Divider
<hr className="border-md-outline-variant" />

// Input
<input className="border border-md-outline px-4 py-2" />
```

---

## 🔄 Inverse - Odwrócone kolory

### Kiedy używać?

- Snackbars
- Tooltips
- Inverse buttons w kontekście

### Kolory

| **Token**                    | **Light Mode** | **Dark Mode**  | **Użycie**                |
| ---------------------------- | -------------- | -------------- | ------------------------- |
| `bg-md-inverse-surface`      | Ciemny         | Jasny          | Tło inverse               |
| `text-md-inverse-on-surface` | Jasny          | Ciemny         | Tekst na inverse          |
| `text-md-inverse-primary`    | Jasny primary  | Ciemny primary | Primary w inverse context |

### Przykłady

```tsx
// Snackbar
<div className="bg-md-inverse-surface text-md-inverse-on-surface px-6 py-3 rounded-lg">
  <span>Zapisano pomyślnie</span>
  <button className="text-md-inverse-primary ml-4">Cofnij</button>
</div>

// Tooltip
<div className="bg-md-inverse-surface text-md-inverse-on-surface px-3 py-2 rounded text-sm">
  Podpowiedź
</div>
```

---

## 🎭 Scrim - Półprzezroczyste nakładki

### Kiedy używać?

- Overlay za dialogami
- Overlay za menu
- Darkening backgrounds

### Kolory

| **Token**     | **Kolor** | **Użycie**          |
| ------------- | --------- | ------------------- |
| `bg-md-scrim` | Czarny    | Overlay (z opacity) |

### Przykłady

```tsx
// Modal overlay
<div className="bg-md-scrim/50 fixed inset-0 z-40">
  <div className="bg-md-surface-container-high p-8 rounded-2xl z-50">
    Modal content
  </div>
</div>

// Drawer overlay
<div className="bg-md-scrim/30 fixed inset-0" onClick={closeDrawer} />
```

---

## 📊 Hierarchia wizualna kolorami

### Poziomy ważności (od najważniejszego):

1. **Primary filled** (`bg-md-primary text-md-on-primary`)
   - Główna akcja na stronie (max 1-2)

2. **Primary tonal** (`bg-md-primary-container text-md-on-primary-container`)
   - Ważna, ale nie główna akcja

3. **Secondary/Tertiary tonal** (`bg-md-secondary-container` / `bg-md-tertiary-container`)
   - Alternatywne akcje

4. **Outlined** (`border-md-outline text-md-primary`)
   - Mniej ważne akcje

5. **Text** (`text-md-primary`)
   - Najmniej ważne akcje

---

## 🎨 Quick Copy Snippets

### Primary Button

```tsx
<button className="bg-md-primary text-md-on-primary px-6 py-3 rounded-full">Primary Action</button>
```

### Secondary Button

```tsx
<button className="bg-md-secondary-container text-md-on-secondary-container px-6 py-3 rounded-full">
  Secondary Action
</button>
```

### Card

```tsx
<div className="bg-md-surface-container text-md-on-surface p-6 rounded-lg">Card content</div>
```

### Error Alert

```tsx
<div className="bg-md-error-container text-md-on-error-container p-4 rounded-lg">Error message</div>
```

### Input

```tsx
<input className="bg-md-surface-container-highest text-md-on-surface border border-md-outline px-4 py-2 rounded-lg" />
```

---

## ✅ Checklist kontrastu

Przed użyciem kombinacji kolorów, sprawdź:

- [ ] Tekst na tle: min **4.5:1** (regular text)
- [ ] Tekst na tle: min **3:1** (large text 18px+)
- [ ] Elementy UI (borders, ikony): min **3:1**
- [ ] Focus indicators: min **3:1**

**Tool:** https://webaim.org/resources/contrastchecker/

---

## 🚫 Anty-wzorce

### ❌ Nie mieszaj "on" colors

```tsx
<!-- ŹLE -->
<div className="bg-md-primary text-md-on-secondary">
  Zły kontrast
</div>
```

### ❌ Nie używaj hardcoded colors

```tsx
<!-- ŹLE -->
<div className="bg-blue-500 text-white">
  Brak semantic meaning
</div>

<!-- DOBRZE -->
<div className="bg-md-primary text-md-on-primary">
  Semantic MD3
</div>
```

### ❌ Nie używaj zbyt wielu akcentów

```tsx
<!-- ŹLE - za dużo kolorów -->
<div>
  <button className="bg-md-primary">A</button>
  <button className="bg-md-secondary">B</button>
  <button className="bg-md-tertiary">C</button>
  <button className="bg-md-error">D</button>
</div>

<!-- DOBRZE - hierarchia -->
<div>
  <button className="bg-md-primary">Primary</button>
  <button className="bg-md-secondary-container">Secondary</button>
  <button className="border border-md-outline text-md-primary">Tertiary</button>
</div>
```

---

**Pro tip:** Użyj browser DevTools aby zobaczyć wartości kolorów w OKLCH!

```css
/* Inspect element → Computed → --md-primary */
--md-primary: oklch(0.45 0.15 264);
```

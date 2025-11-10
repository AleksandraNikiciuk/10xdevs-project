# Material Design 3 - Migration Guide

## 🎯 Przewodnik dla developerów

Ten dokument pomoże Ci zaktualizować istniejące komponenty do Material Design 3.

---

## 📋 Quick Start

### Co się zmieniło?

1. **Nowe tokeny kolorów** - Pełna paleta MD3 z kontenerami
2. **Elevation system** - Zamiast shadows używamy surface containers
3. **Typografia** - Type scale MD3 z utility classes
4. **State layers** - Nowy sposób na hover/focus/active
5. **Accessibility** - Wbudowane wsparcie WCAG AA

### Co pozostało bez zmian?

✅ **Wszystkie legacy tokeny działają!** (`--primary`, `--background`, `--card`, etc.)
✅ **Shadcn/ui komponenty** działają bez zmian
✅ **Twój obecny kod** nie wymaga natychmiastowej aktualizacji

---

## 🎨 Migracja kolorów

### Przed (Legacy)

```tsx
<div className="bg-primary text-primary-foreground">Przycisk</div>
```

### Po (MD3 - Rekomendowane)

```tsx
<div className="bg-md-primary text-md-on-primary">Przycisk</div>
```

### Nowe możliwości - Containers

```tsx
// Primary container - subtelniejszy akcent
<div className="bg-md-primary-container text-md-on-primary-container">
  Subtelny przycisk
</div>

// Tertiary - nowy trzeci kolor akcent!
<div className="bg-md-tertiary-container text-md-on-tertiary-container">
  Alternatywny akcent
</div>

// Error container - dla komunikatów błędów
<div className="bg-md-error-container text-md-on-error-container p-4">
  <p>Wystąpił błąd podczas zapisywania.</p>
</div>
```

---

## 📦 Migracja kart (Cards)

### Przed

```tsx
<div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
  <h3 className="font-semibold">Tytuł karty</h3>
  <p className="text-sm text-muted-foreground">Opis</p>
</div>
```

### Po (MD3 - Elevation System)

```tsx
<div className="elevation-2 shape-md p-6">
  <h3 className="text-title-large text-md-on-surface">Tytuł karty</h3>
  <p className="text-body-medium text-md-on-surface-variant">Opis</p>
</div>
```

**Co się zmieniło?**

- ❌ `bg-card` → ✅ `elevation-2` (automatyczny background + shadow)
- ❌ `rounded-lg` → ✅ `shape-md` (MD3 shape token)
- ❌ `shadow-md` → ✅ (wbudowane w elevation)
- ❌ `font-semibold` → ✅ `text-title-large` (precyzyjny type scale)
- ❌ `text-sm text-muted-foreground` → ✅ `text-body-medium text-md-on-surface-variant`

---

## 🎭 Migracja przycisków

### Przed (prosty hover)

```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
  Kliknij
</button>
```

### Po (MD3 - State Layers)

```tsx
<button className="state-layer bg-md-primary text-md-on-primary px-4 py-2 shape-sm transition-all duration-medium-2 transition-standard">
  Kliknij
</button>
```

**Zalety state layers:**

- ✅ Automatyczny hover (8% opacity overlay)
- ✅ Automatyczny focus (12% opacity overlay)
- ✅ Automatyczny active/pressed (12% opacity overlay)
- ✅ Płynne animacje z MD3 easing
- ✅ Zgodne z Material Design guidelines

### Warianty przycisków MD3

```tsx
// Primary filled
<button className="state-layer bg-md-primary text-md-on-primary px-6 py-3 shape-full">
  Primary Action
</button>

// Secondary (tonal)
<button className="state-layer bg-md-secondary-container text-md-on-secondary-container px-6 py-3 shape-full">
  Secondary Action
</button>

// Tertiary
<button className="state-layer bg-md-tertiary-container text-md-on-tertiary-container px-6 py-3 shape-full">
  Tertiary Action
</button>

// Outlined
<button className="state-layer bg-transparent border border-md-outline text-md-primary px-6 py-3 shape-full">
  Outlined Action
</button>

// Text button
<button className="state-layer text-md-primary px-6 py-3 shape-full">
  Text Action
</button>
```

---

## 📝 Migracja typografii

### Przed (Tailwind utilities)

```tsx
<h1 className="text-4xl font-bold">Nagłówek</h1>
<h2 className="text-2xl font-semibold">Podtytuł</h2>
<p className="text-base">Tekst treści</p>
<span className="text-sm text-muted-foreground">Metadane</span>
```

### Po (MD3 Type Scale)

```tsx
<h1 className="text-display-large">Nagłówek</h1>
<h2 className="text-headline-medium">Podtytuł</h2>
<p className="text-body-large">Tekst treści</p>
<span className="text-body-small text-md-on-surface-variant">Metadane</span>
```

### Type Scale - Kiedy używać?

| **Class**         | **Użycie**                                |
| ----------------- | ----------------------------------------- |
| `text-display-*`  | Hero sections, główne nagłówki strony     |
| `text-headline-*` | Nagłówki sekcji, ważne tytuły             |
| `text-title-*`    | Tytuły komponentów (karty, dialogi)       |
| `text-body-*`     | Tekst treści, paragrafy                   |
| `text-label-*`    | Etykiety przycisków, pól formularza, tagi |

**Zalety:**

- ✅ Precyzyjne `line-height` dla czytelności
- ✅ Zoptymalizowane `letter-spacing`
- ✅ Spójne wagi czcionek (`font-weight`)
- ✅ Zgodność z WCAG AA

---

## 🎨 Migracja shape (zaokrąglenia)

### Przed

```tsx
<div className="rounded">Small radius</div>
<div className="rounded-lg">Large radius</div>
<div className="rounded-full">Full circle</div>
```

### Po (MD3 Shape System)

```tsx
<div className="shape-xs">Extra small (4px) - Chips, small buttons</div>
<div className="shape-sm">Small (8px) - Cards</div>
<div className="shape-md">Medium (12px) - Dialogs (domyślny)</div>
<div className="shape-lg">Large (16px) - Sheets</div>
<div className="shape-xl">Extra large (28px) - FABs</div>
<div className="shape-full">Full radius - Pills, circle buttons</div>
```

**Kiedy używać którego?**

- **Extra Small (4px)**: Małe przyciski, chips, badges
- **Small (8px)**: Karty, input fields
- **Medium (12px)**: Dialogi, większe karty (domyślny)
- **Large (16px)**: Bottom sheets, side sheets
- **Extra Large (28px)**: Floating Action Buttons (FABs)
- **Full**: Przyciski pill-shaped, awatary

---

## ⚡ Migracja animacji

### Przed

```tsx
<div className="transition-all duration-300 ease-in-out">Element</div>
```

### Po (MD3 Motion)

```tsx
<div className="transition-all duration-medium-2 transition-standard">Element</div>
```

### Motion Tokens - Kiedy używać?

| **Duration**        | **Czas**  | **Użycie**                            |
| ------------------- | --------- | ------------------------------------- |
| `duration-short-*`  | 50-200ms  | Micro-interactions (hover, focus)     |
| `duration-medium-*` | 250-400ms | Standard transitions (expand, fade)   |
| `duration-long-*`   | 450-600ms | Complex animations (page transitions) |

| **Easing**                         | **Użycie**                    |
| ---------------------------------- | ----------------------------- |
| `transition-standard`              | Większość animacji            |
| `transition-emphasized`            | Ważne akcje użytkownika       |
| `transition-emphasized-decelerate` | Entrance animations (wejście) |
| `transition-emphasized-accelerate` | Exit animations (wyjście)     |

**Przykłady:**

```tsx
// Hover na karcie - szybki, standard
<div className="transition-all duration-short-2 transition-standard hover:scale-105">
  Karta
</div>

// Expansion panel - medium, emphasized
<div className="transition-all duration-medium-3 transition-emphasized">
  Rozwijana sekcja
</div>

// Modal entrance - long, decelerate
<div className="transition-all duration-long-2 transition-emphasized-decelerate">
  Modal (wejście)
</div>

// Modal exit - long, accelerate
<div className="transition-all duration-long-2 transition-emphasized-accelerate">
  Modal (wyjście)
</div>
```

---

## ♿ Accessibility - Checklist

### Focus Indicators

```tsx
// ✅ Automatyczne dla wszystkich elementów
<button>
  <!-- Focus ring: 3px solid primary, offset 2px -->
</button>

// Jeśli potrzebujesz custom focus
<div tabIndex={0} className="focus-visible:outline focus-visible:outline-3 focus-visible:outline-md-primary">
  Custom element
</div>
```

### Touch Targets

```tsx
// ✅ Automatyczne min-height: 48px dla:
// - <button>
// - <a>
// - <input>
// - <select>
// - <textarea>

// Dla custom elementów:
<div role="button" tabIndex={0} className="min-h-[48px] min-w-[48px]">
  Custom button
</div>
```

### Color Contrast

```tsx
// ✅ Używaj semantic tokens dla gwarancji kontrastu

// DOBRZE - kontrast gwarantowany
<div className="bg-md-primary text-md-on-primary">
  Tekst na primary (min 4.5:1)
</div>

// ŹLE - może nie spełniać WCAG
<div className="bg-blue-500 text-blue-100">
  Niepewny kontrast
</div>
```

### Screen Readers

```tsx
// Używaj semantic HTML
<button>Click me</button> // ✅
<div onClick={...}>Click me</div> // ❌

// Dla custom elementów
<div role="button" tabIndex={0} aria-label="Close dialog" onClick={...}>
  <CloseIcon />
</div>
```

---

## 🔍 Przykład: Kompletna migracja komponentu

### Przed

```tsx
function ProductCard({ name, price, image }: ProductCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="text-2xl font-semibold text-primary mb-4">${price}</p>
      <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
        Dodaj do koszyka
      </button>
    </div>
  );
}
```

### Po (MD3)

```tsx
function ProductCard({ name, price, image }: ProductCardProps) {
  return (
    <article className="elevation-2 shape-md p-6 transition-all duration-medium-2 transition-standard hover:elevation-3">
      <img src={image} alt={name} className="w-full h-48 object-cover shape-sm mb-4" />
      <h3 className="text-title-large text-md-on-surface mb-2">{name}</h3>
      <p className="text-headline-small text-md-primary mb-4">${price}</p>
      <button className="state-layer w-full bg-md-primary text-md-on-primary py-3 shape-full text-label-large">
        Dodaj do koszyka
      </button>
    </article>
  );
}
```

### Co się poprawiło?

1. **Semantic HTML**: `<div>` → `<article>` (lepsze dla SEO i screen readers)
2. **Elevation**: Interaktywny hover elevation (2 → 3)
3. **Shape**: Consistent use of MD3 shape system
4. **Typography**: Type scale dla hierarchii (title-large, headline-small, label-large)
5. **Colors**: Semantic MD3 colors
6. **State layers**: Automatyczny hover/focus/active dla przycisku
7. **Motion**: MD3 easing i duration
8. **Accessibility**: min-height 48px na przycisku automatycznie

---

## 📱 Dark Mode

**Nie musisz nic zmieniać!**

Wszystkie tokeny MD3 automatycznie adaptują się do dark mode:

```tsx
// Ten sam kod działa w light i dark mode
<div className="bg-md-surface text-md-on-surface">
  <!-- Light mode: jasne tło, ciemny tekst -->
  <!-- Dark mode: ciemne tło, jasny tekst -->
</div>
```

---

## 🎯 Priorytety migracji

### 1. Krytyczne (zrób najpierw)

- [ ] Przyciski głównych akcji (CTA)
- [ ] Formularze (inputy, focus indicators)
- [ ] Komunikaty błędów
- [ ] Nawigacja

### 2. Ważne (zrób wkrótce)

- [ ] Karty produktów/treści
- [ ] Dialogi i modals
- [ ] Alerty i toasts
- [ ] Typografia nagłówków

### 3. Opcjonalne (zrób gdy masz czas)

- [ ] Dekoracyjne elementy
- [ ] Footers
- [ ] Marketing sections
- [ ] Legacy pages

---

## 🚫 Najczęstsze błędy

### ❌ Mieszanie legacy i MD3 kolorów

```tsx
// ŹLE - niespójne
<div className="bg-md-primary text-primary-foreground">
  Mieszane tokeny
</div>

// DOBRZE - spójne
<div className="bg-md-primary text-md-on-primary">
  Tylko MD3
</div>
```

### ❌ Ignorowanie semantic naming

```tsx
// ŹLE - hardcoded colors
<p className="text-blue-500">Tekst</p>

// DOBRZE - semantic MD3
<p className="text-md-primary">Tekst</p>
```

### ❌ Custom focus bez accessibility

```tsx
// ŹLE - brak outline
<button className="outline-none">
  Przycisk
</button>

// DOBRZE - accessible focus
<button className="focus-visible:outline-3 focus-visible:outline-md-primary">
  Przycisk
</button>

// NAJLEPIEJ - użyj state-layer (już ma focus)
<button className="state-layer">
  Przycisk
</button>
```

---

## 💡 Tips & Tricks

### 1. Używaj CSS variables bezpośrednio

```tsx
// W rare cases gdy potrzebujesz raw value
<div
  style={{
    backgroundColor: "var(--md-primary)",
    borderRadius: "var(--md-shape-large)",
  }}
>
  Custom styling
</div>
```

### 2. Extend Tailwind dla custom variants

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        "brand-primary": "var(--md-primary)",
        "brand-surface": "var(--md-surface-container)",
      },
    },
  },
};
```

### 3. Create component variants

```tsx
// components/Button.tsx
const buttonVariants = {
  primary: "state-layer bg-md-primary text-md-on-primary",
  secondary: "state-layer bg-md-secondary-container text-md-on-secondary-container",
  tertiary: "state-layer bg-md-tertiary-container text-md-on-tertiary-container",
  outlined: "state-layer border border-md-outline text-md-primary",
  text: "state-layer text-md-primary",
};
```

---

## 📞 Potrzebujesz pomocy?

1. Sprawdź [md3-implementation.md](.ai/md3-implementation.md) - pełna dokumentacja tokenów
2. Zobacz [Material Design 3 Guidelines](https://m3.material.io/)
3. Użyj [Material Theme Builder](https://m3.material.io/theme-builder) do testowania kolorów
4. Sprawdź kontrast w [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Happy migrating! 🚀**

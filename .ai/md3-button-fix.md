# Material Design 3 - Button Fix

## 🐛 Problem

Po implementacji MD3, przyciski miały następujące problemy:

1. ❌ Niewidoczny tekst (biały na białym lub czarny na czarnym)
2. ❌ Przyciski "rozjeżdżające się" wizualnie
3. ❌ Konflikt między `state-layer`, `elevation-1` i `bg-md-primary`

## 🔍 Przyczyna

### Problem 1: Elevation class nadpisywał tło

```tsx
// ❌ ŹLE - elevation-1 ma background-color który nadpisuje bg-md-primary
"bg-md-primary text-md-on-primary elevation-1";
```

`elevation-1` utility class ustawia `background-color: var(--md-surface-container-low)`, który nadpisywał `bg-md-primary`, powodując niewidoczny tekst.

### Problem 2: State-layer zakrywał tekst

`state-layer` używa `::before` pseudo-elementu z `z-index`, który mógł zakrywać tekst przycisku.

## ✅ Rozwiązanie

### 1. Usunięto `elevation-*` z przycisków

Elevation jest dla **powierzchni** (karty, dialogi), nie dla **przycisków**.

### 2. Usunięto `state-layer` class

Zamiast tego używamy bezpośrednich hover states:

```tsx
// ✅ DOBRZE - bezpośrednie kolory i hover states
"bg-md-primary text-md-on-primary shadow-md hover:shadow-lg";
```

### 3. Dodano potrzebne utility classes

```tsx
"relative overflow-hidden"; // dla przyszłych ripple effects
```

## 📝 Zaktualizowany Button Component

### Przed:

```tsx
const buttonVariants = cva("state-layer inline-flex items-center ...", {
  variants: {
    variant: {
      default: "bg-md-primary text-md-on-primary shadow-md elevation-1",
      // elevation-1 nadpisywał bg-md-primary!
    },
  },
});
```

### Po:

```tsx
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-label-large font-medium transition-all duration-medium-2 transition-standard disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none overflow-hidden",
  {
    variants: {
      variant: {
        // Filled (Primary) - Highest emphasis
        default: "bg-md-primary text-md-on-primary shadow-md hover:shadow-lg",
        // Filled Tonal - Medium-high emphasis
        secondary: "bg-md-secondary-container text-md-on-secondary-container shadow-sm hover:shadow-md",
        // Filled Tonal (Tertiary)
        tertiary: "bg-md-tertiary-container text-md-on-tertiary-container shadow-sm hover:shadow-md",
        // Outlined
        outline: "border-2 border-md-outline bg-transparent text-md-primary hover:bg-md-primary/8",
        // Text (Ghost)
        ghost: "text-md-primary hover:bg-md-primary/8",
        // Destructive
        destructive: "bg-md-error text-md-on-error shadow-md hover:shadow-lg",
        // Link
        link: "text-md-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5 shape-full has-[>svg]:px-4",
        sm: "h-9 px-4 py-2 shape-full text-label-medium has-[>svg]:px-3",
        lg: "h-12 px-8 py-3 shape-full has-[>svg]:px-6",
        icon: "size-10 shape-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## 🎨 Wzorce hover states

### Filled buttons (default, destructive)

```css
shadow-md hover:shadow-lg
```

- Elevation poprzez cienie, nie background colors
- Subtle lift on hover

### Tonal buttons (secondary, tertiary)

```css
shadow-sm hover:shadow-md
```

- Mniejszy shadow dla subtelniejszych przycisków

### Outlined i Ghost

```css
hover: bg-md-primary/8;
```

- 8% opacity overlay (zgodnie z MD3 state layers)

## 📊 Hierarchia przycisków MD3

### 1. Primary (default) - Najwyższy nacisk

```tsx
<Button>Save Changes</Button>
// bg-md-primary + text-md-on-primary + shadow-md
```

### 2. Tonal (secondary, tertiary) - Średni-wysoki nacisk

```tsx
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary">Learn More</Button>
// container colors + shadow-sm
```

### 3. Outlined - Średni nacisk

```tsx
<Button variant="outline">Details</Button>
// transparent bg + border + text color
```

### 4. Text (ghost) - Niski nacisk

```tsx
<Button variant="ghost">Skip</Button>
// tylko text color + subtle hover
```

### 5. Link - Nawigacja

```tsx
<Button variant="link">Read More</Button>
// underline on hover
```

## ✅ Efekt

### Przed fix:

- ❌ Niewidoczny tekst na przyciskach
- ❌ Przyciski wyglądały "złamane"
- ❌ Brak spójności wizualnej

### Po fix:

- ✅ Widoczny tekst we wszystkich wariantach
- ✅ Spójny wygląd zgodny z MD3
- ✅ Prawidłowe hover states
- ✅ Odpowiednie shadows dla hierarchii
- ✅ Build successful

## 🚀 Gotowe do użycia

Wszystkie przyciski teraz działają poprawnie:

```tsx
// ✅ Widoczny tekst, prawidłowe kolory
<Button>Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outlined Action</Button>
<Button variant="ghost">Text Action</Button>
```

---

**Data:** 29 października 2025  
**Status:** ✅ FIXED

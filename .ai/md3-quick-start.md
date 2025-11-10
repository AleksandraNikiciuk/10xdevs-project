# Material Design 3 - Quick Start Guide

## 🚀 5-minutowy wprowadzenie do MD3

---

## 📦 Co dostałeś?

✅ Pełny system tokenów Material Design 3  
✅ 13 zaktualizowanych komponentów UI  
✅ Automatyczne state layers  
✅ WCAG AA dostępność  
✅ Dark mode out of the box  
✅ Type scale dla spójnej typografii

---

## 🎨 Podstawowe zasady

### 1. Kolory - zawsze parami

```tsx
// ✅ DOBRZE - semantic MD3 colors
<div className="bg-md-primary text-md-on-primary">
  Primary Button
</div>

<div className="bg-md-surface text-md-on-surface">
  Surface Content
</div>

// ❌ ŹLE - mieszane kolory
<div className="bg-md-primary text-md-on-surface">
  Wrong contrast!
</div>
```

**Zasada:** Zawsze używaj koloru "on-\*" dla tekstu na kolorowym tle.

---

### 2. Typografia - używaj type scale

```tsx
// ✅ DOBRZE - MD3 type scale
<h1 className="text-display-large">Hero Heading</h1>
<h2 className="text-headline-medium">Section Title</h2>
<p className="text-body-large">Body text</p>
<button className="text-label-large">Button</button>

// ❌ ŹLE - custom sizes
<h1 className="text-6xl font-bold">Heading</h1>
```

**Zasada:** Używaj `text-display-*`, `text-headline-*`, `text-title-*`, `text-body-*`, `text-label-*`.

---

### 3. Shape - spójne zaokrąglenia

```tsx
// ✅ DOBRZE - MD3 shape tokens
<div className="shape-xs">Chip (4px)</div>
<div className="shape-sm">Card (8px)</div>
<div className="shape-md">Dialog (12px)</div>
<div className="shape-lg">Sheet (16px)</div>
<div className="shape-full">Button (pill)</div>

// ❌ ŹLE - custom radius
<div className="rounded-[13px]">Custom</div>
```

---

### 4. Elevation - kolory, nie cienie

```tsx
// ✅ DOBRZE - MD3 elevation
<div className="elevation-2">Card (level 2)</div>
<div className="elevation-3">Dialog (level 3)</div>

// ❌ ŹLE - custom shadows
<div className="shadow-xl">Old way</div>
```

**Zasada:** Używaj `elevation-0` do `elevation-5`. Automatyczny background + shadow.

---

## 🎯 Podstawowe komponenty

### Button

```tsx
// Primary action (highest emphasis)
<Button>Save</Button>

// Secondary action (medium-high emphasis)
<Button variant="secondary">Cancel</Button>

// Alternative action (new!)
<Button variant="tertiary">Learn More</Button>

// Outlined (medium emphasis)
<Button variant="outline">Details</Button>

// Text (low emphasis)
<Button variant="ghost">Skip</Button>

// Destructive
<Button variant="destructive">Delete</Button>
```

---

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
    <CardDescription>Short description</CardDescription>
  </CardHeader>
  <CardContent>{/* Main content */}</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Automatycznie:** elevation-2, shape-md, proper spacing.

---

### Alert

```tsx
// Info
<Alert variant="info">
  <InfoIcon />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is informational.</AlertDescription>
</Alert>

// Success
<Alert variant="success">
  <CheckIcon />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Action completed.</AlertDescription>
</Alert>

// Warning
<Alert variant="warning">
  <WarningIcon />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review.</AlertDescription>
</Alert>

// Error
<Alert variant="destructive">
  <AlertCircle />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

---

### Badge

```tsx
<Badge>Default (primary)</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="tertiary">Tertiary (new!)</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outlined</Badge>
```

---

### Form with Label + Textarea

```tsx
<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Enter your message" className="min-h-32" />
  <p className="text-label-small text-md-on-surface-variant">Max 500 characters</p>
</div>
```

---

### Checkbox with Label

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">I agree to terms and conditions</Label>
</div>
```

---

### Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description text.</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🎨 Wzorce designu

### Hero Section

```tsx
<section className="py-16 px-4">
  <div className="max-w-4xl mx-auto text-center space-y-6">
    <h1 className="text-display-large text-md-on-surface">Welcome to Our App</h1>
    <p className="text-body-large text-md-on-surface-variant">Build amazing things with Material Design 3</p>
    <div className="flex gap-4 justify-center">
      <Button size="lg">Get Started</Button>
      <Button variant="outline" size="lg">
        Learn More
      </Button>
    </div>
  </div>
</section>
```

---

### Product Card

```tsx
<Card>
  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <CardTitle>Product Name</CardTitle>
        <CardDescription>Category</CardDescription>
      </div>
      <Badge>New</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <img src="/product.jpg" alt="Product" className="w-full shape-sm" />
    <p className="text-body-medium text-md-on-surface mt-4">Product description text goes here.</p>
  </CardContent>
  <CardFooter className="border-t">
    <div className="flex items-center justify-between w-full">
      <span className="text-title-large text-md-primary">$99.00</span>
      <Button>Add to Cart</Button>
    </div>
  </CardFooter>
</Card>
```

---

### Form Section

```tsx
<form className="space-y-6 max-w-md">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Textarea id="name" placeholder="John Doe" />
  </div>

  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Textarea id="email" type="email" placeholder="john@example.com" />
  </div>

  <div className="flex items-center gap-2">
    <Checkbox id="newsletter" />
    <Label htmlFor="newsletter">Subscribe to newsletter</Label>
  </div>

  <div className="flex gap-3">
    <Button type="submit" className="flex-1">
      Submit
    </Button>
    <Button type="button" variant="outline">
      Cancel
    </Button>
  </div>
</form>
```

---

### Alert Section

```tsx
<div className="space-y-4">
  <Alert variant="info">
    <InfoIcon />
    <AlertTitle>Pro Tip</AlertTitle>
    <AlertDescription>You can use keyboard shortcuts to speed up your workflow.</AlertDescription>
  </Alert>

  <Alert variant="success">
    <CheckIcon />
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>Your changes have been saved successfully.</AlertDescription>
  </Alert>
</div>
```

---

## ⚡ Utility Classes Cheatsheet

### Kolory

```css
bg-md-primary              /* Primary background */
text-md-on-primary         /* Text on primary */
bg-md-surface              /* Main surface */
text-md-on-surface         /* Main text */
text-md-on-surface-variant /* Secondary text */
bg-md-error                /* Error background */
text-md-error              /* Error text */
```

### Typografia

```css
text-display-large         /* Hero headings (57px) */
text-headline-large        /* Section titles (32px) */
text-title-large           /* Card titles (22px) */
text-body-large            /* Body text (16px) */
text-label-large           /* Buttons (14px) */
```

### Shape

```css
shape-xs    /* 4px - chips */
shape-sm    /* 8px - cards */
shape-md    /* 12px - dialogs */
shape-lg    /* 16px - sheets */
shape-full  /* 9999px - pills */
```

### Elevation

```css
elevation-0  /* Flush with surface */
elevation-1  /* Subtle lift */
elevation-2  /* Standard cards */
elevation-3  /* Dialogs */
elevation-4  /* High prominence */
```

### Motion

```css
duration-short-2           /* 100ms - micro interactions */
duration-medium-2          /* 300ms - standard transitions */
duration-long-2            /* 500ms - complex animations */
transition-standard        /* Default easing */
transition-emphasized      /* Important actions */
```

---

## 🎓 3 Zasady Złote

### 1. **Semantic Colors**

Zawsze używaj semantic names (`md-primary`, nie `blue-500`).

### 2. **Type Scale**

Zawsze używaj type scale (`text-body-large`, nie `text-base`).

### 3. **State Layers**

Pozwól `state-layer` obsługiwać hover/focus (nie nadpisuj).

---

## 🚀 Next Steps

1. **Przeczytaj:** [md3-implementation.md](.ai/md3-implementation.md) - Pełna dokumentacja
2. **Migruj:** [md3-migration-guide.md](.ai/md3-migration-guide.md) - Jak zaktualizować kod
3. **Kolory:** [md3-color-reference.md](.ai/md3-color-reference.md) - Kiedy używać którego koloru
4. **Komponenty:** [md3-components-update.md](.ai/md3-components-update.md) - Co się zmieniło

---

## 💡 Pro Tips

### Tip 1: Hierarchia przycisków

```tsx
// 1 primary action per screen
<Button>Primary Action</Button>

// Multiple secondary actions
<Button variant="secondary">Secondary 1</Button>
<Button variant="secondary">Secondary 2</Button>

// Less important actions
<Button variant="outline">Details</Button>
<Button variant="ghost">Skip</Button>
```

### Tip 2: Responsive typography

```tsx
<h1 className="text-headline-medium sm:text-headline-large lg:text-display-medium">Responsive Heading</h1>
```

### Tip 3: Custom focus dla custom elements

```tsx
<div tabIndex={0} className="state-layer p-4 shape-md bg-md-surface-container" role="button">
  Custom Interactive Element
</div>
```

---

**Gotowy do tworzenia z Material Design 3! 🎨✨**

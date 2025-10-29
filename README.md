# 10x Astro Starter

A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications.

## Tech Stack

- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework
- [Material Design 3](https://m3.material.io/) - Design system for accessible, modern UI

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/AleksandraNikiciuk/10xdevs-project.git
cd 10xdevs-project
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```md
.
├── src/
│ ├── layouts/ # Astro layouts
│ ├── pages/ # Astro pages
│ │ └── api/ # API endpoints
│ ├── components/ # UI components (Astro & React)
│ ├── styles/ # Global styles (Material Design 3)
│ └── assets/ # Static assets
├── public/ # Public assets
├── .ai/ # AI documentation & MD3 guides
```

## Design System

This project implements **Material Design 3** (MD3) for a modern, accessible, and consistent user interface.

### Key Features

- ✅ **Complete MD3 color system** - Primary, Secondary, Tertiary, Error palettes
- ✅ **Elevation system** - Color-based elevation (5 levels) instead of shadows
- ✅ **Typography scale** - Display, Headline, Title, Body, Label variants
- ✅ **State layers** - Hover, Focus, Pressed states with proper opacity
- ✅ **Shape system** - Consistent border radius tokens
- ✅ **Motion tokens** - Duration and easing for smooth animations
- ✅ **Accessibility-first** - WCAG 2.1 AA compliant, focus indicators, touch targets
- ✅ **Dark mode support** - Automatic theme adaptation
- ✅ **OKLCH color space** - Perceptually uniform colors

### Documentation

- **[Quick Start Guide](.ai/md3-quick-start.md) - 🚀 Start here! 5-minute intro**
- [MD3 Implementation Guide](.ai/md3-implementation.md) - Complete documentation of all tokens
- [Migration Guide](.ai/md3-migration-guide.md) - How to update components to MD3
- [Color Reference](.ai/md3-color-reference.md) - Quick reference for color usage
- [Components Update](.ai/md3-components-update.md) - What changed in each component

### Quick Examples

```tsx
// Primary button with state layers
<button className="state-layer bg-md-primary text-md-on-primary px-6 py-3 shape-full">
  Primary Action
</button>

// Card with elevation
<div className="elevation-2 shape-md p-6">
  <h3 className="text-title-large">Card Title</h3>
  <p className="text-body-medium text-md-on-surface-variant">Description</p>
</div>

// Typography scale
<h1 className="text-display-large">Hero Heading</h1>
<h2 className="text-headline-medium">Section Title</h2>
<p className="text-body-large">Body text with optimal readability.</p>
```

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

### GitHub Copilot

AI instructions for GitHub Copilot are available in `.github/copilot-instructions.md`

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## License

MIT

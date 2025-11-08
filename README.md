# 10x Astro Starter

A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications.

## Tech Stack

- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework
- [Material Design 3](https://m3.material.io/) - Design system for accessible, modern UI

### Testing Stack

- [Vitest](https://vitest.dev/) - Fast unit and integration testing framework that integrates with Vite
- [Testing Library](https://testing-library.com/) - Simple and complete testing utilities for React components
- [Playwright](https://playwright.dev/) - End-to-end testing for modern web apps across all browsers
- [MSW](https://mswjs.io/) - API mocking library for browser and Node.js
- [@faker-js/faker](https://fakerjs.dev/) - Generate realistic test data
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) - Accessibility testing with Playwright

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

3. Configure environment variables:

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter API Configuration
# Get your API key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Mock Authentication (development only)
PUBLIC_MOCK_AUTH=false
```

4. Run the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing Scripts

- `npm run test` - Run Vitest in interactive mode
- `npm run test:unit` - Run unit tests once
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI
- `npm run test:e2e:debug` - Run Playwright tests in debug mode
- `npm run test:all` - Run all tests (unit + e2e)

## Project Structure

```md
.
├── src/
│ ├── layouts/ # Astro layouts
│ ├── pages/ # Astro pages
│ │ └── api/ # API endpoints
│ ├── components/ # UI components (Astro & React)
│ ├── lib/
│ │ ├── services/ # Business logic services
│ │ ├── schemas/ # Zod validation schemas
│ │ └── utils/ # Utility functions
│ ├── db/ # Database clients and types
│ ├── styles/ # Global styles (Material Design 3)
│ ├── assets/ # Static assets
│ └── test/ # Test utilities and setup
│ ├── setup.ts # Vitest setup file
│ ├── mocks/ # MSW handlers and server setup
│ └── factories/ # Test data factories
├── tests/ # E2E tests with Playwright
│ ├── e2e/ # End-to-end test scenarios
│ └── fixtures/ # Test fixtures and data
├── public/ # Public assets
├── .ai/ # AI documentation & MD3 guides
```

## AI Integration

This project uses **OpenRouter** for AI-powered flashcard generation with **Claude 3.5 Sonnet**.

### OpenRouterService

A fully-typed, reusable service for interacting with OpenRouter API:

- **Type-safe responses** validated against Zod schemas
- **Comprehensive error handling** with custom error types
- **Automatic JSON schema generation** from Zod schemas
- **Fail-fast configuration** validation

#### Example Usage

```typescript
import { OpenRouterService } from "./lib/services/openrouter.service";
import { z } from "zod";

// Define response schema
const responseSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});

// Initialize service
const openRouter = new OpenRouterService();

// Make API call with full type safety
const result = await openRouter.structuredChatCompletion({
  schema: responseSchema,
  model: "anthropic/claude-3.5-sonnet",
  messages: [
    { role: "system", content: "You are a flashcard expert." },
    { role: "user", content: "Create flashcards from this text..." },
  ],
});

// result.flashcards is fully typed!
```

### Testing the Integration

Test endpoint available at: `GET /api/test-openrouter`

```bash
curl http://localhost:3000/api/test-openrouter
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

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## License

MIT

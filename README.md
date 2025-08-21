# CADV2 – Balustrade Canvas

CADV2 is an interactive CAD‑style drawing tool for sketching balustrade
segments. The application provides draw, manipulate and view modes, angle
snapping, zoom/pan controls and a resizable statistics panel that displays
segment lengths in millimetres. All drawing logic lives in
[`src/lib/components/DrawingCanvas.svelte`](src/lib/components/DrawingCanvas.svelte).

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) 2 with [Svelte](https://svelte.dev/) 5
- [Konva](https://konvajs.org/) for canvas rendering
- [Tailwind CSS](https://tailwindcss.com/) 4 for styling
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for development and builds
- [Vitest](https://vitest.dev/) for unit tests
- [Playwright](https://playwright.dev/) for end‑to‑end tests

## Getting Started

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The server runs at `http://localhost:5173`. Use `pnpm dev -- --open` to open
the app in a new browser tab automatically.

## Building

Create an optimized production build and preview it locally:

```bash
pnpm build
pnpm preview
```

## Testing

Run the automated test suites:

```bash
pnpm test       # unit tests (Vitest)
 pnpm test:e2e   # end‑to‑end tests (Playwright)
```

## Environment Variables

This project currently does not require any environment variables for local development or builds.

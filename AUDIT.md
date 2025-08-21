# Project Audit

## Project Snapshot
- **Framework**: SvelteKit 2.20.7 / Svelte 5.28.1 / Vite 6.3.2
- **Adapter**: `@sveltejs/adapter-auto` (no production target configured)
- **Styling**: TailwindCSS 4 with forms plugin
- **Key deps**: Konva drawing library
- **Build output** (server):
  - `index.js` 106 kB, `internal.js` 50 kB, `_page.svelte.js` 5.5 kB
- **Routes**: single root route (`+page.svelte`)

## Top Risks
| # | Risk | Impact | Effort |
|---|------|--------|--------|
|1|Monolithic `DrawingCanvas.svelte` (~818 lines) complicates maintenance|P1|L|
|2|Canvas UI lacks keyboard/ARIA support; `svelte-ignore` used|P1|M|
|3|No automated tests or testing framework|P1|M|
|4|Adapter-auto without deployment target may fail in production|P2|S|
|5|Global event listeners (resize, keydown) without cleanup could leak|P2|M|
|6|No Content-Security-Policy or security headers|P2|M|
|7|Konva bundled on initial load, hindering perf|P2|M|
|8|Missing code-splitting; all logic loads on root page|P3|M|
|9|No error boundaries or loading states|P3|S|
|10|No CSP/helmet for server-side headers|P3|M|

## Quick Wins
1. Add newline at end of `+page.svelte` to fix shell prompt artifact.
2. Configure explicit adapter (e.g., Node, Cloudflare) in `svelte.config.js`.
3. Add `lang="en"` and `<title>` in `app.html` head.
4. Replace `svelte-ignore` usage with accessible separator element.
5. Add keyboard handlers for canvas actions (zoom, pan, resize).
6. Export `DrawingCanvas` helper modules to shrink component.
7. Use `konva` dynamic import to defer load.
8. Enable strict ESLint rules for `any` usage.
9. Add `npm audit` script and update vulnerable packages.
10. Add `precommit` hook running `lint` and `check`.
11. Document environment variables in README.
12. Add meta viewport testing (already there) but use `max-scale=1` for accessibility.
13. Compress build assets using adapter's options.
14. Implement svelte-kit `load` returning data to page.
15. Provide fallback text/content when canvas unsupported.

## Deeper Work
- **Modularize Drawing Canvas**: split into store and UI modules under `src/lib/canvas/`.
- **Accessibility overhaul**: introduce ARIA roles, keyboard navigation, focus management.
- **Testing setup**: add Vitest for unit tests and Playwright for e2e under `tests/`.
- **Security hardening**: add CSP headers and sanitize user-drawn data before serialization.
- **Performance**: introduce code-splitting with route-level lazy loading and optimize Konva usage.

## Performance
- Build output shows 106 kB server bundle; Konva loaded eagerly.
- Single route means no code-splitting; dynamic import of Konva recommended.
- No image strategy or asset optimization configured.
- Frequent DOM queries and `window` listeners could impact hydration.

## Accessibility
- `svelte-ignore` bypasses non-interactive element interaction warnings at the resize handle.
- Canvas relies on pointer events only; no keyboard alternatives.
- Lacks ARIA labels/roles for buttons and status messages.

## Security
- `app.html` lacks CSP/meta security headers.
- Global `window` event handlers may be susceptible to injection if not guarded.
- No server-side routes, but ensure serialized drawing data is validated before persistence.

## SvelteKit Usage
- Minimal routing: only `+layout.svelte` and `+page.svelte`.
- No `load` functions or invalidation logic; route tree is flat.
- Adapter-auto warns about production environment detection.

## Developer Experience
- ESLint/Prettier and `svelte-check` scripts present, but no tests.
- Huge component hinders readability; refactor into smaller modules.
- Consider adding `svelte-check --watch` in dev workflow.

## Testing Gaps
- No unit or E2E tests. Suggested tests:
  - `DrawingCanvas` zoom/pan interactions (unit)
  - Keyboard navigation for anchors (unit)
  - End-to-end test creating and undoing lines (Playwright)

## Appendix: Notes
- `src/lib/components/DrawingCanvas.svelte`: split state management, remove `any` types, add cleanup for listeners.
- `src/routes/+page.svelte`: provide semantic wrappers and title.
- `svelte.config.js`: switch from adapter-auto to specific adapter.



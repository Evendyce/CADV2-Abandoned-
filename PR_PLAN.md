# PR Plan

| Item                                                             | Done                                             |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| Top Risk #1: Modularize DrawingCanvas.svelte                     |                                                  |
| Top Risk #2: Canvas keyboard/ARIA support                        |                                                  |
| Top Risk #4: Adapter-auto documentation                          | [PR#2](https://github.com/Evendyce/CADV2/pull/2) |
| Top Risk #5: Global listeners cleanup                            | [PR#6](https://github.com/Evendyce/CADV2/pull/6) |
| Top Risk #6: Content-Security-Policy and security headers        | [PR#7](https://github.com/Evendyce/CADV2/pull/7) |
| Top Risk #7: Defer Konva bundle                                  | [PR#2](https://github.com/Evendyce/CADV2/pull/2) |
| Top Risk #8: Route-level code-splitting                          |                                                  |
| Top Risk #9: Error boundaries and loading states                 |                                                  |
| Top Risk #10: CSP/helmet for server headers                      |                                                  |
| Quick Win 1: Add newline at end of +page.svelte                  | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 2: Configure explicit adapter in svelte.config.js      | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 3: Add lang="en" and <title> in app.html head          | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 4: Replace svelte-ignore with accessible separator     | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 5: Add keyboard handlers for canvas actions            |                                                  |
| Quick Win 6: Export DrawingCanvas helper modules                 |                                                  |
| Quick Win 7: Use konva dynamic import to defer load              | [PR#2](https://github.com/Evendyce/CADV2/pull/2) |
| Quick Win 8: Enable strict ESLint rules for any usage            | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 9: Add npm audit script and update vulnerable packages | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 10: Add precommit hook running lint and check          | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 11: Document environment variables in README           | [PR#4](https://github.com/Evendyce/CADV2/pull/4) |
| Quick Win 12: Add meta viewport max-scale=1                      | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 13: Compress build assets using adapter's options      | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 14: Implement svelte-kit load returning data to page   | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Quick Win 15: Provide fallback text when canvas unsupported      | [PR#5](https://github.com/Evendyce/CADV2/pull/5) |
| Deeper Work: Modularize Drawing Canvas                           |                                                  |
| Deeper Work: Accessibility overhaul                              |                                                  |
| Deeper Work: Security hardening                                  |                                                  |
| Deeper Work: Performance                                         |                                                  |

=======

# Pull Request Plan

## Checklist

### Top Risks

- [ ] Monolithic `DrawingCanvas.svelte` (~818 lines) complicates maintenance
- [ ] Canvas UI lacks keyboard/ARIA support; `svelte-ignore` used
- [x] No automated tests or testing framework
- [x] Adapter-auto without deployment target may fail in production
- [x] Global event listeners (resize, keydown) without cleanup could leak
- [x] No Content-Security-Policy or security headers
- [x] Konva bundled on initial load, hindering performance
- [ ] Missing code-splitting; all logic loads on root page
- [ ] No error boundaries or loading states
- [ ] No CSP/helmet for server-side headers

### Quick Wins

- [x] Add newline at end of `+page.svelte`
- [x] Configure explicit adapter (e.g., Node, Cloudflare) in `svelte.config.js`
- [x] Add `lang="en"` and `<title>` in `app.html` head
- [x] Replace `svelte-ignore` usage with accessible separator element
- [ ] Add keyboard handlers for canvas actions (zoom, pan, resize)
- [ ] Export `DrawingCanvas` helper modules to shrink component
- [x] Use `konva` dynamic import to defer load
- [x] Enable strict ESLint rules for `any` usage
- [x] Add `npm audit` script and update vulnerable packages
- [x] Add `precommit` hook running `lint` and `check`
- [x] Document environment variables in README
- [x] Add meta viewport `max-scale=1` for accessibility
- [x] Compress build assets using adapter's options
- [x] Implement svelte-kit `load` returning data to page
- [x] Provide fallback text/content when canvas unsupported

### Deeper Work

- [ ] Modularize Drawing Canvas into store and UI modules under `src/lib/canvas/`
- [ ] Accessibility overhaul: ARIA roles, keyboard navigation, focus management
- [x] Testing setup: add Vitest for unit tests and Playwright for e2e under `tests/`
- [ ] Security hardening: add CSP headers and sanitize user-drawn data before serialization
- [ ] Performance: code-splitting with route-level lazy loading and optimize Konva usage

## Planned Pull Requests

| #   | Title                                            | Branch                     | Files/Areas                                                  | Acceptance Criteria                                               | Est. LOC | Labels       | Done                                             |
| --- | ------------------------------------------------ | -------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------ |
| 1   | Testing framework baseline (Vitest & Playwright) | tests/setup                | `package.json`, `tests/`                                     | Vitest and Playwright installed; sample tests run.                | ~80      | tests, dx    |                                                  |
| 2   | Split DrawingCanvas into modules                 | refactor/split-canvas      | `src/lib/components/DrawingCanvas.svelte`, `src/lib/canvas/` | Component divided into store and UI modules with same behavior.   | ~400     | refactor     |                                                  |
| 3   | Add keyboard and ARIA support for canvas         | a11y/canvas-aria           | `src/lib/components/DrawingCanvas.svelte`                    | Keyboard navigation and ARIA roles added; remove `svelte-ignore`. | ~120     | a11y         |                                                  |
| 4   | Configure explicit adapter                       | dx/adapter-node            | `svelte.config.js`                                           | Use `adapter-node` with production target.                        | ~20      | dx           |                                                  |
| 5   | Cleanup global event listeners                   | refactor/cleanup-listeners | `src/lib/components/DrawingCanvas.svelte`                    | Listeners registered with proper cleanup on destroy.              | ~40      | refactor     | [PR#6](https://github.com/Evendyce/CADV2/pull/6) |
| 6   | Add CSP meta tags                                | security/csp-meta          | `src/app.html`                                               | Add CSP and security headers in HTML.                             | ~30      | security     | [PR#7](https://github.com/Evendyce/CADV2/pull/7) |
| 7   | Lazy-load Konva                                  | perf/dynamic-konva         | `src/lib/components/DrawingCanvas.svelte`                    | Use dynamic import to load Konva on demand.                       | ~60      | perf         |                                                  |
| 8   | Code-splitting root page                         | perf/code-split-root       | `src/routes/+page.svelte`                                    | Implement dynamic imports to defer heavy logic.                   | ~80      | perf         |                                                  |
| 9   | Add error boundaries and loading states          | dx/error-boundaries        | `src/routes/+layout.svelte`, `src/routes/+page.svelte`       | Error boundary and loading UI added.                              | ~40      | dx           |                                                  |
| 10  | Server-side security headers                     | security/server-headers    | `src/hooks.server.ts` or config                              | Set CSP and helmet-style headers on server responses.             | ~50      | security     |                                                  |
| 11  | Newline at end of +page.svelte                   | dx/page-newline            | `src/routes/+page.svelte`                                    | File ends with newline; no shell artifact.                        | 1        | dx           |                                                  |
| 12  | Add lang and title to app.html                   | a11y/html-lang-title       | `src/app.html`                                               | `<html lang="en">` and page `<title>` included.                   | ~10      | a11y         |                                                  |
| 13  | Replace svelte-ignore separator                  | a11y/remove-svelte-ignore  | `src/lib/components/DrawingCanvas.svelte`                    | Use semantic element instead of `svelte-ignore`.                  | ~20      | a11y         |                                                  |
| 14  | Keyboard handlers for canvas actions             | a11y/canvas-keyboard       | `src/lib/components/DrawingCanvas.svelte`                    | Zoom, pan, resize accessible via keyboard.                        | ~80      | a11y         |                                                  |
| 15  | Export canvas helper modules                     | refactor/export-helpers    | `src/lib/canvas/`                                            | Helper modules exported separately; component reduced.            | ~80      | refactor     |                                                  |
| 16  | Enable strict any rules in ESLint                | dx/no-any-rule             | `eslint.config.js`                                           | Disallow `any` usage via rule configuration.                      | ~10      | dx           |                                                  |
| 17  | Add npm audit script                             | security/npm-audit         | `package.json`                                               | `pnpm audit` script added and dependencies updated if vulnerable. | ~20      | security, dx |                                                  |
| 18  | Precommit hook for lint and check                | dx/precommit               | `package.json`, `.husky/pre-commit`                          | Git hook runs `lint` and `check` before commit.                   | ~30      | dx           |                                                  |
| 19  | Document environment variables                   | docs/env-vars              | `README.md`                                                  | Env vars documented with descriptions.                            | ~20      | docs         |                                                  |
| 20  | Viewport meta max-scale=1                        | a11y/meta-viewport         | `src/app.html`                                               | Meta viewport includes `max-scale=1`.                             | ~5       | a11y         |                                                  |
| 21  | Compress build assets                            | perf/compress-assets       | `svelte.config.js`, adapter options                          | Compression enabled for build assets.                             | ~20      | perf         |                                                  |
| 22  | Implement load function                          | perf/page-load             | `src/routes/+page.ts` & `+page.svelte`                       | Page uses `load` to fetch data.                                   | ~40      | perf         |                                                  |
| 23  | Fallback text for unsupported canvas             | a11y/canvas-fallback       | `src/lib/components/DrawingCanvas.svelte`                    | Display message when canvas not supported.                        | ~15      | a11y         |                                                  |
| 24  | Modularize drawing canvas further                | refactor/canvas-modular    | `src/lib/canvas/`                                            | Stores and UI modules structured under `src/lib/canvas/`.         | ~120     | refactor     |                                                  |
| 25  | Accessibility overhaul                           | a11y/overhaul              | `src/`                                                       | ARIA roles, focus management across app.                          | ~200     | a11y         |                                                  |
| 26  | Extended testing suite                           | tests/expanded             | `tests/`                                                     | Vitest unit tests and Playwright e2e tests implemented.           | ~150     | tests        |                                                  |
| 27  | Security hardening                               | security/hardening         | `src/app.html`, `server`                                     | CSP headers and data sanitization implemented.                    | ~100     | security     |                                                  |
| 28  | Route-level code-splitting & Konva optimizations | perf/route-splitting       | `src/routes/`, `src/lib/components`                          | Lazy load routes and optimize Konva usage.                        | ~150     | perf         |                                                  |

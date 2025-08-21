# Pull Request Plan

## Checklist

### Top Risks
- [ ] Monolithic `DrawingCanvas.svelte` (~818 lines) complicates maintenance
- [ ] Canvas UI lacks keyboard/ARIA support; `svelte-ignore` used
- [ ] No automated tests or testing framework
- [ ] Adapter-auto without deployment target may fail in production
- [ ] Global event listeners (resize, keydown) without cleanup could leak
- [ ] No Content-Security-Policy or security headers
- [ ] Konva bundled on initial load, hindering performance
- [ ] Missing code-splitting; all logic loads on root page
- [ ] No error boundaries or loading states
- [ ] No CSP/helmet for server-side headers

### Quick Wins
- [ ] Add newline at end of `+page.svelte`
- [ ] Configure explicit adapter (e.g., Node, Cloudflare) in `svelte.config.js`
- [ ] Add `lang="en"` and `<title>` in `app.html` head
- [ ] Replace `svelte-ignore` usage with accessible separator element
- [ ] Add keyboard handlers for canvas actions (zoom, pan, resize)
- [ ] Export `DrawingCanvas` helper modules to shrink component
- [ ] Use `konva` dynamic import to defer load
- [ ] Enable strict ESLint rules for `any` usage
- [ ] Add `npm audit` script and update vulnerable packages
- [ ] Add `precommit` hook running `lint` and `check`
- [ ] Document environment variables in README
- [ ] Add meta viewport `max-scale=1` for accessibility
- [ ] Compress build assets using adapter's options
- [ ] Implement svelte-kit `load` returning data to page
- [ ] Provide fallback text/content when canvas unsupported

### Deeper Work
- [ ] Modularize Drawing Canvas into store and UI modules under `src/lib/canvas/`
- [ ] Accessibility overhaul: ARIA roles, keyboard navigation, focus management
- [ ] Testing setup: add Vitest for unit tests and Playwright for e2e under `tests/`
- [ ] Security hardening: add CSP headers and sanitize user-drawn data before serialization
- [ ] Performance: code-splitting with route-level lazy loading and optimize Konva usage

## Planned Pull Requests
| # | Title | Branch | Files/Areas | Acceptance Criteria | Est. LOC | Labels | Done |
|---|-------|--------|-------------|---------------------|----------|--------|------|
|1|Testing framework baseline (Vitest & Playwright)|tests/setup|`package.json`, `tests/`|Vitest and Playwright installed; sample tests run.|~80|tests, dx| |
|2|Split DrawingCanvas into modules|refactor/split-canvas|`src/lib/components/DrawingCanvas.svelte`, `src/lib/canvas/`|Component divided into store and UI modules with same behavior.|~400|refactor| |
|3|Add keyboard and ARIA support for canvas|a11y/canvas-aria|`src/lib/components/DrawingCanvas.svelte`|Keyboard navigation and ARIA roles added; remove `svelte-ignore`.|~120|a11y| |
|4|Configure explicit adapter|dx/adapter-node|`svelte.config.js`|Use `adapter-node` with production target.|~20|dx| |
|5|Cleanup global event listeners|refactor/cleanup-listeners|`src/lib/components/DrawingCanvas.svelte`|Listeners registered with proper cleanup on destroy.|~40|refactor| |
|6|Add CSP meta tags|security/csp-meta|`src/app.html`|Add CSP and security headers in HTML.|~30|security| |
|7|Lazy-load Konva|perf/dynamic-konva|`src/lib/components/DrawingCanvas.svelte`|Use dynamic import to load Konva on demand.|~60|perf| |
|8|Code-splitting root page|perf/code-split-root|`src/routes/+page.svelte`|Implement dynamic imports to defer heavy logic.|~80|perf| |
|9|Add error boundaries and loading states|dx/error-boundaries|`src/routes/+layout.svelte`, `src/routes/+page.svelte`|Error boundary and loading UI added.|~40|dx| |
|10|Server-side security headers|security/server-headers|`src/hooks.server.ts` or config|Set CSP and helmet-style headers on server responses.|~50|security| |
|11|Newline at end of +page.svelte|dx/page-newline|`src/routes/+page.svelte`|File ends with newline; no shell artifact.|1|dx| |
|12|Add lang and title to app.html|a11y/html-lang-title|`src/app.html`|`<html lang="en">` and page `<title>` included.|~10|a11y| |
|13|Replace svelte-ignore separator|a11y/remove-svelte-ignore|`src/lib/components/DrawingCanvas.svelte`|Use semantic element instead of `svelte-ignore`.|~20|a11y| |
|14|Keyboard handlers for canvas actions|a11y/canvas-keyboard|`src/lib/components/DrawingCanvas.svelte`|Zoom, pan, resize accessible via keyboard.|~80|a11y| |
|15|Export canvas helper modules|refactor/export-helpers|`src/lib/canvas/`|Helper modules exported separately; component reduced.|~80|refactor| |
|16|Enable strict any rules in ESLint|dx/no-any-rule|`eslint.config.js`|Disallow `any` usage via rule configuration.|~10|dx| |
|17|Add npm audit script|security/npm-audit|`package.json`|`pnpm audit` script added and dependencies updated if vulnerable.|~20|security, dx| |
|18|Precommit hook for lint and check|dx/precommit|`package.json`, `.husky/pre-commit`|Git hook runs `lint` and `check` before commit.|~30|dx| |
|19|Document environment variables|docs/env-vars|`README.md`|Env vars documented with descriptions.|~20|docs| |
|20|Viewport meta max-scale=1|a11y/meta-viewport|`src/app.html`|Meta viewport includes `max-scale=1`.|~5|a11y| |
|21|Compress build assets|perf/compress-assets|`svelte.config.js`, adapter options|Compression enabled for build assets.|~20|perf| |
|22|Implement load function|perf/page-load|`src/routes/+page.ts` & `+page.svelte`|Page uses `load` to fetch data.|~40|perf| |
|23|Fallback text for unsupported canvas|a11y/canvas-fallback|`src/lib/components/DrawingCanvas.svelte`|Display message when canvas not supported.|~15|a11y| |
|24|Modularize drawing canvas further|refactor/canvas-modular|`src/lib/canvas/`|Stores and UI modules structured under `src/lib/canvas/`.|~120|refactor| |
|25|Accessibility overhaul|a11y/overhaul|`src/`|ARIA roles, focus management across app.|~200|a11y| |
|26|Extended testing suite|tests/expanded|`tests/`|Vitest unit tests and Playwright e2e tests implemented.|~150|tests| |
|27|Security hardening|security/hardening|`src/app.html`, `server`|CSP headers and data sanitization implemented.|~100|security| |
|28|Route-level code-splitting & Konva optimizations|perf/route-splitting|`src/routes/`, `src/lib/components`|Lazy load routes and optimize Konva usage.|~150|perf| |

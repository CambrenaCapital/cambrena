# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install deps
npm run dev          # dev server on http://localhost:8080 (host "::")
npm run build        # SSG production build via vite-react-ssg → dist/
npm run build:dev    # plain vite build, development mode (no prerender)
npm run preview      # serve the built dist/
npm run lint         # eslint
npx tsc --noEmit     # typecheck (no npm script for this)
```

There is **no test framework** in this repo — no vitest/jest, no test files, no test script. Don't suggest running tests; verify changes with `npm run build` (which exercises the prerender path, where most breakage shows up), `npx tsc --noEmit`, and the dev server.

The Cloudflare proxy in `proxy/` deploys separately and is not part of the site build:

```bash
cd proxy && npx wrangler deploy
```

## Architecture

### Static generation is the defining constraint

`src/main.tsx` boots through `ViteReactSSG` (not `createRoot`), and `src/App.tsx` exports a `routes: RouteRecord[]` array that is the single source of truth for routing — consumed at build time to prerender every route to HTML and at runtime to hydrate. There is no `<BrowserRouter>`; `basename` comes from `import.meta.env.BASE_URL`.

Practical consequences for any change under `src/`:

- **Module-scope and render-path code runs in Node during the build.** Touching `window`, `document`, or `localStorage` outside an effect will fail `npm run build`, not just misbehave at runtime.
- **Browser-only subtrees must be wrapped in `<ClientOnly>`** (from `vite-react-ssg`). `App.tsx` does this for the toasters (they portal into `document.body`) and for the entire `/vc-exits-explorer` route, which needs Web Workers and runtime fetches.
- **Non-deterministic render output causes hydration mismatch.** Avoid `Date.now()`/`Math.random()` in render.
- **Dynamic routes need `getStaticPaths`.** `/musings/:slug` enumerates paths from `posts`; a new dynamic route without this won't be prerendered.

### Metadata

Site-wide defaults live in a `<Head>` in `RootLayout` (`src/App.tsx`); per-route overrides go through `src/components/Seo.tsx`, which mirrors the tag set in `index.html`. Both render into the static HTML at build time so crawlers and social scrapers see real tags.

`public/sitemap.xml` is hand-maintained and currently **stale** — it lists only `/`, `/about-us`, `/imprint`, `/privacy-policy`, and omits `/musings`, `/musings/:slug`, and `/vc-exits-explorer`. Update it when adding routes.

### Writing / content pipeline

Articles are file-based: drop a markdown file with a YAML frontmatter block into `src/content/writing/` and it becomes a post. `src/lib/posts.ts` glob-imports them eagerly (`import.meta.glob` with `?raw`), parses frontmatter with `js-yaml`, and sorts by date descending. Frontmatter requires `title`, `slug`, `date`, `excerpt`, `tags`; `author` and `coverImage` are optional. A file with no frontmatter block **throws at import time**, which fails the build.

Images are referenced from markdown as `./public/foo.png` and resolved by `resolveAsset()` against `BASE_URL` — that indirection exists because the base path differs between the custom-domain and GitHub Pages deploys. Don't hardcode asset paths.

### VC exits explorer (`/vc-exits-explorer`)

The one genuinely stateful feature. An LLM-driven data analyst over two CSV datasets:

1. `src/lib/parseDataset.ts` fetches and papaparse-es the CSVs from `${BASE_URL}data/*.csv`, coercing dollar/percent/number columns to `number | null` (`loadDataset` → equity exits, `loadTokenDataset` → token listings).
2. `src/pages/VCExitsExplorer.tsx` orchestrates. Datasets live in refs, not state. `datasetType: 'equity' | 'token'` selects which dataset and which system prompt is active.
3. `src/lib/systemPrompt.ts` instructs the model to return **strict JSON** (`{type, title, explanation, analysisCode, chartConfig}`) where `analysisCode` is a *function body* receiving `data`. The prompt encodes the chart contract, color palette, and rounding rules — change it in lockstep with `ChartRenderer`/`TableRenderer`.
4. `src/lib/anthropicApi.ts` posts to the proxy. `sendMessageWithTools` runs a manual tool-use loop capped at `MAX_ITERATIONS = 10`.
5. `src/workers/analysis-worker.ts` evaluates `analysisCode` via `new Function('data', ...)` in a Web Worker that **nulls out `fetch`, `XMLHttpRequest`, `importScripts`, `WebSocket`, and `EventSource`** and enforces a 10s timeout. This sandbox is the security boundary for model-generated code — preserve it. It also unwraps `function(data){...}` / arrow wrappers the model sometimes emits despite the prompt.
6. Optional "live data" mode connects `src/lib/mcpClient.ts` to the CoinGecko MCP server through the same proxy, converts MCP tool defs to Anthropic tool defs, and appends `LIVE_DATA_ADDENDUM` to the system prompt.

### Proxy worker (`proxy/worker.js`)

Exists because the browser can't hold the Anthropic API key and both upstreams lack permissive CORS. Two routes: `/` forwards to `api.anthropic.com/v1/messages` injecting `ANTHROPIC_API_KEY` from Worker env (never shipped to the client), `/mcp` forwards to `mcp.api.coingecko.com/mcp` relaying the `Mcp-Session-Id` header both ways. Origin allowlist is `cambrena.net`, `www.cambrena.net`, `cambrenacapital.github.io`, plus any localhost port. The client points at it via `VITE_PROXY_URL`, defaulting to the deployed `workers.dev` URL.

### Styling

Tailwind + shadcn/ui over Radix primitives. Design tokens in `src/index.css` are **bare OKLCH `L C H` triplets** (not `oklch(...)` strings) consumed by `tailwind.config.ts` as `oklch(var(--token) / <alpha-value>)`. Any new token must follow that triplet convention or alpha modifiers break. Use semantic classes (`bg-background`, `text-foreground`, `border-border`) rather than raw hex.

`tailwind.config.ts` sets `fontFamily.sans` to `['Garet', 'sans-serif']`, but no `@font-face`, webfont link, or font file for Garet exists in the repo — so `font-sans` currently resolves to the platform `sans-serif` unless the font happens to be installed locally. Bear this in mind before treating a local rendering as representative of production.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`. It auto-detects mode: `public/CNAME` present → custom-domain build (base `/`); otherwise → GitHub Pages build with `REPO_NAME` set, which `vite.config.ts` turns into `base: /${REPO_NAME}/`. Note `vite.config.ts` reads only `REPO_NAME` — the workflow's `USE_CUSTOM_DOMAIN` env var is not consumed anywhere, the custom-domain path simply leaves `base` at its `/` default.

## Repo-specific gotchas

- **TypeScript is deliberately loose**: `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`. The compiler will not catch null-safety bugs — check nullability by hand, especially around `parseDataset`'s `number | null` columns. `@typescript-eslint/no-unused-vars` is also off.
- **`VC_Backed_Exits_July.csv` exists twice**: `public/data/` (fetched at runtime — the one that matters) and `src/data_set/` (not imported by any code). Edit the `public/data/` copy.
- **`README.md`'s "Project Structure" section is out of date** — it lists `GeometricAccent.tsx` and `TriangleAccent.tsx`, which no longer exist, and omits the explorer, writing, and content directories.
- `@/*` aliases `./src/*` (set in both `vite.config.ts` and the tsconfigs).

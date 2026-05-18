# Tridel — Deep Technical Documentation

> **Audience**: developers and ops engineers who will read, run, debug, extend, or hand off this repository.
> **Goal**: be detailed enough that a new contributor can rebuild their mental model of every moving part **without ever guessing**, and shallow-step enough that a non-expert can still read it top-to-bottom.
> **Companion document**: `TECHNOLOGIES_AND_PLUGINS.md` (every library, font, API, and tool inventoried separately).

---

## Table of Contents

1.  [What this repository actually is](#1-what-this-repository-actually-is)
2.  [High-level architecture](#2-high-level-architecture)
3.  [Repository layout (annotated)](#3-repository-layout-annotated)
4.  [Bootstrapping & runtime modes](#4-bootstrapping--runtime-modes)
5.  **Part A — Marketing Website** (the public Tridel SPA)
    - [5.1 Shell (`index.html`)](#51-shell-indexhtml)
    - [5.2 Script load order & dependency graph](#52-script-load-order--dependency-graph)
    - [5.3 The data-as-CMS pattern](#53-the-data-as-cms-pattern)
    - [5.4 SPA hash router (`router.js`)](#54-spa-hash-router-routerjs)
    - [5.5 Page renderers (`assets/js/pages/*.js`)](#55-page-renderers-assetsjspagesjs)
    - [5.6 Section loaders (`*-loader.js`)](#56-section-loaders--loaderjs)
    - [5.7 Layout (`layout.js`) & shared components](#57-layout-layoutjs--shared-components)
    - [5.8 Theme system (light / dark)](#58-theme-system-light--dark)
    - [5.9 Smooth scrolling (Lenis)](#59-smooth-scrolling-lenis)
    - [5.10 The "LIVE / Simulation" gateway to the Hormuz app](#510-the-live--simulation-gateway-to-the-hormuz-app)
6.  **Part B — Admin Panel** (CMS-as-JS authoring UI)
    - [6.1 Shell (`admin.html`)](#61-shell-adminhtml)
    - [6.2 Authentication flow (server-backed + static fallback)](#62-authentication-flow-server-backed--static-fallback)
    - [6.3 Editing model — JS files as a database](#63-editing-model--js-files-as-a-database)
    - [6.4 GitHub publish pipeline](#64-github-publish-pipeline)
    - [6.5 Drag-and-drop ordering (SortableJS)](#65-drag-and-drop-ordering-sortablejs)
7.  **Part C — Express Backend** (`server.js`)
    - [7.1 Process model & boot sequence](#71-process-model--boot-sequence)
    - [7.2 Environment loading (`.env`, `.env.local`)](#72-environment-loading-env-envlocal)
    - [7.3 Password & session model (scrypt + in-memory map)](#73-password--session-model-scrypt--in-memory-map)
    - [7.4 Login rate limiting](#74-login-rate-limiting)
    - [7.5 Complete route inventory](#75-complete-route-inventory)
    - [7.6 Site-metrics persistence (`logs/site-metrics.json`)](#76-site-metrics-persistence-logssite-metricsjson)
    - [7.7 GitHub proxy endpoints](#77-github-proxy-endpoints)
    - [7.8 Security headers (CSP / HSTS / referrer / no-x-powered-by)](#78-security-headers-csp--hsts--referrer--no-x-powered-by)
    - [7.9 Static file serving & deny rules](#79-static-file-serving--deny-rules)
8.  **Part D — Hormuz Drift Simulation** (`simulation/`)
    - [8.1 Why it exists](#81-why-it-exists)
    - [8.2 Shell (`simulation/index.html`)](#82-shell-simulationindexhtml)
    - [8.3 Module load order](#83-module-load-order)
    - [8.4 `state.js` — central AppState](#84-statejs--central-appstate)
    - [8.5 `field.js` — forcing data, interpolation, land mask, chunking](#85-fieldjs--forcing-data-interpolation-land-mask-chunking)
    - [8.6 `drift.js` — particle physics & NOAA leeway](#86-driftjs--particle-physics--noaa-leeway)
    - [8.7 `weathering.js` — oil mass budget (Fingas + Mackay + Delvigne–Sweeney + Fay)](#87-weatheringjs--oil-mass-budget)
    - [8.8 `worker.js` — Web Worker integration loop](#88-workerjs--web-worker-integration-loop)
    - [8.9 `app.js` — Leaflet, canvases, render loop, UI](#89-appjs--leaflet-canvases-render-loop-ui)
    - [8.10 Map layering & Leaflet panes](#810-map-layering--leaflet-panes)
    - [8.11 Service worker caching (`sw.js`)](#811-service-worker-caching-swjs)
    - [8.12 Theme tokens (`simulation/css/theme.css`)](#812-theme-tokens-simulationcsstheme-css)
9.  **Part E — Python Data Pipeline** (`scripts/`)
    - [9.1 Pipeline overview](#91-pipeline-overview)
    - [9.2 `fetch_data.py` — CMEMS + Open-Meteo subsetting](#92-fetch_datapy--cmems--open-meteo-subsetting)
    - [9.3 `forcing_chunks.py` — chunked JSON output](#93-forcing_chunkspy--chunked-json-output)
    - [9.4 `prepare_data.py`, `validate_currents.py`, `smoke_check.py`](#94-prepare_datapy-validate_currentspy-smoke_checkpy)
    - [9.5 OpenDrift companion (`run_opendrift_hormuz.py`)](#95-opendrift-companion-run_opendrift_hormuzpy)
    - [9.6 GitHub Actions daily refresh](#96-github-actions-daily-refresh)
10. [Service workers, caching & versioning](#10-service-workers-caching--versioning)
11. [Security model (end-to-end)](#11-security-model-end-to-end)
12. [Build, run, deploy](#12-build-run-deploy)
13. [Performance & memory considerations](#13-performance--memory-considerations)
14. [Testing, validation, smoke checks](#14-testing-validation-smoke-checks)
15. [Troubleshooting & FAQ](#15-troubleshooting--faq)
16. [Glossary](#16-glossary)

---

## 1. What this repository actually is

This repo is **two products glued together**, plus a small data pipeline.

| # | Sub-product | Purpose | Lives in |
| - | ----------- | ------- | -------- |
| 1 | **Tridel marketing website** | Public corporate website for Tridel Technologies — products, services, success stories, contact, careers. | repo root (`index.html`, `assets/`, page renderers) |
| 2 | **Hormuz Drift simulation** | Interactive Lagrangian particle-tracking model of oil-spill / search-and-rescue drift in the Strait of Hormuz, with NOAA leeway, Stokes drift, eddy diffusion, and ADIOS-style weathering. | `simulation/` |
| 3 | **Express backend** | Thin Node server that powers the admin panel (login, save, publish-to-GitHub) and serves both products in production. | `server.js` |
| 4 | **Python data factory** | Daily refresh of ocean-current and wind forcing data from Copernicus Marine + Open-Meteo, compressed into chunked JSON the browser model can stream. | `scripts/` |

There is **no bundler, no transpiler, and no build step** for the public site. Every JavaScript file ships as-is. This is deliberate: it makes the site portable to GitHub Pages, makes the admin "save" workflow trivial (a save just rewrites a JS file), and keeps the simulation in plain ES2017 that any browser from 2019+ can run.

## 2. High-level architecture

```
                ┌─────────────────────────────────────────────────────────────────┐
                │                          BROWSER                                │
                │                                                                 │
                │   ┌─────────────────┐         ┌─────────────────────────────┐   │
                │   │ Tridel SPA      │         │  Hormuz Drift simulation    │   │
                │   │ (index.html)    │  link   │  (simulation/index.html)    │   │
                │   │                 │ ──────► │                             │   │
                │   │  hash-router    │         │  Leaflet + canvas overlays  │   │
                │   │  page renderers │         │  Web Worker integration     │   │
                │   │  JS-as-CMS data │         │  Plotly analytics           │   │
                │   └────────┬────────┘         └──────────┬──────────────────┘   │
                │            │                             │                      │
                │            ▼                             ▼                      │
                │   ┌─────────────────┐         ┌─────────────────────────────┐   │
                │   │ admin.html      │         │  data/chunks/*.json         │   │
                │   │ (CMS UI)        │         │  cached by sw.js            │   │
                │   └────────┬────────┘         └─────────────┬───────────────┘   │
                └────────────┼────────────────────────────────┼───────────────────┘
                             │ /api/*                         │ GET
                             ▼                                ▼
                ┌────────────────────────────────┐  ┌────────────────────────────┐
                │  Node + Express (server.js)    │  │ CDN / static host          │
                │  • /api/login                  │  │ (or Express also serves)   │
                │  • /api/admin/save             │  └────────────────────────────┘
                │  • /api/github/*               │              ▲
                │  • /api/site-metrics           │              │
                │  • static file serving         │              │ daily refresh
                │  • CSP / HSTS / CORS           │              │
                └────────────────┬───────────────┘              │
                                 │                              │
                                 │ persists                     │
                                 ▼                              │
                ┌────────────────────────────────┐               │
                │  logs/site-metrics.json        │               │
                │  data/, simulation/data/       │ ◄─────────────┘
                │  assets/js/*-data.js           │ written by scripts/fetch_data.py
                └────────────────────────────────┘ and admin "Save" / GitHub publish
```

Key things this diagram makes explicit:

- The **browser is the integration point**. The two SPAs talk to each other only through navigation (the marketing site has a CTA that opens `/simulation/`).
- **No database**. State lives in:
  - versioned `*-data.js` files (marketing content),
  - versioned chunked JSON forcing data (simulation),
  - a single `logs/site-metrics.json` file maintained by Express,
  - in-memory `Map`s in Express for sessions and rate-limit buckets (lost on restart, by design).
- **Two deployment shapes**: the bundle can be hosted as pure static files, **or** behind Express. The simulation runs identically in both.

## 3. Repository layout (annotated)

```
.
├── index.html                       # Marketing SPA shell — see §5.1
├── admin.html                       # Admin/CMS shell — see Part B
├── server.js                        # Express backend (1,124 LOC) — see Part C
├── package.json                     # Tiny — only express + cors as deps
├── package-lock.json
├── 404.html                         # Static-host 404 page
├── _headers                         # Netlify-style header rules
├── _redirects                       # Netlify-style rewrite/deny rules
├── web.config                       # IIS rewrite config (for Azure / IIS hosting)
├── README.md
├── TECHNICAL_DOCUMENTATION.md       # ← this file
├── TECHNOLOGIES_AND_PLUGINS.md      # companion: every dependency catalogued
├── verify_news.txt                  # snapshot used to verify news loader output
│
├── card-concepts.html               # design sandbox pages (not linked from prod nav)
├── linkedin-card-gallery.html
├── linkedin-feed-concept.html
├── usv-viewer.html                  # standalone USV (Unmanned Surface Vessel) viewer
│
├── assets/
│   ├── css/                         # Public-site stylesheets (Inter, design tokens, page styles)
│   │   ├── styles.css               # core stylesheet (~6 KLOC) — see §5.7
│   │   ├── fonts.css                # @font-face declarations for self-hosted Inter
│   │   └── admin.css                # admin-panel-specific styles
│   │
│   ├── fonts/                       # Self-hosted Inter (Variable + static .woff2)
│   ├── images/                      # Logos, page imagery, products/services
│   ├── vendor/
│   │   └── lenis/lenis.min.js       # Smooth-scroll library
│   │
│   └── js/
│       ├── utils.js                 # escapeHtml + tiny helpers (loaded first)
│       ├── viewport-detector.js     # mobile/tablet/desktop breakpoint reporting
│       ├── theme-toggle.js          # runs in <head>, prevents theme-flash
│       │
│       │ # ── DATA FILES (content) ─────────────────────────────────────────
│       ├── products-data.js         # one row per product
│       ├── services-data.js
│       ├── home-data.js
│       ├── news-data.js
│       ├── clients-data.js
│       ├── success-stories-data.js
│       ├── team-data.js
│       ├── testimonials-data.js
│       ├── contact-data.js
│       ├── locations-data.js
│       ├── settings-data.js
│       ├── index-page-data.js       # home-hero / stats / what-we-do
│       ├── about-page-data.js
│       ├── contact-page-data.js
│       ├── honors-awards-data.js
│       └── layout-data.js           # header NAV_LINKS, footer columns
│       │
│       │ # ── LOADERS (data → DOM HTML strings) ──────────────────────────
│       ├── products-loader.js
│       ├── services-loader.js
│       ├── home-loader.js           # renderHomeCards() — see §5.6
│       ├── news-loader.js
│       ├── clients-loader.js
│       ├── success-stories-loader.js
│       ├── team-loader.js
│       ├── product-detail-loader.js
│       ├── service-detail-loader.js
│       ├── testimonial-map-loader.js
│       ├── locations-loader.js
│       └── settings-loader.js
│       │
│       │ # ── LAYOUT / SPA INFRASTRUCTURE ──────────────────────────────
│       ├── components.js            # reusable HTML fragments (cards, ctas, …)
│       ├── layout.js                # renders #header-root and #footer-root
│       ├── router.js                # hash-based SPA router with lazy page scripts
│       ├── script.js                # legacy "behavior" helpers: scroll reveals, etc.
│       ├── bg-animation.js          # animated background canvas (home)
│       ├── bg-animation-future.js   # alternate animation variant
│       ├── smooth-scroll.js         # Lenis wiring
│       │
│       │ # ── PAGE RENDERERS (lazy-loaded except home) ────────────────
│       └── pages/
│           ├── home.js              # eager — bundled in index.html script list
│           ├── about.js
│           ├── products.js
│           ├── product-detail.js
│           ├── services.js
│           ├── service-detail.js
│           ├── success-stories.js
│           ├── articles-blogs.js
│           ├── honors-awards.js
│           ├── contact.js
│           └── careers.js
│       │
│       │ # ── ADMIN UI ─────────────────────────────────────────────────
│       ├── admin.js                 # main admin orchestration
│       ├── admin-auth.js            # login gate + static SHA-256 fallback
│       ├── admin-form-rows.js       # editable row UI for arrays-of-objects
│       ├── admin-ui.js              # toolbar, tabs, dialogs
│       ├── admin-github.js          # GitHub-API publish flow
│       └── admin-publish.js         # batch publish helpers
│
├── scripts/                         # Python data factory + PowerShell helpers
│   ├── fetch_data.py                # CMEMS + Open-Meteo → currents.json
│   ├── fetch_rtofs_data.py          # alternate forcing source (NOAA RTOFS)
│   ├── forcing_chunks.py            # chunked JSON writer (Part E)
│   ├── prepare_data.py
│   ├── validate_currents.py
│   ├── smoke_check.py
│   ├── run_opendrift_hormuz.py      # OpenDrift reference simulation
│   ├── build_graphify.py            # builds knowledge-graph artifacts
│   ├── extract_product_data.js      # Node helper to harvest legacy product data
│   ├── extract_product_data.ps1
│   ├── extract_service_data.ps1
│   ├── merge_product_data.ps1
│   ├── Manage-Content.ps1
│   ├── Content-Manager-GUI.ps1      # WinForms GUI wrapper for admin tasks
│   ├── Open Content Manager.bat
│   └── Start Admin Server.bat
│
├── simulation/                      # Hormuz drift app (Part D)
│   ├── index.html                   # simulation shell
│   ├── README.md
│   ├── sw.js                        # service worker (chunk caching)
│   ├── assets/                      # simulation-specific images (logos, etc.)
│   ├── css/
│   │   ├── style.css                # baseline styles
│   │   ├── ui-cleanup.css           # tweaks layered on style.css
│   │   └── theme.css                # ★ SINGLE SOURCE OF TRUTH for theme tokens
│   ├── data/
│   │   ├── currents.json            # manifest (lats, lons, times, list-of-chunks)
│   │   └── chunks/                  # immutable chunk files referenced by manifest
│   └── js/
│       ├── state.js                 # central AppState (37 LOC)
│       ├── field.js                 # forcing-data query engine
│       ├── drift.js                 # Lagrangian physics
│       ├── weathering.js            # oil-mass budget (Fingas/Mackay/Delvigne/Fay)
│       ├── worker.js                # Web Worker — runs the integration off-main
│       └── app.js                   # Leaflet + canvas overlays + UI wiring
│
├── archive/                         # frozen old code, not loaded by anything live
├── graphify-out/                    # build output from build_graphify.py
└── logs/
    └── site-metrics.json            # written by server.js — see §7.6
```

## 4. Bootstrapping & runtime modes

The repo can run in three distinct ways:

### 4.1 File-system mode (`file://`)

Just double-click `index.html`. **Most things work** because content lives in JS data files, but:
- the simulation refuses to load (`field.js` throws an explicit "use http://localhost" error — the chunked JSON architecture relies on `fetch()`),
- the admin panel can only use the **static SHA-256 fallback hash** (no Express),
- no metrics tracking,
- service worker is not registered.

### 4.2 Static-host mode (GitHub Pages, Netlify, Cloudflare Pages, S3+CloudFront)

The marketing site **and** the simulation work end-to-end. Express routes do not exist, so:
- `/api/login` returns 404 — the admin falls back to the public hash flow in `admin-auth.js`,
- "save" actions go directly to GitHub via the `admin-github.js` client (requires the user to paste a PAT),
- `_headers`, `_redirects`, `404.html`, and `web.config` are the host-specific configs.

### 4.3 Express mode (recommended for any production admin workflow)

`node server.js` (or `npm start`) does everything static-host mode does **and**:
- exposes `/api/*` admin routes (server-side scrypt login, server-managed GitHub token),
- enforces CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
- applies a 5-attempts / 15-minute login rate limit per IP,
- writes site-metrics to `logs/site-metrics.json`,
- can be put behind a reverse proxy (Nginx, Caddy, IIS, Cloudflare Tunnel).

---

# PART A — Marketing Website

The Tridel marketing site is a **single-page application** built on a deliberately small stack: vanilla JS, plain HTML, and CSS. There is no framework, no virtual DOM, no JSX, no compile step.

## 5.1 Shell (`index.html`)

`index.html` is a fixed scaffold. The `<head>` does five things:

1. **Robots meta**: `noindex, nofollow, noarchive, nosnippet, noimageindex` — the deployed site is currently set to be excluded from search engines. Remove this when the site is ready for public indexing.
2. **JSON-LD organization schema** — declares Tridel as an `Organization` with address and LinkedIn profile, so Google rich results can render correctly once the robots meta is relaxed.
3. **Fonts & icons** — `assets/css/fonts.css` for self-hosted Inter; Font Awesome 6.4.0 from cdnjs for icons.
4. **Stylesheets** — `assets/css/styles.css` (~6 KLOC) is the main stylesheet; theme variables live at the top.
5. **Theme-flash prevention** — `assets/js/theme-toggle.js` is loaded synchronously in `<head>` so the chosen theme (`localStorage.theme === 'dark'`) is applied before paint.

The `<body>` has just three live regions:

```html
<a class="skip-link" href="#main-content">Skip to content</a>
<noscript>...</noscript>
<div id="header-root"></div>
<main id="main-content"></main>
<div id="footer-root"></div>
```

Every visible pixel of the site is **rendered into those three nodes by JavaScript at runtime**. The boot script at the bottom of `index.html` runs:

```js
window.initLayout();   // populates #header-root and #footer-root
window.initRouter();   // reads window.location.hash, invokes the matching renderer
```

## 5.2 Script load order & dependency graph

The order in `index.html` is intentional and load-order-sensitive (no module system). The actual order:

| Tier | Files | What they expose | Why this order |
|------|-------|------------------|----------------|
| 1. Core utilities | `utils.js`, `viewport-detector.js` | `escapeHtml`, `isSectionVisible`, viewport breakpoint events | every other file imports these globals |
| 2. Data files | `products-data.js`, `services-data.js`, `home-data.js`, `news-data.js`, `clients-data.js`, `success-stories-data.js`, `team-data.js`, `testimonials-data.js`, `contact-data.js`, `locations-data.js`, `settings-data.js`, `settings-loader.js` | global arrays/objects (e.g. `window.PRODUCTS`, `window.SERVICES`) | no DOM dependency, can be parsed early |
| 3. Page-specific data | `index-page-data.js`, `about-page-data.js`, `contact-page-data.js`, `honors-awards-data.js`, `layout-data.js` | `INDEX_HERO`, `INDEX_STATS`, `INDEX_WHAT_WE_DO`, `NAV_LINKS`, etc. | needed by their loaders / layout |
| 4. Loaders | `*-loader.js` | `renderHomeCards`, `renderProductsGrid`, `renderClientLogos`, … | depend on data files |
| 5. SPA infra | `components.js`, `layout.js` | shared UI fragments + header/footer renderers | depend on data + loaders |
| 6. Behavior | `script.js`, `bg-animation.js`, `bg-animation-future.js` | scroll reveal, animated background | depend on DOM populated by layout |
| 7. Router | `router.js` | `registerRoute`, `navigate`, `initRouter` | must be available before pages register |
| 8. Eager pages | `pages/home.js` | calls `window.registerRoute('/', …)` at parse time | home is the default route → must register before `initRouter()` |
| 9. Smooth scroll | `vendor/lenis/lenis.min.js`, `smooth-scroll.js` | initializes Lenis on `<body>` | after layout exists |
| 10. Boot | inline `initLayout(); initRouter()` | bootstraps the SPA | runs last so all globals exist |

All other page renderers (`about.js`, `products.js`, `services.js`, etc.) are **lazy-loaded** by `router.js` on first navigation — they self-register via `window.registerRoute(path, def)` when their script finishes parsing.

## 5.3 The data-as-CMS pattern

Instead of a database, content lives in **plain JavaScript files** that each assign one or more top-level globals. Example (`products-data.js`):

```js
window.PRODUCTS = [
  {
    id: 'ams',
    title: 'Air Monitoring System',
    image: 'assets/images/products/ams.webp',
    excerpt: '…',
    sections: [{type:'paragraph', text:'…'}, …],
    relatedServices: ['environmental-consulting']
  },
  …
];
```

This pattern has three big consequences:

1. **No build step is ever required.** Editing a product is "open the file in a text editor, change values, save."
2. **Schema is enforced by code, not by a DB.** The renderer (`products-loader.js`) assumes specific keys; missing keys produce blank UI rather than 500 errors.
3. **Diffs are reviewable in git.** Content changes show up as plain JSON-like diffs in PRs.

The admin panel (Part B) edits these same files. When you click "Save" in the admin UI, the server (or the GitHub client) **rewrites the JS file in place** with the new array literal.

## 5.4 SPA hash router (`router.js`)

The router (477 LOC) is hash-based: navigation happens by changing `window.location.hash`. The actual flow:

1. **`registerRoute(path, def)`** — page scripts call this at parse time. `def` looks like:
   ```js
   { render: function (mainEl) { … },
     title: 'Tridel Technologies',
     description: '…',
     bodyClass: 'page-home' }
   ```
2. **`initRouter()`** — runs once at boot. It:
   - parses the current hash (or defaults to `'/'`),
   - finds the matching renderer (lazy-loading the page script from `PAGE_SCRIPTS` if not yet present),
   - calls the renderer, optionally storing a returned **cleanup function** (used by pages that need to release intervals/observers/maps),
   - sets `document.title`, `<meta name="description">`, and the body class,
   - attaches a `hashchange` listener so subsequent navigations repeat the dispatch.
3. **`navigate(path)`** — programmatic navigation; sets the hash, which triggers `hashchange`.
4. **`findLazyScript(path)`** — supports nested paths like `/products/detail` by walking up the segments. The first prefix match in `PAGE_SCRIPTS` wins.
5. **In-flight script de-duplication** — `inFlightScripts` map prevents double-loading when the user clicks fast.
6. **Storage helpers** — `safeStorage`, `getStoredId`, `setStoredId` wrap `localStorage`/`sessionStorage` with try/catch so the router survives quota-exceeded or private-mode browsers.
7. **Site-metrics ping** — on every route change, `router.js` POSTs to `/api/site-metrics/visit` (if running on http(s)), feeding `logs/site-metrics.json`. On `file://` it sets `siteMetricsDisabled = true` to skip the network call.

### 5.4.1 Cleanup contract

Renderers may return a function. The router stores it in `currentCleanup` and runs it before the next render. Used by:
- the home renderer to dispose its testimonial-map deck and IntersectionObserver-based stats counters,
- the simulation-page renderer (if added) to terminate Web Workers,
- pages that subscribe to global events like resize/scroll.

This is the **explicit unmount hook**. Without it, single-page navigation would leak observers and timers.

## 5.5 Page renderers (`assets/js/pages/*.js`)

Each file is an IIFE that defines one or more route definitions and calls `window.registerRoute(...)`. The home page (`pages/home.js`, 283 LOC) is illustrative:

```js
window.registerRoute('/', {
  render: renderHomePage,
  title: meta.title || 'Tridel Technologies',
  description: meta.description || '',
  bodyClass: meta.bodyClass || 'page-home'
});
```

Inside `renderHomePage(mainEl)`:

1. Pulls `INDEX_HERO`, `INDEX_STATS`, `INDEX_WHAT_WE_DO` from the page-data globals (with sane defaults).
2. Uses a **section-builder map** + **section-order array** so the home page can be re-ordered from data without changing the renderer. The default order is `['hero','stats','whatWeDo','highlights','news','clients','testimonialMap']`. `INDEX_SECTION_ORDER` (if present in `index-page-data.js`) overrides it.
3. Each builder returns either an HTML string or `''` (when the section is hidden via the `isSectionVisible('home', key)` helper from `settings-loader.js`).
4. After assembling the HTML, sets `mainEl.innerHTML = html`, then triggers post-render tasks:
   - `initStatsCounter()` — IntersectionObserver-driven count-up animations for the stats bar,
   - `renderHomeCards()`, `renderNewsFeed()`, `renderClientLogos()` — section-level loaders that populate sub-containers,
   - `loadTestimonialMap()` — the world-map testimonial deck,
   - `window.initScrollReveal()`, `window.initHeroCanvas()` — animation hooks.
5. Returns a cleanup function that disposes the testimonial map deck.

This pattern is mirrored across other pages — each renderer **builds a HTML string, injects it, then upgrades sub-containers** via section loaders.

## 5.6 Section loaders (`*-loader.js`)

These are tiny modules whose job is to take a content array and write DOM nodes into a target container.

Example (`home-loader.js`):

```js
window.renderHomeCards = function (container) {
  if (!container) container = document.getElementById('home-cards-container');
  const data = HOME_CARDS_DATA || homeCardsData;
  if (!data) { container.innerHTML = '<p class="empty-state">…</p>'; return; }

  container.innerHTML = '';
  data.forEach(card => {
    const a = document.createElement('a');
    a.className = 'grid-card-wrapper';
    a.href = esc(card.link || '#');
    a.innerHTML = `…template…`;
    container.appendChild(a);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('home-cards-container');
  if (container) window.renderHomeCards(container);
});
```

Two notable details:

- The function is **exposed on `window`** so the SPA router can call it after re-injecting innerHTML. The same function works as a DOMContentLoaded fallback for standalone HTML pages like `admin.html` or `card-concepts.html`.
- All string interpolation uses `escapeHtml(...)` (from `utils.js`) — this is the **only XSS defense** because the renderers shovel content from JS data into `innerHTML`. Loaders must never bypass it.

## 5.7 Layout (`layout.js`) & shared components

`layout.js` renders `#header-root` and `#footer-root` from `NAV_LINKS` and the footer config in `layout-data.js`.

Key responsibilities:

- **Mega-menu rendering** — for nav items flagged `hasMegaMenu`, layout injects an empty mega-menu shell; the actual cards are filled by loaders on hover (`products-loader.js`, `services-loader.js`).
- **Mobile drawer** — single-source nav, repurposed via CSS at small breakpoints.
- **Logo "current page" indicator** — `updateLogoState(path)` toggles `logo-link--current` and `aria-current="page"` on home.
- **Theme toggle button** — re-binds `onclick` after each render so dynamic header changes don't lose the listener.

Shared HTML fragments (CTA cards, "Read more" buttons, badge chips) live in `components.js`. They are pure functions: `componentCard(props)` returns a string.

## 5.8 Theme system (light / dark)

- `assets/js/theme-toggle.js` runs **before** anything paints. It reads `localStorage.theme`; if set, it applies `data-theme="dark"` (or light) to `<html>` immediately. Without this early-running script, the page would flash light on load even for dark-mode users.
- All theme-sensitive colors are CSS custom properties at the top of `assets/css/styles.css` — selectors like `[data-theme="dark"] :root { --bg: …; --fg: …; }`.
- The toggle button (rendered by `layout.js`) flips `data-theme` and writes back to `localStorage`.
- The Hormuz simulation has its **own** theme stack in `simulation/css/theme.css` (see §8.12).

## 5.9 Smooth scrolling (Lenis)

`assets/vendor/lenis/lenis.min.js` is the Lenis runtime. `assets/js/smooth-scroll.js` initializes it on `<body>` and forwards scroll to its `raf` loop. It also disables itself on mobile / users with `prefers-reduced-motion`.

## 5.10 The "LIVE / Simulation" gateway to the Hormuz app

The header CTA labelled "LIVE / Simulation" links to `/simulation/` (a separate document, not a SPA route). The text is **stacked** on two lines and lives in a single pill background — this is achieved by HTML structure plus a CSS rule that uses the "specificity tax" idiom (repeated wrapper class) so the legacy header rules can't override it without `!important`.

---

# PART B — Admin Panel

## 6.1 Shell (`admin.html`)

The admin panel is a separate document at `/admin.html`. It shares the data files (`*-data.js`) and theme tokens with the marketing site, but its own UI lives in `assets/css/admin.css`, `assets/js/admin.js`, `assets/js/admin-auth.js`, `assets/js/admin-form-rows.js`, `assets/js/admin-ui.js`, `assets/js/admin-github.js`, `assets/js/admin-publish.js`.

The shell loads the same data files as `index.html` so the editor sees **exactly what the public site sees** — there is no separate "preview" build.

## 6.2 Authentication flow (server-backed + static fallback)

Two paths exist:

### Server-backed (preferred)

1. User submits password to `POST /api/login`.
2. Express:
   - Checks the per-IP rate-limit bucket; if 5 failures within 15 minutes, returns 429.
   - Calls `verifyAdminPassword(password, ADMIN_PASSWORD_HASH)` — scrypt with timing-safe compare.
   - On success, creates a session token (`crypto.randomBytes(32).toString('hex')`), stores `{ createdAt, expiresAt }` in the in-memory `sessions` `Map`, returns the token in a cookie.
3. Subsequent API calls send the cookie; `requireAuth` middleware looks it up and rejects if missing/expired.

### Static fallback

`assets/js/admin-auth.js` ships a **public SHA-256 hash** of a default password. On `file://` or any host where `/api/login` returns 404, the admin falls back to comparing `sha256(input)` against this hash entirely in the browser.

**This fallback is explicitly weak**: the hash is shipped to every visitor; anyone can brute-force it offline. It exists only so the editor still works on GitHub Pages, where there is no backend. Treat any password matching the public fallback as effectively published.

### Dev mode

If `NODE_ENV` is not `production` and neither `TRIDEL_ADMIN_PASSWORD_HASH` nor `TRIDEL_ADMIN_PASSWORD` is set, `server.js` generates a one-time random password at boot and logs it to stdout. This is the easiest way to test the admin locally:

```
WARNING: TRIDEL_ADMIN_PASSWORD is not set.
Generated one-time development admin password for this server process: 8K9d…
```

## 6.3 Editing model — JS files as a database

The admin shows one editor screen per data file. The editor for an array-of-objects (e.g. products) uses **`admin-form-rows.js`** to render a draggable list of rows, each with inline fields.

The "save" action does three things:

1. Read the in-memory edited array.
2. **Serialize it back into a valid JS file** (`window.PRODUCTS = [ … ];`) — using a deterministic pretty-printer so diffs stay clean.
3. Send it to either:
   - `POST /api/admin/save` if the Express server is reachable, **or**
   - the GitHub Contents API via `admin-github.js` (browser-managed mode).

The serializer preserves key order and uses two-space indentation. It strips trailing commas (some browsers reject them).

## 6.4 GitHub publish pipeline

`admin-github.js` implements a simple read/modify/write loop against the GitHub Contents API:

1. `GET /repos/:owner/:repo/contents/:path?ref=:branch` — returns base64 content + a `sha`.
2. UI shows a diff against the current edit.
3. `PUT /repos/:owner/:repo/contents/:path` with `{ message, content (base64), sha, branch }`.

Two configurations exist:

- **Browser-managed**: the user pastes a Personal Access Token into the admin UI; it's stored in `localStorage`. Suitable for solo edits on a static host. **The PAT is visible to anyone who can run JS in the browser.**
- **Server-managed**: `TRIDEL_GITHUB_OWNER`, `TRIDEL_GITHUB_REPO`, `TRIDEL_GITHUB_BRANCH`, `TRIDEL_GITHUB_TOKEN` env vars are read by `server.js`. The admin UI calls `/api/github/save` and Express proxies the call with the server's PAT.

## 6.5 Drag-and-drop ordering (SortableJS)

SortableJS is loaded on demand in `admin.html` for reordering rows. The save action calls the same serializer with the new index order.

---

# PART C — Express Backend (`server.js`)

`server.js` is a single 1,124-line file. Everything is `require`d at the top (`express`, `cors`, `fs`, `path`, `crypto`). No TypeScript, no transpiler, no clustering.

## 7.1 Process model & boot sequence

```
1. require dependencies
2. loadEnvFile('.env')              // see §7.2
3. loadEnvFile('.env.local')
4. app = express(); app.disable('x-powered-by')
5. Resolve ADMIN_PASSWORD / ADMIN_PASSWORD_HASH or exit(1) if production
6. Set up sessions Map, loginAttempts Map, rate-limit cleanup interval
7. Build SERVER_GITHUB_CONFIG from env
8. Wire all routes
9. Apply 404 handler
10. app.listen(PORT)
```

`PORT` is hard-coded to `3000`. To change it, edit `server.js`; there is intentionally no env override (the deployment story expects a reverse proxy in front).

## 7.2 Environment loading (`.env`, `.env.local`)

Rather than depending on `dotenv`, `server.js` includes a tiny `loadEnvFile(filePath)` parser:

- Reads the file as UTF-8.
- Splits on `\r?\n`.
- Trims, skips blank lines and lines beginning with `#`.
- Matches `^([\w.-]+)\s*=\s*(.*)$`.
- Strips matching outer quotes (`"…"` or `'…'`).
- **Only sets the variable if it isn't already in `process.env`** — so OS-level env vars always win.

`.env` is loaded first, then `.env.local`; whichever defines a variable first wins. Conventional layout:

- `.env` — committed defaults that are safe in version control,
- `.env.local` — gitignored secrets for the current machine.

## 7.3 Password & session model (scrypt + in-memory map)

```js
function hashAdminPassword(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

function verifyAdminPassword(password, storedHash) {
  // … parse '$' fields, scryptSync with same salt, timingSafeEqual
}
```

Key points:

- **scrypt** is used because Node ships it in the standard library. No third-party crypto deps.
- Hash format: `scrypt$<saltHex>$<derivedKeyHex>` — versionable; if the algorithm changes the prefix changes.
- Comparison uses `crypto.timingSafeEqual` to avoid timing oracles.
- `ADMIN_PASSWORD_HASH` is preferred. `ADMIN_PASSWORD` (plaintext) is only kept for dev convenience and will be auto-generated if neither is set.

Sessions:

- `sessions = new Map()` — keys are tokens, values are `{ createdAt, expiresAt }`.
- Token = `crypto.randomBytes(32).toString('hex')` (64-char hex, ~256 bits of entropy).
- Sessions expire after a fixed TTL (declared further down in the file).
- The map lives in memory — restarting the server invalidates every session. This is acceptable because (a) it's an admin tool, (b) it limits blast radius on token theft.

## 7.4 Login rate limiting

```js
const loginAttempts = new Map();      // Map<ip, { count, firstAttempt }>
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

setInterval(() => { /* drop expired entries */ }, RATE_LIMIT_WINDOW_MS);
```

`checkRateLimit(ip)` returns false (denied) when count ≥ 5 within the 15-minute window. The first failed attempt records `firstAttempt = now`; subsequent attempts increment `count`; after the window passes the cleanup interval removes the entry.

IPs are taken from `req.ip` (after Express's trust-proxy logic, if enabled). Behind a reverse proxy, **make sure `app.set('trust proxy', 1)` is appropriate** for your topology so the rate limit isn't keyed to the proxy IP.

## 7.5 Complete route inventory

| Method & path | Purpose | Auth | Notes |
|---------------|---------|------|-------|
| `GET /` | serves `index.html` | none | static |
| `GET /admin.html` | serves admin shell | none | the shell itself is public; gated client-side |
| `GET /simulation/*` | simulation static files | none | also served by static-host config |
| `GET /assets/*`, `GET /data/*` | static assets | none | |
| `POST /api/login` | scrypt verify, issue session | rate-limited | |
| `GET /api/check-auth` | session probe | session cookie | returns 200 if valid |
| `POST /api/logout` | revokes the session | session cookie | |
| `POST /api/admin/save` | rewrite a JS data file on disk | auth | only allow-listed paths |
| `GET /api/github/config` | what server-managed GitHub repo is wired | auth | returns redacted config (token excluded) |
| `POST /api/github/test` | round-trip a test call to GitHub | auth | validates token + repo perms |
| `POST /api/github/load` | proxy `GET /contents/:path` | auth | |
| `POST /api/github/save` | proxy `PUT /contents/:path` | auth | |
| `POST /api/site-metrics/visit` | record a SPA page-view | none | sanitised, written to `logs/site-metrics.json` |
| `POST /api/site-metrics/enquiry` | record a contact-form lead | none | |
| `GET /api/site-metrics/summary` | dashboard JSON | auth | |
| `GET /*` (catch-all) | SPA fallback to `index.html` | none | only for extensionless paths; unknown `*.ext` returns 404 |

## 7.6 Site-metrics persistence (`logs/site-metrics.json`)

This is the closest thing to a database in the project. Schema:

```json
{
  "totals": { "visits": 0, "pageViews": 0, "enquiries": 0 },
  "visitors": {
    "<visitorId>": {
      "firstSeenAt": "ISO",
      "lastSeenAt": "ISO",
      "visitCount": 0,
      "pageViews": 0,
      "lastSessionId": "...",
      "lastPath": "/",
      "lastTitle": "…",
      "lastEnquiryAt": "ISO"
    }
  },
  "pages": { "<path>": pageViewCount },
  "enquiryInterests": { "<interestLabel>": count },
  "recentEnquiries": [{ "at": "ISO", "path": "/contact", "interest": "…" }],
  "meta": { "lastVisitAt": "ISO", "lastEnquiryAt": "ISO" }
}
```

- All input is sanitized through `sanitizeMetricId` (alphanumeric + `._-`, capped length), `sanitizeMetricText` (control-char-stripped, capped length), and `sanitizeMetricPath` (forces a leading `/`, strips query strings).
- `recentEnquiries` is capped at 10 entries (older ones drop off the end).
- `normalizeSiteMetrics()` is run on read **and** write — defends against truncated/corrupted files by reseeding missing fields with defaults.
- All counters are **monotonic**; there's no decrement. To reset, stop the server, delete the JSON, and restart.

## 7.7 GitHub proxy endpoints

These take small JSON payloads and forward to GitHub's REST API:

- `/api/github/load` → `GET https://api.github.com/repos/:owner/:repo/contents/:path?ref=:branch`
- `/api/github/save` → `PUT  https://api.github.com/repos/:owner/:repo/contents/:path` with the existing `sha`, base64-encoded content, and a commit message.

The server adds the `Authorization: token <TRIDEL_GITHUB_TOKEN>` header. The token never leaves the server; the browser only sees the result.

Errors are mapped:
- 401 from GitHub → "Your token is invalid or revoked." (the server returns 401 to the client too)
- 404 → "Branch or path not found."
- 409 → "Another user updated this file. Reload and try again." (caused by stale `sha`)

## 7.8 Security headers (CSP / HSTS / referrer / no-x-powered-by)

In Express mode the server emits, on every response:

- `Content-Security-Policy` — default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://api.open-meteo.com; frame-src https://www.linkedin.com — the exact directives vary by route; check the CSP middleware near the top of `server.js`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only).
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: SAMEORIGIN`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` — restricts geolocation, camera, microphone.

`x-powered-by: Express` is disabled via `app.disable('x-powered-by')` for fingerprinting hygiene.

## 7.9 Static file serving & deny rules

The static handler serves the repo root. Deny patterns:

- `.env`, `.env.*`, `.git`, `node_modules`, `package*.json` (still readable but optionally hidden via `_redirects`/`web.config`).
- Anything matching `\.(json|md|py|ps1|ipynb)$` outside whitelisted folders (`data/`, `simulation/data/`).
- Catch-all 404 handler returns `404.html` for paths with extensions and falls through to the SPA shell for extensionless paths.

---

# PART D — Hormuz Drift Simulation

## 8.1 Why it exists

The Strait of Hormuz is one of the most strategically sensitive maritime chokepoints in the world. Roughly 20–25 % of the world's seaborne oil passes through it. The simulation provides a **fast, browser-only Lagrangian drift model** for:

1. **Oil-spill scenarios** — predict where a release at a chosen lat/lon/time would drift over the next 24–240 hours, given live ocean-current and wind forcing.
2. **Search-and-rescue (SAR) scenarios** — drift a NOAA-style "leeway object" (person in water, raft, container, …) and visualize the search area.
3. **Public education / situational awareness** — a slick "live" view of how Gulf currents move things.

It is **explicitly a teaching/exploration tool**. The README warns: this is not a replacement for OpenDrift / OpenOil. The physics is intentionally simple and runs entirely in the browser so anyone can reproduce a scenario without a Python environment.

## 8.2 Shell (`simulation/index.html`)

The simulation is **not** a SPA route of the marketing site. It is a separate full document at `/simulation/index.html`. The shell has three large regions:

```html
<div id="map-toolbar">…</div>      <!-- Hide UI / Reset view buttons -->
<div id="banner">…</div>           <!-- Tridel masthead -->
<div id="map">…</div>              <!-- Leaflet -->
<div id="side-panel">…</div>       <!-- controls, scenario inputs, analytics -->
```

Notable head-tag choices:

- **Inter** is loaded from Google Fonts (`fonts.googleapis.com/css2?family=Inter:...`).
- **Leaflet 1.9.4** CSS from `unpkg.com`; the JS is loaded later from the same origin.
- **`style.css`, `ui-cleanup.css`, `theme.css`** are loaded with `?v=NN` query strings to bust browser caches when CSS changes ship. `theme.css` is loaded **last** so its CSS variables override anything from the older stylesheets.

`<svg class="liquid-glass-svg-filter">` defines an SVG filter that powers the "liquid glass" aesthetic — `feTurbulence` + `feDisplacementMap` over translucent panels.

## 8.3 Module load order

Bottom of `simulation/index.html`:

```html
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
<script src="js/state.js"></script>
<script src="js/field.js"></script>
<script src="js/drift.js"></script>
<script src="js/weathering.js"></script>
<script src="js/app.js" defer></script>
```

(With `?v=N` cache busters.) The worker is loaded inside JS as `new Worker('js/worker.js')`.

Why this order matters:

- `state.js` declares `window.AppState` (the central mutable singleton).
- `field.js` declares `globalThis.Field` (the forcing query engine).
- `drift.js` declares `globalThis.Drifter`, `LEEWAY_CATEGORIES`, `OIL_TYPES`.
- `weathering.js` declares `globalThis.ADIOS_OILS`, `OilBudget`, and merges its richer oil catalog with the one drift.js published (intentional: load-order-independent).
- `app.js` is the orchestrator and runs last.

## 8.4 `state.js` — central AppState

```js
window.AppState = {
  tIdx: 0,
  playing: true,
  playSpeed: 1.5,
  timelineStepHours: 3,
  nParticles: 1800,
  fieldLayer: null,
  releasePoint: null,
  activeScenario: 'leeway', // or 'oil'
  activeRun: null,
  oilSlickModel: null,
  oilBudgetModel: null,
  runTimer: null,
  focusMode: false,
  mapChromeHidden: false,
  expertToolsOpen: false,
  frameCache: null,
  lastResultsKey: null,
  lastPlotMarkerKey: null,
  pendingFieldChunkKey: '',
  bgParticles: [],
  overlayState: {
    currents: true, tracers: true, trails: true,
    density: false, uncertainty: false, release: true, oilRadius: true
  }
};
```

This is **the only place** mutable simulation state lives. The render loop, scenario inputs, and worker messages all read/write here. Anything that needs to survive a re-render of the side panel goes in `AppState`.

## 8.5 `field.js` — forcing data, interpolation, land mask, chunking

`Field` is a singleton with these public methods:

| Method | Returns | Used by |
|--------|---------|---------|
| `Field.load(url='data/currents.json')` | Promise — fetches the manifest and primes chunk metadata | `app.js` at boot |
| `Field.sampleCurrent(lon, lat, tSec)` | `{u, v}` m/s (or `null` for land / OOB) | `Drifter._vel`, render loop |
| `Field.sampleWind(lon, lat, tSec)` | `{u, v}` m/s (or `null`) | `Drifter._vel` when leeway is enabled |
| `Field.isLand(lon, lat)` | `boolean` (uses the t=0 land mask snapshot) | `app.js` (don't release on land) |
| `Field.times`, `Field.grid`, `Field.t0Unix`, `Field.dtSec` | static metadata | timeline UI |

### 8.5.1 Manifest schema (`data/currents.json`)

```json
{
  "meta": {
    "dlat": 0.083, "dlon": 0.083,
    "has_wind": true,
    "source_currents": "CMEMS GLOBAL_ANALYSISFORECAST_PHY_001_024",
    "source_wind": "Open-Meteo / GFS",
    "generated_at": "2026-01-15T06:14:00Z"
  },
  "times": ["2026-01-14 00:00:00", "2026-01-14 01:00:00", …],
  "lats": [22.0, 22.083, …, 30.5],
  "lons": [47.5, 47.583, …, 59.0],
  "chunks": [
    { "url": "chunks/currents_0000.json", "tStart": 0, "tEnd": 23 },
    { "url": "chunks/currents_0001.json", "tStart": 24, "tEnd": 47 },
    …
  ]
}
```

Each chunk file then contains, for its time slice, the dense arrays `u[t][y][x]`, `v[t][y][x]`, and optionally `uw[t][y][x]`, `vw[t][y][x]` (wind).

The schema is intentionally **denormalized** (raw arrays of numbers, no JSON objects per cell) so a 240-hour Strait-of-Hormuz cube fits in ~50–80 MB total, split across ~10 chunk files.

### 8.5.2 Bilinear + temporal interpolation

Each sample is a tri-linear interpolation:

1. Find the four grid cells surrounding `(lon, lat)` in the spatial grid.
2. Bilinearly interpolate `u` and `v` at the two surrounding time slices.
3. Linearly interpolate in time.

When any of the eight corner samples is `NaN` (land), the result is `null`. This is the **implicit land mask** during simulation.

### 8.5.3 Chunk loading

`Field` keeps each chunk's `loaded`/`promise` state. When a sampler is asked for a time slice not yet in memory, it `await`s the chunk's `promise`, parses it, and writes its arrays into `F.u[t]`, `F.v[t]`, etc. The worker preloads neighboring chunks so playback rarely stalls.

### 8.5.4 Land mask snapshot

At load time, `field.js` snapshots `F.u[0]` into `F.landMask`. `Field.isLand(lon, lat)` reads `F.landMask` instead of `F.u[0]` so the app stays correct even if chunk 0 is evicted from memory during long playback.

### 8.5.5 Axis direction normalization

NetCDF files often have descending latitudes (north→south). `Field.load()` detects this and stores `latAsc` / `lonAsc` flags; `dlat` / `dlon` carry their natural sign. All sampling code uses absolute step magnitudes for index math but respects the sign for direction-of-increase logic.

## 8.6 `drift.js` — particle physics & NOAA leeway

### 8.6.1 Governing equations

```
dx/dt = V_current + V_leeway(wind, object) + V_stokes(wind) + diffusion
```

- **`V_current`**: from `Field.sampleCurrent`.
- **`V_leeway`**: `dw·W·ŵ + cw·W·ŵ⊥` (downwind + crosswind components, % of wind speed). Coefficients from NOAA / Allen (2005) and Breivik et al. (2011) (see `LEEWAY_CATEGORIES` table).
- **`V_stokes`** (Stokes drift from waves): approximated as `0.018·W·ŵ` (a standard empirical fraction used in NOAA SAR models).
- **Diffusion**: a Gaussian random walk with σ = √(2·K·Δt), default `K = 10 m²/s` (eddy diffusivity).

### 8.6.2 Integrator

For each particle, per time step:

1. **RK2 (midpoint) on the current term**:
   - `v1 = V_current(x, t)`
   - `x_mid = x + 0.5·dt·v1`
   - `v2 = V_current(x_mid, t + 0.5·dt)`
   - `x = x + dt·v2`
2. **Forward Euler on wind-driven terms** (leeway + Stokes) — wind varies slowly enough that midpoint is overkill.
3. Add Gaussian diffusion: `x += randn()·σ_lat`, `y += randn()·σ_lon`.

`randn()` is Box–Muller. `mPerDegLat(lat)`, `mPerDegLon(lat)` convert m to degrees.

### 8.6.3 `Drifter` class

```js
class Drifter {
  constructor(lon, lat, tSec, opts) {
    // … initialize lon0/lat0/t0, alive=true, mass_frac=1.0, …
    this.leeway_dw = opts.leeway_dw;
    this.leeway_cw = opts.leeway_cw;
    // ±15% jitter per particle, clamped to [0.5, 1.5] so a fat-tail
    // randn() draw can't give a single particle 1.5× nominal leeway.
    const jitter = Math.max(0.5, Math.min(1.5, 1 + 0.15 * randn()));
    this.leeway_dw *= jitter;
    this.leeway_cw *= jitter;
    this.track = [[lon, lat, tSec]];  // [lon, lat, t]
  }
  step(dt) { … }      // integrate one dt
  isStranded() { … }  // land/OOB termination flag
}
```

The `track` history is what powers the "trail" canvas overlay in `app.js`. Per-particle storage is `O(T_steps)` floats — at 1800 particles × 240 hours × 3-hour step → 144 K points total, easily fits in memory.

### 8.6.4 Stranding logic

If `Field.sampleCurrent(...)` returns `null` at the integration midpoint (the particle has wandered onto land), `Drifter.alive = false` and `stranded = true`. The render loop still draws stranded particles but stops integrating them; they appear "beached".

### 8.6.5 Oil-mode coupling

When `AppState.activeScenario === 'oil'`, each Drifter's `mass_frac` is decremented at every step according to a first-order evaporation curve, with a `residueFrac` floor that matches the Fingas `f_max` cap inside `OilBudget` (Section 8.7). Without this floor, a long run would drive `mass_frac → 0` even though OilBudget correctly retains a few-percent residue, producing an order-of-magnitude disagreement at `t ~ 3τ`.

### 8.6.6 OilSlick (visual footprint)

`OilSlick` is a lightweight helper that grows a footprint radius using Fay (1971) gravity-viscous regime:

```
r(t) = 1.5 · ( Δ · g · V² · t^1.5 / sqrt(ν_w) )^(1/6)
```

It is **only for visualization** — the actual fate accounting is in `weathering.js`.

## 8.7 `weathering.js` — oil mass budget

A pure-JS port of the four ADIOS-style processes:

| Process | Model | Parameter source |
|---------|-------|------------------|
| **Multi-component evaporation** | `F(t_min) = C1 · ln(t_min)`, clamped to `[0, f_max]` | Fingas (1996, 1998) |
| **Emulsification (water-in-oil)** | `dW/dt = K_e · U10² · (1 − W/W_max)` | Mackay et al. (1980) |
| **Natural dispersion** | `D_nd = C_nd` (fraction dispersed per breaking-wave event) | Delvigne & Sweeney (1988), simplified |
| **Response options** | mechanical skimming, in-situ burning, chemical dispersant (deterministic mass removals) | various |

### 8.7.1 Oil catalog (`ADIOS_OILS`)

Twelve Hormuz-relevant oils, each with:

- `label`, `adiosId`, `api`, `rho` (kg/m³), `nu15` / `nu25` (kinematic viscosity), `pour_pt_C`,
- Fingas parameters (`C1`, `f_max`),
- SARA fractions (`saturates`, `aromatics`, `resins`, `asphaltenes`),
- Mackay emulsification (`K_e`, `W_max`),
- Delvigne–Sweeney dispersion (`C_nd`),
- a `color` used for the stacked-area chart.

Sample entry:

```js
arabian_light: {
  label: 'Arabian Light (API 33)', adiosId: 'AD00340', api: 33,
  rho: 860, nu15: 8e-6, nu25: 4e-6, pour_pt_C: -12,
  C1: 5.6, f_max: 30,                // Fingas
  saturates: 0.62, aromatics: 0.25, resins: 0.09, asphaltenes: 0.04,
  K_e: 1.5e-6, W_max: 0.65,          // Mackay
  C_nd: 0.024,                       // Delvigne–Sweeney
  color: '#f4a340'
}
```

### 8.7.2 `OilBudget` class

Tracks, at each time step, the running mass fractions: `floating`, `evaporated`, `dispersed`, `emulsified`, `recovered_skim`, `burned`, `dispersant`. Sums to 1.0 by construction (with a tiny residual `residue` so the chart looks clean).

It stores **history**, so the side-panel "Mass balance" chart can render a Plotly stacked-area plot from one Plotly call.

OilBudget is **deterministic**: same inputs → same outputs every time. This matters for the "Export results" feature (CSV download): users can reproduce a scenario from its parameters alone.

## 8.8 `worker.js` — Web Worker integration loop

The integration is offloaded to a Web Worker so the main thread stays free to render canvases and respond to UI events.

### 8.8.1 Message protocol

| `msg.type` (main → worker) | Payload | Meaning |
|-----------------------|---------|---------|
| `init` | `{ manifestUrl, chunkBaseUrl }` | tells the worker which manifest to fetch |
| `run` | `{ release, scenario, options }` | start a new run |
| `cancel` | `{}` | abort the current run |
| `setSpeed` | `{ playSpeed }` | change time-step pacing |

| `msg.type` (worker → main) | Payload | Meaning |
|-----------------------|---------|---------|
| `ready` | `{}` | manifest loaded |
| `frame` | `{ tIdx, particles: Float32Array, alive: Uint8Array, mass_frac: Float32Array }` | one integrated frame |
| `done` | `{ tracks }` | run complete; pass full tracks back for export |
| `error` | `{ message }` | something went wrong |

### 8.8.2 `initPromise` pattern

The worker awaits `Field.load(manifestUrl)` once at boot. Every subsequent `run` message `await`s that promise before stepping. This guarantees the manifest is parsed exactly once even if the user clicks "Run" before the chunk fetch finishes.

### 8.8.3 Transferable buffers

`frame` messages send `Float32Array.buffer` as a transferable so the main thread doesn't pay a copy cost. The worker recreates the typed array on each frame.

## 8.9 `app.js` — Leaflet, canvases, render loop, UI

The orchestrator (~2.5 KLOC) does six things:

### 8.9.1 Leaflet map

```js
const map = L.map('map', { zoomControl: false, attributionControl: false })
  .setView([26.5, 56.0], 7);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {…}).addTo(map);
```

CARTO dark basemap is the default. `app.js` also creates **custom Leaflet panes** for `labels` and `landmarks` (see §8.10).

### 8.9.2 Canvas overlays stacked on the map

Three `<canvas>` elements are absolutely positioned over the Leaflet container:

1. **Currents canvas** — animated streamlines drawn from `Field.sampleCurrent` on a coarse grid (background motion that runs even when no scenario is active).
2. **Particle canvas** — every particle drawn as a 1–2 px dot, color-coded by `mass_frac` (oil) or stranding state (leeway).
3. **Trails canvas** — long-exposure dots showing each particle's recent path (uses `globalCompositeOperation = 'lighter'` and a slight per-frame alpha fade).

The render loop is `requestAnimationFrame`-driven. Each frame:
- Listens for the most recent `frame` from the worker.
- Projects every particle from lon/lat to pixel via `map.latLngToContainerPoint`.
- Clears + redraws each canvas.

### 8.9.3 Side-panel controls

- **Time slider** — drives `AppState.tIdx`. Dragging it sends `seek` to the worker.
- **Play / Pause** — `AppState.playing`.
- **Scenario picker** — toggles `leeway` ↔ `oil`.
- **Object / oil picker** — populates from `LEEWAY_CATEGORIES` or `ADIOS_OILS`.
- **Release point picker** — click on the map; if `Field.isLand(...)`, refuses and shows a hint.
- **Wind toggle, Stokes toggle, diffusion K knob**.
- **Run button** — sends `run` to the worker.
- **Export buttons** — CSV of tracks, PNG of map.

### 8.9.4 Analytics charts (Plotly)

Plotly 2.35.2 is loaded for the oil-budget stacked-area chart. The chart is redrawn on each `frame` by passing the current OilBudget history. Plotly is heavy (~3 MB minified) but loaded only on the simulation page.

### 8.9.5 Provenance footer

The side panel shows `meta.source_currents`, `meta.source_wind`, `meta.generated_at` from the manifest so users always know what dataset they're looking at.

### 8.9.6 Background canvas (idle state)

When no run is active, `bgParticles` are seeded across the visible map and follow `Field.sampleCurrent` directly (no leeway, no diffusion) so the map "comes alive" even before the user clicks anything.

## 8.10 Map layering & Leaflet panes

`app.js` creates three custom panes with explicit z-indices:

```js
map.createPane('labels');     // zIndex 650 — country/sea name labels
map.createPane('landmarks');  // zIndex 700 — Persian Gulf, Strait of Hormuz, etc.
```

(`overlayPane` ships at 400; `tilePane` at 200.) Custom panes sit **above** the canvas overlays but **below** popups so the labels are always visible without obscuring tooltips.

Labels like "Persian Gulf" and "Strait of Hormuz" are drawn as `L.tooltip({ permanent: true, direction: 'center', pane: 'landmarks' })` markers at known geographic coordinates.

## 8.11 Service worker caching (`sw.js`)

`simulation/sw.js` registers a service worker scoped to `/simulation/`. The strategy:

| Pattern | Strategy | Why |
|---------|----------|-----|
| `/data/currents.json` (the manifest) | **network-first**, fall back to cache | mutable across releases — new chunks can appear |
| `/data/chunks/*.json` (chunk files) | **cache-first**, only fetch on miss | immutable per release (named per dataset) |
| everything else | falls through to the browser's normal cache | no need to intercept |

`CACHE_VERSION = "v4"` is bumped whenever the chunk schema changes. On `activate`, the worker deletes all caches whose name doesn't match `hormuz-forcing-v4`, freeing disk for old releases.

Opaque cross-origin responses (`fresh.type === 'opaque'`) are **skipped** — caching them would silently disable offline fallback because every match would look empty.

## 8.12 Theme tokens (`simulation/css/theme.css`)

`theme.css` is the **single source of truth** for the simulation's visual language. It declares ~70 CSS custom properties at `:root` (and `[data-theme="light"]`), e.g.:

```css
:root {
  --glass-bg: rgba(15, 18, 28, 0.55);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: 18px;
  --accent: #4cc4ff;
  --warn: #f4a340;
  …
}
```

Why it's loaded **last** (`theme.css?v=31` after `style.css?v=60` and `ui-cleanup.css?v=90`): later cascade wins for equal-specificity selectors, so `theme.css` reliably overrides any historical bleed-through from the older stylesheets.

### "Specificity tax" pattern

Some legacy rules in `style.css` use `!important` or unusually specific selectors. To beat them without using `!important` everywhere, components use a "doubled wrapper class" trick:

```css
.liquidGlass-wrapper.liquidGlass-wrapper {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
}
```

`.foo.foo` has specificity (0,2,0) instead of (0,1,0), beating any legacy single-class rule. This is the maintainable alternative to `!important`.

---

# PART E — Python Data Pipeline (`scripts/`)

## 9.1 Pipeline overview

```
Copernicus Marine (CMEMS)            Open-Meteo / GFS
   GLOBAL_ANALYSISFORECAST_PHY          surface wind (u10, v10)
   001_024, hourly utotal/vtotal
            │                               │
            └──────────┬────────────────────┘
                       ▼
              scripts/fetch_data.py
                       │
                       ▼
              scripts/forcing_chunks.py
                       │
                       ▼
        simulation/data/currents.json   ← manifest
        simulation/data/chunks/*.json   ← immutable chunks
                       │
                       ▼
              browser app (Field.load)
```

## 9.2 `fetch_data.py` — CMEMS + Open-Meteo subsetting

Knobs at the top of the file:

```python
CMEMS_PRODUCT_ID = 'GLOBAL_ANALYSISFORECAST_PHY_001_024'
CMEMS_DATASET_ID = 'cmems_mod_glo_phy_anfc_merged-uv_PT1H-i'
CMEMS_VARIABLES = ['utotal', 'vtotal']
LON_MIN, LON_MAX = 47.5, 59.0   # full Arabian Gulf + Strait of Hormuz + Gulf of Oman
LAT_MIN, LAT_MAX = 22.0, 30.5
HINDCAST_DAYS    = 1            # 1 day of context before release
FORECAST_DAYS    = 9            # 10-day hourly browser window after chunking
```

Authentication is checked in order:
1. `CMEMS_USER`, `CMEMS_PASS` env vars,
2. `COPERNICUSMARINE_SERVICE_USERNAME`, `COPERNICUSMARINE_SERVICE_PASSWORD` env vars,
3. saved credentials at `~/.copernicusmarine/.copernicusmarine-credentials` or legacy `motuclient`/`.netrc`,
4. fall back to interactive prompt (only useful for manual runs).

`copernicusmarine.subset(...)` is called with the bbox + time window; it returns an `xarray.Dataset` with `utotal`, `vtotal` on a regular lon/lat grid.

Open-Meteo wind is fetched via HTTPS for each grid cell (cached to `data/cache/`). On failure or rate-limit, wind is skipped — the model degrades gracefully because `Field.hasWind = false`.

Output writing is delegated to `forcing_chunks.write_chunked_payload`.

## 9.3 `forcing_chunks.py` — chunked JSON output

Splits the 240-hour cube into N chunks of ~24 hours each, writes one JSON per chunk under `data/chunks/`, plus a manifest `data/currents.json`:

```json
{
  "meta": {…},
  "times": [...],
  "lats": [...],
  "lons": [...],
  "chunks": [
    { "url": "chunks/currents_0000.json", "tStart": 0,  "tEnd": 23 },
    { "url": "chunks/currents_0001.json", "tStart": 24, "tEnd": 47 },
    …
  ]
}
```

Each chunk file contains its slice of `u`, `v`, `uw`, `vw` as 3-D arrays (`[t][y][x]`). Floats are serialized at fixed precision to keep file sizes deterministic across reruns.

## 9.4 `prepare_data.py`, `validate_currents.py`, `smoke_check.py`

- **`prepare_data.py`** — helper for one-off data prep: applies the same cropping/normalization that `fetch_data.py` does, but to a NetCDF already on disk. Used for manual experiments.
- **`validate_currents.py`** — schema validator. Loads `data/currents.json`, walks every chunk, asserts shapes match `(len(times), len(lats), len(lons))`, asserts time axis is monotonic, asserts no NaN-only frames.
- **`smoke_check.py`** — a fast Python-side simulation harness: loads the manifest, integrates a handful of test particles, dumps their tracks. Used in CI to catch regressions in the data pipeline before deploying.

## 9.5 OpenDrift companion (`run_opendrift_hormuz.py`)

A reference run using the **OpenDrift** Python library (not loaded in the browser). Useful for sanity-checking the browser model's output against an industry-standard offline simulator.

## 9.6 GitHub Actions daily refresh

`.github/workflows/daily-data.yml` runs `python scripts/fetch_data.py` at 06:00 UTC, commits any changes to `simulation/data/`, and pushes. The runner needs `CMEMS_USER` / `CMEMS_PASS` (or saved credentials) injected via secrets. The simulation's service worker (`sw.js`) handles the cache invalidation for returning users.

---

## 10. Service workers, caching & versioning

| Asset class | Where served | Strategy | Versioning |
|-------------|--------------|----------|------------|
| Marketing HTML | static or Express | browser default (HTML usually not aggressively cached) | path-based |
| Marketing JS/CSS | static or Express | browser default | rely on `?v=N` query strings or filename hash when you redeploy |
| Simulation HTML | static or Express | browser default | `?v=N` on `<link>`s in `simulation/index.html` |
| Simulation chunks | static (under `simulation/data/`) | **service worker** — chunks cache-first, manifest network-first | `CACHE_VERSION` constant in `sw.js`; new dataset = new chunk filenames |
| Vendor libs from CDNs | unpkg / cdnjs / Google Fonts / cdn.plot.ly | their cache headers (immutable for versioned URLs) | pinned versions in `<script>` / `<link>` tags |

Bumping `CACHE_VERSION` in `simulation/sw.js` from `v4` → `v5` invalidates every cached chunk on next visit.

## 11. Security model (end-to-end)

| Concern | Mitigation | Where |
|---------|------------|-------|
| Password brute force | scrypt + 5/15min rate limit | `server.js` §7.3, §7.4 |
| Session hijack | 256-bit token, secure cookies, short TTL | `server.js` §7.3 |
| Timing oracle | `crypto.timingSafeEqual` for hash compare | `server.js` §7.3 |
| XSS in CMS content | `escapeHtml(...)` on every interpolation | `utils.js`, every loader |
| CSRF on admin | session cookie + same-origin policy | `server.js` |
| Server fingerprinting | `x-powered-by` disabled | `server.js` §7.1 |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` | `server.js` §7.8 |
| MIME-sniffing | `X-Content-Type-Options: nosniff` | `server.js` §7.8 |
| Referrer leakage | `Referrer-Policy: strict-origin-when-cross-origin` | `server.js` §7.8 |
| HTTPS downgrade | HSTS in production | `server.js` §7.8 |
| Inline script abuse | CSP narrow allowlist | `server.js` §7.8 |
| Secrets in repo | `.env` / `.env.local` gitignored | `server.js` §7.2 |
| Sensitive root files | `_redirects`, `web.config`, server-side deny | §7.9 |
| GitHub PAT leakage | server-managed mode — token never leaves the box | `server.js` §7.7 |
| Static fallback weakness | documented; only on static-only hosts | `admin-auth.js` §6.2 |

## 12. Build, run, deploy

### 12.1 Local development (Express)

```bash
npm ci
npm start          # equivalent to: node server.js
# →  http://127.0.0.1:3000/             marketing site
# →  http://127.0.0.1:3000/admin.html   admin
# →  http://127.0.0.1:3000/simulation/  Hormuz drift app
```

When `NODE_ENV` is unset, the server prints a freshly generated admin password to stdout if you don't supply `TRIDEL_ADMIN_PASSWORD_HASH` or `TRIDEL_ADMIN_PASSWORD`.

### 12.2 Static-host deployment (GitHub Pages, Netlify, etc.)

1. Push the repo as-is to the host's primary branch.
2. Confirm `_headers`, `_redirects`, `404.html`, `web.config` are uploaded — these contain the routing fallback and security headers for the host.
3. Test extensionless paths resolve to `index.html` (SPA fallback).
4. Test `/simulation/` loads end-to-end and the chunk fetches succeed.

The admin will fall back to the public SHA-256 hash flow; the site is not safe to use as a real CMS in this mode unless the public hash is also rotated.

### 12.3 Express deployment (recommended for real admin)

```bash
# On the deployment box:
git clone … && cd Tridel
npm ci

# Generate a scrypt hash for your admin password (one-off, locally):
node -e "const c=require('crypto'); const s=c.randomBytes(16).toString('hex'); console.log('scrypt$'+s+'$'+c.scryptSync('mypassword',s,64).toString('hex'))"

# Set environment:
export TRIDEL_ADMIN_PASSWORD_HASH='scrypt$...$...'
export TRIDEL_GITHUB_OWNER='EnochMacwan'
export TRIDEL_GITHUB_REPO='Tridel'
export TRIDEL_GITHUB_BRANCH='main'
export TRIDEL_GITHUB_TOKEN='github_pat_…'
export TRIDEL_ALLOWED_ORIGINS='https://admin.your-domain.example'
export NODE_ENV=production

node server.js
```

Recommended process supervisors:

- **systemd** (Linux) — drop a unit file at `/etc/systemd/system/tridel.service`.
- **pm2** (any) — `pm2 start server.js --name tridel`.
- **IIS + iisnode** on Windows — use `web.config` as the routing shim.
- **Docker** — minimal Dockerfile: `FROM node:20-alpine; WORKDIR /app; COPY . .; RUN npm ci --production; CMD ["node","server.js"]`.

Always front the Node process with **HTTPS** (Nginx / Caddy / Cloudflare Tunnel / IIS termination). `server.js` does not terminate TLS itself.

### 12.4 PowerShell example (Windows)

```powershell
$env:TRIDEL_ADMIN_PASSWORD_HASH="scrypt$..."
$env:TRIDEL_GITHUB_OWNER="EnochMacwan"
$env:TRIDEL_GITHUB_REPO="Tridel"
$env:TRIDEL_GITHUB_BRANCH="main"
$env:TRIDEL_GITHUB_TOKEN="github_pat_xxxxx"
$env:TRIDEL_ALLOWED_ORIGINS="https://admin.your-domain.example"
$env:NODE_ENV="production"
node server.js
```

## 13. Performance & memory considerations

### Marketing site
- All page renderers `innerHTML`-replace `<main>` — there is no node diffing. This is fine because pages are small (the largest is the products grid at a few hundred nodes), and `innerHTML` is fast for that scale.
- Images use `loading="lazy"` and `decoding="async"`.
- Inter is self-hosted as `woff2` so first paint doesn't depend on Google Fonts.
- IntersectionObserver is used for the stats counter and `initScrollReveal` so animations don't run on offscreen content.

### Simulation
- 1,800 particles × 80 time-steps = 144 K positions. Stored as `Float32Array`, ~1.1 MB. Transferred zero-copy between worker and main thread.
- Chunked JSON keeps any single fetch under ~10 MB.
- Service worker eliminates the network round-trip for chunks on repeat visits.
- The render loop draws at 60 fps on most hardware; on low-end devices, `viewport-detector.js` can drop `nParticles` and disable trails.

### Server
- In-memory `sessions` and `loginAttempts` maps are bounded: sessions by TTL cleanup, rate-limit by the 15-minute window cleanup interval.
- Site-metrics file grows ~linearly with visitor count. Rotate it manually if it grows past a few MB.

## 14. Testing, validation, smoke checks

There is no formal test runner. The available checks:

| Check | What it covers | How to run |
|-------|----------------|------------|
| `scripts/validate_currents.py` | manifest schema, axis monotonicity, no all-NaN frames | `python scripts/validate_currents.py` |
| `scripts/smoke_check.py` | end-to-end integration over a tiny scenario | `python scripts/smoke_check.py` |
| `verify_news.txt` | snapshot of the rendered news section to diff against | manual visual inspection |
| `node -e "require('./server.js')"` | confirms the server module parses (catches typos before deploy) | `node -c server.js` |
| `npm ci` | clean lockfile install | CI |
| Manual: open `/simulation/`, click "Run" | smoke-tests the full chain | every release |

When the chunking schema changes, **bump `CACHE_VERSION` in `simulation/sw.js`** so returning users invalidate their old caches.

## 15. Troubleshooting & FAQ

**Q. The simulation says "This app cannot load data over file://" — why?**
A. The chunked JSON architecture relies on `fetch()` with same-origin URLs, which `file://` doesn't support. Use `npm start`, or any static-file server (`python -m http.server`, `npx serve`), and open via `http://localhost:…/simulation/`.

**Q. The map is blank but no errors.**
A. Most likely: `Field.load()` succeeded but `currents.json` is missing the `chunks` array, or the chunks 404. Open DevTools → Network and look for failed chunk fetches.

**Q. The admin login button does nothing on production.**
A. Either Express is down (check `pm2 status` / `systemctl status tridel`), or you're hitting a static-only fallback. Try `curl https://your-host/api/check-auth` — if it 404s, the admin is in static-fallback mode.

**Q. "FATAL: TRIDEL_ADMIN_PASSWORD_HASH is not in the expected scrypt format."**
A. Your hash isn't `scrypt$<saltHex>$<derivedKeyHex>`. Regenerate it with the one-liner in §12.3.

**Q. CMEMS download fails: "401 Unauthorized."**
A. Either env vars are wrong, or your saved credentials at `~/.copernicusmarine/` are stale. Run `copernicusmarine login` to refresh.

**Q. The home stats bar wraps to two rows on some desktops.**
A. The flexbox container has a min-width-per-stat tuned for desktop. Check `assets/css/styles.css` for `.stats-grid` and verify the breakpoint media query.

**Q. The service worker is serving stale data after I redeploy chunks.**
A. The manifest is network-first, so the chunk list updates. But if your **chunk filenames** were reused (same names, new contents), the cache will hand back old versions. Bump `CACHE_VERSION` in `sw.js` whenever chunk filenames are reused.

**Q. The header CTA "LIVE / Simulation" shows on one line on production but two lines locally (or vice versa).**
A. CSS specificity issue — make sure `simulation/css/theme.css` is loaded **after** `style.css` and `ui-cleanup.css`, and that the wrapper class is doubled (`.liquidGlass-wrapper.liquidGlass-wrapper`) in the rule for stacking.

**Q. The `_headers` file has no effect on my host.**
A. `_headers` is Netlify-specific. Cloudflare Pages reads it too. For GitHub Pages, security headers must come from `<meta http-equiv>` tags in `index.html`. For IIS, use `web.config`.

## 16. Glossary

| Term | Meaning |
|------|---------|
| **SPA** | Single-page application — navigation happens in JS, not via full page loads |
| **SAR** | Search and rescue |
| **PIW** | Person in water — a NOAA leeway category |
| **Leeway** | Drift of a floating object relative to surface current, driven by wind |
| **Stokes drift** | Net forward drift caused by surface waves |
| **Lagrangian** | Following individual particles through the flow (vs Eulerian = fixed grid) |
| **CMEMS** | Copernicus Marine Environment Monitoring Service — EU ocean data provider |
| **GFS** | Global Forecast System — NOAA's global weather model |
| **OpenDrift** | Python framework for offline particle-tracking; reference implementation we approximate in-browser |
| **ADIOS** | NOAA's oil-property database (Automated Data Inquiry for Oil Spills) |
| **API gravity** | Industry oil-density scale: API = (141.5/SG) − 131.5 |
| **SARA** | Oil composition: Saturates, Aromatics, Resins, Asphaltenes |
| **Fingas evaporation** | Empirical log-linear model: F(t) = C1·ln(t_min), capped at f_max |
| **Mackay emulsification** | dW/dt = K_e·U10²·(1 − W/W_max) — water-in-oil mousse formation |
| **Delvigne–Sweeney dispersion** | Natural break-up of slick into droplets that mix into water |
| **Fay (1971) spreading** | Gravity-viscous regime law for slick footprint radius vs time |
| **scrypt** | Password hashing function in Node's standard `crypto` module |
| **JSON-LD** | JSON-encoded linked-data — used for the org schema in `index.html` |
| **CSP** | Content Security Policy — HTTP header that allowlists script/style/etc. sources |
| **HSTS** | HTTP Strict Transport Security — forces HTTPS for the configured TTL |
| **CARTO** | Provider of dark/light basemap tiles used by the simulation |
| **Lenis** | Smooth-scrolling JS library used on the marketing site |
| **SortableJS** | Drag-and-drop list reorder used by the admin |
| **Mega menu** | Multi-column dropdown shown on hover for nav items with `hasMegaMenu: true` |
| **Specificity tax** | Doubling a class selector (`.x.x`) to beat a single-class `!important` rule |
| **Cleanup function** | The function a page renderer returns; the router calls it before the next route renders |

---

> _End of document. See `TECHNOLOGIES_AND_PLUGINS.md` for the dependency-by-dependency inventory._

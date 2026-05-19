# Technologies and Plugins

> Exhaustive inventory of every language, framework, library, plugin, external API, browser API, font, data format, and scientific model used by the Tridel + Hormuz simulation codebase. For each entry: **what it is**, **where it lives in this repo**, **why we use it**, and **how to find/update it**.

---

## Table of Contents

1. [Languages](#1-languages)
2. [JavaScript runtime dependencies (npm)](#2-javascript-runtime-dependencies-npm)
3. [Browser JavaScript libraries (vendored + CDN)](#3-browser-javascript-libraries-vendored--cdn)
4. [Python libraries](#4-python-libraries)
5. [Fonts & icon libraries](#5-fonts--icon-libraries)
6. [CSS frameworks & utilities](#6-css-frameworks--utilities)
7. [Map tile providers](#7-map-tile-providers)
8. [External APIs & web services](#8-external-apis--web-services)
9. [Browser platform APIs](#9-browser-platform-apis)
10. [Data formats](#10-data-formats)
11. [Build & dev tools](#11-build--dev-tools)
12. [Security primitives](#12-security-primitives)
13. [Scientific models & references](#13-scientific-models--references)
14. [Hosting & deployment targets](#14-hosting--deployment-targets)
15. [Quick-reference matrix](#15-quick-reference-matrix)

---

## 1. Languages

| Language | Where | Why | Files / count |
|---|---|---|---|
| **JavaScript (ES2015+)** | All browser logic + Node backend | Universal browser runtime, no transpilation step needed for our target (modern Chromium-based browsers) | ~55 files, ~12,000 LOC |
| **Python 3.10+** | Data refresh pipeline | NumPy / xarray ecosystem is the de-facto standard for ocean/climate gridded data | 7 scripts in `scripts/` |
| **HTML5** | Page shells | Semantic structure for shells; rest is JS-rendered | `index.html`, `admin.html`, `simulation/index.html`, `404.html` |
| **CSS3** | All styling | Plain CSS with `:root` custom-property tokens — no preprocessor | `styles.css` 7,862 LOC, `simulation/css/theme.css` ~1,200 LOC, plus 6 more |
| **PowerShell** | Windows admin scripts | Native Windows shell for content-extraction GUI | `scripts/*.ps1` (4 files) |
| **Batch** | Windows launchers | `.bat` shortcuts for the GUI tools | `scripts/*.bat` (2 files) |

---

## 2. JavaScript runtime dependencies (npm)

The full `package.json`:

```json
{
  "name": "tridel-admin",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js", "dev": "node server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "cors":    "^2.8.5"
  }
}
```

### Express ^4.18.2

- **What:** Minimal, unopinionated Node.js web framework
- **Where:** `server.js` (the only Node entry point)
- **Why:** Tiny dependency surface; handles routing, JSON body parsing, and static-file serving with no ceremony
- **Used for:** `/api/login`, `/api/check-auth`, `/api/metrics/*`, `/api/github/*`, `/api/data/*`, plus serving the SPA shell as a catch-all (`app.get('*', …)`)
- **Update via:** `npm install express@latest`

### CORS ^2.8.5

- **What:** Express middleware that emits the right `Access-Control-Allow-*` response headers
- **Where:** `server.js` (registered as `app.use(cors({ origin: ALLOWED_ORIGINS }))`)
- **Why:** The admin panel may be hosted on a different origin from the API (e.g. when proxied) — CORS allows the cross-origin XHRs to succeed
- **Whitelist:** `http://localhost:3000`, `http://127.0.0.1:3000`, plus origins set via env var

**Intentionally NOT installed (kept minimal):**
- No bundler (Webpack/Vite/esbuild)
- No transpiler (Babel/TypeScript)
- No test framework (Jest/Mocha)
- No ORM, no database driver — data is plain JSON committed to git via the GitHub API
- No template engine — everything is `${escapeHtml(...)}` string interpolation

---

## 3. Browser JavaScript libraries (vendored + CDN)

### Leaflet 1.9.4 — interactive map

- **What:** Lightweight, mobile-friendly interactive map library (~140 KB)
- **Where:** `simulation/index.html` loads from CDN:
  ```html
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  ```
- **Also vendored:** `assets/vendor/leaflet/` (used by the marketing site's testimonial-map and admin location editor)
- **Why:** Mature, no-build, plugin-rich. Pane system lets us stack basemap + labels + landmarks + our custom canvas overlays cleanly.
- **Custom usage:** `DualCanvasLayer` (in `simulation/js/app.js`) — a custom Leaflet layer that stacks three full-viewport `<canvas>` elements (`_field`, `_part`, `_drift`) over the map to render current vectors, ambient flow tracers, and particle ensembles respectively.

### Plotly.js 2.35.2 — analytics charts

- **What:** D3-based scientific charting library
- **Where:** `simulation/index.html` from CDN:
  ```html
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
  ```
- **Why:** Stacked-area + time-series charts with no manual SVG work
- **Used in:** `#ts-plot` (run analytics: particle count, spread radius over time), `#oil-budget-plot` (compartment evolution)
- **Note:** The oil-budget chart was eventually re-implemented as a custom 2-D canvas (`drawOilBudgetCanvas` in `app.js`) to bypass Plotly's SVG paint quirks inside the side-panel stacking context. Plotly is still loaded for `#ts-plot`.

### Lenis (vendored, version not pinned) — smooth scroll

- **What:** Smooth-scroll engine that overrides the browser's native scroll
- **Where:** `assets/vendor/lenis/lenis.min.js`, loaded by `index.html`
- **Why:** Buttery-smooth scroll on the marketing site
- **Wired up by:** `assets/js/smooth-scroll.js`

### Sortable.js (vendored, version not pinned) — drag-and-drop

- **What:** Drag-and-drop library for HTML lists/tables
- **Where:** `assets/vendor/sortable/Sortable.min.js`
- **Why:** Admin panel needs reorderable lists (e.g. nav links, mega-menu items, gallery image order)
- **Used by:** `assets/js/admin.js` and `admin-form-rows.js`

### Inline SVG: `<filter id="glass-distortion">` — refraction effect

- **What:** SVG `feTurbulence` + `feDisplacementMap` + `feSpecularLighting` filter chain
- **Where:** Inline in `simulation/index.html` (hidden `<svg>` at the end of `<body>`)
- **Why:** Provides the macOS-style glass distortion referenced by `.liquidGlass-effect` via `filter: url(#glass-distortion)`. Currently `filter: none` is set in `theme.css` to keep cards colour-neutral, but the SVG is retained for fallback / future use.

---

## 4. Python libraries

The pipeline doesn't ship a `requirements.txt` but `scripts/fetch_data.py` imports:

| Library | Version | Where used | Why |
|---|---|---|---|
| **xarray** | unpinned | `fetch_data.py`, `forcing_chunks.py` | NumPy-like labelled multi-dimensional arrays. The standard tool for working with NetCDF ocean datasets. |
| **numpy** | unpinned | All scripts | Numerical arrays, gridded math, bilinear resampling, JSON-safe value coercion |
| **copernicusmarine** | 2.4.0 | `fetch_data.py` | Official CMEMS Python client. Authenticates with the user's CMEMS account and downloads NetCDF subsets. |
| **requests** | unpinned | `fetch_data.py` (Open-Meteo call) | HTTP client for the wind API |
| **stdlib `json`** | — | `forcing_chunks.py` | Serialise the manifest + chunks |
| **stdlib `pathlib`** | — | All scripts | Cross-platform path handling |
| **stdlib `datetime`** | — | All scripts | Time-window construction |

**Install:**
```bash
pip install xarray numpy copernicusmarine requests
# or, if a requirements.txt is added:
pip install -r scripts/requirements.txt
```

---

## 5. Fonts & icon libraries

### Inter (Google Fonts + local fallback)

- **What:** Modern variable sans-serif designed for screens
- **Where:**
  - `assets/css/fonts.css` declares local `@font-face` for `Inter-Light.ttf`, `Inter-Regular.ttf`, `Inter-Medium.ttf`, `Inter-SemiBold.ttf`, `Inter-Bold.ttf`, `Inter-ExtraBold.ttf` (300/400/500/600/700/800)
  - `simulation/index.html` also loads from Google Fonts as a fallback:
    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet">
    ```
- **Why:** Excellent legibility at every size; weights cover all UI needs
- **Token:** `--sim-font-family: "Inter", system-ui, -apple-system, sans-serif`

### Font Awesome 6.4.0 (CDN)

- **What:** Icon font library
- **Where:**
  ```html
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossorigin="anonymous" referrerpolicy="no-referrer">
  ```
- **Used in:** Nav icons (`fa-trophy`, `fa-water`, `fa-chevron-down`, `fa-arrow-up-right-from-square`), social icons (`fab fa-linkedin`), button icons
- **Why:** Battle-tested icon library with SRI integrity check for tamper protection

### Outfit (font, used in stats)

- **What:** Geometric sans-serif designed for display use
- **Where:** Referenced in `assets/css/styles.css` for the homepage stats numbers:
  ```css
  .stat-number { font-family: 'Outfit', sans-serif; font-weight: 800; }
  ```
- **Why:** Distinctive numeric display style for the "26 PRODUCTS / 12 SERVICES / …" stats bar

---

## 6. CSS frameworks & utilities

We don't use a CSS framework. The project is **plain CSS with design tokens** — `:root` custom properties act as the design system.

### Layers (load order matters)

| File | LOC | Purpose | Where loaded |
|---|---|---|---|
| `assets/css/styles.css` | 7,862 | Main marketing-site styles (hero, sections, cards, header, footer, responsive breakpoints) | `index.html` |
| `assets/css/admin.css` | 1,042 | Admin panel layout + tabs + forms | `admin.html` |
| `assets/css/admin-auth.css` | 143 | Login form | `admin.html` |
| `assets/css/fonts.css` | 71 | `@font-face` for Inter | both shells |
| `simulation/css/style.css` | 5,212 | Simulation base layout (map shell, side panel, controls) | `simulation/index.html` |
| `simulation/css/ui-cleanup.css` | 3,215 | Legacy polish + responsive cascade fixes | `simulation/index.html` |
| `simulation/css/theme.css` | ~1,200 | **Single source of truth** — design tokens + component recipes; loaded LAST | `simulation/index.html` |

### Key CSS techniques used

- **CSS custom properties (`var(--token)`)** for theming
- **`backdrop-filter: blur(…) saturate(0)`** for glass-morphism with no colour bleed
- **`flex-wrap: nowrap` + `flex: 1 1 0` + `min-width: 0`** for guaranteed single-row layouts
- **`@media (max-width: 768px)`** mobile breakpoint
- **CSS `clamp()`** for fluid sizing (e.g. `clamp(6px, 1.2vw, 20px)`)
- **`:not(.compact-reference-ui)` body-class scoping** to disable the modern theme for legacy "compact reference UI" mode
- **Specificity tax** (`#side.liquidGlass-wrapper.liquidGlass-wrapper`) to beat `!important` rules from older CSS

---

## 7. Map tile providers

### CARTO Dark (current default)

- **What:** Free dark basemap with a clean style
- **Where:** `simulation/js/app.js`:
  ```js
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { … })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { … })
  ```
- **Why:** Free, fast, and the dark theme matches the simulation aesthetic. Labels are a separate layer so we can control their z-index.
- **Attribution:** © OpenStreetMap contributors © CARTO

### OpenSeaMap Seamark overlay

- **What:** Free overlay layer with nautical features (buoys, channels, lighthouses)
- **Where:** `simulation/js/app.js`:
  ```js
  L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', { … })
  ```
- **Used for:** "Show seamarks" toggle in the Vessel Traffic & Incidents card

---

## 8. External APIs & web services

### Copernicus Marine Service (CMEMS)

- **What:** EU's operational ocean data service
- **Where:** `scripts/fetch_data.py` via the `copernicusmarine` Python SDK
- **Auth:** Required. `CMEMS_USER` + `CMEMS_PASS` env vars (or `COPERNICUSMARINE_SERVICE_USERNAME` + `_PASSWORD`)
- **Dataset:** `cmems_mod_glo_phy_anfc_merged-uv_PT1H-i` (Global Ocean Analysis & Forecast, merged surface u/v, hourly instantaneous)
- **Bbox:** lon 47.5–59.0, lat 22.0–30.5 (Persian Gulf)
- **Output:** `data/cache/cmems.nc` (NetCDF, ~18 MB)

### Open-Meteo Archive API (wind)

- **What:** Free weather API serving GFS surface winds
- **Where:** `scripts/fetch_data.py` (called via `requests`)
- **Auth:** None
- **URL:** `https://archive-api.open-meteo.com/v1/era5?…&hourly=u10,v10`
- **Why:** Reliable, free, no rate limits at our query volume

### MarineTraffic (external link)

- **What:** Live AIS vessel-tracking service
- **Where:** `simulation/index.html` — "Open live AIS" / "Open MarineTraffic" buttons link to `https://www.marinetraffic.com/en/ais/home`
- **Auth:** None (just an external link)
- **Why:** MarineTraffic doesn't expose a free Leaflet tile endpoint for live AIS, so we open a synced external tab instead of trying to embed it

### NOAA WebGNOME (external link)

- **What:** NOAA's official high-fidelity oil-spill response planning tool
- **Where:** "Open WebGNOME" button → `https://gnome.orr.noaa.gov/#config`
- **Why:** Browser app is for fast exploration; operational response planning must use NOAA's validated tools

### GitHub Contents API

- **What:** REST API for reading/writing files in a GitHub repo
- **Where:** `server.js` — `/api/github/load`, `/api/github/save`, `/api/github/test` endpoints proxy to `https://api.github.com/repos/{repo}/contents/{path}`
- **Auth:** Personal access token in `GITHUB_TOKEN` env var, with `repo` scope
- **Why:** Lets the admin panel persist content edits without us running our own database

### LinkedIn embeds (third-party iframes)

- **What:** Embedded LinkedIn post cards for the "Latest from LinkedIn" section
- **Where:** `assets/js/news-data.js` provides embed URLs; `pages/home.js` (news section) renders `<iframe>` elements
- **CSP:** `frame-src https://www.linkedin.com` is whitelisted in `server.js`

### FormSubmit (contact form)

- **What:** Free serverless form-handler service
- **Where:** Contact page form — referenced in CSP allowed-origins
- **Why:** Sends contact-form submissions to a configured email without us hosting form handling

---

## 9. Browser platform APIs

### Web Workers

- **What:** Browser API for running JS on a background thread
- **Where:** `simulation/js/worker.js` is instantiated by `app.js` via `new Worker('js/worker.js')`. Worker uses `importScripts('field.js', 'weathering.js', 'drift.js')` to share globals.
- **Why:** Integrating 1,800 particles × 24 h × 1 h dt = 43,200 RK2 steps takes ~3 seconds. Doing this on the main thread freezes the UI. Workers keep the canvas smooth.
- **Message protocol:** `postMessage({ action, payload })` / `postMessage({ type, … })` (documented in `TECHNICAL_DOCUMENTATION.md` § Part D.5)

### Service Workers

- **What:** Programmable network proxy + persistent cache
- **Where:** `simulation/sw.js`, registered by `app.js`
- **Why:** Cache the large forcing-data chunks (~19 MB each, ~126 MB total). Cache-first for chunks (immutable per `CACHE_VERSION`); network-first for the manifest so visitors don't get stale time ranges.

### Canvas 2D rendering context

- **What:** `<canvas>` + `getContext('2d')` pixel-drawing API
- **Where:** `simulation/js/app.js` (`DualCanvasLayer`) — three stacked canvases over the Leaflet map
- **Why:** Drawing 1,800 moving particles per frame in DOM is too slow; canvas is the right tool. Also used by `drawOilBudgetCanvas()` for the stacked-area oil-fate chart.

### IntersectionObserver

- **What:** Observes when elements enter/leave the viewport
- **Where:**
  - `assets/js/pages/home.js` — animates stats counter when the stats bar scrolls into view
  - `assets/js/script.js` — scroll-reveal animations
- **Why:** More performant than scroll-event listeners

### MutationObserver

- **What:** Observes DOM changes
- **Where:** `simulation/js/liquid-glass.js` (legacy) — used to wrap dynamically-added cards in the 4-layer glass structure
- **Why:** Lets us decorate cards that get added after initial render

### Fetch API

- **What:** Modern HTTP client (`fetch(url).then(r => r.json())`)
- **Where:** Everywhere data is loaded (`Field.load()`, admin GitHub I/O, metrics POSTs)
- **Why:** Native, Promise-based, supersedes XHR

### History API (via Leaflet's panes & hash routing)

- **What:** `window.history.pushState()` for SPA URL changes
- **Where:** `assets/js/router.js` uses hash routing (`#/route`) so deep links work without server-side rewrite rules
- **Why:** Simplest SPA routing; works on static hosts

### `localStorage`

- **What:** Persistent key/value storage in the browser
- **Where:** Theme preference (`theme-toggle.js`), simulation expert-tools state, settings
- **Why:** Survives tab close; per-origin

### Geolocation API

- Not used. We intentionally never read user location — the simulation only uses map-click coordinates the user provides.

### Service Worker Cache Storage

- **What:** Persistent cache used by service workers
- **Where:** `sw.js` opens `caches.open('hormuz-forcing-v4')`
- **Why:** Stores the 126 MB of forcing chunks across visits

---

## 10. Data formats

### JSON (everywhere)

- **What:** JavaScript Object Notation — text-based interchange format
- **Where:** API request/response bodies, `data/currents.json` manifest, chunked forcing data, log files
- **Why:** Native browser parser, human-readable, language-agnostic

### NetCDF (.nc)

- **What:** Network Common Data Form — binary file format for gridded scientific data
- **Where:** `data/cache/cmems.nc` (raw CMEMS download before chunking)
- **Why:** Standard format for ocean/climate data. We use xarray to read it and re-serialise to JSON for the browser.

### "JavaScript as CMS"

- **What:** Content files like `assets/js/products-data.js` are valid JavaScript modules:
  ```js
  window.PRODUCTS_DATA = [ { id: '…', name: '…', … }, … ];
  ```
- **Where:** All `assets/js/*-data.js` files
- **Why:** No database, no fetch, no template engine. The page loads, the data is already in `window.*_DATA`, the renderer reads it synchronously. The admin panel writes back to these files as JS source strings (using regex + markers to splice values in/out of preserved comments).

### Service Worker cache (named cache storage)

- **What:** Persistent key/value cache (request → response) per origin
- **Where:** `simulation/sw.js` manages `hormuz-forcing-v4`
- **Why:** Stores the forcing JSON chunks across visits, allowing offline playback after first load

---

## 11. Build & dev tools

This project intentionally has **no build step**. The files you write are the files the browser loads. Trade-offs:

| Approach | Pro | Con |
|---|---|---|
| **No build (chosen)** | Edit → reload. No CI build minutes. No source-map debugging gap. | No minification. No tree-shaking. No TypeScript. |
| Webpack/Vite | Modern features, smaller bundle | Build step, source-map debugging, longer feedback loop |

### Cache-busting via query string

Each `<link>` and `<script>` carries a manually-bumped version:
```html
<link rel="stylesheet" href="css/theme.css?v=31" />
<script src="js/app.js?v=71"></script>
```
After editing a file, bump its `?v=` so browsers fetch the new copy past their HTTP cache.

### Local development servers

| Tool | Use case |
|---|---|
| `node server.js` | Full backend (admin panel + metrics + GitHub proxy) on `http://localhost:3000` |
| `python -m http.server 8000 --bind 127.0.0.1` | Static-only dev (when you don't need the admin API). Used by the conversation transcript's testing flow. |

### git + GitHub

- **Repo:** `https://github.com/EnochMacwan/Tridel`
- **Worktrees:** `.claude/worktrees/` directory holds Claude Code's isolation worktrees for parallel agent work
- **Branch model:** Single `main` branch, push-only workflow

### Claude Code MCP integrations

- **claude-in-chrome** — drives Brave/Chrome from JS for live UI verification (used heavily in this transcript)
- **claude_preview** — quick screenshot preview of a local dev server
- **graphify** — generates a knowledge-graph visualisation of the codebase (output in `graphify-out/`)

---

## 12. Security primitives

### Node.js `crypto` module

- **What:** Built-in cryptographic API
- **Where:** `server.js` — `crypto.scryptSync()` for password hashing, `crypto.randomBytes()` for session tokens, `crypto.timingSafeEqual()` for hash comparison
- **Why:** Built into Node, no extra deps. Scrypt is intentionally slow → resistant to brute-force.

### Content Security Policy (CSP)

- **What:** HTTP header that whitelists script/style/connect sources
- **Where:** `server.js` sets `Content-Security-Policy` on every response
- **Why:** Mitigates XSS by preventing inline scripts from unknown origins
- **Limitation:** `'unsafe-inline'` is currently required for inline `<script>` blocks in shells

### HSTS

- **What:** `Strict-Transport-Security` header forces browsers to use HTTPS for a year
- **Where:** `server.js` (`max-age=31536000; includeSubDomains`)
- **Why:** Prevents protocol-downgrade attacks

### X-Frame-Options: DENY

- **What:** Forbids the site from being embedded in iframes
- **Where:** `server.js`
- **Why:** Anti-clickjacking

### X-Content-Type-Options: nosniff

- **What:** Disables browser MIME-type sniffing
- **Where:** `server.js`
- **Why:** Prevents an uploaded .txt from being executed as .js

### Rate limiting

- **What:** In-memory `Map<ip, { attempts, firstAttemptAt }>`
- **Where:** `server.js` — applied to `/api/login` (5 attempts / 15 min / IP)
- **Why:** Brute-force resistance

### `escapeHtml()` (`assets/js/utils.js`)

- **What:** 6-line function that escapes `& < > " '`
- **Where:** Imported as `esc` and wrapped around every interpolated value in page renderers
- **Why:** XSS prevention — content from data files goes through this on every render

---

## 13. Scientific models & references

These are the published models the simulation implements. Citations are in code comments in `simulation/js/`.

### Particle drift physics

| Reference | Model | Where |
|---|---|---|
| **NOAA Allen (2005)** | Leeway parameters for 19 SAR target categories — downwind & crosswind fractions | `drift.js` `LEEWAY_CATEGORIES` |
| **Breivik et al. (2011)** | Updated leeway coefficients for additional object types | `drift.js` |
| **Kenyon (1969)** | Stokes drift ≈ 1.6% of wind speed | `drift.js` `STOKES_FRACTION = 0.016` |
| **Csanady (1973)** | Random-walk eddy diffusion with σ = √(2Kdt) | `drift.js` |

### Oil weathering

| Reference | Model | Where |
|---|---|---|
| **Fingas (1998)** | `F(t) = C1·ln(t_min)` — log-linear evaporation rate | `weathering.js` |
| **Mackay et al. (1980)** | `dW/dt = K_e · U10² · (W_max − W)` — water-in-oil emulsification | `weathering.js` |
| **Delvigne & Sweeney (1988)** | Natural surface-oil dispersion under wave action | `weathering.js` |
| **Fay (1971)** | Three-regime slick spreading (gravity-inertial, gravity-viscous, surface-tension) | `drift.js` |
| **NOAA ADIOS** | Oil-property database (14 Hormuz-relevant oils with API, density, SARA, viscosity) | `weathering.js` `OIL_TYPES` |

### Ocean & wind data

| Source | Variable | Where |
|---|---|---|
| **CMEMS GLOBAL_ANALYSISFORECAST_PHY_001_024** | Surface u/v (merged geostrophic + Ekman + tidal), hourly | `scripts/fetch_data.py` |
| **NOAA NCEP RTOFS Global** | Surface u/v (no-auth fallback) | `scripts/fetch_rtofs_data.py` |
| **Open-Meteo (GFS)** | 10 m wind u/v, hourly | `scripts/fetch_data.py` |

### Geometric algorithms

| Algorithm | Where | Used for |
|---|---|---|
| **Andrew's monotone chain** | `simulation/js/app.js` | O(n log n) convex hull for trail coverage / footprint metrics |
| **2×2 covariance eigendecomposition** | `simulation/js/app.js` | Uncertainty ellipse axes |
| **Bilinear interpolation** | `simulation/js/field.js` `_sample()` | Sampling currents at arbitrary lon/lat |
| **Linear interpolation** | `simulation/js/field.js` | Sampling currents at arbitrary time |
| **Box-Muller transform** | `simulation/js/drift.js` | Gaussian random numbers for diffusion noise |

---

## 14. Hosting & deployment targets

The repo includes rewrite rules for three different static hosting environments:

| File | Host | Purpose |
|---|---|---|
| `.htaccess` | Apache (cPanel, traditional shared hosting) | SPA history-fallback rewrite to `/index.html` |
| `_headers` + `_redirects` | Netlify, Cloudflare Pages | Headers + history fallback in Netlify config format |
| `web.config` | IIS, Azure App Service | Same fallback for Microsoft-stack hosting |

For Node-backed deploys (when the admin panel is needed), the recommended approach is:

```
[CDN/edge]  →  [Reverse proxy: nginx/Caddy + TLS]  →  [node server.js on :3000]
```

For pure-static deploys (no admin panel needed), point any CDN at the repo root. The simulation and marketing site work fully client-side.

---

## 15. Quick-reference matrix

| Category | Count | Notes |
|---|---|---|
| Languages | 6 | JS, Python, HTML, CSS, PowerShell, Batch |
| npm dependencies | 2 | express, cors |
| Browser JS libs | 4 | Leaflet, Plotly, Lenis, Sortable |
| Python libs | 4 | xarray, numpy, copernicusmarine, requests |
| External APIs | 6 | CMEMS, Open-Meteo, MarineTraffic, WebGNOME, GitHub, LinkedIn |
| Map tile providers | 3 | CARTO, Mapbox (optional), OpenSeaMap |
| Browser APIs | 8+ | Workers, Service Workers, Canvas, Fetch, History, IntersectionObserver, MutationObserver, localStorage |
| Fonts | 3 | Inter, Outfit, Font Awesome (icons) |
| Scientific models | 8+ | Fingas, Mackay, Delvigne-Sweeney, Fay, Allen leeway, Kenyon, Csanady, Andrew's hull |
| Lines of JS | ~12,000 | ~7,000 marketing + ~5,000 simulation |
| Lines of CSS | ~18,800 | 7,862 main + ~9,500 simulation + others |
| Lines of Python | ~1,500 | Across 7 scripts |
| Data size | ~126 MB | 7 chunks × 24 h of CMEMS + wind |
| External CDN dependencies | 4 | unpkg/Leaflet, cdn.plot.ly, Google Fonts, cdnjs Font Awesome |

---

*To find where any technology in this document is used, grep for its name in the codebase. Every dependency was added intentionally, with the reasoning captured in code comments at the import site.*

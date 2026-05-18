# Tridel Technologies and Plugin Inventory

Last updated: 2026-05-18

## Purpose

This document inventories the main technologies, plugins, third-party libraries, hosted services, and browser platform APIs used by the Tridel website and simulation.

Use it when:

- onboarding a developer
- reviewing security headers before deployment
- replacing a plugin
- adding a new external script, stylesheet, iframe, form target, map tile source, or API endpoint

The project is mostly a static HTML/CSS/JavaScript application with an optional Node/Express backend for admin workflows.

## Runtime Architecture

| Area | Technology | Where | Purpose |
| --- | --- | --- | --- |
| Public website | HTML5, CSS3, vanilla JavaScript | `index.html`, `assets/css/`, `assets/js/` | Single-page public site, route rendering, layout, theme, content display |
| Admin panel | HTML5, CSS3, vanilla JavaScript | `admin.html`, `assets/js/admin*.js`, `assets/css/admin.css` | Content management UI, GitHub publish flow, local save flow through Express |
| Optional backend | Node.js, Express, CORS | `server.js`, `package.json` | Admin auth, GitHub proxy, local content saving, metrics endpoints |
| Static hosting | Netlify `_headers` and `_redirects` | `_headers`, `_redirects` | SPA routing, denied files, response headers, CSP |
| Netlify edge layer | Netlify Edge Functions | `netlify.toml`, `netlify/edge-functions/block-bots.ts` | Bot/fetcher blocking and `X-Robots-Tag` enforcement |
| IIS/static fallback | IIS web config | `web.config` | Header and rewrite support for IIS-style hosting |
| Simulation | Leaflet, Canvas 2D, Web Worker, Service Worker | `simulation/index.html`, `simulation/js/`, `simulation/sw.js` | Interactive Hormuz drift model and map visualization |

## Frontend Plugins and Libraries

| Plugin / library | Version | Source | Loaded from | Used by | Purpose |
| --- | --- | --- | --- | --- | --- |
| Leaflet | 1.9.4 | Vendored and CDN | `assets/vendor/leaflet/`, `https://unpkg.com/leaflet@1.9.4/` | Contact/location maps and simulation map | Interactive maps, markers, tile layers, scale controls, map panes |
| Plotly.js | 2.35.2 | CDN | `https://cdn.plot.ly/plotly-2.35.2.min.js` | Simulation | Charting support for simulation analytics and fallbacks |
| Lenis | 1.0.29 | Vendored | `assets/vendor/lenis/lenis.min.js` | Public site | Smooth scrolling and route scroll restoration |
| SortableJS | 1.15.0 | Vendored | `assets/vendor/sortable/Sortable.min.js` | Admin panel | Drag-and-drop ordering for content items and sections |
| Font Awesome | 6.4.0 | CDN | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` | Public site and admin panel | Icons for navigation, cards, social links, admin actions |
| Google Fonts - Inter | Google Fonts CSS | CDN | `https://fonts.googleapis.com`, `https://fonts.gstatic.com` | Simulation | Simulation UI typeface |
| Local fonts - Inter and Outfit | Local TTF files | Vendored | `assets/fonts/inter/`, `assets/fonts/outfit/` | Public site and admin UI | Local font delivery for core brand/UI typography |

## Map and Geospatial Services

| Service | Where used | Purpose | CSP dependency |
| --- | --- | --- | --- |
| OpenStreetMap attribution | `assets/js/locations-loader.js`, `simulation/js/app.js` | Required attribution for map tiles and map context | No direct tile fetch unless via tile provider |
| CARTO basemaps | `assets/js/locations-loader.js`, `simulation/js/app.js` | Light/dark basemaps and simulation label layers | `img-src` / `connect-src` allow `*.basemaps.cartocdn.com` |
| Esri ArcGIS World Imagery | `assets/js/pages/contact.js` | Satellite imagery for office/contact map | `img-src` allows `server.arcgisonline.com` |
| OpenSeaMap | `simulation/js/app.js` | Nautical seamark overlay for channels, lighthouses, and marine context | `img-src` / `connect-src` allow `tiles.openseamap.org` |
| Mapbox style tiles | `simulation/js/app.js` | Optional Greenpeace reference basemap when a valid token is provided | `img-src` / `connect-src` allow `api.mapbox.com` |

Mapbox is optional. The simulation reads `window.TRIDEL_MAPBOX_TOKEN` or `?mapbox_token=...`; otherwise it falls back to public CARTO tiles.

## External Service Integrations

| Service | Where | Purpose | Notes |
| --- | --- | --- | --- |
| FormSubmit | `assets/js/pages/contact.js`, `assets/js/pages/careers.js`, `assets/js/settings-loader.js` | Contact and careers form delivery | Uses AJAX endpoint conversion in `settings-loader.js`; `_headers` allows `form-action` and `connect-src` for `formsubmit.co` and `www.formsubmit.co` |
| GitHub Contents API | `server.js`, `assets/js/admin.js`, `assets/js/admin-github.js`, `assets/js/admin-publish.js` | Load/save content files from admin UI | Can run server-managed via Express env vars or browser-managed via admin settings |
| LinkedIn embeds | `assets/js/news-loader.js`, `assets/js/news-data.js`, `admin.html` | News/articles feed embeds and admin preview | `_headers` allows LinkedIn in `frame-src`; embed URLs are normalized before rendering |
| Netlify Deploy Preview Drawer | Netlify deploy previews | Preview feedback UI | `_headers` allows `https://app.netlify.com` in `frame-src` |
| Netlify Edge Function | `netlify/edge-functions/block-bots.ts` | Blocks common bots, crawlers, AI fetchers, social preview fetchers, command-line fetchers, and Netlify-classified non-browser agents | `/robots.txt` is intentionally allowed through |

## Backend Dependencies

| Dependency | Declared version | Locked version | Where | Purpose |
| --- | --- | --- | --- | --- |
| Express | `^4.18.2` | 4.22.1 | `server.js`, `package.json`, `package-lock.json` | Static file serving, admin API, auth, GitHub proxy, metrics endpoints |
| CORS | `^2.8.5` | 2.8.6 | `server.js`, `package.json`, `package-lock.json` | Origin allowlist for API requests |
| Node native `fs` | Built in | Built in | `server.js` | Read/write repo files and local data |
| Node native `path` | Built in | Built in | `server.js` | Filesystem path handling |
| Node native `crypto` | Built in | Built in | `server.js` | Development password generation, scrypt password hashes, timing-safe comparisons, session tokens |

The backend does not currently use a database, ORM, queue, build tool, bundler, or transpiler.

## Browser Platform APIs

| API | Where | Purpose |
| --- | --- | --- |
| Fetch API | Public site, admin, simulation | FormSubmit AJAX, GitHub API calls, metrics posts, JSON/data loading |
| FormData | `assets/js/settings-loader.js` | AJAX form submission to FormSubmit |
| Web Crypto API | `assets/js/admin-auth.js` | Static fallback SHA-256 admin login check |
| LocalStorage | `assets/js/theme-toggle.js`, `assets/js/router.js`, `assets/js/admin.js` | Theme preference, visitor ID, admin UI preference |
| SessionStorage | `assets/js/router.js`, `assets/js/admin-auth.js`, `assets/js/admin-github.js`, product/service loaders | Session IDs, admin token, GitHub config, list scroll state |
| Canvas 2D | `assets/js/bg-animation*.js`, `assets/js/admin-form-rows.js`, `simulation/js/app.js` | Hero animation, client-side image compression, current/tracer/drifter overlays, charts |
| Web Worker | `simulation/js/worker.js`, `simulation/js/app.js` | Off-main-thread ensemble simulation |
| Service Worker and Cache API | `simulation/sw.js` | Cache simulation forcing JSON and chunk files |
| History/hash routing APIs | `assets/js/router.js` | SPA route handling |
| ResizeObserver | Lenis runtime | Smooth-scroll dimension tracking |

## Simulation-Specific Modules

| File | Role |
| --- | --- |
| `simulation/js/app.js` | Main map, UI, animation loop, rendering, playback, analytics, service-worker registration |
| `simulation/js/field.js` | Loads and serves gridded current/wind fields and chunked forcing data |
| `simulation/js/drift.js` | Particle/drifter movement logic |
| `simulation/js/weathering.js` | Oil/weathering behavior used by the model |
| `simulation/js/worker.js` | Worker wrapper for ensemble runs |
| `simulation/js/state.js` | State constants/helpers |
| `simulation/sw.js` | Cache strategy for forcing data |
| `simulation/data/currents.json` | Manifest/primary current data |
| `simulation/data/chunks/*.json` | Chunked forcing data |

## Admin-Specific Modules

| File | Role |
| --- | --- |
| `assets/js/admin.js` | Main admin shell logic, data editing, render orchestration |
| `assets/js/admin-auth.js` | Login overlay, Express login attempt, static fallback hash check |
| `assets/js/admin-github.js` | GitHub configuration, LinkedIn URL normalization, admin GitHub helpers |
| `assets/js/admin-publish.js` | Publish/save flow to Express or GitHub Contents API |
| `assets/js/admin-form-rows.js` | Dynamic form row builders and client-side image compression |
| `assets/js/admin-ui.js` | Shared admin UI helpers |
| `assets/vendor/sortable/Sortable.min.js` | Drag-and-drop ordering engine |

## Public Site Modules

| File/folder | Role |
| --- | --- |
| `assets/js/router.js` | Hash router, metrics events, route lifecycle |
| `assets/js/layout.js` | Header/footer rendering |
| `assets/js/components.js` | Reusable UI fragments |
| `assets/js/pages/*.js` | Route-level page renderers |
| `assets/js/*-data.js` | Flat-file content source |
| `assets/js/*-loader.js` | Section and data renderers |
| `assets/js/theme-toggle.js` | Theme setup and toggle persistence |
| `assets/js/smooth-scroll.js` | Lenis initialization |
| `assets/js/bg-animation*.js` | Canvas hero/page-header animation |

## Security and Deployment Technologies

| Technology | Where | Purpose |
| --- | --- | --- |
| Content Security Policy | `_headers`, `server.js`, `web.config` | Restricts scripts, styles, images, frames, forms, workers, and API connections |
| `X-Robots-Tag` | `_headers`, Netlify Edge Function | Prevents indexing/snippets/archives where honored |
| `robots.txt` | `robots.txt` | Tells compliant crawlers not to crawl the site |
| Netlify Edge bot blocker | `netlify/edge-functions/block-bots.ts` | Returns `403` for declared/known bot and fetcher traffic |
| Static deny rules | `_redirects` | Blocks sensitive root files and extension paths on static hosting |
| Express deny/404 rules | `server.js` | Blocks sensitive paths and unknown extension paths in server mode |
| HSTS | `_headers`, `server.js`, `web.config` | Requires HTTPS on supporting browsers |
| CORS allowlist | `server.js` | Restricts admin/API origins |
| Login rate limit | `server.js` | Limits failed login attempts per IP |
| Scrypt password hashing | `server.js` | Server-side admin password hash format |

## CSP Maintenance Checklist

When adding a new plugin or external service, update the relevant CSP directives in `_headers`, `server.js`, and `web.config`.

Use this mapping:

- External JavaScript: `script-src`
- External CSS: `style-src`
- External fonts: `font-src`
- Images and map tiles: `img-src`
- API calls, AJAX forms, JSON fetches, map tile fetches when required: `connect-src`
- Iframes and embeds: `frame-src`
- Form POST targets: `form-action`
- Web workers or blob workers: `worker-src`

Also update this document when the dependency is meant to stay.

## Replacement Notes

- Prefer vendored plugins for core UI behavior when the project should work without external CDN availability.
- Prefer pinned CDN versions when a CDN is necessary.
- Keep public forms on FormSubmit only if the no-backend static deployment path is still required.
- Keep GitHub tokens out of tracked files; use Express environment variables for server-managed publishing.
- If strict bot blocking must be stronger than user-agent/category checks, add private deployment access, a WAF/challenge layer, or authenticated routes.

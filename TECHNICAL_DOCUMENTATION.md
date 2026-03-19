# Tridel Technical Documentation

## 1. Purpose

This document is the technical handoff for the Tridel website codebase.

It covers:

- the technology stack
- how the site is structured
- how to run it locally
- how to deploy it in static and server-backed modes
- which environment variables the server expects
- how admin authentication works

This repository does not use a database or build pipeline. The public site is served from versioned HTML, CSS, JavaScript, image, and font files in the repo.

## 2. Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Flat-file content stored in `assets/js/*-data.js`

### Backend

- Node.js
- Express 4
- CORS
- Native Node modules: `fs`, `path`, `crypto`

### Frontend Libraries

- Lenis for smooth scrolling
- Leaflet for maps
- SortableJS for admin drag-and-drop ordering
- Font Awesome for icons

### External Services

- GitHub Contents API for admin publish/sync workflows
- FormSubmit for form delivery
- LinkedIn embeds for the news section

## 3. Runtime Model

The project supports two operating modes.

### A. Static Site Mode

Use this when you only want to host the public site as static files.

Examples:

- GitHub Pages
- Netlify
- any basic static web host

In this mode:

- the public website works
- SPA routing depends on the host serving `index.html` for extensionless routes
- `_headers`, `_redirects`, and `404.html` are part of the static-host setup
- there is no live Express API
- admin login can only use the browser-side fallback logic in `assets/js/admin-auth.js`

### B. Express Server Mode

Use this when you want the admin panel to use protected API routes and server-side secrets.

In this mode:

- `server.js` serves the site and admin panel
- `/api/login` and related admin API routes are available
- local file saving is available
- server-managed GitHub publishing is available
- CORS and response security headers are applied by Express

This is the recommended mode for any real admin workflow.

## 4. Repository Layout

### Core Files

- `index.html`: public site shell
- `admin.html`: admin panel shell
- `server.js`: Express server and admin API
- `404.html`: static-host 404 page
- `_headers`: static-host response headers
- `_redirects`: static-host rewrite and deny rules

### Main Asset Folders

- `assets/css/`: public site and admin styles
- `assets/fonts/`: locally hosted fonts
- `assets/images/`: logos, page images, product/service assets
- `assets/js/`: page logic, loaders, components, and data files
- `assets/vendor/`: vendored third-party runtime files

### Content Source Files

The project uses JavaScript data files instead of a database.

Examples:

- `assets/js/products-data.js`
- `assets/js/services-data.js`
- `assets/js/team-data.js`
- `assets/js/success-stories-data.js`
- `assets/js/news-data.js`
- `assets/js/contact-page-data.js`
- `assets/js/layout-data.js`
- `assets/js/settings-data.js`

## 5. Public Site Architecture

The public website is a vanilla JavaScript single-page application.

Key parts:

- `index.html` bootstraps the app
- `assets/js/router.js` handles route changes
- `assets/js/layout.js` renders the shared header/footer
- `assets/js/components.js` provides reusable UI fragments
- `assets/js/pages/*.js` renders page-level routes
- `assets/js/*-loader.js` files render section-specific content

Primary route families:

- `/`
- `/about`
- `/products`
- `/products/detail`
- `/services`
- `/services/detail`
- `/success-stories`
- `/contact`
- `/careers`

## 6. Admin Architecture

The admin panel is loaded from `admin.html`.

Key files:

- `assets/js/admin.js`: main admin logic
- `assets/js/admin-auth.js`: login gate and browser fallback auth logic
- `assets/css/admin.css`: admin styling

The admin supports:

- content editing
- ordering
- local save flows through the Express server
- GitHub-backed publish flows

## 7. Local Development

### Prerequisites

- Node.js 18 or newer recommended
- npm

### Install

```bash
npm ci
```

### Start

```bash
npm start
```

The server listens on port `3000`.

Local URLs:

- Site: `http://127.0.0.1:3000/`
- Admin: `http://127.0.0.1:3000/admin.html`

## 8. Environment Configuration

Before the server reads defaults, it loads:

- `.env`
- `.env.local`

These files are intended for local or server-specific configuration and should not be committed with secrets.

### Supported Environment Variables

#### `TRIDEL_ADMIN_PASSWORD_HASH`

- Preferred admin credential setting
- Must be in the format `scrypt$<salt>$<derivedKey>`
- Used by the Express login API

#### `TRIDEL_ADMIN_PASSWORD`

- Plaintext compatibility option
- Used only when `TRIDEL_ADMIN_PASSWORD_HASH` is not set
- Not recommended for persistent environments

#### `TRIDEL_GITHUB_OWNER`

- GitHub owner or organization used by the admin publish flow

#### `TRIDEL_GITHUB_REPO`

- GitHub repository name used by the admin publish flow

#### `TRIDEL_GITHUB_BRANCH`

- Target branch for GitHub admin saves
- Defaults to `main`

#### `TRIDEL_GITHUB_TOKEN`

- GitHub token used for server-managed read/write operations
- Required only if the admin should publish to GitHub through the backend

#### `TRIDEL_ALLOWED_ORIGINS`

- Optional comma-separated list of additional allowed origins for CORS

### Production Requirement

In production, the server expects one of these to be configured:

- `TRIDEL_ADMIN_PASSWORD_HASH`
- `TRIDEL_ADMIN_PASSWORD`

Preferred production choice:

- `TRIDEL_ADMIN_PASSWORD_HASH`

If neither is set in production, `server.js` exits.

## 9. Admin Authentication Model

### Server-Backed Login

If the site is running through `server.js`, admin login should happen through `/api/login`.

This is the stronger option because:

- the secret stays on the server
- rate limiting is applied
- session state is created after server validation

### Static Fallback Login

`assets/js/admin-auth.js` currently contains a public SHA-256 fallback hash for static hosting.

This exists so the admin page can still unlock on static-only hosts such as GitHub Pages.

Important:

- the fallback hash is shipped to every browser
- it is weaker than server-side auth
- it can be brute-forced offline
- it should be treated as a convenience path, not the preferred security model

### Plain-Language Summary

- If the Express server is available, it should handle login.
- If the site is hosted as static files only, the browser can fall back to the public hash in `assets/js/admin-auth.js`.
- For secure deployment, use the Express server with `TRIDEL_ADMIN_PASSWORD_HASH`.

## 10. Deployment Procedures

### Option A: Static Hosting Deployment

Use this for brochure-site hosting or GitHub Pages style deployment.

#### Steps

1. Publish the repository files to the static host.
2. Make sure `_headers`, `_redirects`, and `404.html` are included if the host supports them.
3. Verify that SPA routes resolve correctly.
4. Verify that blocked extension paths and protected root files are not being exposed by the host.

#### Notes

- The public site works without Node.
- Backend API routes do not exist in this mode.
- Admin access depends on the public frontend fallback, not the Express API.

### Option B: Express Deployment

Use this for protected admin access and server-managed GitHub publishing.

#### Steps

1. Clone the repository to the target server.
2. Run `npm ci`.
3. Set environment variables.
4. Start `server.js`.
5. Put the app behind HTTPS.
6. If using a proxy, forward traffic to port `3000`.

#### PowerShell Example

```powershell
$env:TRIDEL_ADMIN_PASSWORD_HASH="replace-with-scrypt-hash"
$env:TRIDEL_GITHUB_OWNER="EnochMacwan"
$env:TRIDEL_GITHUB_REPO="Tridel"
$env:TRIDEL_GITHUB_BRANCH="main"
$env:TRIDEL_GITHUB_TOKEN="github_pat_xxxxxxxxx"
$env:TRIDEL_ALLOWED_ORIGINS="https://your-admin-domain.example"
node server.js
```

#### Bash Example

```bash
export TRIDEL_ADMIN_PASSWORD_HASH="replace-with-scrypt-hash"
export TRIDEL_GITHUB_OWNER="EnochMacwan"
export TRIDEL_GITHUB_REPO="Tridel"
export TRIDEL_GITHUB_BRANCH="main"
export TRIDEL_GITHUB_TOKEN="github_pat_xxxxxxxxx"
export TRIDEL_ALLOWED_ORIGINS="https://your-admin-domain.example"
node server.js
```

#### Recommended Process Management

Use one of:

- `systemd`
- `pm2`
- Windows service wrapper
- container/process supervisor

## 11. GitHub Integration

The admin supports two GitHub patterns.

### Browser-Managed Mode

- the user supplies GitHub settings in the admin UI
- useful on static hosting
- secrets are not protected by the server

### Server-Managed Mode

- GitHub owner, repo, branch, and token are set via environment variables
- the admin uses backend proxy endpoints
- preferred when Express is running

### Token Guidance

Use a GitHub Personal Access Token with repository contents read/write permission for the target repo.

Do not:

- commit the token
- store the token in tracked repo files
- place the plaintext token in documentation

## 12. Security Notes

Current code-level protections include:

- `x-powered-by` disabled
- CSP and other response headers in Express and static host config
- login rate limiting
- request sanitization for admin payloads
- deny rules for sensitive root files
- 404 handling for blocked extension paths

Security limitations to be aware of:

- static-host admin fallback is intentionally weaker because the hash is public
- any real secure admin deployment should use the Express server

## 13. Operational Notes

- The project has no database migration process because content lives in versioned JS files.
- There is no frontend build step.
- Changes to content may require updating both data files and loader/rendering logic if schemas change.
- Large image payloads increase repo size; some data files contain inline base64 assets.

## 14. What Not to Store in the Repo

Do not store these as committed plaintext values:

- admin passwords
- GitHub tokens
- server-specific `.env` secrets

Use environment variables on the deployment target instead.

## 15. Quick Handoff Checklist

For a static public deployment:

1. Publish the repo contents.
2. Confirm SPA routing works.
3. Confirm `_headers`, `_redirects`, and `404.html` are live where supported.

For a secure admin deployment:

1. Run the site through `server.js`.
2. Set `TRIDEL_ADMIN_PASSWORD_HASH`.
3. Set GitHub environment variables if publish-to-repo is required.
4. Serve the app over HTTPS.
5. Verify `/api/login` and admin save routes work before handoff.

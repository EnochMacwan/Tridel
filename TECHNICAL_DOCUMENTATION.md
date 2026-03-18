# Tridel Technical Documentation

## Overview

This repository contains the Tridel website frontend, the admin panel, and a lightweight Express server used for authenticated content editing and optional GitHub-backed publishing.

There is no build step. The site is served directly from versioned HTML, CSS, JS, image, font, and vendor files.

## Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Local flat-file content data stored in `assets/js/*-data.js`

### Frontend Libraries

- [Lenis](./assets/vendor/lenis/lenis.min.js) for smooth scrolling
- [Leaflet](./assets/vendor/leaflet/leaflet.js) for maps
- [SortableJS](./assets/vendor/sortable/Sortable.min.js) for drag-and-drop ordering in the admin panel
- Font Awesome via CDN with SRI for iconography

### Backend

- Node.js
- Express
- CORS
- Native Node `fs`, `path`, and `crypto`

### External Services

- GitHub Contents API for admin-driven repository sync
- FormSubmit for contact/careers form delivery
- LinkedIn embeds for the news/feed section

## Architecture

### Runtime Model

The project runs in one of two modes:

1. Static frontend mode
   - Serves the website without Node.
   - Appropriate for brochure-site hosting.
   - `_headers` and `_redirects` support static hosts such as Netlify-style deployments.
   - Admin GitHub publishing can still work with a browser-entered GitHub token, but server-managed secrets are not available in this mode.

2. Full Express mode
   - Runs `server.js`.
   - Enables admin authentication, protected API routes, local file writes, and server-managed GitHub sync.
   - This is the recommended mode for internal admin use.

### Content Model

- Content is stored as JavaScript declarations, not a database.
- Main content files live under `assets/js/`.
- Examples:
  - `assets/js/products-data.js`
  - `assets/js/services-data.js`
  - `assets/js/team-data.js`
  - `assets/js/contact-page-data.js`
  - `assets/js/layout-data.js`
  - `assets/js/settings-data.js`

### Main Entry Points

- `index.html`: public site shell
- `admin.html`: admin panel
- `server.js`: Express server and authenticated admin API

## Repository Structure

- `assets/css/`: frontend and admin styles
- `assets/fonts/`: local Inter and Outfit font files
- `assets/images/`: image assets
- `assets/js/`: app logic, loaders, page modules, and data files
- `assets/vendor/`: vendored runtime dependencies
- `_headers`: static-host response headers
- `_redirects`: static-host SPA routing rules
- `404.html`: static-host 404 page
- `crossdomain.xml`: deny policy for legacy cross-domain policy requests
- `sitemap.xml`: sitemap

## Local Development

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm ci
```

### Start the Server

```bash
npm start
```

The Express server listens on port `3000`.

### Local URLs

- Website: `http://127.0.0.1:3000/`
- Admin: `http://127.0.0.1:3000/admin.html`

## Deployment Procedures

### 1. Express Deployment

Use this mode if the admin panel should:

- require authenticated access,
- save directly to local files, or
- use a server-managed GitHub token.

### Deployment Steps

1. Clone the repository to the server.
2. Install dependencies with `npm ci`.
3. Set the required environment variables.
4. Start `server.js` under a process manager or service manager.
5. Put the app behind HTTPS.
6. If using a reverse proxy, forward traffic to port `3000`.

### PowerShell Example

```powershell
$env:TRIDEL_ADMIN_PASSWORD="replace-with-strong-password"
$env:TRIDEL_GITHUB_OWNER="EnochMacwan"
$env:TRIDEL_GITHUB_REPO="Tridel"
$env:TRIDEL_GITHUB_BRANCH="main"
$env:TRIDEL_GITHUB_TOKEN="github_pat_xxxxxxxxx"
$env:TRIDEL_ALLOWED_ORIGINS="https://your-admin-domain.example"
npm ci
node server.js
```

### Bash Example

```bash
export TRIDEL_ADMIN_PASSWORD="replace-with-strong-password"
export TRIDEL_GITHUB_OWNER="EnochMacwan"
export TRIDEL_GITHUB_REPO="Tridel"
export TRIDEL_GITHUB_BRANCH="main"
export TRIDEL_GITHUB_TOKEN="github_pat_xxxxxxxxx"
export TRIDEL_ALLOWED_ORIGINS="https://your-admin-domain.example"
npm ci
node server.js
```

### Recommended Process Management

Run the server under a supervisor such as:

- `systemd`
- `pm2`
- Windows Task Scheduler / NSSM / Service wrapper

### 2. Static Hosting Deployment

Use this mode if only the public site is being hosted and no Express process will run.

### Deployment Steps

1. Upload the repository contents to the static host.
2. Ensure `_headers` and `_redirects` are deployed unchanged.
3. Verify the host serves:
   - `_headers`
   - `_redirects`
   - `404.html`
4. Validate that unknown file-extension routes return `404` and extensionless SPA routes resolve to `index.html`.

### Static Hosting Notes

- The public site will work without Node.
- The admin page can still open, but server-backed authentication and server-managed GitHub secrets will not be available.
- In static-only mode, the admin falls back to client-side login behavior and browser-based GitHub token entry.

## Required Passphrases and Environment Variables

### Required in Production

### `TRIDEL_ADMIN_PASSWORD`

- Purpose: Admin login password for the Express API.
- Required for production Express deployment.
- If missing in production, `server.js` exits.

### Optional but Recommended

### `TRIDEL_GITHUB_OWNER`

- GitHub owner or organization name used by server-managed GitHub sync.

### `TRIDEL_GITHUB_REPO`

- GitHub repository name used by server-managed GitHub sync.

### `TRIDEL_GITHUB_BRANCH`

- Branch that admin GitHub saves should target.
- Defaults to `main` if not set.

### `TRIDEL_GITHUB_TOKEN`

- GitHub Personal Access Token used by the server to read/write repo content through the GitHub API.
- Required only if you want server-managed GitHub publishing from the admin panel.

### `TRIDEL_ALLOWED_ORIGINS`

- Optional comma-separated list of additional allowed CORS origins.
- Useful when the admin is served behind a different HTTPS domain.

## Important Authentication Note

There is a development/offline fallback password path in `assets/js/admin-auth.js`.

- Fallback password value: `tridel2026`
- Purpose: GitHub Pages/offline fallback when the server is unavailable
- Security implication: this fallback is not acceptable for production security

If the project will be deployed as a static admin without the Express server, the fallback hash in `assets/js/admin-auth.js` must be reviewed and rotated as part of the security process.

## GitHub Token Requirements

The admin panel expects a GitHub Personal Access Token, not an SSH key.

Recommended token characteristics:

- Fine-grained token preferred
- Repository access limited to the target repo
- Repository contents read/write permission

Do not commit the token, store it in the repository, or send it in chat.

## Admin Panel GitHub Modes

### Browser-Managed GitHub Token

- Token is entered in the GitHub Settings modal.
- Intended for static hosting or ad hoc use.
- Stored in browser session storage for the current session.

### Server-Managed GitHub Token

- The Express server reads GitHub credentials from environment variables.
- `admin.html` detects this automatically.
- The token is not exposed in the admin form for manual entry.
- This is the recommended operational mode.

## Security and Deployment Notes

- The Express server sets CSP, anti-clickjacking, `nosniff`, referrer policy, permissions policy, COOP, CORP, and HSTS headers.
- The static hosting equivalents are defined in `_headers`.
- `_redirects` prevents unknown file-extension paths from being rewritten into the SPA shell.
- `crossdomain.xml` is intentionally present and explicitly denies legacy cross-domain policy access.
- `sitemap.xml` is intentionally present.

## Operational Caveats

- Port is hard-coded to `3000` in `server.js`.
- Content edits modify JS data files directly.
- The app has no database migrations because there is no database.
- The README setup instructions in older revisions may not reflect the current secured admin workflow; this document should be treated as the authoritative handoff document.

## Recommended Server Handover Checklist

1. Install Node.js and npm.
2. Clone the repository.
3. Run `npm ci`.
4. Set `TRIDEL_ADMIN_PASSWORD`.
5. If GitHub publishing is required, set:
   - `TRIDEL_GITHUB_OWNER`
   - `TRIDEL_GITHUB_REPO`
   - `TRIDEL_GITHUB_BRANCH`
   - `TRIDEL_GITHUB_TOKEN`
6. Configure HTTPS.
7. Configure reverse proxy/CORS origins if needed.
8. Start `server.js` under a supervisor.
9. Verify:
   - `/`
   - `/admin.html`
   - `/api/check-auth`
   - GitHub sync from the admin panel

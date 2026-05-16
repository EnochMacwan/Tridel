# Hormuz Simulation — Detachable Module

This folder is a self-contained browser application that simulates oil-spill
and drifter trajectories at the Strait of Hormuz. It is embedded inside the
Tridel website but has **no runtime dependency on the rest of the site**.

## Detachable

You can delete this entire `simulation/` folder and the rest of the Tridel
site will continue to work. The only places that reference it are:

- `assets/js/layout-data.js` — the nav-bar entry that links here
- `assets/css/styles.css` — the `.nav-cta-hormuz` red-pill style

Remove those two and the module is gone with no leftover traces.

## What's inside

```
simulation/
├── index.html       # entry point — open this in a browser
├── css/             # styles + UI cleanup overrides
├── js/              # field loader, drift physics, oil weathering, app
│                    # state, web worker, service worker
├── data/            # forcing data
│   ├── currents.json     # manifest
│   └── chunks/           # 11 × ~19 MB JSON chunks
├── sw.js            # service worker (chunk cache, manifest network-first)
└── assets/          # logos
```

## How it runs

`index.html` boots `js/app.js`. App boot loads `data/currents.json`,
prefetches chunks on demand via the service worker, and renders animated
currents + a particle ensemble on a Leaflet basemap. The heavy ensemble
simulation runs in a Web Worker (`js/worker.js`) so the main thread stays
responsive.

## Serving notes

- Must be served over HTTP (the service worker refuses `file://`).
- Under the Tridel site it lives at `<host>/simulation/`. Inside that path
  every relative URL works as-is.
- Service worker scope is `/simulation/`, so chunk caching does not leak
  into the parent Tridel site.

## Data refresh

The forcing data was generated from CMEMS / NOAA RTOFS + Open-Meteo wind.
To refresh, see the Python pipeline at the source Hormuz repo:
`scripts/fetch_data.py`, `scripts/fetch_rtofs_data.py`,
`scripts/prepare_data.py`, `scripts/forcing_chunks.py`.
Those scripts produce a fresh `data/currents.json` + `data/chunks/`
that drops in here directly.

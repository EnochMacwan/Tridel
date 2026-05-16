/* field.js — load forcing data and provide bilinear + temporal sampling
 * ------------------------------------------------------------------
 *   Field.load()            -> fetch data/currents.json
 *   Field.sampleCurrent(lon,lat,tSec)  -> {u,v} m/s   or null (land/OOB)
 *   Field.sampleWind(lon,lat,tSec)     -> {u,v} m/s   or null
 *   Field.t0Unix                      -> start epoch (sec)
 *   Field.dtSec                       -> grid time step (sec)
 *   Field.times[]                     -> ISO strings (for UI)
 *   Field.grid                        -> {lats, lons, nLat, nLon, dlat, dlon}
 */
/* Additional maintainer notes:
 * - This module is the only place that knows the exact JSON forcing schema.
 * - Other files should treat it as a tiny query engine over the data cube.
 * - Null is intentional and means land, missing data, or out-of-bounds.
 * - The interpolation logic is what makes the browser animation feel smooth.
 */
globalThis.Field = (() => {
  /* Exported singleton that caches the forcing payload after load() resolves. */
  const F = {
    loaded:false, meta:null, times:[],
    grid:{lats:null, lons:null, nLat:0, nLon:0, dlat:0, dlon:0,
          latMin:0, latMax:0, lonMin:0, lonMax:0,
          latAsc:true, lonAsc:true},
    u:null, v:null, uw:null, vw:null,
    hasWind:false,
    chunked:false, chunks:[], manifestUrl:null,
    t0Unix:0, dtSec:3600,
    /* Land mask snapshot taken from t=0 at load time. isLand() reads this
       instead of F.u[0], so evicting chunk 0 during playback can't trigger
       a runtime crash. */
    landMask:null,
  };

  F.load = async function(url = 'data/currents.json'){
    /* Detect unsupported file:// launches before fetch() emits a more opaque
       browser-level cross-origin error. */
    if (globalThis.location.protocol === 'file:'){
      throw new Error(
        'This app cannot load data over file://. Start a local server and open http://localhost:8000 instead.'
      );
    }

    const manifestUrl = new URL(url, globalThis.location.href).toString();
    let r;
    try {
      /* Network failures land here before an HTTP status even exists. */
      r = await fetch(manifestUrl);
    } catch (err) {
      throw new Error(
        `Could not reach ${url}. Start a local server and open the site over http://localhost:8000.`
      );
    }

    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    const d = await r.json();
    /* Normalize the payload once so animation/rendering code can sample it
       directly without repeated JSON parsing or schema handling. */
    F.meta  = d.meta;
    F.times = d.times;
    F.chunked = Array.isArray(d.chunks) && d.chunks.length > 0;
    F.chunks = F.chunked ? d.chunks.map((chunk, index) => ({...chunk, index, promise:null, loaded:false})) : [];
    F.manifestUrl = r.url || manifestUrl;
    F.u = F.chunked ? new Array(F.times.length) : d.u;
    F.v = F.chunked ? new Array(F.times.length) : d.v;
    F.uw = F.chunked ? new Array(F.times.length) : d.uw;   // may be null (wind not yet integrated)
    F.vw = F.chunked ? new Array(F.times.length) : d.vw;
    F.hasWind = F.chunked ? Boolean(d.meta?.has_wind) : (Array.isArray(F.uw) && Array.isArray(F.vw));
    F.grid.lats = d.lats; F.grid.lons = d.lons;
    F.grid.nLat = d.lats.length; F.grid.nLon = d.lons.length;
    /* Detect descending axes (common in NetCDF where lats run north→south)
       and normalize so index math always uses absolute step magnitudes. */
    F.grid.latAsc = F.grid.nLat < 2 || d.lats[F.grid.nLat - 1] >= d.lats[0];
    F.grid.lonAsc = F.grid.nLon < 2 || d.lons[F.grid.nLon - 1] >= d.lons[0];
    F.grid.dlat = Math.abs(d.meta.dlat) * (F.grid.latAsc ? 1 : -1);
    F.grid.dlon = Math.abs(d.meta.dlon) * (F.grid.lonAsc ? 1 : -1);
    F.grid.latMin = Math.min(d.lats[0], d.lats[F.grid.nLat - 1]);
    F.grid.latMax = Math.max(d.lats[0], d.lats[F.grid.nLat - 1]);
    F.grid.lonMin = Math.min(d.lons[0], d.lons[F.grid.nLon - 1]);
    F.grid.lonMax = Math.max(d.lons[0], d.lons[F.grid.nLon - 1]);
    F.t0Unix = Date.parse(d.times[0].replace(' ','T') + 'Z') / 1000;
    F.dtSec = d.meta.time_step_sec;
    if (F.chunked) {
      await F.ensureTimeRange(F.t0Unix, F.t0Unix + F.dtSec);
    }
    /* Snapshot the land mask from t=0 (1 = land/null, 0 = water). isLand
       reads this instead of F.u[0] so chunk eviction can't strand it. */
    F.landMask = _buildLandMask();
    F.loaded = true;
    return F;
  };

  function _buildLandMask(){
    const g = F.grid;
    if (!F.u || !F.u[0] || g.nLat === 0 || g.nLon === 0) return null;
    const mask = new Uint8Array(g.nLat * g.nLon);
    for (let j = 0; j < g.nLat; j += 1){
      const row = F.u[0][j];
      if (!row){ for (let i = 0; i < g.nLon; i += 1) mask[j * g.nLon + i] = 1; continue; }
      for (let i = 0; i < g.nLon; i += 1){
        mask[j * g.nLon + i] = (row[i] === null) ? 1 : 0;
      }
    }
    return mask;
  }

  function _chunkForIndex(ti){
    return F.chunks.find((chunk) => ti >= chunk.start_index && ti < chunk.end_index);
  }

  async function _loadChunk(chunk){
    if (!F.chunked || !chunk) return;
    if (chunk.loaded) return;
    if (chunk.promise) return chunk.promise;
    chunk.promise = (async () => {
      const chunkUrl = new URL(chunk.href, F.manifestUrl).toString();
      const response = await fetch(chunkUrl);
      if (!response.ok) throw new Error(`Failed to load ${chunk.href}: ${response.status}`);
      const data = await response.json();
      const start = Number(data.start_index ?? chunk.start_index);
      const chunkHasWind = Array.isArray(data.uw) && Array.isArray(data.vw);
      if (F.hasWind && !chunkHasWind && !chunk._warnedNoWind) {
        chunk._warnedNoWind = true;
        console.warn(`[field] chunk ${chunk.href} is missing uw/vw despite manifest meta.has_wind=true`);
      }
      for (let local = 0; local < data.times.length; local += 1) {
        const ti = start + local;
        F.u[ti] = data.u[local];
        F.v[ti] = data.v[local];
        if (F.hasWind && chunkHasWind) {
          F.uw[ti] = data.uw[local];
          F.vw[ti] = data.vw[local];
        }
      }
      chunk.loaded = true;
    })();
    return chunk.promise;
  }

  F.isTimeLoaded = function(ti){
    if (!F.chunked) return true;
    const index = Math.max(0, Math.min(F.times.length - 1, Math.floor(ti)));
    return Boolean(F.u[index] && F.v[index]);
  };

  F.ensureTimeIndex = async function(ti){
    if (!F.chunked) return;
    const index = Math.max(0, Math.min(F.times.length - 1, Math.floor(ti)));
    if (F.isTimeLoaded(index)) return;
    await _loadChunk(_chunkForIndex(index));
  };

  F.ensureTimeRange = async function(startSec, endSec){
    if (!F.chunked) return;
    const startIdx = Math.max(0, Math.min(F.times.length - 1, Math.floor((startSec - F.t0Unix) / F.dtSec)));
    const endIdx = Math.max(0, Math.min(F.times.length - 1, Math.ceil((endSec - F.t0Unix) / F.dtSec)));
    const loads = F.chunks
      .filter((chunk) => chunk.end_index > startIdx && chunk.start_index <= endIdx)
      .map((chunk) => _loadChunk(chunk));
    await Promise.all(loads);
  };

  /* Predictive prefetch: once we're in the last 25% of the current chunk during
     playback, kick off a background fetch for the next one so the boundary
     crossing is seamless. Cheap to call every frame — early returns dominate. */
  F.prefetchNext = function(ti){
    if (!F.chunked) return;
    const idx = Math.max(0, Math.min(F.times.length - 1, Math.floor(ti)));
    const current = _chunkForIndex(idx);
    if (!current) return;
    const len = current.end_index - current.start_index;
    const pos = idx - current.start_index;
    if (len <= 0 || pos / len < 0.75) return;
    const next = F.chunks[current.index + 1];
    if (next && !next.loaded && !next.promise) {
      _loadChunk(next).catch(() => {});
    }
  };

  /* Sequential, low-priority background warm-up. Fires one chunk at a time
     so we don't burn 10× the memory by holding every chunk's float arrays
     resident at once. The service worker caches the responses, so on the
     NEXT scrub the chunk is fetched from disk and decoded just-in-time —
     no permanent RAM cost. */
  F.prefetchAll = async function(){
    if (!F.chunked) return;
    for (const chunk of F.chunks) {
      if (chunk.loaded || chunk.promise) continue;
      try {
        await _loadChunk(chunk);
      } catch (err) {
        /* Network blip — skip and let on-demand loading retry later. */
      }
      /* Yield so the main thread can paint between chunks. */
      await new Promise((res) => setTimeout(res, 50));
    }
  };

  /* Evict chunks far from the current playback time to keep the heap small.
     Keeps a hot window of [current - keepBack, current + keepAhead] chunks
     resident; everything else is freed (the on-disk service-worker cache
     still has the JSON, so loading back is fast). */
  F.evictDistantChunks = function(currentTi, keepBack = 2, keepAhead = 2){
    if (!F.chunked) return 0;
    const idx = Math.max(0, Math.min(F.times.length - 1, Math.floor(currentTi)));
    const current = _chunkForIndex(idx);
    if (!current) return 0;
    let freed = 0;
    for (const chunk of F.chunks) {
      if (!chunk.loaded) continue;
      const dist = chunk.index - current.index;
      if (dist >= -keepBack && dist <= keepAhead) continue;
      /* Null out the float-array slots this chunk owns and let GC reclaim. */
      for (let ti = chunk.start_index; ti < chunk.end_index; ti += 1) {
        F.u[ti] = null;
        F.v[ti] = null;
        if (F.uw) F.uw[ti] = null;
        if (F.vw) F.vw[ti] = null;
      }
      chunk.loaded = false;
      chunk.promise = null;
      freed += 1;
    }
    return freed;
  };

  F.slice = function(key, ti){
    const arr = F[key];
    if (!arr) return null;
    const index = Math.max(0, Math.min(F.times.length - 1, Math.floor(ti)));
    if (!arr[index] && F.chunked) {
      F.ensureTimeIndex(index).catch(() => {});
    }
    return arr[index] || null;
  };

  /* ─── bilinear space + linear time on a 3-D (t,lat,lon) grid ─────── */
  function _sample(arr, lon, lat, tSec){
    /* Core 3-D interpolator for arrays stored as [time][lat][lon]. */
    if (!arr) return null;
    const g = F.grid;
    /* Position in continuous index space, respecting axis direction so a
       NetCDF-style north→south lat array still indexes correctly. */
    const iRaw = g.lonAsc
      ? (lon - g.lonMin) / Math.abs(g.dlon)
      : (g.lonMax - lon) / Math.abs(g.dlon);
    const jRaw = g.latAsc
      ? (lat - g.latMin) / Math.abs(g.dlat)
      : (g.latMax - lat) / Math.abs(g.dlat);
    if (iRaw < 0 || iRaw > g.nLon - 1 || jRaw < 0 || jRaw > g.nLat - 1) return null;

    const tf = (tSec - F.t0Unix) / F.dtSec;             // fractional time idx
    const nT = F.times.length;
    if (tf < 0 || tf > nT - 1) return null;
    const t0 = Math.floor(tf);
    const t1 = Math.min(t0 + 1, nT - 1);
    const ft = tf - t0;

    /* Clamp to the last interior cell at the boundary so the trailing row
       and column are not silently un-sampleable. */
    const i0 = Math.min(g.nLon - 2, Math.floor(iRaw));
    const j0 = Math.min(g.nLat - 2, Math.floor(jRaw));
    const fi = iRaw - i0;
    const fj = jRaw - j0;

    const slice0 = arr[t0];
    const slice1 = arr[t1];
    if (!slice0 || !slice1) {
      if (F.chunked) {
        F.ensureTimeIndex(t0).catch(() => {});
        F.ensureTimeIndex(t1).catch(() => {});
      }
      return null;
    }

    function atT(slice){
      /* Bilinear interpolation inside one time slice. Returning null when any
         corner is null prevents accidental blending across coastlines. */
      const r0 = slice[j0];
      const r1 = slice[j0 + 1];
      if (!r0 || !r1) return null;
      const a = r0[i0    ];
      const b = r0[i0 + 1];
      const c = r1[i0    ];
      const d = r1[i0 + 1];
      if (a === null || b === null || c === null || d === null) return null;
      return (1 - fi)*(1 - fj)*a + fi*(1 - fj)*b
           + (1 - fi)*fj      *c + fi*fj      *d;
    }
    const A = atT(slice0), B = atT(slice1);
    if (A === null || B === null) return null;
    return A * (1 - ft) + B * ft;
  }

  F.sampleCurrent = function(lon, lat, tSec){
    /* Vector samples are only valid when both u and v are valid. */
    const u = _sample(F.u, lon, lat, tSec);
    const v = _sample(F.v, lon, lat, tSec);
    if (u === null || v === null) return null;
    return {u, v};
  };

  F.sampleWind = function(lon, lat, tSec){
    /* Wind is optional in this project, so null doubles as "no wind field". */
    if (!F.hasWind || !F.uw || !F.vw) return null;
    const u = _sample(F.uw, lon, lat, tSec);
    const v = _sample(F.vw, lon, lat, tSec);
    if (u === null || v === null) return null;
    return {u, v};
  };

  function _cellIdx(lon, lat){
    const g = F.grid;
    const dLon = Math.abs(g.dlon);
    const dLat = Math.abs(g.dlat);
    if (!dLon || !dLat) return null;
    const i = g.lonAsc
      ? Math.round((lon - g.lonMin) / dLon)
      : Math.round((g.lonMax - lon) / dLon);
    const j = g.latAsc
      ? Math.round((lat - g.latMin) / dLat)
      : Math.round((g.latMax - lat) / dLat);
    if (i < 0 || i >= g.nLon || j < 0 || j >= g.nLat) return null;
    return {i, j};
  }

  /* convenience: is this (lon,lat) on land / OOB at any time? */
  F.isLand = function(lon, lat){
    /* Cheap nearest-cell test used by drifters to decide when to strand.
       Reads the cached landMask (built once at load) rather than F.u[0],
       which can be evicted to free memory during long playbacks. */
    const idx = _cellIdx(lon, lat);
    if (!idx) return true;
    if (F.landMask) return F.landMask[idx.j * F.grid.nLon + idx.i] === 1;
    /* Fallback for the unusual case where the mask wasn't built (e.g. the
       payload was loaded but slice 0 was null). Guard against eviction. */
    const slice = F.u && F.u[0];
    if (!slice || !slice[idx.j]) return true;
    return slice[idx.j][idx.i] === null;
  };

  /* integer grid index for a lon/lat (for click-to-plot cell picking) */
  F.nearestCell = function(lon, lat){
    /* Used by UI actions that want the nearest discrete model cell. */
    const idx = _cellIdx(lon, lat);
    if (!idx) return null;
    return {i: idx.i, j: idx.j, lon: F.grid.lons[idx.i], lat: F.grid.lats[idx.j]};
  };

  return F;
})();

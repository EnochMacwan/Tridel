importScripts('field.js', 'weathering.js', 'drift.js');

/* Track init so runEnsemble can wait for Field.load() to finish even when
   the main thread fires init + runEnsemble back-to-back. Without this the
   simulation samples an empty Field on the first step and every particle
   strands immediately. */
let initPromise = null;

self.onmessage = async (e) => {
  const { action, payload } = e.data;

  if (action === 'init') {
    initPromise = (async () => {
      try {
        await globalThis.Field.load(payload.manifestUrl);
        self.postMessage({ type: 'ready' });
      } catch (err) {
        self.postMessage({ type: 'error', error: err.message });
        throw err;
      }
    })();
    return;
  }

  if (action === 'runEnsemble') {
    const { lon, lat, tSec, params, scenario, steps, dt, startSec, endSec } = payload;

    try {
      // Wait for the init's Field.load() to finish before we try to sample —
      // otherwise the very first Drifter.step finds a half-loaded Field and
      // strands every particle on cycle 0.
      if (initPromise) {
        await initPromise;
      }
      if (!globalThis.Field || !globalThis.Field.loaded) {
        self.postMessage({ type: 'error', error: 'Worker received runEnsemble before Field finished loading.' });
        return;
      }

      // Ensure the time range we are simulating is loaded into the Field cache
      await globalThis.Field.ensureTimeRange(startSec, endSec);

      /* Accept either an explicit top-level `n` or `params.n_particles`.
         Falling back to undefined would silently produce an empty ensemble
         because the spawn loop runs `for (k=0; k<undefined; k++)` → 0 iters. */
      const n = Number(payload.n ?? params.n_particles ?? 0);
      if (!Number.isFinite(n) || n <= 0) {
        self.postMessage({ type: 'error', error: `Worker received invalid particle count: ${payload.n ?? params.n_particles}` });
        return;
      }

      const drifters = globalThis.spawnEnsemble({
        lon, lat, tSec, n, scenario, params
      });

      let currentSec = startSec;

      for (let s = 0; s < steps; s++) {
        // Step all drifters by dt
        for (let i = 0; i < drifters.length; i++) {
          drifters[i].step(dt);
        }
        currentSec += dt;

        // Post progress back to main thread periodically so the UI stays updated
        if (s % 30 === 0) {
          self.postMessage({ type: 'progress', done: s, total: steps });
        }
      }

      // Serialize the output data. Drifter instances cannot be sent via
      // postMessage directly; we include every field the main thread reads
      // (lon, lat, age, alive, stranded, mass_frac, track, t, t0) so
      // snapshotFromEnsemble + playback frame reconstruction see the same
      // shape they would from a synchronous in-page Drifter.
      const serialized = drifters.map(d => ({
        lon0: d.lon0, lat0: d.lat0, t0: d.t0,
        lon: d.lon, lat: d.lat, t: d.t,
        age: d.age,
        alive: d.alive,
        stranded: d.stranded,
        track: d.track,
        tau_evap: d.tau_evap,
        mass_frac: d.mass_frac,
        scenario: d.scenario,
      }));

      self.postMessage({ type: 'done', drifters: serialized });
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
};

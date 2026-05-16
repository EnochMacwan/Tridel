/* state.js - Centralized application state
 * Extracts global variables from app.js to decouple UI from physics/logic.
 */

window.AppState = {
  tIdx: 0,
  playing: true,
  playSpeed: 1.5,
  timelineStepHours: 3,
  nParticles: 1800,
  fieldLayer: null,
  releasePoint: null,
  activeScenario: "leeway", // "leeway" or "oil"
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
  pendingFieldChunkKey: "",
  bgParticles: [],

  overlayState: {
    currents: true,
    tracers: true,
    trails: true,
    density: false,
    uncertainty: false,
    release: true,
    oilRadius: true,
  }
};

/**
 * Viewport detector
 * Keeps layout decisions tied to the real visible browser size.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var state = null;
  var frameId = null;
  var headerObserver = null;
  var observedHeader = null;

  function match(query) {
    return !!(window.matchMedia && window.matchMedia(query).matches);
  }

  function getSize(width) {
    if (width < 480) return 'xs';
    if (width < 700) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    return 'xl';
  }

  function getHeightSize(height) {
    if (height < 640) return 'short';
    if (height < 820) return 'medium';
    return 'tall';
  }

  function getDensity(width, height) {
    if (width < 700 || height < 620) return 'compact';
    if (width < 1100 || height < 760) return 'cozy';
    return 'open';
  }

  function getHeaderHeight() {
    var header = document.querySelector('.header');
    if (!header) return 89;

    var rect = header.getBoundingClientRect();
    return Math.max(0, Math.round(rect.height));
  }

  function readState() {
    var docEl = document.documentElement;
    var visual = window.visualViewport;
    var layoutWidth = Math.round(docEl.clientWidth || window.innerWidth || 0);
    var layoutHeight = Math.round(window.innerHeight || docEl.clientHeight || 0);
    var width = Math.round((visual && visual.width) || layoutWidth);
    var height = Math.round((visual && visual.height) || layoutHeight);
    var orientation = width >= height ? 'landscape' : 'portrait';

    return {
      width: width,
      height: height,
      layoutWidth: layoutWidth,
      layoutHeight: layoutHeight,
      size: getSize(width),
      heightSize: getHeightSize(height),
      density: getDensity(width, height),
      orientation: orientation,
      input: match('(pointer: coarse)') ? 'coarse' : 'fine',
      hover: match('(hover: hover)') ? 'hover' : 'none',
      motion: match('(prefers-reduced-motion: reduce)') ? 'reduce' : 'normal',
      headerHeight: getHeaderHeight(),
      pixelRatio: Math.round((window.devicePixelRatio || 1) * 100) / 100
    };
  }

  function changed(previous, next) {
    if (!previous) return true;

    return Object.keys(next).some(function (key) {
      return previous[key] !== next[key];
    });
  }

  function setCssVar(name, value) {
    root.style.setProperty(name, value);
  }

  function applyState(next) {
    root.setAttribute('data-viewport-ready', 'true');
    root.setAttribute('data-viewport-size', next.size);
    root.setAttribute('data-viewport-height', next.heightSize);
    root.setAttribute('data-viewport-density', next.density);
    root.setAttribute('data-viewport-orientation', next.orientation);
    root.setAttribute('data-viewport-input', next.input);
    root.setAttribute('data-viewport-hover', next.hover);
    root.setAttribute('data-viewport-motion', next.motion);

    setCssVar('--viewport-width', next.width + 'px');
    setCssVar('--viewport-height', next.height + 'px');
    setCssVar('--viewport-layout-width', next.layoutWidth + 'px');
    setCssVar('--viewport-layout-height', next.layoutHeight + 'px');
    setCssVar('--app-vh', (next.height * 0.01).toFixed(2) + 'px');
    setCssVar('--header-height-live', next.headerHeight + 'px');
    setCssVar('--device-pixel-ratio', String(next.pixelRatio));
  }

  function emit(next, reason) {
    var event;
    var detail = {
      state: next,
      reason: reason || 'refresh'
    };

    try {
      event = new CustomEvent('tridel:viewportchange', { detail: detail });
    } catch (e) {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('tridel:viewportchange', false, false, detail);
    }

    document.dispatchEvent(event);
  }

  function observeHeader() {
    var header = document.querySelector('.header');
    if (observedHeader === header) return;

    observedHeader = header;

    if (headerObserver) {
      headerObserver.disconnect();
      headerObserver = null;
    }

    if (!header || typeof ResizeObserver !== 'function') return;

    headerObserver = new ResizeObserver(function () {
      scheduleRefresh('header-resize');
    });
    headerObserver.observe(header);
  }

  function refresh(reason) {
    observeHeader();

    var next = readState();
    var hasChanged = changed(state, next);
    applyState(next);

    if (hasChanged) {
      state = next;
      emit(next, reason);
    } else {
      state = next;
    }

    return Object.assign({}, state);
  }

  function scheduleRefresh(reason) {
    if (frameId) return;

    frameId = window.requestAnimationFrame(function () {
      frameId = null;
      refresh(reason);
    });
  }

  function bindMediaQuery(query) {
    if (!window.matchMedia) return;

    var list = window.matchMedia(query);
    var listener = function () {
      scheduleRefresh('media-query');
    };

    if (typeof list.addEventListener === 'function') {
      list.addEventListener('change', listener);
    } else if (typeof list.addListener === 'function') {
      list.addListener(listener);
    }
  }

  window.viewportDetector = {
    getState: function () {
      return Object.assign({}, state || readState());
    },
    refresh: refresh,
    scheduleRefresh: scheduleRefresh
  };

  window.addEventListener('resize', function () {
    scheduleRefresh('resize');
  }, { passive: true });

  window.addEventListener('orientationchange', function () {
    scheduleRefresh('orientationchange');
  }, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () {
      scheduleRefresh('visual-viewport');
    }, { passive: true });
    window.visualViewport.addEventListener('scroll', function () {
      scheduleRefresh('visual-viewport');
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    refresh('dom-ready');
  });

  bindMediaQuery('(pointer: coarse)');
  bindMediaQuery('(hover: hover)');
  bindMediaQuery('(prefers-reduced-motion: reduce)');

  refresh('init');
})();

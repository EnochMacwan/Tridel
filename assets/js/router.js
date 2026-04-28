/**
 * Tridel SPA Router
 * Hash-based routing for single-page application
 */
(function () {
  'use strict';

  var routes = {};
  var currentCleanup = null;
  var currentRoute = null;
  var siteMetricsDisabled = window.location.protocol === 'file:';

  // Lazy-loaded page renderer scripts. Each script self-registers a route via
  // window.registerRoute on load. Home is eager (loaded directly in index.html)
  // so the default route renders without an extra round-trip.
  var PAGE_SCRIPTS = {
    '/about':            'assets/js/pages/about.js',
    '/products':         'assets/js/pages/products.js',
    '/products/detail':  'assets/js/pages/product-detail.js',
    '/services':         'assets/js/pages/services.js',
    '/services/detail':  'assets/js/pages/service-detail.js',
    '/success-stories':  'assets/js/pages/success-stories.js',
    '/articles-blogs':   'assets/js/pages/articles-blogs.js',
    '/honors-awards':    'assets/js/pages/honors-awards.js',
    '/contact':          'assets/js/pages/contact.js',
    '/careers':          'assets/js/pages/careers.js'
  };
  var loadedScripts = {};
  var inFlightScripts = {};

  function loadScript(src) {
    if (loadedScripts[src]) return Promise.resolve();
    if (inFlightScripts[src]) return inFlightScripts[src];

    var promise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = function () {
        loadedScripts[src] = true;
        delete inFlightScripts[src];
        resolve();
      };
      s.onerror = function () {
        delete inFlightScripts[src];
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(s);
    });

    inFlightScripts[src] = promise;
    return promise;
  }

  function findLazyScript(path) {
    if (PAGE_SCRIPTS[path]) return PAGE_SCRIPTS[path];
    var segments = path.split('/').filter(Boolean);
    while (segments.length > 0) {
      var test = '/' + segments.join('/');
      if (PAGE_SCRIPTS[test]) return PAGE_SCRIPTS[test];
      segments.pop();
    }
    return null;
  }

  function safeStorage(storageName) {
    try {
      return window[storageName];
    } catch (e) {
      return null;
    }
  }

  function getStoredId(storageName, key) {
    var storage = safeStorage(storageName);
    if (!storage) return '';
    try {
      return storage.getItem(key) || '';
    } catch (e) {
      return '';
    }
  }

  function setStoredId(storageName, key, value) {
    var storage = safeStorage(storageName);
    if (!storage) return;
    try {
      storage.setItem(key, value);
    } catch (e) {
      // Ignore storage write failures
    }
  }

  function generateTrackingId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return prefix + window.crypto.randomUUID();
    }
    return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function getVisitorId() {
    var key = 'tridel.visitorId';
    var visitorId = getStoredId('localStorage', key);
    if (!visitorId) {
      visitorId = generateTrackingId('v_');
      setStoredId('localStorage', key, visitorId);
    }
    return visitorId;
  }

  function getVisitSessionId() {
    var key = 'tridel.visitSessionId';
    var sessionId = getStoredId('sessionStorage', key);
    if (!sessionId) {
      sessionId = generateTrackingId('s_');
      setStoredId('sessionStorage', key, sessionId);
    }
    return sessionId;
  }

  function postSiteMetric(endpoint, payload, useBeacon) {
    if (siteMetricsDisabled) return;

    var body = JSON.stringify(payload || {});

    if (useBeacon && navigator.sendBeacon) {
      try {
        var ok = navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
        if (ok) return;
      } catch (e) {
        // Fall back to fetch below
      }
    }

    if (typeof fetch !== 'function') return;

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body,
      keepalive: true
    }).then(function(response) {
      if (!response.ok) {
        siteMetricsDisabled = true;
      }
    }).catch(function() {
      siteMetricsDisabled = true;
    });
  }

  function trackSiteVisit(pathName) {
    postSiteMetric('/api/metrics/visit', {
      visitorId: getVisitorId(),
      sessionId: getVisitSessionId(),
      path: pathName || '/',
      title: document.title || ''
    }, false);
  }

  window.trackSiteEnquiry = function(details) {
    var payload = details && typeof details === 'object' ? details : {};
    payload.visitorId = getVisitorId();
    payload.sessionId = getVisitSessionId();
    payload.path = payload.path || (parseHash().path || '/contact');
    postSiteMetric('/api/metrics/enquiry', payload, true);
  };

  function resetScrollPosition() {
    function scrollTopNow() {
      if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
        window.__lenis.scrollTo(0, { immediate: true, force: true });
      }

      window.scrollTo(0, 0);

      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }

    scrollTopNow();

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(scrollTopNow);
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(scrollTopNow);
      });
    }

    setTimeout(scrollTopNow, 80);
  }

  /**
   * Register a route
   * @param {string} path - Route path (e.g., '/about', '/products/detail')
   * @param {object} config - { render: fn, title, description, bodyClass, cleanup?: fn }
   */
  window.registerRoute = function (path, config) {
    routes[path] = config;
  };

  /**
   * Navigate to a route
   * @param {string} hash - Full hash (e.g., '#/about' or '#/products/detail?id=buoy')
   */
  window.navigate = function (hash) {
    if (
      currentRoute === '/products' &&
      typeof hash === 'string' &&
      hash.indexOf('#/products/detail') === 0 &&
      typeof window.saveProductsListState === 'function'
    ) {
      window.saveProductsListState();
    }

    if (
      currentRoute === '/services' &&
      typeof hash === 'string' &&
      hash.indexOf('#/services/detail') === 0 &&
      typeof window.saveServicesListState === 'function'
    ) {
      window.saveServicesListState();
    }

    window.location.hash = hash;
  };

  /**
   * Parse the current hash into path and params
   * @returns {{ path: string, params: object }}
   */
  function parseHash() {
    var hash = window.location.hash.replace(/^#/, '') || '/';
    var qIndex = hash.indexOf('?');
    var path = qIndex >= 0 ? hash.substring(0, qIndex) : hash;
    var params = {};

    if (qIndex >= 0) {
      var search = hash.substring(qIndex + 1);
      search.split('&').forEach(function (pair) {
        var parts = pair.split('=');
        if (parts[0]) {
          params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
        }
      });
    }

    return { path: path, params: params };
  }

  /**
   * Find matching route for a path
   */
  function findRoute(path) {
    // Exact match first
    if (routes[path]) return { route: routes[path], params: {} };

    // Try parent paths (e.g., '/products/detail' for '/products/detail')
    var segments = path.split('/').filter(Boolean);
    while (segments.length > 0) {
      var testPath = '/' + segments.join('/');
      if (routes[testPath]) return { route: routes[testPath], params: {} };
      segments.pop();
    }

    // Default to home
    return routes['/'] ? { route: routes['/'], params: {} } : null;
  }

  /**
   * Handle route change
   */
  function handleRoute() {
    var parsed = parseHash();

    // Lazy-load page renderer if the route hasn't registered yet but a
    // matching script is known. After the script loads it self-registers,
    // and we re-enter handleRoute to render normally.
    if (!routes[parsed.path]) {
      var lazySrc = findLazyScript(parsed.path);
      if (lazySrc && !loadedScripts[lazySrc]) {
        var mainEl = document.getElementById('main-content');
        if (mainEl && !inFlightScripts[lazySrc]) {
          mainEl.innerHTML =
            '<div style="text-align:center;padding:120px 20px;color:var(--color-text-muted);">' +
              '<i class="fas fa-spinner fa-spin fa-2x"></i><br><br>Loading page&hellip;' +
            '</div>';
        }
        loadScript(lazySrc).then(handleRoute).catch(function (e) {
          console.error('Lazy page load failed:', e);
          if (mainEl) {
            mainEl.innerHTML = '<div class="empty-state" style="padding:100px 20px;text-align:center;"><h2>Page failed to load</h2><p>Please refresh and try again.</p></div>';
          }
        });
        return;
      }
    }

    var match = findRoute(parsed.path);
    var shouldRestoreProductsList = currentRoute === '/products/detail' && parsed.path === '/products';
    var shouldRestoreServicesList = currentRoute === '/services/detail' && parsed.path === '/services';

    if (!match) {
      // Unknown hash — redirect to home rather than blank page
      window.location.hash = '#/';
      return;
    }

    var route = match.route;
    var mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    // Run cleanup for previous route
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch (e) { console.warn('Route cleanup error:', e); }
      currentCleanup = null;
    }

    // Cancel any running bg animations
    if (typeof window.cleanupBgAnimation === 'function') {
      window.cleanupBgAnimation();
    }
    // Cancel any running testimonial map timers/instances
    if (typeof window.cleanupTestimonialMap === 'function') {
      window.cleanupTestimonialMap();
    }

    // Update page meta
    if (route.title) document.title = route.title;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && route.description) metaDesc.setAttribute('content', route.description);

    // Update body class
    document.body.className = route.bodyClass || '';

    // Clear main content
    mainEl.innerHTML = '';

    // Render new page
    try {
      var cleanup = route.render(mainEl, parsed.params);
      if (typeof cleanup === 'function') {
        currentCleanup = cleanup;
      }
    } catch (e) {
      console.error('Route render error:', e);
      mainEl.innerHTML = '<div class="empty-state" style="padding:100px 20px;text-align:center;"><h2>Page Error</h2><p>Something went wrong loading this page.</p></div>';
    }

    if (window.viewportDetector && typeof window.viewportDetector.refresh === 'function') {
      window.viewportDetector.refresh('route-rendered');
    }

    // Update active nav
    if (typeof window.updateActiveNav === 'function') {
      window.updateActiveNav(parsed.path);
    }

    // Scroll to top
    resetScrollPosition();

    if (shouldRestoreProductsList && typeof window.restoreProductsListState === 'function') {
      window.restoreProductsListState();
    }

    if (shouldRestoreServicesList && typeof window.restoreServicesListState === 'function') {
      window.restoreServicesListState();
    }

    // Re-init scroll reveal for new content
    if (typeof window.initScrollReveal === 'function') {
      setTimeout(function () { window.initScrollReveal(); }, 50);
    }

    // Apply form email settings (contact/careers) to dynamically rendered forms
    if (typeof window.applyFormSettings === 'function') {
      setTimeout(function () { window.applyFormSettings(); }, 100);
    }

    // Init bg animation if hero-canvas exists
    setTimeout(function () {
      var canvas = document.getElementById('hero-canvas');
      if (canvas) {
        if (parsed.path === '/' || parsed.path === '/home') {
          if (typeof window.initBgAnimationFuture === 'function') window.initBgAnimationFuture();
        } else {
          if (typeof window.initBgAnimation === 'function') window.initBgAnimation();
        }
      }
    }, 100);

    currentRoute = parsed.path;
    trackSiteVisit(parsed.path);
  }

  // Intercept clicks on internal links to use SPA navigation
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    // Handle hash links
    if (href.startsWith('#/')) {
      e.preventDefault();
      navigate(href);
      return;
    }

    // Handle old-style .html links (for backward compatibility)
    if (href.endsWith('.html') && !href.startsWith('http') && href !== 'admin.html' && href !== 'usv-viewer.html') {
      e.preventDefault();
      var route = htmlToHash(href);
      navigate(route);
      return;
    }
  });

  /**
   * Convert old HTML filenames to hash routes
   */
  function htmlToHash(href) {
      var map = {
        'index.html': '#/',
        'about.html': '#/about',
        'products.html': '#/products',
        'services.html': '#/services',
        'success-stories.html': '#/success-stories',
        'articles-blogs.html': '#/articles-blogs',
        'honors-awards.html': '#/honors-awards',
        'contact.html': '#/contact',
        'careers.html': '#/careers'
      };

    // Handle query params (e.g., product-detail.html?id=X)
    var qIndex = href.indexOf('?');
    var base = qIndex >= 0 ? href.substring(0, qIndex) : href;
    var query = qIndex >= 0 ? href.substring(qIndex) : '';

    if (base === 'product-detail.html') return '#/products/detail' + query;
    if (base === 'service-detail.html') return '#/services/detail' + query;

    return map[base] || '#/';
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleRoute);

  // Initialize router on DOM ready
  window.initRouter = function () {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Set default hash if none
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/';
    }
    handleRoute();
  };

  // Expose parseHash for external use
  window.parseHash = parseHash;
})();

/**
 * Tridel SPA Router
 * Hash-based routing for single-page application
 */
(function () {
  'use strict';

  var routes = {};
  var currentCleanup = null;
  var currentRoute = null;

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
    var match = findRoute(parsed.path);

    if (!match) return;

    var route = match.route;
    var mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    // Run cleanup for previous route
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch (e) { console.warn('Route cleanup error:', e); }
      currentCleanup = null;
    }

    // Cancel any running bg animations
    if (typeof window.cleanupAnimation === 'function') {
      window.cleanupAnimation();
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

    // Update active nav
    if (typeof window.updateActiveNav === 'function') {
      window.updateActiveNav(parsed.path);
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Re-init scroll reveal for new content
    if (typeof window.initScrollReveal === 'function') {
      setTimeout(function () { window.initScrollReveal(); }, 50);
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
    // Set default hash if none
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/';
    }
    handleRoute();
  };

  // Expose parseHash for external use
  window.parseHash = parseHash;
})();

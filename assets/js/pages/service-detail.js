/**
 * Service Detail Page Renderer (/services/detail)
 * Renders a single service detail view based on the id parameter.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/services/detail']) || {};

  function renderServiceDetailPage(mainEl, params) {
    var html = '';

    // Service detail container with loading spinner
    html +=
      '<div id="service-detail-container">' +
        '<div style="text-align: center; padding: 100px;">' +
          '<span role="status" aria-live="polite"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading service details...</span>' +
        '</div>' +
      '</div>';

    mainEl.innerHTML = html;

    // Load service detail dynamically
    var container = document.getElementById('service-detail-container');
    if (typeof renderServiceDetail === 'function' && container) {
      renderServiceDetail(container, params.id);
    }

    // Initialize scroll reveal
    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    // Initialize hero canvas
    if (typeof window.initHeroCanvas === 'function') {
      window.initHeroCanvas();
    }
  }

  window.registerRoute('/services/detail', {
    render: renderServiceDetailPage,
    title: meta.title || 'Service Details | Tridel',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-service-detail'
  });
})();

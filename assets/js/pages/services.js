/**
 * Services Page Renderer (/services)
 * Renders the services listing page with page header and dynamic service grid.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/services']) || {};

  function render(mainEl) {
    var html = '';

    // Page header with breadcrumb
    html += window.renderPageHeader({
      title: 'Our Services',
      subtitle: 'Providing end-to-end solutions across the entire project lifecycle, from initial studies to data management and custom engineering.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Services' }
      ]
    });

    // Dynamic service grid container
    html +=
      '<div id="dynamic-services-container">' +
        '<div style="text-align: center; padding: 50px;">' +
          '<span role="status" aria-live="polite"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading Services...</span>' +
        '</div>' +
      '</div>';

    mainEl.innerHTML = html;

    // Load services grid dynamically
    if (typeof renderServicesGrid === 'function') {
      renderServicesGrid();
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

  window.registerRoute('/services', {
    render: render,
    title: meta.title || 'Services | TRIDEL',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-services'
  });
})();

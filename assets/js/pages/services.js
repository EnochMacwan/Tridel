/**
 * Services Page Renderer (/services)
 * Renders the services listing page with page header and dynamic service grid.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/services']) || {};

  function renderServicesPage(mainEl) {
    var html = '';
    var hashParts = String(window.location.hash || '').split('?');
    var params = new URLSearchParams(hashParts[1] || '');
    var targetSectionId = params.get('section');

    // Page header with breadcrumb
    if (isSectionVisible('services', 'hero'))
    html += window.renderPageHeader({
      title: 'Our Services',
      subtitle: 'Providing end-to-end solutions across the entire project lifecycle, from initial studies to data management and custom engineering.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Services' }
      ]
    });

    // Dynamic service grid container
    if (isSectionVisible('services', 'grid'))
    html +=
      '<div id="dynamic-services-container">' +
        '<div class="loading-state">' +
          '<span role="status" aria-live="polite"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading Services...</span>' +
        '</div>' +
      '</div>';

    mainEl.innerHTML = html;

    // Load services grid dynamically
    if (typeof renderServicesGrid === 'function') {
      renderServicesGrid(null, targetSectionId);
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
    render: renderServicesPage,
    title: meta.title || 'Services | TRIDEL',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-services'
  });
})();

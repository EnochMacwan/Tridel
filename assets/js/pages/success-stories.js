/**
 * Success Stories Page Renderer (/success-stories)
 * Renders the success stories page with page header and dynamic project grid.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/success-stories']) || {};

  function render(mainEl) {
    var html = '';

    // Page header with breadcrumb
    if (isSectionVisible('successStories', 'hero'))
    html += window.renderPageHeader({
      title: 'Success Stories',
      subtitle: 'Explore our portfolio of successful projects, showcasing our expertise in environmental monitoring, hydrographic surveying, and custom solution development.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Success Stories' }
      ]
    });

    // Dynamic success stories container
    if (isSectionVisible('successStories', 'grid'))
    html +=
      '<div id="dynamic-success-stories">' +
        '<div style="text-align: center; padding: 100px; color: var(--color-text-muted);">' +
          '<span role="status" aria-live="polite"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Loading Success Stories...</span>' +
        '</div>' +
      '</div>';

    mainEl.innerHTML = html;

    // Load success stories dynamically
    if (typeof renderSuccessStories === 'function') {
      renderSuccessStories();
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

  window.registerRoute('/success-stories', {
    render: render,
    title: meta.title || 'Success Stories | Tridel',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-success-stories'
  });
})();

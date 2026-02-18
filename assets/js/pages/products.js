/**
 * Products Page Renderer (/products)
 * Renders the products listing page with page header and dynamic product grid.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/products']) || {};

  function render(mainEl) {
    var html = '';

    // Page header with breadcrumb
    if (isSectionVisible('products', 'hero'))
    html += window.renderPageHeader({
      title: 'Our Products',
      subtitle: 'Comprehensive Survey & Monitoring Solutions, Software, and Integrated Systems.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Products' }
      ]
    });

    // Dynamic product grid container
    if (isSectionVisible('products', 'grid'))
    html +=
      '<div id="dynamic-products-container">' +
        '<div class="loading-state">' +
          '<span role="status" aria-live="polite"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading Products...</span>' +
        '</div>' +
      '</div>';

    mainEl.innerHTML = html;

    // Load products grid dynamically
    if (typeof renderProductsGrid === 'function') {
      renderProductsGrid();
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

  window.registerRoute('/products', {
    render: render,
    title: meta.title || 'Products | TRIDEL',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-products'
  });
})();

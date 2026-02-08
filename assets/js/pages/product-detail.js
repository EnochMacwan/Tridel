/**
 * Product Detail Page Renderer (/products/detail)
 * Renders a single product detail view based on the id parameter.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/products/detail']) || {};

  function render(mainEl, params) {
    var html = '';

    // Product detail container with loading spinner
    html +=
      '<div id="product-detail-container">' +
        '<div style="text-align: center; padding: 100px;">' +
          '<span role="status" aria-live="polite"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading product details...</span>' +
        '</div>' +
      '</div>';

    mainEl.innerHTML = html;

    // Load product detail dynamically
    var container = document.getElementById('product-detail-container');
    if (typeof renderProductDetail === 'function' && container) {
      renderProductDetail(container, params.id);
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

  window.registerRoute('/products/detail', {
    render: render,
    title: meta.title || 'Product Details | Tridel',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-product-detail'
  });
})();

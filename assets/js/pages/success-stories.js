/**
 * Success Stories Page Renderer (/success-stories)
 * Renders the success stories page with page header and dynamic project grid.
 */
(function () {
  'use strict';

  var esc = escapeHtml;
  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/success-stories']) || {};

  function inferHonorCategory(item) {
    if (item.category) return String(item.category).toLowerCase();
    var t = String(item.type || '').toLowerCase();
    if (t.indexOf('event') !== -1) return 'event';
    if (t.indexOf('recognition') !== -1) return 'recognition';
    return 'award';
  }

  function buildHonorCard(item) {
    var category = inferHonorCategory(item);
    return (
      '<article class="honor-card" data-category="' + esc(category) + '">' +
        '<span class="honor-card__type honor-card__type--' + esc(category) + '">' + esc(item.type || category) + '</span>' +
        '<h3 class="honor-card__title">' + esc(item.title || '') + '</h3>' +
        (item.organization ? '<p class="honor-card__meta">' + esc(item.organization) + '</p>' : '') +
        (item.date ? '<p class="honor-card__date"><i class="far fa-calendar"></i> ' + esc(item.date) + '</p>' : '') +
        (item.description ? '<p class="honor-card__description">' + esc(item.description) + '</p>' : '') +
      '</article>'
    );
  }

  function buildHonorsTeaser() {
    var data = (typeof HONORS_AWARDS_DATA !== 'undefined') ? HONORS_AWARDS_DATA : null;
    if (!data) return '';
    var highlights = Array.isArray(data.highlights) ? data.highlights.slice(0, 3) : [];

    var cards = highlights.length
      ? highlights.map(buildHonorCard).join('')
      : ('<article class="honor-card honor-card--empty">' +
            '<h3 class="honor-card__title">More entries coming soon</h3>' +
            '<p class="honor-card__description">New awards, recognitions, and event highlights will appear here.</p>' +
          '</article>');

    return (
      '<section class="section success-stories-honors reveal">' +
        '<div class="container">' +
          '<div class="section__header">' +
            '<h2 class="section__title">Honors &amp; Awards</h2>' +
            '<p class="section__subtitle">Recognitions and event milestones from across our environmental, marine, and engineering work.</p>' +
          '</div>' +
          '<div class="honors-grid">' + cards + '</div>' +
          '<div class="success-stories-honors__cta">' +
            '<a class="button button--primary" href="#/honors-awards">View all honors &amp; awards <i class="fas fa-arrow-right"></i></a>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function renderSuccessStoriesPage(mainEl) {
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

    // Honors & Awards teaser — links through to dedicated /honors-awards page
    html += buildHonorsTeaser();

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
    render: renderSuccessStoriesPage,
    title: meta.title || 'Success Stories | Tridel',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-success-stories'
  });
})();

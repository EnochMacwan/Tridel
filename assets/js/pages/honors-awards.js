/**
 * Honors & Awards Page Renderer (/honors-awards)
 * Shows awards, recognitions, and events with category filters,
 * plus a feed of company event updates from LinkedIn.
 */
(function () {
  'use strict';

  var esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  };

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/honors-awards']) || {};

  function inferCategory(item) {
    if (item.category) return String(item.category).toLowerCase();
    var t = String(item.type || '').toLowerCase();
    if (t.indexOf('event') !== -1) return 'event';
    if (t.indexOf('recognition') !== -1) return 'recognition';
    return 'award';
  }

  function renderCard(item) {
    var category = inferCategory(item);
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

  function renderEmpty(emptyState) {
    return (
      '<article class="honor-card honor-card--empty">' +
        '<h3 class="honor-card__title">' + esc(emptyState.title || 'Nothing here yet') + '</h3>' +
        '<p class="honor-card__description">' + esc(emptyState.description || '') + '</p>' +
      '</article>'
    );
  }

  function renderFilters(labels, counts) {
    var keys = ['all', 'award', 'recognition', 'event'];
    return (
      '<div class="honors-filters" role="tablist" aria-label="Honors and awards categories">' +
        keys.map(function (key, i) {
          var label = labels[key] || key;
          var count = key === 'all' ? counts.all : (counts[key] || 0);
          return (
            '<button type="button" class="honors-filter' + (i === 0 ? ' is-active' : '') + '"' +
              ' data-filter="' + esc(key) + '"' +
              ' role="tab"' +
              ' aria-selected="' + (i === 0 ? 'true' : 'false') + '">' +
              esc(label) + ' <span class="honors-filter__count">' + count + '</span>' +
            '</button>'
          );
        }).join('') +
      '</div>'
    );
  }

  function bindFilters(root) {
    var buttons = root.querySelectorAll('.honors-filter');
    var cards = root.querySelectorAll('.honor-card[data-category]');
    var emptyMsg = root.querySelector('.honors-grid__empty');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        buttons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        var visibleCount = 0;
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });
        if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? '' : 'none';
      });
    });
  }

  function render(mainEl) {
    var data = (typeof HONORS_AWARDS_DATA !== 'undefined') ? HONORS_AWARDS_DATA : {};
    var header = data.pageHeader || {};
    var eventsIntro = data.eventsIntro || {};
    var labels = data.categoryLabels || { all: 'All', award: 'Awards', recognition: 'Recognitions', event: 'Events' };
    var emptyState = data.emptyState || { title: 'More coming soon', description: '' };
    var highlights = Array.isArray(data.highlights) ? data.highlights : [];

    var counts = { all: highlights.length, award: 0, recognition: 0, event: 0 };
    highlights.forEach(function (h) {
      var c = inferCategory(h);
      if (counts[c] !== undefined) counts[c]++;
    });

    var html = '';

    html += window.renderPageHeader({
      title: header.title || 'Honors & Awards',
      subtitle: header.subtitle || 'Awards, recognitions, and event milestones from across Tridel Technologies.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Honors & Awards' }
      ]
    });

    html +=
      '<section class="section reveal" id="honors-list">' +
        '<div class="container">' +
          '<div class="section__header honors-section__header">' +
            '<h2 class="section__title">Awards, Recognitions & Events</h2>' +
            '<p class="section__subtitle">Browse the full record. Use the filters to focus on a specific category.</p>' +
          '</div>' +
          renderFilters(labels, counts) +
          '<div class="honors-grid">' +
            (highlights.length
              ? highlights.map(renderCard).join('')
              : renderEmpty(emptyState)
            ) +
            '<div class="honors-grid__empty" style="display:none;">' +
              renderEmpty({ title: 'No entries in this category yet', description: 'Try a different filter or check back soon.' }) +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';

    html +=
      '<section class="section section--light-bg reveal">' +
        '<div class="container--wide">' +
          '<div class="section__header honors-section__header">' +
            '<h2 class="section__title">' + esc(eventsIntro.title || 'Events & Updates') + '</h2>' +
            '<p class="section__subtitle">' + esc(eventsIntro.subtitle || 'Recent event highlights and public-facing company updates.') + '</p>' +
          '</div>' +
          '<div id="honors-events-feed" class="linkedin-feed__grid"></div>' +
        '</div>' +
      '</section>';

    mainEl.innerHTML = html;

    bindFilters(document.getElementById('honors-list'));

    if (typeof renderNewsFeed === 'function') {
      renderNewsFeed(document.getElementById('honors-events-feed'));
    }

    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }
  }

  window.registerRoute('/honors-awards', {
    render: render,
    title: meta.title || 'Honors & Awards | Tridel',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-honors-awards'
  });
})();

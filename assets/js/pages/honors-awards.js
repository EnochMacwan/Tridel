/**
 * Honors & Awards Page Renderer (/honors-awards)
 * Shows recognitions plus a feed of company event updates.
 */
(function () {
  'use strict';

  var esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  };

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/honors-awards']) || {};

  function renderHighlights(highlights) {
    if (!highlights || !highlights.length) {
      return (
        '<div class="honors-grid">' +
          '<article class="honor-card honor-card--empty">' +
            '<h3 class="honor-card__title">More recognitions coming soon</h3>' +
            '<p class="honor-card__description">This page is ready to grow as new awards, recognitions, and event highlights are published.</p>' +
          '</article>' +
        '</div>'
      );
    }

    return (
      '<div class="honors-grid">' +
        highlights.map(function (item) {
          return (
            '<article class="honor-card">' +
              '<span class="honor-card__type">' + esc(item.type || 'Recognition') + '</span>' +
              '<h3 class="honor-card__title">' + esc(item.title || '') + '</h3>' +
              (item.organization ? '<p class="honor-card__meta">' + esc(item.organization) + '</p>' : '') +
              (item.description ? '<p class="honor-card__description">' + esc(item.description) + '</p>' : '') +
            '</article>'
          );
        }).join('') +
      '</div>'
    );
  }

  function render(mainEl) {
    var data = (typeof HONORS_AWARDS_DATA !== 'undefined') ? HONORS_AWARDS_DATA : {};
    var header = data.pageHeader || {};
    var eventsIntro = data.eventsIntro || {};
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
      '<section class="section reveal">' +
        '<div class="container">' +
          '<div class="section__header honors-section__header">' +
            '<h2 class="section__title">Awards & Recognitions</h2>' +
            '<p class="section__subtitle">A curated collection of formal recognitions and milestone acknowledgements.</p>' +
          '</div>' +
          renderHighlights(data.highlights || []) +
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

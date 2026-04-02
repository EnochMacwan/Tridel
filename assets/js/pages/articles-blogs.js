/**
 * Articles & Blogs Page Renderer (/articles-blogs)
 * Reuses the LinkedIn/news feed in a dedicated page context.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/articles-blogs']) || {};

  function render(mainEl) {
    var html = '';

    html += window.renderPageHeader({
      title: 'Articles & Blogs',
      subtitle: 'Company updates, industry notes, event highlights, and featured posts from Tridel Technologies.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Articles & Blogs' }
      ]
    });

    html +=
      '<section class="section reveal">' +
        '<div class="container--wide">' +
          '<div class="section__header linkedin-section__header linkedin-section__header--page">' +
            '<div class="linkedin-section__intro">' +
              '<div class="linkedin-section__badge">' +
                '<i class="fab fa-linkedin"></i>' +
              '</div>' +
              '<div class="linkedin-section__copy">' +
                '<h2 class="section__title">From Tridel</h2>' +
                '<p class="section__subtitle">Explore the full set of published LinkedIn updates and featured company posts.</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div id="articles-blogs-feed" class="linkedin-feed__grid"></div>' +
        '</div>' +
      '</section>';

    mainEl.innerHTML = html;

    if (typeof renderNewsFeed === 'function') {
      renderNewsFeed(document.getElementById('articles-blogs-feed'));
    }

    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }
  }

  window.registerRoute('/articles-blogs', {
    render: render,
    title: meta.title || 'Articles & Blogs | Tridel',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-articles-blogs'
  });
})();

/**
 * Articles & Blogs Page Renderer (/articles-blogs)
 * Reuses the LinkedIn/news feed in a dedicated page context, with a
 * corner Quick Links panel for jumping to external publishing channels.
 */
(function () {
  'use strict';

  var esc = escapeHtml;

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/articles-blogs']) || {};

  // Corner "Quick Links" — channels where Tridel publishes content.
  var QUICK_LINKS = [
    {
      icon: 'fab fa-linkedin',
      label: 'LinkedIn',
      sublabel: 'Company updates & posts',
      href: 'https://www.linkedin.com/company/tridel-technologies-company/',
      external: true
    },
    {
      icon: 'fas fa-newspaper',
      label: 'Press & News',
      sublabel: 'Latest LinkedIn feed',
      href: '#articles-feed',
      external: false
    },
    {
      icon: 'fas fa-trophy',
      label: 'Honors & Awards',
      sublabel: 'Recognitions & events',
      href: '#/honors-awards',
      external: false
    },
    {
      icon: 'fas fa-envelope',
      label: 'Get in touch',
      sublabel: 'Contact our team',
      href: '#/contact',
      external: false
    }
  ];

  function renderQuickLinks() {
    var items = QUICK_LINKS.map(function (l) {
      var ext = l.external
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      var extIcon = l.external
        ? '<i class="fas fa-arrow-up-right-from-square articles-links__ext"></i>'
        : '';
      return (
        '<a class="articles-links__item" href="' + esc(l.href) + '"' + ext + '>' +
          '<span class="articles-links__icon"><i class="' + esc(l.icon) + '"></i></span>' +
          '<span class="articles-links__body">' +
            '<span class="articles-links__label">' + esc(l.label) + '</span>' +
            '<span class="articles-links__sub">' + esc(l.sublabel) + '</span>' +
          '</span>' +
          extIcon +
        '</a>'
      );
    }).join('');

    return (
      '<aside class="articles-links" aria-label="Quick links">' +
        '<div class="articles-links__header">' +
          '<i class="fas fa-link"></i>' +
          '<h3 class="articles-links__title">Quick Links</h3>' +
        '</div>' +
        '<div class="articles-links__list">' + items + '</div>' +
      '</aside>'
    );
  }

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
        '<div class="container--wide articles-layout">' +
          '<div class="articles-layout__main">' +
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
            '<div id="articles-blogs-feed" class="linkedin-feed__grid" data-feed-anchor="articles-feed"></div>' +
          '</div>' +
          renderQuickLinks() +
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

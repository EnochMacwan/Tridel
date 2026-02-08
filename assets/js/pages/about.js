/**
 * About Page Renderer (/about)
 * Renders the about page with page header, who-we-are section, and team grid.
 */
(function () {
  'use strict';

  var esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  };

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/about']) || {};

  function render(mainEl) {
    var data = (typeof ABOUT_DATA !== 'undefined') ? ABOUT_DATA : {};
    var header = data.pageHeader || {};
    var whoWeAre = data.whoWeAre || {};

    var html = '';

    // Page header with breadcrumb
    html += window.renderPageHeader({
      title: header.title || 'Pioneering the Future of Maritime Intelligence',
      subtitle: header.subtitle || 'We are a team of engineers, scientists, and hydrographers dedicated to solving complex challenges in the marine environment.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'About Us' }
      ]
    });

    // Who We Are section
    html +=
      '<section class="section" id="who-we-are">' +
        '<div class="container">' +
          '<div class="section__header">' +
            '<h2 class="section__title">' + esc(whoWeAre.title || 'Who We Are') + '</h2>' +
          '</div>' +
          '<p>' + esc(whoWeAre.text || '') + '</p>' +
          '<img loading="lazy" alt="' + esc(whoWeAre.imageAlt || 'The Tridel team') + '" src="' + esc(whoWeAre.image || 'assets/images/team/team.jpg') + '"' +
            ' style="width: 100%; border-radius: var(--radius-lg); margin-top: var(--space-lg); box-shadow: var(--shadow-md);">' +
        '</div>' +
      '</section>';

    // Team section
    html +=
      '<section class="section section--light-bg" id="our-team">' +
        '<div class="container">' +
          '<div class="section__header">' +
            '<h2 class="section__title">Meet Our Team</h2>' +
          '</div>' +
          '<div class="team-grid"></div>' +
        '</div>' +
      '</section>';

    mainEl.innerHTML = html;

    // Load team grid dynamically
    if (typeof renderTeamGrid === 'function') {
      renderTeamGrid();
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

  window.registerRoute('/about', {
    render: render,
    title: meta.title || 'About Us | TRIDEL',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-about'
  });
})();

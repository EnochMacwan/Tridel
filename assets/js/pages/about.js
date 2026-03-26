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
    if (isSectionVisible('about', 'pageHeader'))
    html += window.renderPageHeader({
      title: header.title || 'Pioneering the Future of Maritime Intelligence',
      subtitle: header.subtitle || 'We are a team of engineers, scientists, and hydrographers dedicated to solving complex challenges in the marine environment.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'About Us' }
      ]
    });

    // Who We Are section
    if (isSectionVisible('about', 'whoWeAre'))
    html +=
      '<section class="section about-who-we-are-section reveal" id="who-we-are">' +
        '<div class="container--wide">' +
          '<div class="about-who-we-are-layout">' +
            '<div class="about-who-we-are-media">' +
              '<img loading="lazy" alt="' + esc(whoWeAre.imageAlt || 'The Tridel team') + '" class="about-who-we-are-image" src="' + esc(whoWeAre.image || 'assets/images/team/team.jpg') + '">' +
            '</div>' +
            '<div class="about-who-we-are-copy">' +
              '<h2 class="sr-only">' + esc(whoWeAre.title || 'Who We Are') + '</h2>' +
              '<p class="about-who-we-are-text">' + esc(whoWeAre.text || '') + '</p>' +
            '</div>' +
          '</div>' +
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

/**
 * Home Page Renderer (/)
 * Renders the full home/index page with hero, stats, what-we-do, highlights,
 * news, clients, case study, and CTA sections.
 */
(function () {
  'use strict';

  var esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  };

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/']) || {};

  function buildStatsHtml(stats) {
    var items = '';
    stats.forEach(function (s) {
      var suffixHtml = s.suffix ? '<span class="stat-suffix">' + esc(s.suffix) + '</span>' : '';
      items +=
        '<div class="stat-item">' +
          '<div class="stat-number" data-target="' + s.target + '">' + suffixHtml + '</div>' +
          '<div class="stat-label">' + esc(s.label) + '</div>' +
        '</div>';
    });
    return items;
  }

  function buildWhatWeDoHtml(data) {
    var cards = '';
    data.cards.forEach(function (card) {
      cards +=
        '<div class="value-prop-card">' +
          '<div class="value-prop-card__icon">' +
            '<i class="fas ' + esc(card.icon) + '"></i>' +
          '</div>' +
          '<h3 class="value-prop-card__title">' + esc(card.title) + '</h3>' +
          '<p class="value-prop-card__desc">' + esc(card.desc) + '</p>' +
        '</div>';
    });
    return (
      '<section class="section reveal">' +
        '<div class="container">' +
          '<div class="section__header">' +
            '<h2 class="section__title">' + esc(data.title) + '</h2>' +
            '<p class="section__subtitle">' + esc(data.subtitle) + '</p>' +
          '</div>' +
          '<div class="value-prop-grid">' + cards + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function buildCaseStudyHtml(cs) {
    return (
      '<section class="section reveal">' +
        '<div class="container">' +
          '<div class="case-study-banner">' +
            '<div class="case-study-banner__visual">' +
              '<img loading="lazy" src="' + esc(cs.image) + '" alt="' + esc(cs.imageAlt) + '"' +
                ' onerror="this.src=\'assets/images/logo/tridel.png\'">' +
            '</div>' +
            '<div class="case-study-banner__info">' +
              '<span class="case-study-banner__label">' + esc(cs.label) + '</span>' +
              '<h3 class="case-study-banner__title">' + esc(cs.title) + '</h3>' +
              '<p class="case-study-banner__desc">' + esc(cs.desc) + '</p>' +
              '<a href="' + esc(cs.linkHref) + '" class="button button--primary">' + esc(cs.linkText) + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function buildCtaHtml(cta) {
    return (
      '<section class="section reveal">' +
        '<div class="container">' +
          '<div class="cta-banner">' +
            '<div class="cta-banner__content">' +
              '<h2 class="cta-banner__title">' + esc(cta.title) + '</h2>' +
              '<p class="cta-banner__desc">' + esc(cta.desc) + '</p>' +
              '<div class="cta-banner__actions">' +
                '<a href="' + esc(cta.primaryBtn.href) + '" class="cta-banner__btn cta-banner__btn--primary">' +
                  esc(cta.primaryBtn.text) + (cta.primaryBtn.icon ? ' <i class="fas ' + esc(cta.primaryBtn.icon) + '"></i>' : '') +
                '</a>' +
                '<a href="' + esc(cta.secondaryBtn.href) + '" class="cta-banner__btn cta-banner__btn--secondary">' +
                  esc(cta.secondaryBtn.text) +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function initStatsCounter() {
    var counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;
    var animated = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !animated.has(entry.target)) {
          animated.add(entry.target);
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'));
          var suffix = el.querySelector('.stat-suffix');
          var suffixText = suffix ? suffix.outerHTML : '';
          var duration = 1500;
          var startTime = null;
          function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(eased * target);
            el.innerHTML = current + suffixText;
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  function render(mainEl) {
    var hero = (typeof INDEX_HERO !== 'undefined') ? INDEX_HERO : { title: 'Pioneering the Future of Maritime Intelligence', subtitle: 'We deliver integrated hardware, software, and services for the comprehensive maritime domain.' };
    var stats = (typeof INDEX_STATS !== 'undefined') ? INDEX_STATS : [];
    var whatWeDo = (typeof INDEX_WHAT_WE_DO !== 'undefined') ? INDEX_WHAT_WE_DO : null;
    var caseStudy = (typeof INDEX_CASE_STUDY !== 'undefined') ? INDEX_CASE_STUDY : null;
    var cta = (typeof INDEX_CTA !== 'undefined') ? INDEX_CTA : null;

    var html = '';

    // Hero
    html +=
      '<section class="hero">' +
        '<div class="hero__bg">' +
          '<canvas id="hero-canvas" width="1920" height="1080"></canvas>' +
        '</div>' +
        '<div class="hero__overlay"></div>' +
        '<div class="container hero__content">' +
          '<h1 class="hero__title">' + esc(hero.title) + '</h1>' +
          '<p class="hero__subtitle">' + esc(hero.subtitle) + '</p>' +
        '</div>' +
        '<div class="hero__scroll-indicator" aria-hidden="true">' +
          '<div class="hero__scroll-mouse"><div class="hero__scroll-wheel"></div></div>' +
        '</div>' +
      '</section>';

    // Stats Bar
    if (stats.length) {
      html +=
        '<section class="stats-bar reveal">' +
          '<div class="container">' +
            '<div class="stats-grid">' + buildStatsHtml(stats) + '</div>' +
          '</div>' +
        '</section>';
    }

    // What We Do
    if (whatWeDo) {
      html += buildWhatWeDoHtml(whatWeDo);
    }

    // Highlights
    html +=
      '<section class="section reveal" id="highlights">' +
        '<div class="container--wide">' +
          '<div class="section__header">' +
            '<h2 class="section__title">Highlights</h2>' +
          '</div>' +
          '<div id="home-cards-container" class="highlights-grid highlights-grid--4-items">' +
          '</div>' +
        '</div>' +
      '</section>';

    // Latest News
    html +=
      '<section class="section section--light-bg reveal">' +
        '<div class="container--wide">' +
          '<div class="news-feed">' +
            '<h2 class="section__title">Latest News</h2>' +
            '<div id="news-feed-container">' +
              '<div class="news-loading-placeholder" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">' +
                '<i class="fas fa-spinner fa-spin"></i> Loading latest updates...' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';

    // Clients
    html +=
      '<section class="section reveal" id="clients">' +
        '<div class="container">' +
          '<div class="section__header">' +
            '<h2 class="section__title">Our Clients &amp; Partners</h2>' +
          '</div>' +
        '</div>' +
        '<div class="client-logos">' +
          '<div class="client-logo-track"></div>' +
        '</div>' +
      '</section>';

    // Case Study
    if (caseStudy) {
      html += buildCaseStudyHtml(caseStudy);
    }

    // CTA
    if (cta) {
      html += buildCtaHtml(cta);
    }

    mainEl.innerHTML = html;

    // Initialize stats counter animation
    initStatsCounter();

    // Load dynamic content
    if (typeof renderHomeCards === 'function') {
      renderHomeCards();
    }
    if (typeof renderNewsFeed === 'function') {
      renderNewsFeed();
    }
    if (typeof renderClientLogos === 'function') {
      renderClientLogos();
    }

    // Initialize scroll reveal
    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    // Initialize hero canvas animation
    if (typeof window.initHeroCanvas === 'function') {
      window.initHeroCanvas();
    }
  }

  window.registerRoute('/', {
    render: render,
    title: meta.title || 'Tridel Technologies',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-home'
  });
})();

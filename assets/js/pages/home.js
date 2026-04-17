/**
 * Home Page Renderer (/)
 * Renders the home/index page: hero, stats, what-we-do, highlights,
 * news feed, clients, and testimonials.
 */
(function () {
  'use strict';

  var esc = escapeHtml;

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

  function renderHomePage(mainEl) {
    var hero = (typeof INDEX_HERO !== 'undefined') ? INDEX_HERO : { title: 'Pioneering the Future of Maritime Intelligence', subtitle: 'We deliver integrated hardware, software, and services for the comprehensive maritime domain.' };
    var stats = (typeof INDEX_STATS !== 'undefined') ? INDEX_STATS : [];
    var whatWeDo = (typeof INDEX_WHAT_WE_DO !== 'undefined') ? INDEX_WHAT_WE_DO : null;

    var html = '';

    // Default section order
    var defaultOrder = ['hero', 'stats', 'whatWeDo', 'highlights', 'news', 'clients', 'testimonialMap'];
    var sectionOrder = (typeof INDEX_SECTION_ORDER !== 'undefined' && Array.isArray(INDEX_SECTION_ORDER) && INDEX_SECTION_ORDER.length)
      ? INDEX_SECTION_ORDER
      : defaultOrder;

    // Section builder map — each returns HTML string or ''
    var sectionBuilders = {
      hero: function () {
        if (!isSectionVisible('home', 'hero')) return '';
        return (
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
          '</section>'
        );
      },
      stats: function () {
        if (!stats.length || !isSectionVisible('home', 'stats')) return '';
        return (
          '<section class="stats-bar reveal">' +
            '<div class="container">' +
              '<div class="stats-grid">' + buildStatsHtml(stats) + '</div>' +
            '</div>' +
          '</section>'
        );
      },
      whatWeDo: function () {
        if (!whatWeDo || !isSectionVisible('home', 'whatWeDo')) return '';
        return buildWhatWeDoHtml(whatWeDo);
      },
      highlights: function () {
        return (
          '<section class="section reveal" id="highlights">' +
            '<div class="container--wide">' +
              '<div class="section__header">' +
                '<h2 class="section__title">Highlights</h2>' +
              '</div>' +
              '<div id="home-cards-container" class="highlights-grid highlights-grid--4-items">' +
              '</div>' +
            '</div>' +
          '</section>'
        );
      },
      news: function () {
        return (
          '<section class="section linkedin-section reveal">' +
            '<div class="container--wide">' +
              '<div class="linkedin-feed">' +
                '<div class="section__header linkedin-section__header linkedin-section__header--compact">' +
                  '<h2 class="linkedin-section__title">' +
                    '<i class="fab fa-linkedin linkedin-section__title-icon" aria-hidden="true"></i>' +
                    '<span>Latest from LinkedIn</span>' +
                  '</h2>' +
                  '<a class="linkedin-section__corner-link" href="#/articles-blogs">Articles / Blogs <i class="fas fa-arrow-up-right-from-square"></i></a>' +
                '</div>' +
                '<div id="news-feed-container" class="linkedin-feed__grid">' +
                  '<div class="linkedin-feed__loading">' +
                    '<div class="linkedin-embed-card">' +
                      '<div class="linkedin-embed-card__shimmer">' +
                        '<div class="shimmer-bar shimmer-bar--header"></div>' +
                        '<div class="shimmer-bar shimmer-bar--text"></div>' +
                        '<div class="shimmer-bar shimmer-bar--text shimmer-bar--short"></div>' +
                        '<div class="shimmer-bar shimmer-bar--image"></div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="linkedin-embed-card">' +
                      '<div class="linkedin-embed-card__shimmer">' +
                        '<div class="shimmer-bar shimmer-bar--header"></div>' +
                        '<div class="shimmer-bar shimmer-bar--text"></div>' +
                        '<div class="shimmer-bar shimmer-bar--text shimmer-bar--short"></div>' +
                        '<div class="shimmer-bar shimmer-bar--image"></div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="linkedin-embed-card">' +
                      '<div class="linkedin-embed-card__shimmer">' +
                        '<div class="shimmer-bar shimmer-bar--header"></div>' +
                        '<div class="shimmer-bar shimmer-bar--text"></div>' +
                        '<div class="shimmer-bar shimmer-bar--text shimmer-bar--short"></div>' +
                        '<div class="shimmer-bar shimmer-bar--image"></div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</section>'
        );
      },
        clients: function () {
          return (
            '<section class="section reveal" id="clients">' +
              '<div class="container">' +
                '<div class="section__header">' +
                  '<h2 class="section__title">Our Clients &amp; Partners</h2>' +
                '</div>' +
              '</div>' +
            '<div class="client-logos">' +
                '<button class="client-logos__control client-logos__control--prev" type="button" aria-label="Show previous clients and partners">' +
                  '<span aria-hidden="true">&larr;</span>' +
                '</button>' +
                '<div class="client-logos__viewport">' +
                  '<div class="client-logo-track"></div>' +
                '</div>' +
                '<button class="client-logos__control client-logos__control--next" type="button" aria-label="Show next clients and partners">' +
                  '<span aria-hidden="true">&rarr;</span>' +
                '</button>' +
              '</div>' +
            '</section>'
          );
        },
      testimonialMap: function () {
        return '<div id="testimonial-map-root"></div>';
      }
    };

    // Render sections in configured order
    sectionOrder.forEach(function (key) {
      var builder = sectionBuilders[key];
      if (builder) html += builder();
    });

    // Append any sections not in the order array (safety net)
    defaultOrder.forEach(function (key) {
      if (sectionOrder.indexOf(key) === -1) {
        var builder = sectionBuilders[key];
        if (builder) html += builder();
      }
    });

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

    // Render the testimonial card deck
    loadTestimonialMap();

    // Initialize scroll reveal
    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    // Initialize hero canvas animation
    if (typeof window.initHeroCanvas === 'function') {
      window.initHeroCanvas();
    }

    // Return cleanup function for SPA router
    return function () {
      if (typeof window.cleanupTestimonialMap === 'function') {
        window.cleanupTestimonialMap();
      }
    };
  }

  function loadTestimonialMap() {
    if (typeof renderTestimonialMap === 'function') {
      renderTestimonialMap();
      return;
    }

    setTimeout(function () {
      if (typeof renderTestimonialMap === 'function') {
        renderTestimonialMap();
      }
    }, 50);
  }

  window.registerRoute('/', {
    render: renderHomePage,
    title: meta.title || 'Tridel Technologies',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-home'
  });
})();

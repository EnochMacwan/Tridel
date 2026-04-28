/**
 * Home Page Renderer (/)
 * Renders the home/index page: hero, stats, what-we-do, highlights,
 * news feed, clients, and testimonials.
 */
(function () {
  'use strict';

  var esc = escapeHtml;

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/']) || {};

  function cleanCopy(value) {
    return String(value || '')
      .replace(/\u00e2\u20ac\u201d/g, '-')
      .replace(/\u00e2\u20ac\u2018/g, '-');
  }

  function normalizeCapabilityLabel(title) {
    var text = String(title || '').toLowerCase();
    if (text.indexOf('hardware') !== -1) return 'Hardware';
    if (text.indexOf('software') !== -1) return 'Software';
    if (text.indexOf('survey') !== -1) return 'Surveys';
    if (text.indexOf('analytic') !== -1) return 'Analytics';
    return String(title || '').split(/\s+/).slice(0, 2).join(' ');
  }

  function buildHeroActionsHtml(cta) {
    var primary = (cta && cta.primaryBtn) || { text: 'Get in Touch', href: '#/contact', icon: 'fa-arrow-right' };
    var secondary = (cta && cta.secondaryBtn) || { text: 'Explore Products', href: '#/products' };

    return (
      '<div class="hero__actions" data-depth="4">' +
        '<a class="button button--primary hero__action" href="' + esc(primary.href) + '">' +
          '<span>' + esc(primary.text) + '</span>' +
          (primary.icon ? '<i class="fas ' + esc(primary.icon) + '" aria-hidden="true"></i>' : '') +
        '</a>' +
        '<a class="button button--secondary hero__action hero__action--ghost" href="' + esc(secondary.href) + '">' +
          '<span>' + esc(secondary.text) + '</span>' +
        '</a>' +
      '</div>'
    );
  }

  function buildHeroChipsHtml(whatWeDo) {
    var cards = (whatWeDo && Array.isArray(whatWeDo.cards)) ? whatWeDo.cards.slice(0, 4) : [];
    if (!cards.length) return '';

    return (
      '<div class="hero__chips" aria-label="Core capabilities" data-depth="4">' +
        cards.map(function (card) {
          return '<span class="hero__chip">' + esc(normalizeCapabilityLabel(card.title)) + '</span>';
        }).join('') +
      '</div>'
    );
  }

  function buildHeroPanelHtml(stats, whatWeDo) {
    var metrics = (stats || []).slice(0, 3).map(function (item) {
      return (
        '<div class="hero__panel-metric">' +
          '<strong>' + esc(String(item.target)) + (item.suffix ? esc(item.suffix) : '') + '</strong>' +
          '<span>' + esc(item.label) + '</span>' +
        '</div>'
      );
    }).join('');

    var signals = ((whatWeDo && whatWeDo.cards) || []).slice(0, 4).map(function (card) {
      return (
        '<li>' +
          '<span class="hero__signal-dot" aria-hidden="true"></span>' +
          '<span>' + esc(normalizeCapabilityLabel(card.title)) + '</span>' +
        '</li>'
      );
    }).join('');

    return (
      '<aside class="hero__panel" data-depth="3">' +
        '<h2 class="hero__panel-title">Field systems, survey execution, and analytics in one delivery loop.</h2>' +
        '<div class="hero__panel-metrics">' + metrics + '</div>' +
        '<ul class="hero__signals">' + signals + '</ul>' +
      '</aside>'
    );
  }

  function buildStatsHtml(stats) {
    var items = '';
    stats.forEach(function (s, index) {
      var suffixHtml = s.suffix ? '<span class="stat-suffix">' + esc(s.suffix) + '</span>' : '';
      items +=
        '<div class="stat-item reveal-child" style="--item-index:' + index + '">' +
          '<div class="stat-number" data-target="' + s.target + '">' + suffixHtml + '</div>' +
          '<div class="stat-label">' + esc(s.label) + '</div>' +
        '</div>';
    });
    return items;
  }

  function buildWhatWeDoHtml(data) {
    var cards = '';
    data.cards.forEach(function (card, index) {
      cards +=
        '<div class="value-prop-card reveal-child" style="--item-index:' + index + '">' +
          '<div class="value-prop-card__icon">' +
            '<i class="fas ' + esc(card.icon) + '"></i>' +
          '</div>' +
          '<h3 class="value-prop-card__title">' + esc(card.title) + '</h3>' +
          '<p class="value-prop-card__desc">' + esc(card.desc) + '</p>' +
        '</div>';
    });
    return (
      '<section class="section section--light-bg reveal reveal-group">' +
        '<div class="container">' +
          '<div class="section__header reveal-child">' +
            '<h2 class="section__title">' + esc(data.title) + '</h2>' +
            '<p class="section__subtitle">' + esc(data.subtitle) + '</p>' +
          '</div>' +
          '<div class="value-prop-grid">' + cards + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function buildWhyChooseHtml(data) {
    if (!data || !Array.isArray(data.reasons)) return '';

    var reasons = data.reasons.map(function (reason, index) {
      return (
        '<article class="home-trust__item reveal-child" style="--item-index:' + index + '" data-depth="4">' +
          '<div class="home-trust__icon"><i class="fas ' + esc(reason.icon) + '" aria-hidden="true"></i></div>' +
          '<span class="home-trust__index">0' + (index + 1) + '</span>' +
          '<h3>' + esc(cleanCopy(reason.title)) + '</h3>' +
          '<p>' + esc(cleanCopy(reason.desc)) + '</p>' +
        '</article>'
      );
    }).join('');

    return (
      '<section class="section home-trust reveal reveal-group" id="why-choose-tridel">' +
        '<div class="container--wide">' +
          '<div class="home-trust__layout">' +
            '<div class="home-trust__copy reveal-child" data-depth="4">' +
              '<p class="section-kicker">Why teams choose us</p>' +
              '<h2>' + esc(cleanCopy(data.title)) + '</h2>' +
              '<p>' + esc(cleanCopy(data.subtitle)) + '</p>' +
            '</div>' +
            '<div class="home-trust__grid">' + reasons + '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function buildCaseStudyHtml(data) {
    if (!data) return '';

    return (
      '<section class="section home-case-study reveal" id="featured-project">' +
        '<div class="container--wide">' +
          '<article class="home-case-study__layout">' +
            '<div class="home-case-study__media" data-depth="3">' +
              '<img loading="lazy" src="' + esc(data.image) + '" alt="' + esc(data.imageAlt || data.title) + '">' +
            '</div>' +
            '<div class="home-case-study__copy" data-depth="4">' +
              '<p class="section-kicker">' + esc(data.label || 'Featured Project') + '</p>' +
              '<h2>' + esc(data.title) + '</h2>' +
              '<p>' + esc(data.desc) + '</p>' +
              '<a class="button button--primary home-case-study__link" href="' + esc(data.linkHref || '#/success-stories') + '">' +
                '<span>' + esc(data.linkText || 'View Project') + '</span>' +
                '<i class="fas fa-arrow-right" aria-hidden="true"></i>' +
              '</a>' +
            '</div>' +
          '</article>' +
        '</div>' +
      '</section>'
    );
  }

  function buildCtaHtml(data) {
    if (!data) return '';
    var primary = data.primaryBtn || { text: 'Get in Touch', href: '#/contact', icon: 'fa-arrow-right' };
    var secondary = data.secondaryBtn || { text: 'Explore Products', href: '#/products' };

    return (
      '<section class="section home-cta reveal">' +
        '<div class="container">' +
          '<div class="home-cta__inner">' +
            '<p class="section-kicker">Start the conversation</p>' +
            '<h2>' + esc(data.title) + '</h2>' +
            '<p>' + esc(data.desc) + '</p>' +
            '<div class="home-cta__actions">' +
              '<a class="button button--primary" href="' + esc(primary.href) + '">' +
                '<span>' + esc(primary.text) + '</span>' +
                (primary.icon ? '<i class="fas ' + esc(primary.icon) + '" aria-hidden="true"></i>' : '') +
              '</a>' +
              '<a class="button button--secondary" href="' + esc(secondary.href) + '">' + esc(secondary.text) + '</a>' +
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

  function renderHomePage(mainEl) {
    var hero = (typeof INDEX_HERO !== 'undefined') ? INDEX_HERO : { title: 'Pioneering the Future of Maritime Intelligence', subtitle: 'We deliver integrated hardware, software, and services for the comprehensive maritime domain.' };
    var stats = (typeof INDEX_STATS !== 'undefined') ? INDEX_STATS : [];
    var whatWeDo = (typeof INDEX_WHAT_WE_DO !== 'undefined') ? INDEX_WHAT_WE_DO : null;
    var whyChoose = (typeof INDEX_WHY_CHOOSE !== 'undefined') ? INDEX_WHY_CHOOSE : null;
    var caseStudy = (typeof INDEX_CASE_STUDY !== 'undefined') ? INDEX_CASE_STUDY : null;
    var cta = (typeof INDEX_CTA !== 'undefined') ? INDEX_CTA : null;

    var html = '';

    // Default section order
    var defaultOrder = ['hero', 'stats', 'highlights', 'whatWeDo', 'whyChoose', 'caseStudy', 'news', 'clients', 'cta', 'testimonialMap'];
    var sectionOrder = (typeof INDEX_SECTION_ORDER !== 'undefined' && Array.isArray(INDEX_SECTION_ORDER) && INDEX_SECTION_ORDER.length)
      ? INDEX_SECTION_ORDER
      : defaultOrder;

    // Section builder map — each returns HTML string or ''
    var sectionBuilders = {
      hero: function () {
        if (!isSectionVisible('home', 'hero')) return '';
        return (
          '<section class="hero hero--graph-polish" data-home-hero>' +
            '<div class="hero__bg" data-depth="0">' +
              '<canvas id="hero-canvas" width="1920" height="1080"></canvas>' +
            '</div>' +
            '<div class="hero__chart-layer" data-depth="1" aria-hidden="true"></div>' +
            '<div class="hero__overlay"></div>' +
            '<div class="container hero__content">' +
              '<div class="hero__copy" data-depth="4">' +
                '<p class="hero__eyebrow">Environmental and maritime intelligence</p>' +
                '<h1 class="hero__title">' + esc(hero.title) + '</h1>' +
                '<p class="hero__subtitle">' + esc(hero.subtitle) + '</p>' +
                buildHeroActionsHtml(cta) +
                buildHeroChipsHtml(whatWeDo) +
              '</div>' +
              buildHeroPanelHtml(stats, whatWeDo) +
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
          '<section class="stats-bar reveal reveal-group">' +
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
      whyChoose: function () {
        if (!whyChoose || !isSectionVisible('home', 'whyChoose')) return '';
        return buildWhyChooseHtml(whyChoose);
      },
      caseStudy: function () {
        if (!caseStudy || !isSectionVisible('home', 'caseStudy')) return '';
        return buildCaseStudyHtml(caseStudy);
      },
      cta: function () {
        if (!cta || !isSectionVisible('home', 'cta')) return '';
        return buildCtaHtml(cta);
      },
      highlights: function () {
        return (
          '<section class="section reveal reveal-group" id="highlights">' +
            '<div class="container--wide">' +
              '<div class="section__header reveal-child">' +
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

/**
 * Testimonials Deck Loader
 * Renders the home-page testimonials section as a sliding card deck.
 *
 * Exports:
 *   window.renderTestimonialMap(container)
 *   window.cleanupTestimonialMap()
 */
(function () {
  'use strict';

  var _testimonialTimer = null;
  var _progressTimer = null;
  var _resizeHandler = null;
  var _scrollHandler = null;
  var _destroyed = false;

  function clearTimers() {
    if (_testimonialTimer) {
      clearInterval(_testimonialTimer);
      _testimonialTimer = null;
    }
    if (_progressTimer) {
      clearTimeout(_progressTimer);
      _progressTimer = null;
    }
  }

  function padNumber(num) {
    return String(num).padStart(2, '0');
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function getCardsPerView() {
    var width = window.innerWidth || document.documentElement.clientWidth || 1440;
    if (width <= 680) return 1;
    if (width <= 1180) return 2;
    return 3;
  }

  window.cleanupTestimonialMap = function () {
    _destroyed = true;
    clearTimers();

    if (_resizeHandler) {
      window.removeEventListener('resize', _resizeHandler);
      _resizeHandler = null;
    }

    var track = document.getElementById('testimonial-card-track');
    if (track && _scrollHandler) {
      track.removeEventListener('scroll', _scrollHandler);
      _scrollHandler = null;
    }
  };

  window.renderTestimonialMap = function (container) {
    if (!container) container = document.getElementById('testimonial-map-root');
    if (!container) return;

    window.cleanupTestimonialMap();
    _destroyed = false;

    var testimonials = typeof TESTIMONIALS_DATA !== 'undefined' ? TESTIMONIALS_DATA.slice() : [];
    testimonials.sort(function (a, b) {
      var nameA = String((a && a.name) || '').trim();
      var nameB = String((b && b.name) || '').trim();
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
    container.innerHTML = '';

    if (!testimonials.length) {
      container.innerHTML =
        '<section class="section section--light-bg reveal">' +
          '<div class="container">' +
            '<div class="section__header">' +
              '<h2 class="section__title">Testimonials</h2>' +
              '<p class="section__subtitle">No testimonials available at the moment.</p>' +
            '</div>' +
          '</div>' +
        '</section>';
      return;
    }

    var section = document.createElement('section');
    section.className = 'section section--light-bg reveal';
    section.id = 'testimonials-section';

    var cardsHtml = testimonials.map(function (item, index) {
      var logo = esc(item.logo || 'assets/images/logo/tridel.png');
      return (
        '<article class="testimonial-card testimonial-deck__card" data-index="' + index + '">' +
          '<div class="testimonial-card__header">' +
            '<img class="testimonial-card__logo" src="' + logo + '" alt="' + esc(item.name) + ' logo" onerror="this.onerror=null;this.src=\'assets/images/logo/tridel.png\'">' +
          '</div>' +
          '<div class="testimonial-card__content">' +
            '<div>' +
              '<div class="testimonial-deck__company">' + esc(item.name) + '</div>' +
              '<div class="testimonial-deck__location">' + esc(item.location) + '</div>' +
              '<p class="testimonial-card__quote">"' + esc(item.quote) + '"</p>' +
            '</div>' +
            '<div class="testimonial-card__author-info">' +
              '<div class="testimonial-author-name">' + esc(item.author) + '</div>' +
              '<div class="testimonial-author-title">' + esc(item.role) + '</div>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    section.innerHTML =
      '<div class="container--wide">' +
        '<div class="section__header">' +
          '<h2 class="section__title">Testimonials</h2>' +
          '<p class="section__subtitle">What clients, partners, and collaborators say about working with Tridel.</p>' +
        '</div>' +
        '<div class="testimonial-deck">' +
          '<div class="testimonial-deck__toolbar">' +
            '<div class="testimonial-deck__counter" aria-live="polite">' +
              '<span id="testimonial-current-count">01</span>' +
              '<span class="testimonial-deck__counter-separator">/</span>' +
              '<span>' + padNumber(testimonials.length) + '</span>' +
            '</div>' +
            '<div class="testimonial-deck__controls">' +
              '<button type="button" class="slider-btn testimonial-deck__btn" id="testimonial-prev" aria-label="Previous testimonials"><i class="fas fa-chevron-left"></i></button>' +
              '<button type="button" class="slider-btn testimonial-deck__btn" id="testimonial-next" aria-label="Next testimonials"><i class="fas fa-chevron-right"></i></button>' +
            '</div>' +
          '</div>' +
          '<div class="testimonial-scroll-container testimonial-deck__track" id="testimonial-card-track">' +
            cardsHtml +
          '</div>' +
          '<div class="testimonial-deck__progress">' +
            '<div class="testimonial-deck__progress-fill" id="testimonial-progress-fill"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    container.appendChild(section);

    var track = document.getElementById('testimonial-card-track');
    var cards = Array.prototype.slice.call(track.querySelectorAll('.testimonial-deck__card'));
    var counterEl = document.getElementById('testimonial-current-count');
    var progressEl = document.getElementById('testimonial-progress-fill');
    var prevBtn = document.getElementById('testimonial-prev');
    var nextBtn = document.getElementById('testimonial-next');
    var activeIndex = 0;
    var autoplayDelay = 5000;

    function setActiveCard(index) {
      activeIndex = index;
      cards.forEach(function (card, cardIndex) {
        card.classList.toggle('is-active', cardIndex === index);
      });
      if (counterEl) {
        counterEl.textContent = padNumber(index + 1);
      }
    }

    function scrollToIndex(index, behavior) {
      var clamped = Math.max(0, Math.min(index, cards.length - 1));
      var card = cards[clamped];
      if (!card) return;

      setActiveCard(clamped);
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: behavior || 'smooth'
      });
    }

    function resetProgress() {
      if (!progressEl) return;
      progressEl.style.transition = 'none';
      progressEl.style.width = '0%';
      if (_progressTimer) clearTimeout(_progressTimer);
      _progressTimer = setTimeout(function () {
        if (_destroyed) return;
        progressEl.style.transition = 'width ' + autoplayDelay + 'ms linear';
        progressEl.style.width = '100%';
        _progressTimer = null;
      }, 40);
    }

    function startAutoplay() {
      clearTimers();
      resetProgress();
      _testimonialTimer = setInterval(function () {
        var nextIndex = activeIndex + getCardsPerView();
        if (nextIndex >= cards.length) {
          nextIndex = 0;
        }
        scrollToIndex(nextIndex, 'smooth');
        resetProgress();
      }, autoplayDelay);
    }

    function syncToNearestCard() {
      if (!cards.length) return;
      var nearestIndex = 0;
      var smallestDistance = Infinity;

      cards.forEach(function (card, index) {
        var distance = Math.abs(card.offsetLeft - track.scrollLeft - track.offsetLeft);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveCard(nearestIndex);
    }

    prevBtn.addEventListener('click', function () {
      var nextIndex = activeIndex - getCardsPerView();
      if (nextIndex < 0) nextIndex = 0;
      scrollToIndex(nextIndex, 'smooth');
      startAutoplay();
    });

    nextBtn.addEventListener('click', function () {
      var nextIndex = activeIndex + getCardsPerView();
      if (nextIndex >= cards.length) nextIndex = 0;
      scrollToIndex(nextIndex, 'smooth');
      startAutoplay();
    });

    _scrollHandler = function () {
      syncToNearestCard();
    };
    track.addEventListener('scroll', _scrollHandler, { passive: true });

    track.addEventListener('mouseenter', clearTimers);
    track.addEventListener('mouseleave', startAutoplay);

    _resizeHandler = function () {
      scrollToIndex(activeIndex, 'auto');
    };
    window.addEventListener('resize', _resizeHandler);

    setActiveCard(0);
    scrollToIndex(0, 'auto');
    startAutoplay();

    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }
  };

  (function () {
    var container = document.getElementById('testimonial-map-root');
    if (container) {
      window.renderTestimonialMap(container);
    }
  })();
})();

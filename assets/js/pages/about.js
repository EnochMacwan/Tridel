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

  function getWhoWeAreGallery(whoWeAre) {
    var gallery = Array.isArray(whoWeAre.gallery)
      ? whoWeAre.gallery.map(function (item) { return String(item || '').trim(); }).filter(Boolean)
      : [];

    if (!gallery.length && whoWeAre.image) {
      gallery = [String(whoWeAre.image).trim()];
    }

    return gallery;
  }

  function renderWhoWeAreMedia(whoWeAre) {
    var gallery = getWhoWeAreGallery(whoWeAre);
    var altText = esc(whoWeAre.imageAlt || 'The Tridel team');

    if (gallery.length <= 1) {
      return (
        '<div class="about-who-we-are-media">' +
          '<img loading="lazy" alt="' + altText + '" class="about-who-we-are-image" src="' + esc(gallery[0] || 'assets/images/team/team.jpg') + '">' +
        '</div>'
      );
    }

    return (
      '<div class="about-who-we-are-media">' +
        '<div class="about-who-we-are-slider" data-about-slider>' +
          '<div class="about-who-we-are-slider__viewport">' +
            gallery.map(function (src, index) {
              return (
                '<figure class="about-who-we-are-slide' + (index === 0 ? ' is-active' : '') + '" data-about-slide="' + index + '">' +
                  '<img loading="lazy" alt="' + altText + '" class="about-who-we-are-image" src="' + esc(src) + '">' +
                '</figure>'
              );
            }).join('') +
          '</div>' +
          '<div class="about-who-we-are-slider__controls">' +
            '<button type="button" class="about-who-we-are-slider__control about-who-we-are-slider__control--prev" aria-label="Show previous group photo">' +
              '<i class="fas fa-arrow-left"></i>' +
            '</button>' +
            '<div class="about-who-we-are-slider__dots">' +
              gallery.map(function (_, index) {
                return (
                  '<button type="button" class="about-who-we-are-slider__dot' + (index === 0 ? ' is-active' : '') + '" data-about-dot="' + index + '" aria-label="Show group photo ' + (index + 1) + '"></button>'
                );
              }).join('') +
            '</div>' +
            '<button type="button" class="about-who-we-are-slider__control about-who-we-are-slider__control--next" aria-label="Show next group photo">' +
              '<i class="fas fa-arrow-right"></i>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function setupWhoWeAreSlider(root) {
    var slider = root.querySelector('[data-about-slider]');
    if (!slider) return null;

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-about-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-about-dot]'));
    var prevButton = slider.querySelector('.about-who-we-are-slider__control--prev');
    var nextButton = slider.querySelector('.about-who-we-are-slider__control--next');
    var activeIndex = 0;
    var autoplayId = null;

    if (slides.length <= 1) return null;

    function renderActiveSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        var isActive = index === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function resetAutoplay() {
      if (autoplayId) {
        window.clearInterval(autoplayId);
      }
      autoplayId = window.setInterval(function () {
        renderActiveSlide(activeIndex + 1);
      }, 4200);
    }

    function onPrevClick() {
      renderActiveSlide(activeIndex - 1);
      resetAutoplay();
    }

    function onNextClick() {
      renderActiveSlide(activeIndex + 1);
      resetAutoplay();
    }

    function onDotClick(event) {
      var button = event.currentTarget;
      var nextIndex = parseInt(button.getAttribute('data-about-dot'), 10);
      if (isNaN(nextIndex)) return;
      renderActiveSlide(nextIndex);
      resetAutoplay();
    }

    if (prevButton) prevButton.addEventListener('click', onPrevClick);
    if (nextButton) nextButton.addEventListener('click', onNextClick);
    dots.forEach(function (dot) { dot.addEventListener('click', onDotClick); });

    renderActiveSlide(0);
    resetAutoplay();

    return function cleanupSlider() {
      if (autoplayId) {
        window.clearInterval(autoplayId);
      }
      if (prevButton) prevButton.removeEventListener('click', onPrevClick);
      if (nextButton) nextButton.removeEventListener('click', onNextClick);
      dots.forEach(function (dot) { dot.removeEventListener('click', onDotClick); });
    };
  }

  function render(mainEl) {
    var data = (typeof ABOUT_DATA !== 'undefined') ? ABOUT_DATA : {};
    var header = data.pageHeader || {};
    var whoWeAre = data.whoWeAre || {};
    var html = '';

    if (isSectionVisible('about', 'pageHeader')) {
      html += window.renderPageHeader({
        title: header.title || 'Pioneering the Future of Maritime Intelligence',
        subtitle: header.subtitle || 'We are a team of engineers, scientists, and hydrographers dedicated to solving complex challenges in the marine environment.',
        breadcrumbs: [
          { label: 'Home', href: '#/' },
          { label: 'About Us' }
        ]
      });
    }

    if (isSectionVisible('about', 'whoWeAre')) {
      html +=
        '<section class="section about-who-we-are-section reveal" id="who-we-are">' +
          '<div class="container--wide">' +
            '<div class="about-who-we-are-layout">' +
              renderWhoWeAreMedia(whoWeAre) +
              '<div class="about-who-we-are-copy">' +
                '<h2 class="sr-only">' + esc(whoWeAre.title || 'Who We Are') + '</h2>' +
                '<p class="about-who-we-are-text">' + esc(whoWeAre.text || '') + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>';
    }

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

    if (typeof renderTeamGrid === 'function') {
      renderTeamGrid();
    }

    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    if (typeof window.initHeroCanvas === 'function') {
      window.initHeroCanvas();
    }

    return setupWhoWeAreSlider(mainEl);
  }

  window.registerRoute('/about', {
    render: render,
    title: meta.title || 'About Us | TRIDEL',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-about'
  });
})();

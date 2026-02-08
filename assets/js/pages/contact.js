/**
 * Contact Page Renderer (/contact)
 * Renders the contact page with info cards, form, FAQ, and testimonial map.
 */
(function () {
  'use strict';

  var esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  };

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/contact']) || {};

  function buildInfoCards(cards) {
    var html = '';
    cards.forEach(function (card) {
      html +=
        '<div class="contact-info-card">' +
          '<div class="contact-info-card__icon">' +
            '<i class="fas ' + esc(card.icon) + '"></i>' +
          '</div>' +
          '<h3 class="contact-info-card__title">' + esc(card.title) + '</h3>' +
          '<p class="contact-info-card__detail">' + card.detail + '</p>' +
        '</div>';
    });
    return '<div class="contact-info-grid">' + html + '</div>';
  }

  function render(mainEl) {
    var infoCards = (typeof CONTACT_INFO_CARDS !== 'undefined') ? CONTACT_INFO_CARDS : [];
    var faqData = (typeof CONTACT_FAQ_DATA !== 'undefined') ? CONTACT_FAQ_DATA : [];

    var html = '';

    // Page header with breadcrumb
    html += window.renderPageHeader({
      title: 'Contact Us',
      subtitle: 'We\'re here to help. Reach out to us with any questions or enquiries about our solutions.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Contact Us' }
      ]
    });

    // Contact info + form section
    html += '<section class="section reveal"><div class="container">';

    // Info cards
    if (infoCards.length) {
      html += buildInfoCards(infoCards);
    }

    // Contact form
    html += '<div style="max-width: 700px; margin: 0 auto;">';
    html += window.renderForm({
      title: 'Send Us a Message',
      action: 'https://formsubmit.co/geminibaba1@gmail.com',
      method: 'POST',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          type: 'email',
          name: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'your@email.com'
        },
        {
          type: 'select',
          name: 'interest',
          label: "I'm interested in...",
          required: true,
          placeholder: 'Select an option',
          options: [
            'Product Enquiry',
            'Service Enquiry',
            'Custom Solution',
            'Partnership',
            'General Question'
          ]
        },
        {
          type: 'textarea',
          name: 'message',
          label: 'Message',
          required: true,
          placeholder: 'How can we help you?',
          rows: 5
        }
      ],
      submitText: 'Send Message'
    });
    html += '</div>';

    html += '</div></section>';

    // FAQ section
    if (faqData.length) {
      html +=
        '<section class="section section--light-bg reveal">' +
          '<div class="container">' +
            window.renderFaqAccordion(faqData) +
          '</div>' +
        '</section>';
    }

    // Testimonial map root
    html += '<div id="testimonial-map-root"></div>';

    mainEl.innerHTML = html;

    // Initialize FAQ accordion
    if (faqData.length && typeof window.initFaqAccordion === 'function') {
      window.initFaqAccordion();
    }

    // Lazy-load Leaflet and testimonial map
    loadTestimonialMap();

    // Initialize scroll reveal
    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    // Initialize hero canvas
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
    // Check if Leaflet is already loaded
    if (typeof L !== 'undefined') {
      if (typeof renderTestimonialMap === 'function') {
        renderTestimonialMap();
      }
      return;
    }

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = function () {
      if (typeof renderTestimonialMap === 'function') {
        renderTestimonialMap();
      }
    };
    document.head.appendChild(script);
  }

  window.registerRoute('/contact', {
    render: render,
    title: meta.title || 'Contact Us | TRIDEL',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-contact'
  });
})();

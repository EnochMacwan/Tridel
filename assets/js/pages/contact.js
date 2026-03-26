/**
 * Contact Page Renderer (/contact)
 * Sapthavarna-style two-column layout: form card (left) + sidebar (right)
 * With interactive Apple-style offices map
 */
(function () {
  'use strict';

  var esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  };

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/contact']) || {};

  function isExternalUrl(value) {
    return typeof value === 'string' && /^(https?:)?\/\//i.test(value);
  }

  // ── Map state for cleanup ──
  var _contactMapInstance = null;
  var _mapResizeTimeout = null;

  function buildSectorOptions(options) {
    var html = '<option value="">Select an option...</option>';
    options.forEach(function (opt) {
      html += '<option value="' + esc(opt) + '">' + esc(opt) + '</option>';
    });
    return html;
  }

  function buildContactInfoCards(cards) {
    if (!cards || !cards.length) return '';

    var html = '<div class="contact-sidebar-card">';
    cards.forEach(function (card) {
      var iconClass = (card.icon || '').trim();
      if (!iconClass) {
        iconClass = 'fas fa-circle-info';
      } else if (!/^(fas|far|fab|fal|fad|fa-solid|fa-regular|fa-brands)\s/.test(iconClass)) {
        iconClass = 'fas ' + iconClass;
      }

      html +=
        '<div class="contact-info-item">' +
          '<div class="contact-info-icon"><i class="' + esc(iconClass) + '"></i></div>' +
          '<div>' +
            '<h4>' + esc(card.title || 'Info') + '</h4>' +
            '<div class="contact-info-copy">' + (card.detail || '') + '</div>' +
          '</div>' +
        '</div>';
    });
    html += '</div>';

    return html;
  }

  function buildOfficesMapCard(label, locations) {
    var html = '';
    html += '<div class="contact-sidebar-card contact-offices-map-card">';
    html += '<div class="contact-section-label">' + esc(label) + '</div>';
    html += '<div class="offices-map-wrapper"><div id="contact-offices-map" class="offices-map"></div></div>';
    html += '<div class="offices-card-list">';

    // Group locations by country
    var grouped = {};
    locations.forEach(function (loc) {
      var country = loc.country || 'Other';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(loc);
    });

    var preferredOrder = ['Australia', 'India', 'UAE'];
    var otherCountries = Object.keys(grouped).filter(function (country) {
      return preferredOrder.indexOf(country) === -1;
    });
    var sortedCountries = preferredOrder.concat(otherCountries);

    sortedCountries.forEach(function (country) {
      if (!grouped[country]) return;

      html += '<div class="office-country-group">';
      html += '<div class="office-country-label">' + esc(country) + '</div>';

      grouped[country].forEach(function (loc) {
        var officeName = loc.name || loc.companyName;
        var officeDesignation = loc.designation || loc.type || '';
        var iconClass = loc.type === 'Factory' ? 'fa-industry' :
                        loc.type === 'Registered Office' ? 'fa-landmark' : 'fa-building';

        html +=
          '<div class="office-card" data-location-id="' + esc(loc.id) + '" ' +
               'data-lat="' + parseFloat(loc.lat) + '" data-lng="' + parseFloat(loc.lng) + '" tabindex="0" role="button">' +
            '<div class="office-card-icon"><i class="fas ' + iconClass + '"></i></div>' +
            '<div class="office-card-body">' +
              '<div class="office-card-name">' + esc(officeName) + '</div>' +
              (officeDesignation ? '<div class="office-card-meta">' + esc(officeDesignation) + '</div>' : '') +
            '</div>' +
          '</div>';
      });

      html += '</div>';
    });

    html += '</div></div>';
    return html;
  }

  function scrollToContactForm() {
    var formCard = document.getElementById('project-enquiry-card');
    if (!formCard) return;

    var headerOffset = 96;
    var top = formCard.getBoundingClientRect().top + window.scrollY - headerOffset;

    if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
      window.__lenis.scrollTo(Math.max(0, top), { force: true });
    } else {
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }

  function applyContactRouteParams(params) {
    if (!params) return;

    var subjectField = document.querySelector('#contact-form input[name="_subject"]');
    if (subjectField && params.subject) {
      subjectField.value = params.subject;
    }

    if (params.focus === 'form' || params.subject) {
      setTimeout(scrollToContactForm, 120);
    }
  }

  function render(mainEl, params) {
    var config = (typeof CONTACT_PAGE_CONFIG !== 'undefined') ? CONTACT_PAGE_CONFIG : {};
    var infoCards = (typeof CONTACT_INFO_CARDS !== 'undefined' && Array.isArray(CONTACT_INFO_CARDS)) ? CONTACT_INFO_CARDS : [];
    var faqData = (typeof CONTACT_FAQ_DATA !== 'undefined') ? CONTACT_FAQ_DATA : [];

    var hero = config.hero || {};
    var enquiry = config.enquiry || {};
    var contactSocial = (typeof CONTACT_DATA !== 'undefined' && CONTACT_DATA && CONTACT_DATA.social) ? CONTACT_DATA.social : {};
    var offices = config.offices || { label: 'Our Offices', locations: [] };
    var guarantee = config.responseGuarantee || {};
    var sectorOpts = config.sectorOptions || ['Product Enquiry', 'Service Enquiry', 'Custom Solution', 'Partnership', 'General Question'];
    var linkedInUrl = enquiry.linkedinUrl ||
      contactSocial.linkedin ||
      (isExternalUrl(enquiry.linkedin) ? enquiry.linkedin : '') ||
      ((typeof FOOTER_DATA !== 'undefined' && FOOTER_DATA && FOOTER_DATA.linkedIn) ? FOOTER_DATA.linkedIn : '') ||
      '#';
    var linkedInLabel = enquiry.linkedinLabel ||
      (!isExternalUrl(enquiry.linkedin) && enquiry.linkedin ? enquiry.linkedin : '') ||
      'Tridel Technologies';

    var html = '';

    // Page header with breadcrumb
    if (isSectionVisible('contact', 'hero'))
    html += window.renderPageHeader({
      title: hero.title || 'Contact Us',
      subtitle: hero.subtitle || "We're here to help. Reach out to us with any questions or enquiries about our solutions.",
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Contact Us' }
      ]
    });

    // ── Form + Sidebar Section ──
    var showForm = isSectionVisible('contact', 'form');
    var showInfoCards = isSectionVisible('contact', 'infoCards');
    var showMap = isSectionVisible('contact', 'map');

    if (showForm || showInfoCards || showMap) {
    html += '<section class="section reveal"><div class="container">';
    html += '<div class="contact-form-layout">';

    // ── LEFT: Form Card ──
    if (showForm)
    html +=
      '<div class="contact-form-card" id="project-enquiry-card">' +
        '<div class="contact-section-label">Send us a Message</div>' +
        '<form id="contact-form" class="contact-form" action="' + esc(enquiry.formAction || '#') + '" method="POST">' +
          '<input type="hidden" name="_subject" value="New Contact Message - Tridel Website">' +
          '<input type="hidden" name="_captcha" value="false">' +
          '<input type="hidden" name="_template" value="table">' +
          '<div class="contact-form-row">' +
            '<div class="form-group">' +
              '<label for="contact-name">Full Name <span class="required">*</span></label>' +
              '<input type="text" id="contact-name" name="name" class="form-input" placeholder="John Smith" required>' +
              '<span class="form-error">Please enter your name</span>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="contact-company">Company / Organisation</label>' +
              '<input type="text" id="contact-company" name="company" class="form-input" placeholder="Your company name">' +
            '</div>' +
          '</div>' +
          '<div class="contact-form-row">' +
            '<div class="form-group">' +
              '<label for="contact-email">Email Address <span class="required">*</span></label>' +
              '<input type="email" id="contact-email" name="email" class="form-input" placeholder="john@company.com" required>' +
              '<span class="form-error">Please enter a valid email</span>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="contact-phone">Phone Number</label>' +
              '<input type="tel" id="contact-phone" name="phone" class="form-input" placeholder="+971 5XX XXXX">' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="contact-sector">Sector of Interest</label>' +
            '<select id="contact-sector" name="interest" class="form-input form-select">' +
              buildSectorOptions(sectorOpts) +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="contact-message">Message <span class="required">*</span></label>' +
            '<textarea id="contact-message" name="message" class="form-input form-textarea" placeholder="Share your requirements, questions, or message..." required></textarea>' +
            '<span class="form-error">Please enter your message</span>' +
          '</div>' +
          '<button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> Send Message</button>' +
        '</form>' +
        '<div id="contact-success" class="eoi-success" style="display:none;">' +
          '<i class="fas fa-check-circle"></i>' +
          '<h3>Message Sent!</h3>' +
          '<p>Thank you for reaching out. Our team will review your enquiry and get back to you within 24\u201348 hours.</p>' +
        '</div>' +
      '</div>';

    // ── RIGHT: Sidebar ──
    if (showInfoCards) {
    html += '<div class="contact-sidebar">';

    // Response guarantee
    if (guarantee.title) {
      html +=
        '<div class="response-guarantee">' +
          '<i class="fas fa-clock"></i>' +
          '<div>' +
            '<h4>' + esc(guarantee.title) + '</h4>' +
            '<p>' + esc(guarantee.desc || '') + '</p>' +
          '</div>' +
        '</div>';
    }

    html += buildContactInfoCards(infoCards);

    // Contact info card
    html +=
      '<div class="contact-sidebar-card">' +
        '<div class="contact-info-item">' +
          '<div class="contact-info-icon"><i class="fas fa-envelope"></i></div>' +
          '<div>' +
            '<h4>Email Us</h4>' +
            '<a href="mailto:' + esc(enquiry.email || '') + '" class="contact-link-item">' + esc(enquiry.email || '') + '</a>' +
          '</div>' +
        '</div>';

    if (config.phone) {
      html +=
        '<div class="contact-info-item">' +
          '<div class="contact-info-icon"><i class="fas fa-phone"></i></div>' +
          '<div>' +
            '<h4>Call Us</h4>' +
            '<a href="tel:' + esc(config.phone.replace(/\s/g, '')) + '" class="contact-link-item">' + esc(config.phone) + '</a>' +
          '</div>' +
        '</div>';
    }

    html +=
        '<div class="contact-info-item">' +
          '<div class="contact-info-icon"><i class="fab fa-linkedin"></i></div>' +
          '<div>' +
            '<h4>LinkedIn</h4>' +
            '<a href="' + esc(linkedInUrl) + '" target="_blank" rel="noopener noreferrer" class="contact-link-item">' + esc(linkedInLabel) + '</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    html += '</div>'; // end sidebar
    } // end showInfoCards

    html += '</div>'; // end contact-form-layout

    // Offices map card — full-width below the form layout
    if (offices.locations.length && showMap) {
      html += buildOfficesMapCard(offices.label, offices.locations);
    }

    html += '</div></section>'; // end section
    } // end if (showForm || showInfoCards || showMap)

    // ── FAQ Section ──
    if (faqData.length && isSectionVisible('contact', 'faq')) {
      html +=
        '<section class="section section--light-bg reveal">' +
          '<div class="container">' +
            window.renderFaqAccordion(faqData) +
          '</div>' +
        '</section>';
    }

    mainEl.innerHTML = html;

    // Initialize FAQ accordion
    if (faqData.length && typeof window.initFaqAccordion === 'function') {
      window.initFaqAccordion();
    }

    // Initialize form validation
    initContactForm();
    applyContactRouteParams(params);

    // Initialize offices map
    if (offices.locations.length) {
      initOfficesMap(offices.locations);
    }

    // Initialize scroll reveal
    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    // Initialize hero canvas
    if (typeof window.initHeroCanvas === 'function') {
      window.initHeroCanvas();
    }

    // Return cleanup for SPA router
    return cleanupOfficesMap;
  }

  // ── Interactive Offices Map ──

  function initOfficesMap(locations) {
    if (!locations || !locations.length) return;

    var mapEl = document.getElementById('contact-offices-map');
    if (!mapEl) return;

    function ensureLeaflet(cb) {
      if (typeof L !== 'undefined') return cb();

      // Load Leaflet CSS
      if (!document.querySelector('link[href$="assets/vendor/leaflet/leaflet.css"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/vendor/leaflet/leaflet.css';
        document.head.appendChild(link);
      }

      var script = document.createElement('script');
      script.src = 'assets/vendor/leaflet/leaflet.js';
      script.onload = cb;
      document.head.appendChild(script);
    }

    ensureLeaflet(function () {
      // Bail if element was removed during async load (SPA navigation)
      if (!document.getElementById('contact-offices-map')) return;

      // Offset duplicate Vadodara coordinates slightly
      var adjustedLocs = locations.map(function (loc) {
        return { id: loc.id, lat: loc.lat, lng: loc.lng };
      });
      var seen = {};
      adjustedLocs.forEach(function (loc) {
        var key = loc.lat + ',' + loc.lng;
        if (seen[key]) {
          loc.lat = loc.lat + 0.15;
          loc.lng = loc.lng + 0.15;
        }
        seen[key] = true;
      });

      // Compute bounds
      var bounds = L.latLngBounds(adjustedLocs.map(function (loc) {
        return [loc.lat, loc.lng];
      }));

      var map = L.map('contact-offices-map', {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
        dragging: true,
        doubleClickZoom: true
      }).fitBounds(bounds.pad(0.3));

      _contactMapInstance = map;
      map.zoomControl.setPosition('bottomright');

      // Satellite tiles (Esri World Imagery)
      var satelliteTiles = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      var tileLayer = L.tileLayer(satelliteTiles, {
        maxZoom: 18,
        attribution: ''
      }).addTo(map);

      // Apple-style circle pin markers
      function createPin(active) {
        var size = active ? 28 : 18;
        var bg = active ? '#ffffff' : '#00AAE7';
        var border = active ? '3px solid #00AAE7' : '2px solid #fff';
        var inner = active ? 10 : 6;
        var innerBg = active ? '#00AAE7' : '#fff';
        var shadow = active ? '0 2px 10px rgba(0,170,231,0.4)' : '0 2px 6px rgba(0,0,0,0.2)';

        return L.divIcon({
          className: 'offices-map-pin',
          html: '<div style="' +
            'width:' + size + 'px;height:' + size + 'px;' +
            'background:' + bg + ';' +
            'border-radius:50%;' +
            'border:' + border + ';' +
            'box-shadow:' + shadow + ';' +
            'display:flex;align-items:center;justify-content:center;' +
            'transition:all 0.3s cubic-bezier(0.4,0,0.2,1);' +
          '"><div style="' +
            'width:' + inner + 'px;height:' + inner + 'px;' +
            'background:' + innerBg + ';' +
            'border-radius:50%;' +
          '"></div></div>',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });
      }

      var pinNormal = createPin(false);
      var pinActive = createPin(true);

      // Create markers
      var markers = {};
      adjustedLocs.forEach(function (loc) {
        var marker = L.marker([loc.lat, loc.lng], { icon: pinNormal }).addTo(map);
        markers[loc.id] = marker;

        marker.on('click', function () {
          setActiveLocation(loc.id);
        });
      });

      // Active state management
      var activeId = null;

      function setActiveLocation(id) {
        // Reset previous
        if (activeId && markers[activeId]) {
          markers[activeId].setIcon(pinNormal);
          markers[activeId].setZIndexOffset(0);
        }
        var prevCard = document.querySelector('.office-card.active');
        if (prevCard) prevCard.classList.remove('active');

        // Set new active
        activeId = id;
        if (markers[id]) {
          markers[id].setIcon(pinActive);
          markers[id].setZIndexOffset(1000);
          var ll = markers[id].getLatLng();
          map.flyTo(ll, 8, { animate: true, duration: 1200 });
        }

        var escapedId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/(["\\])/g, '\\$1');
        var newCard = document.querySelector('.office-card[data-location-id="' + escapedId + '"]');
        if (newCard) {
          newCard.classList.add('active');
          newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      // Wire up card clicks
      var cards = document.querySelectorAll('.office-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          setActiveLocation(card.getAttribute('data-location-id'));
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveLocation(card.getAttribute('data-location-id'));
          }
        });
      });

      // Fix tile rendering for initially hidden containers
      _mapResizeTimeout = setTimeout(function () {
        map.invalidateSize();
      }, 250);

      // Store cleanup reference
      _contactMapInstance = map;
    });
  }

  function cleanupOfficesMap() {
    if (_mapResizeTimeout) {
      clearTimeout(_mapResizeTimeout);
      _mapResizeTimeout = null;
    }
    if (_contactMapInstance) {
      _contactMapInstance.remove();
      _contactMapInstance = null;
    }
  }

  // ── Form Validation ──

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(input);
      });
      input.addEventListener('input', function () {
        if (input.classList.contains('invalid')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      var valid = true;
      requiredInputs.forEach(function (input) {
        if (!validateField(input)) valid = false;
      });
      if (!valid) {
        e.preventDefault();
        return;
      }

      if (typeof window.trackSiteEnquiry === 'function') {
        window.trackSiteEnquiry({
          path: '/contact',
          interest: (form.querySelector('[name="interest"]') || {}).value || 'General'
        });
      }
    });
  }

  function validateField(input) {
    var value = (input.value || '').trim();
    var isValid = true;

    if (input.hasAttribute('required') && !value) {
      isValid = false;
    }
    if (input.type === 'email' && value) {
      isValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
    }

    if (isValid) {
      input.classList.remove('invalid');
      input.classList.add('valid');
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
    }
    return isValid;
  }

  window.registerRoute('/contact', {
    render: render,
    title: meta.title || 'Contact Us | TRIDEL',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-contact'
  });
})();

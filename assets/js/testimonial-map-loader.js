/**
 * Testimonial Map Loader
 * Dynamically generates the Global Client Stories map section
 * Dependencies: testimonials-data.js (TESTIMONIALS_DATA), Leaflet.js
 *
 * Exports:
 *   window.renderTestimonialMap(container)
 */

/**
 * Renders the Testimonial Map into the given container.
 * Exported as window.renderTestimonialMap for SPA router usage.
 *
 * @param {HTMLElement} container - The DOM element to render into (e.g. #testimonial-map-root)
 */
// Internal state for cleanup
var _mapTimer = null;
var _mapInstance = null;

window.cleanupTestimonialMap = function() {
  if (_mapTimer) { clearInterval(_mapTimer); _mapTimer = null; }
  if (_mapInstance) { _mapInstance.remove(); _mapInstance = null; }
};

window.renderTestimonialMap = function(container) {
  if (!container) container = document.getElementById('testimonial-map-root');
  if (!container) return;
  window.cleanupTestimonialMap();

  // --- Build DOM ---
  container.innerHTML = '';

  var section = document.createElement('section');
  section.className = 'section section--light-bg reveal';
  section.id = 'map-section';

  section.innerHTML =
    '<div class="container--wide">' +
      '<div class="section__header">' +
        '<h2 class="section__title">Global Client Stories</h2>' +
        '<p class="section__subtitle">Exploring our impact across the world.</p>' +
      '</div>' +
      '<div class="testimonials">' +
        '<div id="map-container-section">' +
          '<div id="map-hero-canvas"></div>' +
          '<div id="map-sidebar">' +
            '<div id="map-testimonial-content" class="map-testimonial-display active">' +
              '<img id="t-logo" src="assets/images/logo/tridel.png" alt="Logo" class="map-card-logo">' +
              '<p id="t-quote" class="map-card-quote"></p>' +
              '<div id="t-author" class="map-card-author"></div>' +
              '<div id="t-role" class="map-card-role"></div>' +
            '</div>' +
            '<div class="map-controls">' +
              '<button type="button" class="map-nav-btn" id="map-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>' +
              '<button type="button" class="map-nav-btn" id="map-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>' +
            '</div>' +
            '<div class="map-progress-bar">' +
              '<div id="progress" class="map-progress-fill"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  container.appendChild(section);

  // Re-run scroll reveal to observe this newly added .reveal element
  if (typeof window.initScrollReveal === 'function') {
    window.initScrollReveal();
  }

  // --- Wait for Leaflet ---
  function waitForLeaflet(cb) {
    if (typeof L !== 'undefined') return cb();
    var checks = 0;
    var interval = setInterval(function () {
      checks++;
      if (typeof L !== 'undefined') { clearInterval(interval); cb(); }
      if (checks > 100) { clearInterval(interval); console.warn('Leaflet not loaded'); }
    }, 100);
  }

  waitForLeaflet(function () {
    var mapEl = document.getElementById('map-hero-canvas');
    if (!mapEl) return;

    var map = L.map('map-hero-canvas', { zoomControl: true }).setView([25.0, 55.0], 3);
    _mapInstance = map;
    map.zoomControl.setPosition('bottomright');

    var lightTiles = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    var darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    var tileLayer = L.tileLayer(lightTiles, { attribution: '&copy;OpenStreetMap, &copy;CartoDB' }).addTo(map);
    var geoJsonLayer = null;

    function updateMapTheme(theme) {
      var isDark = theme === 'dark';
      tileLayer.setUrl(isDark ? darkTiles : lightTiles);
      var mc = document.getElementById('map-container-section');
      if (mc) {
        mc.style.background = isDark ? 'var(--color-surface-dark, #001220)' : 'var(--color-surface-pure, #f8f9fa)';
        mc.style.color = isDark ? 'white' : 'var(--color-text-main, #333)';
      }
      if (geoJsonLayer) {
        geoJsonLayer.setStyle({ color: isDark ? '#4a4a4a' : '#cbd5e0', weight: 1.5, opacity: 0.8 });
      }
    }

    updateMapTheme(document.documentElement.getAttribute('data-theme') || 'light');
    window.addEventListener('themeChanged', function (e) { updateMapTheme(e.detail.theme); });

    // India GeoJSON overlay (Survey of India compliance)
    fetch('https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson')
      .then(function (r) { 
        if (!r.ok) throw new Error('Network response was not ok');
        return r.json(); 
      })
      .then(function (data) {
        try {
            if (!data || !data.type) throw new Error('Invalid GeoJSON data');
            geoJsonLayer = L.geoJSON(data, { style: { color: '#cbd5e0', weight: 1.5, opacity: 0.8, fillOpacity: 0 } }).addTo(map);
            updateMapTheme(document.documentElement.getAttribute('data-theme') || 'light');
        } catch (e) {
            console.warn('Failed to render India GeoJSON overlay:', e);
        }
      })
      .catch(function (err) { console.log('Error loading India GeoJSON:', err); });

    // Testimonials
    var testimonials = typeof TESTIMONIALS_DATA !== 'undefined' ? TESTIMONIALS_DATA : [];
    if (!testimonials.length) {
      document.getElementById('map-sidebar').innerHTML = '<p class="empty-state">No testimonials available.</p>';
      return;
    }
    testimonials.sort(function (a, b) { return a.lng - b.lng; });

    var iconNormal = L.divIcon({
      className: 'custom-pin',
      html: '<div style="width:24px;height:24px;background:#00AAE7;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:2px 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;margin-top:-34px;margin-left:-12px;"><div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);"></div></div>',
      iconSize: [24, 24], iconAnchor: [12, 12]
    });
    var iconActive = L.divIcon({
      className: 'custom-pin-active',
      html: '<div style="width:36px;height:36px;background:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:4px solid #00AAE7;box-shadow:4px 4px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;margin-top:-48px;margin-left:-18px;z-index:1000;"><div style="width:12px;height:12px;background:#00AAE7;border-radius:50%;transform:rotate(45deg);"></div></div>',
      iconSize: [36, 36], iconAnchor: [18, 18]
    });

    var markers = [];
    testimonials.forEach(function (t, index) {
      var marker = L.marker([t.lat, t.lng], { icon: iconNormal }).addTo(map);
      marker.index = index;
      marker.on('mouseover', function () { if (!isManualInteraction) { isPaused = true; showTestimonial(index); } });
      marker.on('mouseout', function () { if (!isManualInteraction) { isPaused = false; } });
      marker.on('click', function () { isManualInteraction = true; showTestimonial(index); currentIndex = index; stopTimer(); });
      markers.push(marker);
    });

    var currentIndex = 0, isPaused = false, isManualInteraction = false, timer;
    var duration = 5000;

    function showTestimonial(index) {
      var t = testimonials[index];
      var content = document.getElementById('map-testimonial-content');
      if (!content) return;
      content.classList.remove('active');
      void content.offsetWidth;
      document.getElementById('t-logo').src = t.logo;
      document.getElementById('t-logo').onerror = function () { this.onerror = null; this.src = 'assets/images/logo/tridel.png'; };
      document.getElementById('t-quote').textContent = t.quote;
      document.getElementById('t-author').textContent = t.author;
      document.getElementById('t-role').textContent = t.role + ', ' + t.location;
      content.classList.add('active');
      markers.forEach(function (m, i) {
        if (i === index) { m.setIcon(iconActive); m.setZIndexOffset(1000); }
        else { m.setIcon(iconNormal); m.setZIndexOffset(0); }
      });
      map.flyTo([t.lat, t.lng], 4, { animate: true, duration: 2 });
    }

    function nextSlide() { if (isPaused || isManualInteraction) return; currentIndex = (currentIndex + 1) % testimonials.length; showTestimonial(currentIndex); resetProgress(); }
    function resetTimer() { stopTimer(); timer = setInterval(nextSlide, duration); _mapTimer = timer; resetProgress(); }
    function stopTimer() { clearInterval(timer); _mapTimer = null; var prog = document.getElementById('progress'); if (prog) prog.style.width = '0%'; }
    function resetProgress() {
      var bar = document.getElementById('progress');
      bar.style.transition = 'none'; bar.style.width = '0%';
      setTimeout(function () {
        if (!isPaused && !isManualInteraction) { bar.style.transition = 'width ' + duration + 'ms linear'; bar.style.width = '100%'; }
      }, 50);
    }

    document.getElementById('map-prev').addEventListener('click', function () { isManualInteraction = true; stopTimer(); currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length; showTestimonial(currentIndex); });
    document.getElementById('map-next').addEventListener('click', function () { isManualInteraction = true; stopTimer(); currentIndex = (currentIndex + 1) % testimonials.length; showTestimonial(currentIndex); });
    document.getElementById('map-sidebar').addEventListener('mouseenter', function () { isPaused = true; });
    document.getElementById('map-sidebar').addEventListener('mouseleave', function () { if (map.getZoom() <= 4 && !isManualInteraction) { isPaused = false; resetTimer(); } });
    map.on('zoom', function () { if (map.getZoom() > 4) { isPaused = true; stopTimer(); } else { if (!isManualInteraction) { isPaused = false; resetTimer(); } } });
    map.on('dragstart', function () { isManualInteraction = true; stopTimer(); });

    showTestimonial(0);
    resetTimer();
  });
};

// --- IIFE Fallback (for standalone page compatibility) ---
// Auto-run if the container already exists in the DOM (non-SPA usage)
(function () {
  var container = document.getElementById('testimonial-map-root');
  if (container) {
    window.renderTestimonialMap(container);
  }
})();

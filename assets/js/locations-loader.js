/**
 * locations-loader.js
 * Loads locations from LOCATIONS_DATA and renders them into the Global Presence section.
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

document.addEventListener('DOMContentLoaded', function() {
    renderGlobalPresence();
});

function renderGlobalPresence() {
    const locations = typeof window.LOCATIONS_DATA !== 'undefined' ? window.LOCATIONS_DATA : null;

    // We need to render the list of offices in the sidebar/list container
    // Target container: .contact-details (or a specific ID if we add one)
    const container = document.querySelector('.contact-details');

    if (!locations || locations.length === 0) {
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }
    if (!container) return; // Exit if container not found
    
    // Keep the header
    const headerHTML = `
        <div class="section__header" style="text-align: left;">
          <h2 class="section__title">Our Offices</h2>
        </div>
    `;
    
    // Group locations by Country for better display
    const groupedLocations = locations.reduce((acc, loc) => {
        if (!acc[loc.country]) acc[loc.country] = [];
        acc[loc.country].push(loc);
        return acc;
    }, {});
    
    let listHTML = '';
    
    // Force requested order: Australia, India, UAE
    const preferredOrder = ['Australia', 'India', 'UAE'];
    const otherCountries = Object.keys(groupedLocations).filter(c => !preferredOrder.includes(c));
    const sortedCountries = [...preferredOrder, ...otherCountries];
    
    sortedCountries.forEach(country => {
        if (!groupedLocations[country]) return;
        
        // Add Country Header if it's not the first item or following logic
        if (country === 'UAE') {
             // UAE usually has a specific style in the original
             groupedLocations[country].forEach(loc => {
                 var officeName = escapeHtml(loc.companyName || loc.name);
                 var officeDesignation = escapeHtml(loc.designation || loc.type || '');
                 listHTML += `
                    <div id="location-${loc.id}" class="contact-location-group" onclick="focusMap(${parseFloat(loc.lat)}, ${parseFloat(loc.lng)})" onkeydown="if(event.key==='Enter')focusMap(${parseFloat(loc.lat)}, ${parseFloat(loc.lng)})" tabindex="0" role="button">
                      <h4>${escapeHtml(loc.country)}</h4>
                      <p><strong>${officeName}</strong></p>
                      ${officeDesignation ? `<p class="contact-text-secondary">${officeDesignation}</p>` : ''}
                    </div>
                 `;
             });
        } else {
            // Header for other countries
            listHTML += `<h4 class="contact-location-label">${escapeHtml(country)}</h4>`;
            
            groupedLocations[country].forEach(loc => {
                var officeName = escapeHtml(loc.companyName || loc.name);
                var officeDesignation = escapeHtml(loc.designation || loc.type || '');
                listHTML += `
                    <div id="location-${loc.id}" class="contact-location-group" onclick="focusMap(${parseFloat(loc.lat)}, ${parseFloat(loc.lng)})" onkeydown="if(event.key==='Enter')focusMap(${parseFloat(loc.lat)}, ${parseFloat(loc.lng)})" tabindex="0" role="button">
                      <p><strong>${officeName}</strong></p>
                      ${officeDesignation ? `<p class="contact-text-secondary">${officeDesignation}</p>` : ''}
                    </div>
                `;
            });
        }
    });
    
    container.innerHTML = headerHTML + listHTML;
    
    // Initialize Map Markers if Leaflet is available or can be loaded
    if (document.getElementById('map')) {
        ensureLeaflet(function() {
            initMap(locations);
        });
    }
}

function ensureLeaflet(cb) {
    if (typeof L !== 'undefined') return cb();

    // Load Leaflet CSS
    if (!document.querySelector('link[href$="assets/vendor/leaflet/leaflet.css"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/vendor/leaflet/leaflet.css';
        document.head.appendChild(link);
    }

    // Load Leaflet JS
    var script = document.createElement('script');
    script.src = 'assets/vendor/leaflet/leaflet.js';
    script.onload = cb;
    document.head.appendChild(script);
}

let map;
let markers = [];
let _locThemeHandler = null;

function initMap(locations) {
    if (map) {
        // Clear existing if re-initializing (though usually runs once)
        map.remove();
    }
    // Remove previous theme listener to prevent accumulation
    if (_locThemeHandler) {
        window.removeEventListener('themeChanged', _locThemeHandler);
        _locThemeHandler = null;
    }
    markers = []; // Reset markers array to prevent accumulation
    
    // Default center (India/UAE region)
    map = L.map('map').setView([20, 70], 3);
    
    // Determine Theme for Tiles
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    
    const tileLayer = L.tileLayer(isDark ? darkTiles : lightTiles, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Listen for theme changes to update tiles (stored for cleanup)
    _locThemeHandler = (e) => {
        tileLayer.setUrl(e.detail.theme === 'dark' ? darkTiles : lightTiles);
    };
    window.addEventListener('themeChanged', _locThemeHandler);

    // Custom Icons
    const iconNormal = L.divIcon({
        className: 'custom-pin',
        html: `<div style="
                  width: 24px; height: 24px; background: #00AAE7; border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg); border: 2px solid white; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                  display: flex; align-items: center; justify-content: center; margin-top: -34px; margin-left: -12px;">
                  <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
              </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    locations.forEach(loc => {
        if (loc.lat && loc.lng) {
            const marker = L.marker([loc.lat, loc.lng], { icon: iconNormal }).addTo(map);
            var popupName = escapeHtml(loc.companyName || loc.name);
            var popupDesignation = escapeHtml(loc.designation || loc.type || '');
            marker.bindPopup(`<b>${popupName}</b>${popupDesignation ? `<br><span class="contact-text-secondary">${popupDesignation}</span>` : ''}`);
            markers.push(marker);
        }
    });
}

function focusMap(lat, lng) {
    if (map) {
        map.flyTo([lat, lng], 13, {
            animate: true,
            duration: 1.5
        });

        markers.forEach(function(marker) {
            var pos = marker.getLatLng();
            if (pos.lat === lat && pos.lng === lng) {
                marker.openPopup();
            }
        });
    }
}

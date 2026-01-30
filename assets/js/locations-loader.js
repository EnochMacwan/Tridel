/**
 * locations-loader.js
 * Loads locations from LOCATIONS_DATA and renders them into the Global Presence section.
 */

document.addEventListener('DOMContentLoaded', function() {
    renderGlobalPresence();
});

function renderGlobalPresence() {
    const locations = typeof window.LOCATIONS_DATA !== 'undefined' ? window.LOCATIONS_DATA : [];
    
    // We need to render the list of offices in the sidebar/list container
    // Target container: .contact-details (or a specific ID if we add one)
    const container = document.querySelector('.contact-details');
    
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
    
    // Force specific order: UAE, India, Australia (as per original design)
    const preferredOrder = ['UAE', 'India', 'Australia'];
    const otherCountries = Object.keys(groupedLocations).filter(c => !preferredOrder.includes(c));
    const sortedCountries = [...preferredOrder, ...otherCountries];
    
    sortedCountries.forEach(country => {
        if (!groupedLocations[country]) return;
        
        // Add Country Header if it's not the first item or following logic
        if (country === 'UAE') {
             // UAE usually has a specific style in the original
             groupedLocations[country].forEach(loc => {
                 listHTML += `
                    <div id="location-${loc.id}" class="contact-location-group" onclick="focusMap(${loc.lat}, ${loc.lng})">
                      <h4>${loc.country}</h4>
                      <p class="contact-location-address">${loc.address}</p>
                    </div>
                 `;
             });
        } else {
            // Header for other countries
            listHTML += `<h4 class="contact-location-label" style="margin-top: 16px; color: var(--color-accent);">${country}</h4>`;
            
            groupedLocations[country].forEach(loc => {
                listHTML += `
                    <div id="location-${loc.id}" class="contact-location-group" onclick="focusMap(${loc.lat}, ${loc.lng})" style="margin-bottom: 16px;">
                      ${loc.type !== 'Office' && loc.type !== 'Factory' ? '' : `<p style="margin-bottom: 8px;"><strong>${loc.name}</strong></p>`}
                      ${loc.type === 'Registered Office' ? `<p class="contact-location-label">${loc.name}</p>` : ''} 
                      <p class="contact-location-address">${loc.address}</p>
                    </div>
                `;
            });
        }
    });
    
    container.innerHTML = headerHTML + listHTML;
    
    // Initialize Map Markers if Leaflet is available
    if (typeof L !== 'undefined' && document.getElementById('map')) {
        initMap(locations);
    }
}

let map;
let markers = [];

function initMap(locations) {
    if (map) {
        // Clear existing if re-initializing (though usually runs once)
        map.remove();
    }
    
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
    
    // Listen for theme changes to update tiles
    window.addEventListener('themeChanged', (e) => {
        tileLayer.setUrl(e.detail.theme === 'dark' ? darkTiles : lightTiles);
    });

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
            marker.bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
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
        
        // Find marker and open popup
        // This is a simple implementation; strict matching might be needed
    }
}

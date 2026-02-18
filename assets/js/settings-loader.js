/**
 * Settings Loader
 * Applies global configuration from SETTINGS_DATA to the frontend.
 */

/**
 * Check if a section is visible on a given page.
 * Usage: if (isSectionVisible('home', 'hero')) { ... }
 * Returns true by default (sections visible unless explicitly hidden).
 * This function lives here (not in settings-data.js) because the admin panel
 * overwrites settings-data.js on publish — this file is safe from that.
 * Note: Uses typeof check because const doesn't attach to window object.
 */
function isSectionVisible(page, section) {
    try {
        var sd = (typeof SETTINGS_DATA !== 'undefined') ? SETTINGS_DATA : null;
        var vis = sd && sd.sectionVisibility;
        if (!vis || !vis[page]) return true;
        return vis[page][section] !== false;
    } catch (e) { return true; }
}

/**
 * Apply form email settings to any formsubmit.co forms currently in the DOM.
 * Called after SPA route renders, since forms are created dynamically.
 */
window.applyFormSettings = function () {
    if (typeof SETTINGS_DATA === 'undefined') return;

    var config = SETTINGS_DATA;
    var formSubmitBase = 'https://formsubmit.co/';
    var hash = window.location.hash || '';

    var forms = document.querySelectorAll('form[action*="formsubmit.co"]');
    forms.forEach(function (form) {
        var isContact = hash.includes('/contact') || document.querySelector('.page-contact');
        var isCareers = hash.includes('/careers') || document.querySelector('.page-careers');

        if (isContact && config.contactEmail) {
            form.action = formSubmitBase + config.contactEmail;
        } else if (isCareers && config.careersEmail) {
            form.action = formSubmitBase + config.careersEmail;
        }
    });
};

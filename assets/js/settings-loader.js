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

var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

document.addEventListener('DOMContentLoaded', () => {
    // Check if settings exist
    if (typeof SETTINGS_DATA === 'undefined') {
        console.warn('SETTINGS_DATA not found. Using default form actions.');
        return;
    }

    const config = SETTINGS_DATA;
    const formSubmitBase = "https://formsubmit.co/";

    // 1. Configure Contact Form
    const contactForm = document.querySelector('form[action*="formsubmit.co"]');

    const isContactPage = window.location.pathname.includes('contact.html') || window.location.hash.includes('/contact') || document.querySelector('.page-contact');
    const isCareersPage = window.location.pathname.includes('careers.html') || window.location.hash.includes('/careers') || document.querySelector('.page-careers');

    if (isContactPage && contactForm) {
        if (config.contactEmail) {
            contactForm.action = formSubmitBase + config.contactEmail;
        }
    }

    // 2. Configure Careers Form
    if (isCareersPage) {
        const careersForm = document.querySelector('form[action*="formsubmit.co"]');
        if (careersForm && config.careersEmail) {
            careersForm.action = formSubmitBase + config.careersEmail;
        }
    }
});

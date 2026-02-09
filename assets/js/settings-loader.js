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
    if (typeof window.SETTINGS_DATA === 'undefined') {
        console.warn('SETTINGS_DATA not found. Using default form actions.');
        return;
    }

    const config = window.SETTINGS_DATA;
    const formSubmitBase = "https://formsubmit.co/";

    // 1. Configure Contact Form
    // Looks for form in contact.html. We'll target by action attribute substring or class if ID is generic
    // In contact.html: <form action="...geminibaba1@gmail.com"...>
    const contactForm = document.querySelector('form[action*="formsubmit.co"]'); 
    // Note: This matches the first formsubmit form found. 
    // On contact.html there is only one. On careers.html there is only one.
    // To be safer, we can check the page we are on.
    
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

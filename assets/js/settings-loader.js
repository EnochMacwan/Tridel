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
function getFormSubmitAjaxAction(action) {
    try {
        var url = new URL(action, window.location.href);
        if (!/(^|\.)formsubmit\.co$/i.test(url.hostname)) return '';
        if (url.pathname.indexOf('/ajax/') === 0) return url.href;

        var target = url.pathname.replace(/^\/+/, '');
        if (!target) return '';

        url.pathname = '/ajax/' + target;
        url.search = '';
        return url.href;
    } catch (e) {
        return '';
    }
}

function getFormSubmitStatus(form) {
    var status = form.querySelector('[data-formsubmit-status]');
    if (status) return status;

    status = document.createElement('div');
    status.setAttribute('data-formsubmit-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.className = 'form-submit-status';

    var button = form.querySelector('[type="submit"]');
    if (button && button.parentNode === form) {
        form.insertBefore(status, button);
    } else {
        form.appendChild(status);
    }

    return status;
}

function showFormSubmitStatus(form, message, type) {
    var status = getFormSubmitStatus(form);
    status.textContent = message || '';
    status.classList.remove('is-error', 'is-success');
    if (type) status.classList.add('is-' + type);
    status.style.display = message ? 'block' : 'none';
}

function showFormSubmitSuccess(form) {
    var success = null;
    if (form.id === 'contact-form') {
        success = document.getElementById('contact-success');
    }

    if (!success && form.parentNode) {
        success = form.parentNode.querySelector('[data-formsubmit-success]');
        if (!success) {
            success = document.createElement('div');
            success.setAttribute('data-formsubmit-success', '');
            success.className = 'eoi-success';
            success.style.display = 'none';
            success.innerHTML =
                '<i class="fas fa-check-circle"></i>' +
                '<h3>Message Sent!</h3>' +
                '<p>Thank you for reaching out. Our team will review your submission and get back to you soon.</p>';
            form.parentNode.appendChild(success);
        }
    }

    showFormSubmitStatus(form, '', '');
    form.reset();
    form.style.display = 'none';
    if (success) success.style.display = 'block';
}

function enhanceFormSubmitForm(form) {
    if (!form || form.getAttribute('data-formsubmit-enhanced') === 'true') return;
    form.setAttribute('data-formsubmit-enhanced', 'true');

    form.addEventListener('submit', function (event) {
        if (event.defaultPrevented) return;
        if (!/formsubmit\.co/i.test(form.action || '')) return;
        if (!form.checkValidity()) return;

        var ajaxAction = getFormSubmitAjaxAction(form.action);
        if (!ajaxAction || typeof fetch !== 'function' || typeof FormData !== 'function') return;

        event.preventDefault();

        var submitButton = form.querySelector('[type="submit"]');
        var originalButtonHtml = submitButton ? submitButton.innerHTML : '';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Sending...';
        }
        showFormSubmitStatus(form, '', '');

        fetch(ajaxAction, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: new FormData(form)
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('FormSubmit returned ' + response.status);
            }
            return response.json().catch(function () { return {}; });
        }).then(function () {
            showFormSubmitSuccess(form);
        }).catch(function () {
            showFormSubmitStatus(form, 'Message could not be sent. Please try again in a moment.', 'error');
        }).finally(function () {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
            }
        });
    });
}

window.applyFormSettings = function () {
    if (typeof SETTINGS_DATA === 'undefined') return;

    var config = SETTINGS_DATA;
    var formSubmitBase = 'https://formsubmit.co/';
    var forms = document.querySelectorAll('form[data-form-type], #contact-form, #careers-form, form[action*="formsubmit.co"]');
    forms.forEach(function (form) {
        var formType = form.getAttribute('data-form-type');
        if (!formType) {
            if (form.id === 'contact-form') formType = 'contact';
            if (form.id === 'careers-form') formType = 'careers';
        }

        if (formType === 'contact' && config.contactEmail) {
            form.action = formSubmitBase + config.contactEmail;
        } else if (formType === 'careers' && config.careersEmail) {
            form.action = formSubmitBase + config.careersEmail;
        }

        enhanceFormSubmitForm(form);
    });
};

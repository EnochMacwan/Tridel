/**
 * admin-publish.js
 * Local-only save, reload, undo, and export helpers.
 * Depends on: escapeHTML + showToast (globals), renderSection / renderDashboard
 * (admin.js), getDataArray (admin.js), and the localhost Express API.
 */

// -- Publish / Pending State --

function getAdminToken() {
    authToken = authToken || sessionStorage.getItem('adminToken') || window.authToken || null;
    return authToken;
}

function getPublishTargets() {
    var token = getAdminToken();
    return token ? [{
        key: 'server',
        label: 'local file server at ' + (window.location.origin || 'localhost')
    }] : [];
}

function updatePublishBanner() {
    var banner = document.getElementById('publish-status-banner');
    if (!banner) return;

    var targets = getPublishTargets();
    var hasTarget = targets.length > 0;

    if (pendingChanges.size > 0) {
        if (hasTarget) {
            banner.innerHTML = '<strong>Draft only:</strong> these admin changes are not on the website yet. Click <strong>Save Local Files</strong> to write them to the local data files.';
        } else {
            banner.innerHTML = '<strong>Local server required:</strong> log in through <strong>http://localhost:3000/admin.html</strong> before saving files.';
        }
        banner.style.display = 'block';
        return;
    }

    if (hasTarget) {
        banner.innerHTML = 'Publish target: <strong>' + escapeHTML(targets[0].label) + '</strong>. After you edit content, click <strong>Save Local Files</strong>.';
    } else {
        banner.innerHTML = '<strong>Local admin only:</strong> this screen writes files only through the localhost Express server.';
    }
    banner.style.display = 'block';
}

function markAsPending(type) {
    pendingChanges.add(type);
    updatePublishButton();

    var undoBtn = document.getElementById('undo-btn-' + type);
    if (undoBtn) undoBtn.style.display = 'inline-block';

    showToast('Draft saved in admin. Click "Save Local Files" to update the local website files.', 'success');
}

function updatePublishButton() {
    var btn = document.getElementById('publish-btn');
    var badge = document.getElementById('pending-count');

    if (!btn) return;

    if (pendingChanges.size > 0) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-success');
        btn.style.opacity = '1';
        btn.title = 'Save pending changes to local data files';

        if (badge) {
            badge.style.display = 'inline-flex';
            badge.textContent = pendingChanges.size;
        }
    } else {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-secondary');
        btn.style.opacity = '0.7';
        btn.title = 'No draft changes to save';

        if (badge) {
            badge.style.display = 'none';
        }
    }

    updatePublishBanner();
}

function collectPendingPayload(type) {
    if (type === 'index_content') {
        return {
            INDEX_HERO: window.INDEX_HERO || {},
            INDEX_STATS: window.INDEX_STATS || [],
            INDEX_WHAT_WE_DO: window.INDEX_WHAT_WE_DO || {},
            INDEX_CASE_STUDY: window.INDEX_CASE_STUDY || {},
            INDEX_CTA: window.INDEX_CTA || {},
            INDEX_WHY_CHOOSE: window.INDEX_WHY_CHOOSE || {},
            INDEX_SECTION_ORDER: window.INDEX_SECTION_ORDER || []
        };
    }

    if (type === 'about_content') {
        return window.ABOUT_DATA || {};
    }

    if (type === 'contact_content') {
        return {
            CONTACT_INFO_CARDS: window.CONTACT_INFO_CARDS || [],
            CONTACT_FAQ_DATA: window.CONTACT_FAQ_DATA || [],
            CONTACT_PAGE_CONFIG: window.CONTACT_PAGE_CONFIG || {}
        };
    }

    if (type === 'layout') {
        return {
            NAV_LINKS: window.NAV_LINKS || [],
            MEGA_MENU_CONFIG: ensureMegaMenuConfig(),
            FOOTER_DATA: window.FOOTER_DATA || {},
            PAGE_META: window.PAGE_META || {}
        };
    }

    if (type === 'visibility' || type === 'form_settings') {
        return window.SETTINGS_DATA || {};
    }

    if (type === 'settings') {
        return typeof getContactSettingsObject === 'function' ? getContactSettingsObject() : (window.CONTACT_DATA || {});
    }

    return getDataArray(type);
}

// -- Publish All --

async function publishAllChanges() {
    if (pendingChanges.size === 0) {
        showToast('No draft changes to save', 'info');
        return;
    }

    var token = getAdminToken();
    if (!token) {
        showToast('Log in through the local admin server before saving files.', 'error');
        showLogin();
        return;
    }

    var btn = document.getElementById('publish-btn');
    var originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
        var successCount = 0;
        var types = Array.from(pendingChanges);

        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var data = collectPendingPayload(type);
            var serverType = getLocalServerType(type);

            await publishPendingChangeToServer(serverType, data);

            pendingChanges.delete(type);
            updatePublishButton();

            var undoBtn = document.getElementById('undo-btn-' + type);
            if (undoBtn) undoBtn.style.display = 'none';

            successCount++;
        }

        updatePublishButton();
        showToast('Saved ' + successCount + ' update(s) to local data files.', 'success');
    } catch (error) {
        showToast('Error saving local files: ' + error.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// -- Reload & Undo --

async function reloadSectionData(type) {
    var filePath = LOCAL_DATA_FILES[type];
    var varName = LOCAL_VAR_NAMES[type];
    if (!filePath || !varName) return false;

    try {
        var res = await fetch(filePath + '?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(res.statusText || 'Failed to load local file');

        var content = await res.text();

        if (type === 'index_content') {
            parseIndexPageContent(content);
        } else if (type === 'about_content') {
            parseAboutPageContent(content);
        } else if (type === 'contact_content') {
            parseContactPageContent(content);
        } else if (type === 'layout') {
            parseLayoutData(content);
        } else {
            window[varName] = parseAssignedJson(content, varName);
        }

        if (type === 'products') renderProducts();
        else if (type === 'services') renderServices();
        else if (type === 'clients') renderClients();
        else if (type === 'stories') renderStories();
        else if (type === 'home') renderHomeCards();
        else if (type === 'team') renderTeam();
        else if (type === 'testimonials') renderTestimonials();
        else if (type === 'linkedin' || type === 'news') renderLinkedIn();
        else if (type === 'settings' || type === 'form_settings' || type === 'contact_content') loadSettingsToForm();

        return true;
    } catch (e) {
        console.error('Error reloading local data for ' + type + ':', e);
        showToast('Could not reload ' + type + ' from local file: ' + e.message, 'error');
        return false;
    }
}

async function reloadAllLocalData() {
    if (pendingChanges.size > 0 && !confirm('Reloading from disk will discard unsaved admin drafts. Continue?')) {
        return;
    }

    var types = [
        'products',
        'services',
        'clients',
        'stories',
        'home',
        'linkedin',
        'team',
        'testimonials',
        'locations',
        'settings',
        'form_settings',
        'index_content',
        'about_content',
        'contact_content',
        'layout'
    ];

    var loaded = 0;
    for (var i = 0; i < types.length; i++) {
        if (await reloadSectionData(types[i])) loaded++;
    }

    pendingChanges.clear();
    renderAllSections();
    loadSettingsToForm();
    updatePublishButton();
    showToast('Reloaded ' + loaded + ' local data file(s).', 'success');
}

async function undoChanges(type) {
    if (!pendingChanges.has(type)) return;

    if (confirm('Discard all unsaved changes for ' + type + '?')) {
        await reloadSectionData(type);
        pendingChanges.delete(type);

        updatePublishButton();
        var undoBtn = document.getElementById('undo-btn-' + type);
        if (undoBtn) undoBtn.style.display = 'none';

        showToast(type + ' changes discarded.', 'info');
    }
}

// -- Export & Download --

function exportAllData() {
    var exports = [
        { name: 'products-data.js', varName: 'PRODUCTS_DATA', data: window.PRODUCTS_DATA || [] },
        { name: 'services-data.js', varName: 'SERVICES_DATA', data: window.SERVICES_DATA || [] },
        { name: 'clients-data.js', varName: 'CLIENTS_DATA', data: window.CLIENTS_DATA || [] },
        { name: 'success-stories-data.js', varName: 'SUCCESS_STORIES_DATA', data: window.SUCCESS_STORIES_DATA || [] },
        { name: 'home-data.js', varName: 'HOME_CARDS_DATA', data: window.HOME_CARDS_DATA || [] },
        { name: 'news-data.js', varName: 'NEWS_DATA', data: window.NEWS_DATA || [] },
        { name: 'team-data.js', varName: 'TEAM_DATA', data: window.TEAM_DATA || [] },
        { name: 'testimonials-data.js', varName: 'TESTIMONIALS_DATA', data: window.TESTIMONIALS_DATA || [] },
        { name: 'locations-data.js', varName: 'LOCATIONS_DATA', data: window.LOCATIONS_DATA || [] },
        { name: 'settings-data.js', varName: 'SETTINGS_DATA', data: window.SETTINGS_DATA || {} }
    ];

    exports.forEach(function (exp) {
        var content = 'const ' + exp.varName + ' = ' + JSON.stringify(exp.data, null, 2) + ';';
        downloadFile(exp.name, content);
    });

    showToast('Local data files exported!', 'success');
}

function downloadFile(filename, content) {
    var blob = new Blob([content], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

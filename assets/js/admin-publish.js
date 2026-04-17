/**
 * admin-publish.js
 * GitHub save, publish, reload, undo, and export helpers.
 * Depends on: escapeHTML + showToast (globals), getAdminAuthHeaders /
 *   buildGitHubProxyPayload (admin-github.js), renderSection /
 *   renderDashboard (admin.js), getDataArray (admin.js).
 * Load order: utils.js -> admin-github.js -> admin-form-rows.js
 *           -> admin-publish.js -> admin.js
 */


// -- GitHub Save (single file) --

async function saveToGitHub(type, data) {
    if (!hasConfiguredGitHub()) {
        showToast('GitHub not configured', 'error');
        return;
    }

    var filePath = GITHUB_DATA_FILES[type];
    var varName = GITHUB_VAR_NAMES[type];

    if (!filePath || !varName) return;

    // Generate file content
    var fileContent = '';

    // Special: multi-var files need custom serialization
    if (type === 'index_content') {
        fileContent = serializeIndexPageData();
    } else if (type === 'about_content') {
        fileContent = serializeAboutPageData();
    } else if (type === 'contact_content') {
        fileContent = serializeContactPageData();
    } else if (type === 'layout') {
        fileContent = serializeLayoutData();
    } else if (type === 'visibility' || type === 'form_settings') {
        fileContent = 'const SETTINGS_DATA = ' + JSON.stringify(data, null, 2) + ';';
    } else {
        fileContent = 'const ' + varName + ' = ' + JSON.stringify(data, null, 2) + ';';
    }

    // For products, also include the featuredProduct for the Spotlight card
    if (type === 'products') {
        var featuredProductData = {
            tag: "Featured",
            title: "Tridel Aquilon 8000",
            description: "Our flagship carbon fiber USV for advanced autonomous hydrographic surveys.",
            link: "#/products/detail?id=aquilon-8000",
            buttonText: "Learn More",
            image: "assets/images/products/aquilon-8000/aquilon-8000-01.jpg"
        };
        fileContent += '\n\n// Featured Product for Spotlight Card in Mega Menu\nconst featuredProduct = ' + JSON.stringify(featuredProductData, null, 2) + ';';
    }

    // For services, also include the featuredService for the Spotlight card
    if (type === 'services') {
        var featuredServiceData = {
            tag: "Featured",
            title: "Comprehensive Solutions",
            description: "End-to-end expertise from feasibility to real-time monitoring.",
            link: "#/services",
            buttonText: "Learn More",
            image: "assets/images/services/port-monitoring.png"
        };
        fileContent += '\n\n// Featured Service for Spotlight Card in Mega Menu\nconst featuredService = ' + JSON.stringify(featuredServiceData, null, 2) + ';';
    }

    // For team, we want to export only the array
    if (type === 'team') {
        fileContent = 'const ' + varName + ' = ' + JSON.stringify(data, null, 2) + ';';
    }

    if (serverGitHubProxyAvailable) {
        var proxyRes = await fetch('/api/github/save', {
            method: 'POST',
            headers: Object.assign({
                'Content-Type': 'application/json'
            }, getAdminAuthHeaders()),
            body: JSON.stringify(Object.assign(buildGitHubProxyPayload(), {
                path: filePath,
                content: fileContent,
                message: 'Update ' + type + ' via Admin Panel'
            }))
        });

        if (!proxyRes.ok) {
            var proxyErr = await proxyRes.json().catch(function () { return {}; });
            throw new Error(proxyErr.error || proxyRes.statusText);
        }

        return;
    }

    var effectiveConfig = getEffectiveGitHubConfig();
    var apiUrl = 'https://api.github.com/repos/' + effectiveConfig.owner + '/' + effectiveConfig.repo + '/contents/' + filePath;

    var sha = null;
    try {
        var getController = new AbortController();
        var getTimeout = setTimeout(function() { getController.abort(); }, 30000);
        var getRes = await fetch(apiUrl, {
            headers: {
                'Authorization': 'token ' + effectiveConfig.token,
                'Accept': 'application/vnd.github.v3+json'
            },
            signal: getController.signal
        });
        clearTimeout(getTimeout);

        if (getRes.ok) {
            var fileData = await getRes.json();
            sha = fileData.sha;
        }
    } catch (e) {
        if (e.name === 'AbortError') throw new Error('GitHub API request timed out (30s). Check your connection.');
        /* File doesn't exist yet, will create new */
    }

    var body = {
        message: 'Update ' + type + ' via Admin Panel',
        content: btoa(unescape(encodeURIComponent(fileContent))),
        branch: effectiveConfig.branch
    };
    if (sha) body.sha = sha;

    var putController = new AbortController();
    var putTimeout = setTimeout(function() { putController.abort(); }, 30000);
    var putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': 'token ' + effectiveConfig.token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: putController.signal
    });
    clearTimeout(putTimeout);

    if (!putRes.ok) {
        var err = await putRes.json();
        throw new Error(err.message || putRes.statusText);
    }
}


// -- Publish / Pending State --

function getPublishTargets() {
    var targets = [];
    var config = getEffectiveGitHubConfig();

    if (authToken) {
        targets.push({
            key: 'server',
            label: (window.location.origin || 'this site') + ' server'
        });
    }

    if (hasConfiguredGitHub()) {
        targets.push({
            key: 'github',
            label: (config.owner || 'GitHub') + '/' + (config.repo || 'repo') + '@' + (config.branch || 'main')
        });
    }

    return targets;
}

function updatePublishBanner() {
    var banner = document.getElementById('publish-status-banner');
    if (!banner) return;

    var targets = getPublishTargets();
    var targetText = targets.map(function (target) {
        return '<strong>' + escapeHTML(target.label) + '</strong>';
    }).join(' and ');

    if (pendingChanges.size > 0) {
        if (targets.length > 0) {
            banner.innerHTML = '<strong>Draft only:</strong> these admin changes are not on the website yet. Click <strong>Publish Website</strong> to send them to ' + targetText + '.';
        } else {
            banner.innerHTML = '<strong>Draft only:</strong> changes are saved only in this admin session. Configure GitHub Settings or use the server-backed admin to update the website.';
        }
        banner.style.display = 'block';
        return;
    }

    if (targets.length > 0) {
        banner.innerHTML = 'Publish target: ' + targetText + '. After you save edits, click <strong>Publish Website</strong> to update the website.';
        banner.style.display = 'block';
        return;
    }

    banner.innerHTML = '<strong>Draft-only mode:</strong> no GitHub or server publish target is configured, so website updates will not go live from this screen.';
    banner.style.display = 'block';
}

function markAsPending(type) {
    pendingChanges.add(type);
    updatePublishButton();

    var undoBtn = document.getElementById('undo-btn-' + type);
    if (undoBtn) undoBtn.style.display = 'inline-block';

    showToast('Draft saved in admin only. Click "Publish Website" to update the website.', 'success');
}

function updatePublishButton() {
    var btn = document.getElementById('publish-btn');
    var badge = document.getElementById('pending-count');

    if (!btn) return;

    if (pendingChanges.size > 0) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-success');
        btn.style.opacity = '1';
        btn.title = 'Publish pending changes to the website';

        if (badge) {
            badge.style.display = 'inline-flex';
            badge.textContent = pendingChanges.size;
        }
    } else {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-secondary');
        btn.style.opacity = '0.7';
        btn.title = 'No draft changes to publish';

        if (badge) {
            badge.style.display = 'none';
        }
    }

    updatePublishBanner();
}


// -- Publish All --

async function publishAllChanges() {
    if (pendingChanges.size === 0) {
        showToast('No draft changes to publish', 'info');
        return;
    }

    var btn = document.getElementById('publish-btn');
    var originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    btn.disabled = true;

    try {
        var successCount = 0;
        var types = Array.from(pendingChanges);
        var useGitHub = hasConfiguredGitHub();
        var canUseServerApi = !!authToken;
        var targets = getPublishTargets();

        if (!useGitHub && !canUseServerApi) {
            showToast('Draft saved only in admin. Configure GitHub Settings to publish to the website.', 'error');
            openGitHubConfig();
            return;
        }

        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var data;

            // Special payloads for multi-var files
            if (type === 'index_content') {
                data = {
                    INDEX_HERO: window.INDEX_HERO || {},
                    INDEX_STATS: window.INDEX_STATS || [],
                    INDEX_WHAT_WE_DO: window.INDEX_WHAT_WE_DO || {},
                    INDEX_CASE_STUDY: window.INDEX_CASE_STUDY || {},
                    INDEX_CTA: window.INDEX_CTA || {},
                    INDEX_WHY_CHOOSE: window.INDEX_WHY_CHOOSE || {},
                    INDEX_SECTION_ORDER: window.INDEX_SECTION_ORDER || []
                };
            } else if (type === 'about_content') {
                data = window.ABOUT_DATA || {};
            } else if (type === 'contact_content') {
                data = {
                    CONTACT_INFO_CARDS: window.CONTACT_INFO_CARDS || [],
                    CONTACT_FAQ_DATA: window.CONTACT_FAQ_DATA || [],
                    CONTACT_PAGE_CONFIG: window.CONTACT_PAGE_CONFIG || {}
                };
            } else if (type === 'layout') {
                data = {
                    NAV_LINKS: window.NAV_LINKS || [],
                    MEGA_MENU_CONFIG: ensureMegaMenuConfig(),
                    FOOTER_DATA: window.FOOTER_DATA || {},
                    PAGE_META: window.PAGE_META || {}
                };
            } else if (type === 'visibility' || type === 'form_settings') {
                data = window.SETTINGS_DATA || {};
            } else {
                data = getDataArray(type);
            }

            // Map admin 'linkedin' type to server 'news' type
            var serverType = (type === 'linkedin') ? 'news' : type;

            if (canUseServerApi) {
                await publishPendingChangeToServer(serverType, data);
            }

            if (useGitHub) {
                await saveToGitHub(type, data);
            }

            pendingChanges.delete(type);
            updatePublishButton();

            var undoBtn = document.getElementById('undo-btn-' + type);
            if (undoBtn) undoBtn.style.display = 'none';

            successCount++;
        }
        updatePublishButton();

        var targetText = targets.map(function (target) {
            return target.label;
        }).join(' and ');
        var deploymentNote = useGitHub ? ' Static website deployments may take 1-3 minutes to refresh.' : '';
        showToast('Published ' + successCount + ' update(s) to ' + targetText + '.' + deploymentNote, 'success');
    } catch (error) {
        showToast('Error publishing: ' + error.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}


// -- Reload & Undo --

async function reloadSectionData(type) {
    var filePath = GITHUB_DATA_FILES[type];
    var varName = GITHUB_VAR_NAMES[type];
    if (!filePath || !varName) return;

    try {
        var content = '';
        var t = Date.now();

        if (hasConfiguredGitHub()) {
            content = await fetchGitHubFileContent(filePath);
        } else {
            var res2 = await fetch(filePath + '?t=' + t);
            if (res2.ok) content = await res2.text();
        }

        if (content) {
            var match = content.match(/(?:const|var|let)\s+\w+\s*=\s*(\[[\s\S]*\]);?/);
            if (match) {
                window[varName] = JSON.parse(match[1]);
                if (type === 'products') renderProducts();
                else if (type === 'services') renderServices();
                else if (type === 'clients') renderClients();
                else if (type === 'stories') renderStories();
                else if (type === 'home') renderHomeCards();
                else if (type === 'team') renderTeam();
                else if (type === 'testimonials') renderTestimonials();
                else if (type === 'linkedin' || type === 'news') renderLinkedIn();
            }
        }
    } catch (e) {
        console.error('Error reloading data:', e);
    }
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
        { name: 'products-data.js', varName: 'PRODUCTS_DATA', data: PRODUCTS_DATA },
        { name: 'services-data.js', varName: 'SERVICES_DATA', data: SERVICES_DATA },
        { name: 'clients-data.js', varName: 'CLIENTS_DATA', data: CLIENTS_DATA },
        { name: 'success-stories-data.js', varName: 'SUCCESS_STORIES_DATA', data: SUCCESS_STORIES_DATA },
        { name: 'home-data.js', varName: 'HOME_CARDS_DATA', data: HOME_CARDS_DATA }
    ];

    exports.forEach(function (exp) {
        var content = 'const ' + exp.varName + ' = ' + JSON.stringify(exp.data, null, 2) + ';';
        downloadFile(exp.name, content);
    });

    showToast('All data files exported!', 'success');
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


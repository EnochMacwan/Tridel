/**
 * Tridel Admin Panel
 * All business logic for the admin dashboard.
 */

// ==========================================
// 1. DATA MAPPING & COMPATIBILITY
// ==========================================

// Map variable names from data files to expected global names.
// Data files use const, which doesn't attach to window, so we copy explicitly.
(function () {
    try { if (typeof PRODUCTS_DATA !== 'undefined') window.PRODUCTS_DATA = PRODUCTS_DATA; } catch(e){}
    try { if (typeof SERVICES_DATA !== 'undefined') window.SERVICES_DATA = SERVICES_DATA; } catch(e){}
    try { if (typeof CLIENTS_DATA !== 'undefined') window.CLIENTS_DATA = CLIENTS_DATA; } catch(e){}
    try { if (typeof TEAM_DATA !== 'undefined') window.TEAM_DATA = TEAM_DATA; } catch(e){}
    try { if (typeof SUCCESS_STORIES_DATA !== 'undefined') window.SUCCESS_STORIES_DATA = SUCCESS_STORIES_DATA; } catch(e){}
    try { if (typeof HOME_CARDS_DATA !== 'undefined') window.HOME_CARDS_DATA = HOME_CARDS_DATA; } catch(e){}
    try { if (typeof LOCATIONS_DATA !== 'undefined') window.LOCATIONS_DATA = LOCATIONS_DATA; } catch(e){}
    try { if (typeof TESTIMONIALS_DATA !== 'undefined') window.TESTIMONIALS_DATA = TESTIMONIALS_DATA; } catch(e){}
    try { if (typeof NEWS_DATA !== 'undefined') window.NEWS_DATA = NEWS_DATA; } catch(e){}
    try { if (typeof CONTACT_DATA !== 'undefined') window.CONTACT_DATA = CONTACT_DATA; } catch(e){}
    try { if (typeof SETTINGS_DATA !== 'undefined') window.SETTINGS_DATA = SETTINGS_DATA; } catch(e){}
    try { if (typeof ABOUT_DATA !== 'undefined') window.ABOUT_DATA = ABOUT_DATA; } catch(e){}
    try { if (typeof CONTACT_INFO_CARDS !== 'undefined') window.CONTACT_INFO_CARDS = CONTACT_INFO_CARDS; } catch(e){}
    try { if (typeof CONTACT_FAQ_DATA !== 'undefined') window.CONTACT_FAQ_DATA = CONTACT_FAQ_DATA; } catch(e){}
    try { if (typeof CONTACT_PAGE_CONFIG !== 'undefined') window.CONTACT_PAGE_CONFIG = CONTACT_PAGE_CONFIG; } catch(e){}
    try { if (typeof NAV_LINKS !== 'undefined') window.NAV_LINKS = NAV_LINKS; } catch(e){}
    try { if (typeof MEGA_MENU_CONFIG !== 'undefined') window.MEGA_MENU_CONFIG = MEGA_MENU_CONFIG; } catch(e){}
    try { if (typeof FOOTER_DATA !== 'undefined') window.FOOTER_DATA = FOOTER_DATA; } catch(e){}
    try { if (typeof PAGE_META !== 'undefined') window.PAGE_META = PAGE_META; } catch(e){}
    try { if (typeof INDEX_WHY_CHOOSE !== 'undefined') window.INDEX_WHY_CHOOSE = INDEX_WHY_CHOOSE; } catch(e){}
    try { if (typeof INDEX_SECTION_ORDER !== 'undefined') window.INDEX_SECTION_ORDER = INDEX_SECTION_ORDER; } catch(e){}

    // Legacy camelCase aliases
    try { if (typeof servicesData !== 'undefined' && !window.SERVICES_DATA) window.SERVICES_DATA = servicesData; } catch(e){}
    try { if (typeof teamData !== 'undefined' && !window.TEAM_DATA) window.TEAM_DATA = teamData; } catch(e){}
    try { if (typeof successStoriesData !== 'undefined' && !window.SUCCESS_STORIES_DATA) window.SUCCESS_STORIES_DATA = successStoriesData; } catch(e){}
    try { if (typeof homeCardsData !== 'undefined' && !window.HOME_CARDS_DATA) window.HOME_CARDS_DATA = homeCardsData; } catch(e){}
    try { if (typeof testimonialsData !== 'undefined' && !window.TESTIMONIALS_DATA) window.TESTIMONIALS_DATA = testimonialsData; } catch(e){}
    try { if (typeof linkedInPosts !== 'undefined' && !window.NEWS_DATA) window.NEWS_DATA = linkedInPosts; } catch(e){}
    try { if (typeof LINKEDIN_POSTS !== 'undefined' && !window.NEWS_DATA) window.NEWS_DATA = LINKEDIN_POSTS; } catch(e){}
})();

// Helper: Get Data Array by Type
function getDataArray(type) {
    var data = [];
    switch (type) {
        case 'products': data = window.PRODUCTS_DATA; break;
        case 'services': data = window.SERVICES_DATA; break;
        case 'clients': data = window.CLIENTS_DATA; break;
        case 'stories': data = window.SUCCESS_STORIES_DATA; break;
        case 'home': data = window.HOME_CARDS_DATA; break;
        case 'linkedin': data = window.NEWS_DATA; break;
        case 'team': data = window.TEAM_DATA; break;
        case 'testimonials': data = window.TESTIMONIALS_DATA; break;
        case 'locations': data = window.LOCATIONS_DATA; break;
        case 'settings': return [window.CONTACT_DATA || {}];
        case 'index_content': return [window.INDEX_HERO || {}];
        default: return [];
    }
    return Array.isArray(data) ? data : [];
}

// ==========================================
// 2. SECURITY
// ==========================================

// Canonical implementation lives in utils.js (escapeHtml); alias for local call-sites.
var escapeHTML = escapeHtml;

// ==========================================
// 3. THEME TOGGLE
// ==========================================

function toggleTheme() {
    var body = document.body;
    var currentTheme = body.getAttribute('data-theme');
    var newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('adminTheme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    var icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize Theme immediately
(function () {
    var savedTheme = localStorage.getItem('adminTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
})();

// ==========================================
// 4. GITHUB CONFIGURATION
// ==========================================

var gitHubConfig = {};
try {
    gitHubConfig = JSON.parse(sessionStorage.getItem('tridel_github_config') || '{}');
} catch (e) {
    gitHubConfig = {};
}

var serverGitHubConfig = null;
var serverGitHubProxyAvailable = false;

var GITHUB_DATA_FILES = {
    'products': 'assets/js/products-data.js',
    'services': 'assets/js/services-data.js',
    'clients': 'assets/js/clients-data.js',
    'stories': 'assets/js/success-stories-data.js',
    'home': 'assets/js/home-data.js',
    'news': 'assets/js/news-data.js',
    'linkedin': 'assets/js/news-data.js',
    'team': 'assets/js/team-data.js',
    'testimonials': 'assets/js/testimonials-data.js',
    'settings': 'assets/js/contact-data.js',
    'form_settings': 'assets/js/settings-data.js',
    'index_content': 'assets/js/index-page-data.js',
    'about_content': 'assets/js/about-page-data.js',
    'contact_content': 'assets/js/contact-page-data.js',
    'layout': 'assets/js/layout-data.js'
};

var GITHUB_VAR_NAMES = {
    'products': 'PRODUCTS_DATA',
    'services': 'SERVICES_DATA',
    'clients': 'CLIENTS_DATA',
    'stories': 'SUCCESS_STORIES_DATA',
    'home': 'HOME_CARDS_DATA',
    'news': 'NEWS_DATA',
    'linkedin': 'NEWS_DATA',
    'team': 'TEAM_DATA',
    'testimonials': 'TESTIMONIALS_DATA',
    'settings': 'CONTACT_DATA',
    'form_settings': 'SETTINGS_DATA',
    'index_content': 'INDEX_HERO',
    'about_content': 'ABOUT_DATA',
    'contact_content': 'CONTACT_INFO_CARDS',
    'layout': 'NAV_LINKS'
};


async function loadServerGitHubConfig() {
    try {
        var res = await fetch('/api/github/config', {
            headers: getAdminAuthHeaders()
        });
        if (!res.ok) return;
        serverGitHubConfig = await res.json();
        serverGitHubProxyAvailable = true;
    } catch (e) {
        serverGitHubConfig = null;
        serverGitHubProxyAvailable = false;
    }
}


async function fetchGitHubFileContent(filePath) {
    if (serverGitHubProxyAvailable) {
        var proxyRes = await fetch('/api/github/load', {
            method: 'POST',
            headers: Object.assign({
                'Content-Type': 'application/json'
            }, getAdminAuthHeaders()),
            body: JSON.stringify(Object.assign(buildGitHubProxyPayload(), {
                path: filePath
            }))
        });

        if (!proxyRes.ok) {
            var proxyErr = await proxyRes.json().catch(function () { return {}; });
            throw new Error(proxyErr.error || proxyRes.statusText);
        }

        var proxyData = await proxyRes.json();
        return proxyData.content || '';
    }

    var config = getEffectiveGitHubConfig();
    var res = await fetch(
        'https://raw.githubusercontent.com/' + config.owner + '/' + config.repo + '/' + config.branch + '/' + filePath
    );

    if (!res.ok) {
        throw new Error(res.statusText || 'Failed to load GitHub content');
    }

    return res.text();
}

async function loadDataFromGitHub() {
    if (!hasConfiguredGitHub()) {
        showToast('GitHub not configured', 'error');
        return;
    }

    showToast('Loading data from GitHub...', 'success');

    var types = ['products', 'services', 'clients', 'stories', 'home', 'news', 'team', 'testimonials', 'locations', 'settings', 'form_settings'];

    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var filePath = GITHUB_DATA_FILES[type];
        var varName = GITHUB_VAR_NAMES[type];

        try {
            var content = await fetchGitHubFileContent(filePath);
            var match = content.match(/(?:const\s+\w+|window\.\w+)\s*=\s*([\{\[][\s\S]*[\]\}]);?/);
            if (match) {
                try {
                    // Sanitize JS to valid JSON
                    var raw = match[1];
                    raw = raw.replace(/\/\/.*$/gm, '');           // strip single-line comments
                    raw = raw.replace(/\/\*[\s\S]*?\*\//g, '');   // strip block comments
                    raw = raw.replace(/,\s*([\]}])/g, '$1');      // strip trailing commas
                    raw = raw.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":'); // quote unquoted keys
                    // Escape control characters inside JSON string values
                    var out = '', inStr = false;
                    for (var ci = 0; ci < raw.length; ci++) {
                        var ch = raw[ci];
                        if (ch === '"' && (ci === 0 || raw[ci - 1] !== '\\')) { inStr = !inStr; out += ch; }
                        else if (inStr && ch === '\n') out += '\\n';
                        else if (inStr && ch === '\r') out += '\\r';
                        else if (inStr && ch === '\t') out += '\\t';
                        else if (inStr && ch.charCodeAt(0) < 0x20) out += '';
                        else out += ch;
                    }
                    raw = out;
                    var data = JSON.parse(raw);
                    window[varName] = data;
                } catch (parseErr) {
                    // Non-JSON JS data from GitHub is expected; local data files are used instead
                    console.warn('GitHub data for ' + type + ' not JSON-compatible, using local data');
                }
            }
        } catch (e) {
            console.warn('Could not load ' + type + ' from GitHub:', e.message);
        }
    }

    // Special: load multi-var files
    var multiVarFiles = [
        { key: 'index_content', parser: parseIndexPageContent },
        { key: 'about_content', parser: parseAboutPageContent },
        { key: 'contact_content', parser: parseContactPageContent },
        { key: 'layout', parser: parseLayoutData }
    ];
    for (var mvi = 0; mvi < multiVarFiles.length; mvi++) {
        try {
            var mvPath = GITHUB_DATA_FILES[multiVarFiles[mvi].key];
            var mvContent = await fetchGitHubFileContent(mvPath);
            multiVarFiles[mvi].parser(mvContent);
        } catch (e) {
            console.warn('Could not load ' + multiVarFiles[mvi].key + ' from GitHub:', e.message);
        }
    }

    renderAllSections(); // includes renderDashboard()
    showToast('Data loaded from GitHub!', 'success');
}

function parseIndexPageContent(content) {
    // Parse multiple var declarations from index-page-data.js
    var varNames = ['INDEX_HERO', 'INDEX_STATS', 'INDEX_WHAT_WE_DO', 'INDEX_CASE_STUDY', 'INDEX_CTA', 'INDEX_WHY_CHOOSE', 'INDEX_SECTION_ORDER'];
    varNames.forEach(function (varName) {
        var regex = new RegExp('var\\s+' + varName + '\\s*=\\s*([\\{\\[][\\s\\S]*?);\\s*(?:var\\s|$)', 'g');
        var match = regex.exec(content);
        if (!match) {
            // Try without the trailing var lookahead (for last declaration)
            var regex2 = new RegExp('var\\s+' + varName + '\\s*=\\s*([\\{\\[][\\s\\S]*?);\\s*$', 'm');
            match = regex2.exec(content);
        }
        if (match) {
            try {
                var raw = match[1].trim();
                // Remove trailing semicolons
                raw = raw.replace(/;+$/, '');
                raw = raw.replace(/\/\/.*$/gm, '');
                raw = raw.replace(/\/\*[\s\S]*?\*\//g, '');
                raw = raw.replace(/,\s*([\]}])/g, '$1');
                raw = raw.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":');
                // Escape control characters
                var out = '', inStr = false;
                for (var ci = 0; ci < raw.length; ci++) {
                    var ch = raw[ci];
                    if (ch === '"' && (ci === 0 || raw[ci - 1] !== '\\')) { inStr = !inStr; out += ch; }
                    else if (inStr && ch === '\n') out += '\\n';
                    else if (inStr && ch === '\r') out += '\\r';
                    else if (inStr && ch === '\t') out += '\\t';
                    else if (inStr && ch.charCodeAt(0) < 0x20) out += '';
                    else out += ch;
                }
                var parsed = JSON.parse(out);
                window[varName] = parsed;
            } catch (e) {
                console.warn('Could not parse ' + varName + ':', e.message);
            }
        }
    });
}


async function testGitHubConnection() {
    var formConfig = getGitHubFormConfig();
    var statusEl = document.getElementById('github-status');

    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    statusEl.style.color = 'var(--text)';

    try {
        if (serverGitHubProxyAvailable) {
            var proxyRes = await fetch('/api/github/test', {
                method: 'POST',
                headers: Object.assign({
                    'Content-Type': 'application/json'
                }, getAdminAuthHeaders()),
                body: JSON.stringify(Object.assign(buildGitHubProxyPayload(formConfig), formConfig))
            });

            if (proxyRes.ok) {
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Connection Successful!';
                statusEl.style.color = 'var(--success)';
                return;
            }

            var proxyErr = await proxyRes.json().catch(function () { return {}; });
            statusEl.innerHTML = '<i class="fas fa-times-circle"></i> ' + escapeHTML(proxyErr.error || 'Connection Failed');
            statusEl.style.color = 'var(--danger)';
            return;
        }

        var res = await fetch('https://api.github.com/repos/' + formConfig.owner + '/' + formConfig.repo, {
            headers: { 'Authorization': 'token ' + formConfig.token }
        });

        if (res.ok) {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Connection Successful!';
            statusEl.style.color = 'var(--success)';
        } else {
            statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Connection Failed';
            statusEl.style.color = 'var(--danger)';
        }
    } catch (e) {
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error: ' + escapeHTML(e.message);
        statusEl.style.color = 'var(--danger)';
    }
}

// ==========================================
// 5. AUTH
// ==========================================

var authToken = sessionStorage.getItem('adminToken') || null;

function useModernAdminAuth() {
    return typeof AdminAuth !== 'undefined';
}

async function checkAuth() {
    if (useModernAdminAuth()) {
        hideLogin();
        return;
    }

    var isGitHubPages = !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1');

    if (isGitHubPages) {
        hideLogin();
        return;
    }

    if (authToken) {
        try {
            var res = await fetch('/api/check-auth', {
                headers: { 'X-Auth-Token': authToken }
            });
            var data = await res.json();
            if (data.authenticated) {
                hideLogin();
                return;
            }
        } catch (e) {
            hideLogin();
            return;
        }
    }
    showLogin();
}

async function doLogin() {
    var password = document.getElementById('login-password').value;
    var errorEl = document.getElementById('login-error');

    try {
        var res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });

        if (res.ok) {
            var data = await res.json();
            authToken = data.token;
            sessionStorage.setItem('adminToken', authToken);
            hideLogin();
            showToast('Login successful!', 'success');
        } else {
            errorEl.textContent = 'Invalid password. Please try again.';
            errorEl.style.display = 'block';
        }
    } catch (e) {
        errorEl.textContent = 'Server not running. Start it with: npm start';
        errorEl.style.display = 'block';
    }
}

function enableOfflineMode() {
    hideLogin();
    showToast('Running in Offline / GitHub Mode', 'info');

    if (!hasConfiguredGitHub()) {
        setTimeout(function () {
            if (confirm('GitHub is not configured. Do you want to configure it now?')) {
                openGitHubConfig();
            }
        }, 1000);
    }
}

async function doLogout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: { 'X-Auth-Token': authToken }
        });
    } catch (e) { }

    authToken = null;
    sessionStorage.removeItem('adminToken');
    showLogin();
    showToast('Logged out', 'success');
}

function showLogin() {
    if (useModernAdminAuth()) {
        if (typeof AdminAuth.renderLoginModal === 'function') {
            AdminAuth.renderLoginModal();
        }
        return;
    }

    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').style.display = 'none';
}

function hideLogin() {
    if (useModernAdminAuth()) {
        var legacyOverlay = document.getElementById('login-overlay');
        if (legacyOverlay) legacyOverlay.style.display = 'none';
        return;
    }

    document.getElementById('login-overlay').style.display = 'none';
}

// ==========================================
// 6. NAVIGATION
// ==========================================

var currentSection = 'dashboard';

function initNavigation() {
    document.querySelectorAll('.sidebar-nav a').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var section = link.dataset.section;
            showSection(section);
        });
    });
}

function showSection(section) {
    document.querySelectorAll('.sidebar-nav a').forEach(function (a) { a.classList.remove('active'); });
    var activeLink = document.querySelector('[data-section="' + section + '"]');
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.content-section').forEach(function (s) { s.classList.remove('active'); });
    var activeSection = document.getElementById(section);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    currentSection = section;
}

// ==========================================
// 7. DASHBOARD
// ==========================================

function renderDashboardStatCards(containerId, stats) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = (stats || []).map(function (s) {
        return '<div class="stat-card">' +
            '<i class="fas ' + s.icon + '"></i>' +
            '<div class="value">' + s.value + '</div>' +
            '<div class="label">' + s.label + '</div>' +
            '</div>';
    }).join('');
}

function formatDashboardTimestamp(value) {
    if (!value) return 'Not recorded yet';
    var date = new Date(value);
    if (isNaN(date.getTime())) return 'Not recorded yet';
    return date.toLocaleString();
}

async function loadWebsiteActivityMetrics() {
    var metaEl = document.getElementById('website-activity-meta');
    renderDashboardStatCards('website-activity-grid', [
        { icon: 'fa-users', value: '...', label: 'Unique Visitors' },
        { icon: 'fa-door-open', value: '...', label: 'Visits' },
        { icon: 'fa-eye', value: '...', label: 'Page Views' },
        { icon: 'fa-envelope', value: '...', label: 'Enquiries' }
    ]);
    if (metaEl) metaEl.textContent = 'Loading website activity...';

    try {
        var res = await fetch('/api/dashboard/metrics', {
            headers: getAdminAuthHeaders()
        });
        if (!res.ok) throw new Error('Metrics API unavailable');

        var metrics = await res.json();
        renderDashboardStatCards('website-activity-grid', [
            { icon: 'fa-users', value: metrics.uniqueVisitors || 0, label: 'Unique Visitors' },
            { icon: 'fa-door-open', value: metrics.totalVisits || 0, label: 'Visits' },
            { icon: 'fa-eye', value: metrics.totalPageViews || 0, label: 'Page Views' },
            { icon: 'fa-envelope', value: metrics.totalEnquiries || 0, label: 'Enquiries' }
        ]);

        if (metaEl) {
            metaEl.textContent = 'Last visit: ' + formatDashboardTimestamp(metrics.lastVisitAt) +
                ' | Last enquiry: ' + formatDashboardTimestamp(metrics.lastEnquiryAt);
        }
    } catch (err) {
        renderDashboardStatCards('website-activity-grid', [
            { icon: 'fa-users', value: 0, label: 'Unique Visitors' },
            { icon: 'fa-door-open', value: 0, label: 'Visits' },
            { icon: 'fa-eye', value: 0, label: 'Page Views' },
            { icon: 'fa-envelope', value: 0, label: 'Enquiries' }
        ]);
        if (metaEl) metaEl.textContent = 'Website activity stats are available only when the Express admin API is running.';
    }
}

function renderDashboard() {
    var products = getDataArray('products');

    var header = document.querySelector('#dashboard .section-header h2');
    if (header) header.textContent = 'Dashboard';

    var stats = [
        { icon: 'fa-cube', value: products ? products.length : 0, label: 'Products' },
        { icon: 'fa-layer-group', value: (getDataArray('services') || []).length, label: 'Services' },
        { icon: 'fa-building', value: (getDataArray('clients') || []).length, label: 'Clients' },
        { icon: 'fa-trophy', value: (getDataArray('stories') || []).length, label: 'Stories' },
        { icon: 'fa-comment-alt', value: (getDataArray('testimonials') || []).length, label: 'Testimonials' },
        { icon: 'fa-map-marker-alt', value: (getDataArray('locations') || []).length, label: 'Locations' },
        { icon: 'fa-users', value: (getDataArray('team') || []).length, label: 'Team' }
    ];

    renderDashboardStatCards('stats-grid', stats);
    loadWebsiteActivityMetrics();
}

// ==========================================
// 8. RENDER ALL SECTIONS
// ==========================================

function renderAllSections() {
    renderDashboard();
    renderProducts();
    renderServices();
    renderClients();
    renderTeam();
    renderStories();
    renderTestimonials();
    renderLocations();
    renderHomeCards();
    renderLinkedIn();
    loadPageContentToForm();
    loadAboutContentToForm();
    loadContactContentToForm();
    loadNavigationToForm();
    loadVisibilityEditor();
}

/**
 * Targeted section re-render — avoids full page rebuild after a single
 * add/edit/delete. Falls back to renderAllSections() for unknown types
 * so behaviour stays correct even if a new section is added later.
 */
function renderSection(type) {
    switch (type) {
        case 'products':     renderProducts();     break;
        case 'services':     renderServices();     break;
        case 'clients':      renderClients();      break;
        case 'team':         renderTeam();         break;
        case 'stories':      renderStories();      break;
        case 'testimonials': renderTestimonials(); break;
        case 'locations':    renderLocations();    break;
        case 'home':         renderHomeCards();    break;
        case 'linkedin':
        case 'news':         renderLinkedIn();     break;
        default:
            // Unknown / cross-section change — fall back to a full rebuild.
            // renderAllSections() includes renderDashboard(); skip the call below.
            renderAllSections();
            return;
    }
    renderDashboard(); // targeted path only — default branch returns early above
}

// ==========================================
// 9. SELECTION & BULK ACTIONS
// ==========================================

var selectionState = {
    products: new Set(),
    services: new Set(),
    team: new Set()
};

function toggleSelection(type, index, isChecked) {
    if (isChecked) {
        selectionState[type].add(index);
    } else {
        selectionState[type].delete(index);
    }
    updateBulkActionBar(type);
}

function updateBulkActionBar(type) {
    var bar = document.getElementById('bulk-action-bar');
    var countSpan = document.getElementById('bulk-count');
    var count = selectionState[type].size;

    if (count > 0) {
        bar.classList.add('active');
        countSpan.textContent = count + ' Selected';
        bar.dataset.currentType = type;
    } else {
        bar.classList.remove('active');
    }
}

function executeBulkDelete() {
    var bar = document.getElementById('bulk-action-bar');
    var type = bar.dataset.currentType;
    if (!type || selectionState[type].size === 0) return;

    if (!confirm('Are you sure you want to delete ' + selectionState[type].size + ' items?')) return;

    var arr = getDataArray(type);
    var indices = Array.from(selectionState[type]).sort(function (a, b) { return b - a; });

    indices.forEach(function (index) {
        arr.splice(index, 1);
    });

    selectionState[type].clear();
    updateBulkActionBar(type);
    markAsPending(type);
    showToast('Items deleted successfully');

    if (type === 'products') renderProducts();
    if (type === 'services') renderServices();
}

// ==========================================
// 10. GLOBAL SEARCH
// ==========================================

var _globalSearchTimeout = null;

function adminGlobalSearch(query) {
    var resultsList = document.getElementById('admin-global-search-results');
    if (!resultsList) return;

    clearTimeout(_globalSearchTimeout);

    var q = String(query || '').trim().toLowerCase();
    if (!q) {
        resultsList.innerHTML = '';
        resultsList.hidden = true;
        return;
    }

    _globalSearchTimeout = setTimeout(function () {
        var matches = [];

        var searchSets = [
            { section: 'products',     label: 'Product',       arr: window.PRODUCTS_DATA || [],      fields: ['name', 'category', 'description'] },
            { section: 'services',     label: 'Service',       arr: window.SERVICES_DATA || [],      fields: ['name', 'category', 'description'] },
            { section: 'team',         label: 'Team Member',   arr: window.TEAM_DATA || [],          fields: ['name', 'role', 'bio'] },
            { section: 'testimonials', label: 'Testimonial',   arr: window.TESTIMONIALS_DATA || [],  fields: ['name', 'author', 'role', 'quote'] },
            { section: 'clients',      label: 'Client',        arr: window.CLIENTS_DATA || [],       fields: ['name', 'description'] },
            { section: 'stories',      label: 'Success Story', arr: window.SUCCESS_STORIES_DATA || [], fields: ['title', 'client', 'description'] },
            { section: 'news',         label: 'News Post',     arr: window.NEWS_DATA || [],          fields: ['title', 'summary', 'content'] }
        ];

        searchSets.forEach(function (set) {
            if (!Array.isArray(set.arr)) return;
            set.arr.forEach(function (item) {
                if (!item) return;
                var hit = set.fields.some(function (f) {
                    var val = String(item[f] || '').toLowerCase();
                    return val.indexOf(q) !== -1;
                });
                if (hit && matches.length < 10) {
                    var displayName = item.name || item.title || item.author || '(unnamed)';
                    matches.push({ section: set.section, label: set.label, name: displayName });
                }
            });
        });

        if (!matches.length) {
            resultsList.innerHTML = '<li class="admin-global-search__no-results">No results for "' + escapeHTML(query) + '"</li>';
        } else {
            resultsList.innerHTML = matches.map(function (m) {
                return '<li class="admin-global-search__result" onclick="adminGlobalSearchNavigate(\'' + escapeHTML(m.section) + '\')">' +
                    '<span class="admin-global-search__result-type">' + escapeHTML(m.label) + '</span>' +
                    '<span class="admin-global-search__result-name">' + escapeHTML(m.name) + '</span>' +
                '</li>';
            }).join('');
        }
        resultsList.hidden = false;
    }, 150);
}

function adminGlobalSearchNavigate(section) {
    var resultsList = document.getElementById('admin-global-search-results');
    var input = document.getElementById('admin-global-search-input');
    if (resultsList) { resultsList.innerHTML = ''; resultsList.hidden = true; }
    if (input) input.value = '';

    // Activate the section in the sidebar nav
    var link = document.querySelector('.sidebar-nav a[data-section="' + section + '"]');
    if (link) link.click();
}

// Close search results when clicking outside
document.addEventListener('click', function (e) {
    var container = document.querySelector('.admin-global-search');
    var resultsList = document.getElementById('admin-global-search-results');
    if (resultsList && container && !container.contains(e.target)) {
        resultsList.innerHTML = '';
        resultsList.hidden = true;
    }
});

// ==========================================
// 11. FILTERING
// ==========================================

var filterState = {
    products: { search: '', category: '' },
    services: { search: '', category: '' }
};

function renderFilters(type) {
    var arr = getDataArray(type);
    if (!arr || !Array.isArray(arr)) return '';

    var categories = [];
    var seen = {};
    arr.forEach(function (i) {
        if (i.category && !seen[i.category]) {
            seen[i.category] = true;
            categories.push(i.category);
        }
    });
    categories.sort();

    return '<div class="filter-controls">' +
        '<input type="text" class="form-control flex-2" placeholder="Search..." ' +
        'value="' + filterState[type].search + '" ' +
        'oninput="updateFilter(\'' + type + '\', \'search\', this.value)">' +
        '<select class="form-control flex-1" onchange="updateFilter(\'' + type + '\', \'category\', this.value)">' +
        '<option value="">All Categories</option>' +
        categories.map(function (c) {
            return '<option value="' + c + '"' + (filterState[type].category === c ? ' selected' : '') + '>' + c + '</option>';
        }).join('') +
        '</select>' +
        '</div>';
}

function updateFilter(type, key, value) {
    filterState[type][key] = value;
    if (type === 'products') renderProducts();
    if (type === 'services') renderServices();
}

// ==========================================
// 11. GENERIC RENDERING WITH NESTING
// ==========================================

function renderWithNesting(type, data, gridId) {
    if (!data || !Array.isArray(data)) return;
    var grid = document.getElementById(gridId);
    if (!grid) return;

    var search = filterState[type] ? filterState[type].search.toLowerCase() : '';
    var category = filterState[type] ? filterState[type].category : '';

    var html = renderFilters(type);
    html += '<div class="items-grid">';

    data.forEach(function (item, index) {
        var matchesSearch = (item.name || item.title || '').toLowerCase().includes(search) ||
            (item.category || '').toLowerCase().includes(search);
        var matchesCategory = !category || item.category === category;

        // Filtering active: flat list
        if (search || category) {
            if (matchesSearch && matchesCategory) {
                html += renderItemCard(type, item, index, item.isNested);
            }
            return;
        }

        // No filter: hierarchy
        if (item.isNested) return;

        html += renderItemCard(type, item, index);

        var children = item.subServices || item.subProducts;
        if (children && children.length > 0) {
            html += '<div class="nested-items-container">';
            children.forEach(function (childRef) {
                var childIndex = data.findIndex(function (d) { return d.id === childRef.id; });
                if (childIndex !== -1) {
                    html += renderItemCard(type, data[childIndex], childIndex, true);
                }
            });
            html += '</div>';
        }
    });
    html += '</div>';
    grid.innerHTML = html;

    // Initialize Sortable
    if (!search && !category && typeof Sortable !== 'undefined') {
        var container = grid.querySelector('.items-grid');
        if (container) {
            new Sortable(container, {
                animation: 150,
                handle: '.drag-handle',
                onEnd: function (evt) {
                    var oldIndex = evt.oldIndex;
                    var newIndex = evt.newIndex;

                    if (oldIndex === newIndex) return;

                    var movedItem = data.splice(oldIndex, 1)[0];
                    data.splice(newIndex, 0, movedItem);

                    markAsPending(type);
                    showToast(type.slice(0, -1) + ' reordered');
                    renderWithNesting(type, data, gridId);
                }
            });
        }
    }
}

function renderItemCard(type, item, index, isChild) {
    isChild = isChild || false;
    var title = escapeHTML(item.title || item.name || 'Untitled');
    var category = escapeHTML(item.category || (type === 'products' ? 'Uncategorized' : 'Item'));

    if (type === 'home' && !item.title) {
        title = escapeHTML(item.tag || 'Untitled Card');
        category = escapeHTML(item.link || 'No Link');
    }

    if (type === 'team') {
        title = escapeHTML(item.name);
        category = escapeHTML(item.role);
    }

    if (type === 'testimonials') {
        title = escapeHTML(item.name);
        category = escapeHTML(item.location);
    }

    var badge = isChild ? '<span class="badge" style="background:var(--accent); color:white; font-size:10px; margin-left:10px;">NESTED</span>' : '';
    var isSelected = selectionState[type] && selectionState[type].has(index);

    // Image Logic
    var imageUrl = item.image || (item.gallery && item.gallery.length > 0 ? item.gallery[0] : null);

    if (type === 'testimonials' && item.logo) {
        if (item.logo.startsWith('http') || item.logo.startsWith('assets/')) {
            imageUrl = item.logo;
        } else {
            imageUrl = 'assets/images/testimonials/' + item.logo;
        }
    }

    if (type === 'clients' && item.logo) {
        if (item.logo.startsWith('http') || item.logo.startsWith('assets/')) {
            imageUrl = item.logo;
        } else {
            imageUrl = 'assets/images/clients/' + item.logo;
        }
    }

    var imageHtml = imageUrl ?
        '<div class="card-preview-image">' +
        '<img loading="lazy" src="' + escapeHTML(imageUrl) + '" alt="' + title + '" onerror="this.src=\'assets/images/logo/tridel.png\'">' +
        '</div>' : '';

    return '<div class="item-card ' + (isChild ? 'nested-card' : '') + '">' +
        imageHtml +
        '<div class="item-card-header">' +
        '<div class="item-header-content">' +
        (!isChild ? '<input type="checkbox" class="checkbox-sm" ' +
            (isSelected ? 'checked' : '') +
            ' onchange="toggleSelection(\'' + escapeHTML(type) + '\', ' + index + ', this.checked)">' : '') +
        (!isChild ? '<i class="fas fa-grip-vertical drag-handle drag-handle-icon"></i>' : '') +
        '<div>' +
        '<h3>' + escapeHTML(title) + ' ' + badge + '</h3>' +
        '<span class="category">' + category + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<p>' + escapeHTML(item.description || item.quote || item.text || (item.items ? item.items.join(', ') : '') || '').substring(0, 100) +
        ((item.description || item.quote || item.text || (item.items ? item.items.join(', ') : '')) ? '...' : '') + '</p>' +
        '<div class="item-card-actions">' +
        '<button class="btn btn-secondary btn-icon" onclick="editItem(\'' + type + '\', ' + index + ')">' +
        '<i class="fas fa-edit"></i> Edit</button>' +
        '<button class="btn btn-danger btn-icon" onclick="deleteItem(\'' + type + '\', ' + index + ')">' +
        '<i class="fas fa-trash"></i></button>' +
        '</div>' +
        '</div>';
}

// ==========================================
// 12. SECTION RENDERERS
// ==========================================

function renderProducts() {
    renderWithNesting('products', getDataArray('products'), 'products-grid');
}

function renderServices() {
    renderWithNesting('services', getDataArray('services'), 'services-grid');
}

function renderClients() {
    var data = getDataArray('clients');
    var grid = document.getElementById('clients-grid');

    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No clients found.</div>';
        return;
    }

    grid.innerHTML = '<div class="items-grid">' +
        data.map(function (item, i) { return renderItemCard('clients', item, i); }).join('') +
        '</div>';

    if (typeof Sortable !== 'undefined') {
        var container = grid.querySelector('.items-grid');
        if (container) {
            new Sortable(container, {
                animation: 150,
                handle: '.drag-handle',
                onEnd: function (evt) {
                    var oldIndex = evt.oldIndex;
                    var newIndex = evt.newIndex;
                    if (oldIndex !== newIndex) {
                        var item = data.splice(oldIndex, 1)[0];
                        data.splice(newIndex, 0, item);
                        markAsPending('clients');
                    }
                }
            });
        }
    }
}

function renderStories() {
    renderDataGrid('stories', 'SUCCESS_STORIES_DATA', 'stories-grid');
}

function renderLocations() {
    var grid = document.getElementById('locations-grid');
    var locations = getDataArray('locations');

    if (!grid) return;

    grid.innerHTML = '<div class="items-grid">' + locations.map(function (item, index) {
        return '<div class="item-card">' +
            '<div class="item-card-header"><div>' +
            '<h3>' + escapeHTML(item.name) + '</h3>' +
            '<span class="category">' + escapeHTML(item.country) + ' · ' + escapeHTML(item.type) + '</span>' +
            '</div></div>' +
            '<p><strong>Address:</strong><br>' + escapeHTML(item.address) + '</p>' +
            '<div class="item-card-actions">' +
            '<button type="button" class="btn btn-secondary btn-icon" onclick="editItem(\'locations\', ' + index + ')">' +
            '<i class="fas fa-edit"></i> Edit</button>' +
            '<button type="button" class="btn btn-danger btn-icon" onclick="deleteItem(\'locations\', ' + index + ')">' +
            '<i class="fas fa-trash"></i></button>' +
            '</div></div>';
    }).join('') + '</div>';
}

function renderHomeCards() {
    var data = getDataArray('home');
    var grid = document.getElementById('home-grid');
    if (grid) {
        grid.innerHTML = data.map(function (h, i) {
            return '<div class="item-card">' +
                '<div class="item-card-header"><div>' +
                '<h3>' + escapeHTML(h.title) + '</h3>' +
                '</div></div>' +
                '<p>' + escapeHTML(h.description || (h.items ? h.items.join(', ') : '') || '').substring(0, 100) +
                ((h.description || h.items) ? '...' : '') + '</p>' +
                '<div class="item-card-actions">' +
                '<button type="button" class="btn btn-secondary btn-icon" onclick="editItem(\'home\', ' + i + ')">' +
                '<i class="fas fa-edit"></i> Edit</button>' +
                '<button type="button" class="btn btn-danger btn-icon" onclick="deleteItem(\'home\', ' + i + ')">' +
                '<i class="fas fa-trash"></i></button>' +
                '</div></div>';
        }).join('');
    }
}

function renderLinkedIn() {
    var data = getDataArray('linkedin');
    var grid = document.getElementById('linkedin-grid');
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No LinkedIn posts added yet. Click "Add Post" to embed a LinkedIn post.</div>';
        return;
    }

    grid.innerHTML = '<div class="items-grid">' + data.map(function (post, i) {
        var embedUrl = normalizeLinkedInEmbedUrl(post.embedUrl || '');
        var displayUrl = embedUrl.length > 70
            ? escapeHTML(embedUrl.substring(0, 67)) + '...'
            : escapeHTML(embedUrl);

        // Extract URN identifier from embed URL for display
        var urnMatch = embedUrl.match(/urn:li:\w+:\d+/);
        var urnLabel = urnMatch ? urnMatch[0] : 'Unknown';

        return '<div class="item-card">' +
            '<div class="item-card-header"><div>' +
            '<h3><i class="fab fa-linkedin" style="color: #0077b5; margin-right: 8px;"></i> Post ' + (i + 1) + '</h3>' +
            '<span class="category">' + escapeHTML(urnLabel) + '</span>' +
            '</div></div>' +
            '<div style="margin:10px 0; background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:12px; overflow:hidden;">' +
            '<iframe src="' + escapeHTML(embedUrl) + '" height="300" width="100%" frameborder="0" ' +
            'style="border:none; border-radius:4px;" loading="lazy" title="LinkedIn Preview"></iframe>' +
            '</div>' +
            '<p class="text-xs font-mono break-all" style="opacity:0.5; word-break:break-all;">' + displayUrl + '</p>' +
            '<div class="item-card-actions">' +
            '<button type="button" class="btn btn-secondary btn-icon" onclick="editItem(\'linkedin\', ' + i + ')">' +
            '<i class="fas fa-edit"></i> Edit</button>' +
            '<button type="button" class="btn btn-danger btn-icon" onclick="deleteItem(\'linkedin\', ' + i + ')">' +
            '<i class="fas fa-trash"></i></button>' +
            '</div></div>';
    }).join('') + '</div>';
}

function renderDataGrid(type, dataVarName, gridId) {
    var grid = document.getElementById(gridId);
    if (!grid) return;

    var data = window[dataVarName];
    if (typeof data === 'undefined') {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error: ' + dataVarName + ' is not defined.</div>';
        return;
    }

    if (!Array.isArray(data)) {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error: ' + dataVarName + ' is not an array.</div>';
        return;
    }

    if (data.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No items found.</div>';
        return;
    }

    try {
        grid.innerHTML = '<div class="items-grid">' +
            data.map(function (item, i) { return renderItemCard(type, item, i); }).join('') +
            '</div>';

        if (typeof Sortable !== 'undefined') {
            var container = grid.querySelector('.items-grid');
            if (container) {
                new Sortable(container, {
                    animation: 150,
                    handle: '.drag-handle',
                    onEnd: function (evt) {
                        var oldIndex = evt.oldIndex;
                        var newIndex = evt.newIndex;
                        if (oldIndex !== newIndex) {
                            var item = data.splice(oldIndex, 1)[0];
                            data.splice(newIndex, 0, item);
                            markAsPending(type);
                        }
                    }
                });
            }
        }
    } catch (e) {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error rendering grid: ' + escapeHTML(e.message) + '</div>';
    }
}

function renderTeam() {
    renderDataGrid('team', 'TEAM_DATA', 'team-grid');
}

function renderTestimonials() {
    renderDataGrid('testimonials', 'TESTIMONIALS_DATA', 'testimonials-grid');
}

// ==========================================
// 13. MODAL CRUD
// ==========================================

var currentEditType = null;
var currentEditIndex = null;

function openAddModal(type) {
    currentEditType = type;
    currentEditIndex = null;
    document.getElementById('modal-title').textContent = 'Add ' + type.charAt(0).toUpperCase() + type.slice(1);
    document.getElementById('modal-body').innerHTML = getFormHTML(type, {});
    document.getElementById('modal-overlay').classList.add('active');
}

function editItem(type, index) {
    currentEditType = type;
    currentEditIndex = index;
    var data = getDataArray(type)[index];
    document.getElementById('modal-title').textContent = 'Edit ' + type.charAt(0).toUpperCase() + type.slice(1);
    document.getElementById('modal-body').innerHTML = getFormHTML(type, data);
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    currentEditType = null;
    currentEditIndex = null;
}

// ==========================================
// 14. FORM GENERATION
// ==========================================


function getParentOptions(type, currentId) {
    var arr = getDataArray(type);
    if (!arr || !Array.isArray(arr)) return '<option value="">(None)</option>';

    var currentParentId = '';
    if (currentId) {
        var parent = arr.find(function (p) {
            var subs = type === 'products' ? p.subProducts : p.subServices;
            return subs && subs.some(function (s) { return (s.id || s) === currentId; });
        });
        if (parent) currentParentId = parent.id;
    }

    var options = '<option value="">(None)</option>';
    arr.forEach(function (item) {
        if (item.id === currentId) return;
        if (item.isNested) return;

        var selected = item.id === currentParentId ? 'selected' : '';
        var name = escapeHTML(item.name || item.title || 'Untitled');
        options += '<option value="' + escapeHTML(item.id) + '" ' + selected + '>' + name + '</option>';
    });
    return options;
}

function getFormHTML(type, data) {
    switch (type) {
        case 'products':
            var productGallery = data.gallery || (data.image ? [data.image] : []);
            return '<div class="form-group">' +
                '<label>Product Name <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-name" value="' + (data.name || '') + '" placeholder="e.g. Coastal Buoy">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Category</label>' +
                '<input type="text" class="form-control" id="field-category" value="' + (data.category || '') + '" placeholder="e.g. Buoys / Vessels / Equipment">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Nest under Parent (Optional)</label>' +
                '<select class="form-control" id="field-parent">' +
                getParentOptions('products', data.id) +
                '</select>' +
                '<small style="color:var(--text-muted)">If selected, this product will appear inside the parent\'s page.</small>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Description</label>' +
                '<textarea class="form-control" id="field-description" placeholder="Product description...">' + (data.description || data.longDescription || '') + '</textarea>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Key Features</label>' +
                '<div id="features-container">' +
                (data.features || []).map(function (f) {
                    var match = f.match(/<strong>(.*?)<\/strong>(.*)/);
                    var title = match ? match[1] : '';
                    var desc = match ? match[2] : f;
                    return '<div class="feature-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: start;">' +
                        '<div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">' +
                        '<input type="text" class="form-control feature-title" value="' + title.replace(/"/g, '&quot;') + '" placeholder="Title (e.g. Dimensions:)">' +
                        '<input type="text" class="form-control feature-desc" value="' + desc.trim().replace(/"/g, '&quot;') + '" placeholder="Description">' +
                        '</div>' +
                        '<button type="button" class="btn btn-danger" style="height: fit-content; padding: 5px 10px;" onclick="this.closest(\'.feature-row\').remove()"><i class="fas fa-times"></i></button>' +
                        '</div>';
                }).join('') +
                '</div>' +
                '<button type="button" class="btn btn-secondary" style="font-size: 0.9em; padding: 5px 10px;" onclick="addFeature()">' +
                '<i class="fas fa-plus"></i> Add Feature</button>' +
                '</div>' +
                getGalleryHTML(productGallery) +
                '<div class="form-group">' +
                '<label>Link</label>' +
                '<input type="text" class="form-control" id="field-link" value="' + (data.link || '') + '" placeholder="#/products/detail?id=...">' +
                '</div>';

        case 'services':
            var serviceGallery = data.gallery || (data.image ? [data.image] : []);
            return '<div class="form-group">' +
                '<label>Service Title <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-title" value="' + (data.title || data.name || '') + '" placeholder="e.g. Hydrographic Surveys">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Category</label>' +
                '<input type="text" class="form-control" id="field-category" value="' + (data.category || '') + '" placeholder="e.g. Environmental Monitoring">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Nest under Parent (Optional)</label>' +
                '<select class="form-control" id="field-parent">' +
                getParentOptions('services', data.id) +
                '</select>' +
                '<small style="color:var(--text-muted)">If selected, this service will appear inside the parent\'s page.</small>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Description</label>' +
                '<textarea class="form-control" id="field-description" placeholder="Service description...">' + (data.description || '') + '</textarea>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Features</label>' +
                '<div id="service-features-container">' +
                (data.features || []).map(function (f) {
                    return '<div class="service-feature-row" style="display:flex;gap:10px;margin-bottom:10px;">' +
                        '<input type="text" class="form-control service-feature-input" value="' + f.replace(/"/g, '&quot;') + '" placeholder="Feature description">' +
                        '<button type="button" class="btn btn-danger" style="padding:5px 10px;" onclick="this.closest(\'.service-feature-row\').remove()"><i class="fas fa-times"></i></button>' +
                        '</div>';
                }).join('') +
                '</div>' +
                '<button type="button" class="btn btn-secondary" style="font-size:0.9em;padding:5px 10px;" onclick="addServiceFeature()">' +
                '<i class="fas fa-plus"></i> Add Feature</button>' +
                '</div>' +
                getGalleryHTML(serviceGallery) +
                '<div class="form-group">' +
                '<label>Link</label>' +
                '<input type="text" class="form-control" id="field-link" value="' + (data.link || '') + '" placeholder="#/services/detail?id=...">' +
                '</div>';

        case 'testimonials':
            return '<div class="form-group">' +
                '<label>Company Name</label>' +
                '<input type="text" class="form-control" id="field-name" value="' + (data.name || '') + '" placeholder="e.g. Shankar Surveys">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Person Name (Author)</label>' +
                '<input type="text" class="form-control" id="field-author" value="' + (data.author || '') + '" placeholder="e.g. Sreenivasan Shankar">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Role</label>' +
                '<input type="text" class="form-control" id="field-role" value="' + (data.role || '') + '" placeholder="e.g. Founder & Director">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Location</label>' +
                '<input type="text" class="form-control" id="field-location" value="' + (data.location || '') + '" placeholder="e.g. Navi Mumbai, India">' +
                '</div>' +
                '<div class="form-group" style="display:flex; gap:10px;">' +
                '<div style="flex:1"><label>Latitude</label>' +
                '<input type="number" step="any" class="form-control" id="field-lat" value="' + (data.lat || '') + '" placeholder="19.0760"></div>' +
                '<div style="flex:1"><label>Longitude</label>' +
                '<input type="number" step="any" class="form-control" id="field-lng" value="' + (data.lng || '') + '" placeholder="72.8777"></div>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Quote <span style="color:red">*</span></label>' +
                '<textarea class="form-control" id="field-quote" placeholder="Testimonial text...">' + (data.quote || '') + '</textarea>' +
                '</div>' +
                getSingleImageFieldHTML('Logo / Client Image <span style="color:red">*</span>', 'field-logo', data.logo) +
                '<small style="color: var(--text-muted); display: block; margin-top: -10px; margin-bottom: 20px;">' +
                '<i class="fas fa-info-circle"></i> Place files in <code>assets/images/testimonials/</code>. For shared logos, you can use <code>../clients/filename.png</code>.</small>';

        case 'clients':
            return '<div class="form-group">' +
                '<label>Client Name <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-name" value="' + (data.name || '') + '" placeholder="Saudi Aramco">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Category</label>' +
                '<input type="text" class="form-control" id="field-category" value="' + (data.category || '') + '" placeholder="Government / Energy / Marine">' +
                '</div>' +
                getSingleImageFieldHTML('Client Logo <span style="color:red">*</span>', 'field-logo', data.logo);

        case 'stories':
            return '<div class="form-group">' +
                '<label>Project Title <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-title" value="' + (data.title || '') + '" placeholder="e.g. Red Sea Environmental Monitoring">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Category</label>' +
                '<input type="text" class="form-control" id="field-category" value="' + (data.category || '') + '" placeholder="e.g. Environmental / Surveying">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Description</label>' +
                '<textarea class="form-control" id="field-description" placeholder="Project description...">' + (data.description || '') + '</textarea>' +
                '</div>' +
                getSingleImageFieldHTML('Project Image <small class="text-muted-sm">(Optional)</small>', 'field-image', data.image);

        case 'home':
            return '<div class="form-group">' +
                '<label>Card Title <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-title" value="' + (data.title || '') + '" placeholder="e.g. Our Products">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Description</label>' +
                '<textarea class="form-control" id="field-description" placeholder="Card description...">' + (data.description || '') + '</textarea>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Link</label>' +
                '<input type="text" class="form-control" id="field-link" value="' + (data.link || '') + '" placeholder="#/products">' +
                '</div>' +
                getSingleImageFieldHTML('Card Image <span style="color:red">*</span>', 'field-image', data.image);

        case 'linkedin':
            var liData = data || {};
            var normalizedLinkedInUrl = normalizeLinkedInEmbedUrl(liData.embedUrl || '');
            return '<div class="form-group">' +
                '<label>LinkedIn Embed URL <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-embedUrl" value="' + escapeHTML(normalizedLinkedInUrl) + '" ' +
                'placeholder="https://www.linkedin.com/embed/feed/update/urn:li:share:1234567890" ' +
                'oninput="previewLinkedInEmbed(this.value)">' +
                '<small style="color: var(--text-muted); display: block; margin-top: 8px;">' +
                '<i class="fas fa-info-circle"></i> <strong>How to get the Embed URL:</strong><br>' +
                '1. Go to the LinkedIn post<br>' +
                '2. Click the <strong>···</strong> menu → <strong>Embed this post</strong><br>' +
                '3. Copy the URL from the <code>src="..."</code> attribute in the embed code<br>' +
                'Format: <code>https://www.linkedin.com/embed/feed/update/urn:li:share:XXXXXXXXX</code>' +
                '</small>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Preview</label>' +
                '<div id="linkedin-embed-preview" style="background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:12px; min-height:100px; display:flex; align-items:center; justify-content:center;">' +
                (normalizedLinkedInUrl
                    ? '<iframe src="' + escapeHTML(normalizedLinkedInUrl) + '" height="400" width="100%" frameborder="0" style="border:none; border-radius:4px;" loading="lazy" title="LinkedIn Preview"></iframe>'
                    : '<span style="color:var(--text-muted);"><i class="fab fa-linkedin" style="font-size:2rem; opacity:0.3; margin-right:10px;"></i> Enter an embed URL above to preview</span>') +
                '</div>' +
                '</div>';

        case 'team':
            return '<div class="form-group">' +
                '<label>Name <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-name" value="' + (data.name || '') + '" placeholder="e.g. John Doe">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Role / Job Title</label>' +
                '<input type="text" class="form-control" id="field-role" value="' + (data.role || '') + '" placeholder="e.g. Managing Director">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Bio</label>' +
                '<textarea class="form-control" id="field-bio" placeholder="Brief biography...">' + (data.bio || '') + '</textarea>' +
                '</div>' +
                getSingleImageFieldHTML('Member Photo <span style="color:red">*</span>', 'field-image', data.image);

        case 'locations':
            return '<div class="form-group">' +
                '<label>Location Name <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-name" value="' + (data.name || data.companyName || '') + '" placeholder="e.g. Tridel Technologies FZCO">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Office Designation</label>' +
                '<input type="text" class="form-control" id="field-designation" value="' + (data.designation || data.type || '') + '" placeholder="e.g. Head Office - UAE">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Country</label>' +
                '<input type="text" class="form-control" id="field-country" value="' + (data.country || '') + '" placeholder="e.g. India">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Type</label>' +
                '<input type="text" class="form-control" id="field-type" value="' + (data.type || '') + '" placeholder="e.g. Office / Project Site">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Address</label>' +
                '<textarea class="form-control" id="field-address" placeholder="Full address...">' + (data.address || '') + '</textarea>' +
                '</div>' +
                '<div class="form-group" style="display:flex; gap:10px;">' +
                '<div style="flex:1"><label>Latitude</label>' +
                '<input type="number" step="any" class="form-control" id="field-lat" value="' + (data.lat || '') + '" placeholder="19.0760"></div>' +
                '<div style="flex:1"><label>Longitude</label>' +
                '<input type="number" step="any" class="form-control" id="field-lng" value="' + (data.lng || '') + '" placeholder="72.8777"></div>' +
                '</div>';
    }
}

// ==========================================
// 15. FORM HELPERS
// ==========================================


// Live preview helper for LinkedIn embed URL input


function validateForm(type) {
    var errors = [];
    var requiredFields = {
        products: ['field-name', 'field-image'],
        services: ['field-title', 'field-image'],
        clients: ['field-name', 'field-logo'],
        stories: ['field-title'],
        home: ['field-title', 'field-image'],
        team: ['field-name', 'field-image'],
        testimonials: ['field-quote', 'field-logo']
    };

    var fieldsToCheck = requiredFields[type] || [];

    fieldsToCheck.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) {
            if (id.includes('image') || id.includes('logo')) {
                var singleInput = document.getElementById(id);
                var galleryInput = document.getElementById('field-gallery');

                var hasSingle = singleInput && singleInput.value.trim().length > 0;
                var hasGallery = galleryInput && JSON.parse(galleryInput.value || '[]').length > 0;

                if (!hasSingle && !hasGallery) {
                    errors.push('Image/Logo is required');
                }
            }
            return;
        }

        if (!el.value || el.value.trim() === '') {
            var label = el.previousElementSibling ? el.previousElementSibling.textContent : id;
            errors.push(label + ' is required');
        }
    });

    return errors;
}

// ==========================================
// 16. SAVE ITEM
// ==========================================

function saveItem() {
    // Validation
    if (currentEditType !== 'linkedin') {
        var validationErrors = validateForm(currentEditType);
        if (validationErrors.length > 0) {
            showToast('Validation Error: ' + validationErrors[0], 'error');
            return;
        }
    } else {
        var embedUrlField = document.getElementById('field-embedUrl');
        var embedUrlVal = normalizeLinkedInEmbedUrl(embedUrlField.value);
        if (!embedUrlVal) { showToast('Validation Error: LinkedIn Embed URL is required', 'error'); return; }
        embedUrlField.value = embedUrlVal;
        if (!embedUrlVal.includes('linkedin.com/embed/')) {
            showToast('Warning: URL should be a LinkedIn embed URL (linkedin.com/embed/...)', 'info');
        }
    }

    var arr = getDataArray(currentEditType);

    // LinkedIn
    if (currentEditType === 'linkedin') {
        var embedUrlField = document.getElementById('field-embedUrl');
        var embedUrl = normalizeLinkedInEmbedUrl(embedUrlField.value);
        embedUrlField.value = embedUrl;
        var postObj = { embedUrl: embedUrl };

        if (currentEditIndex !== null) {
            arr[currentEditIndex] = postObj;
        } else {
            arr.push(postObj);
        }
    } else {
        // Normal object-based data
        var data = {};
        document.querySelectorAll('#modal-body .form-control').forEach(function (input) {
            if (input.classList.contains('feature-title') ||
                input.classList.contains('feature-desc') ||
                input.classList.contains('service-feature-input')) return;

            var key = input.id.replace('field-', '');
            var val = input.value;

            if (key === 'lat' || key === 'lng') {
                val = val ? parseFloat(val) : 0;
            }

            data[key] = val;
        });

        // Features (Products)
        if (currentEditType === 'products') {
            var features = [];
            document.querySelectorAll('#features-container .feature-row').forEach(function (row) {
                var title = row.querySelector('.feature-title').value.trim();
                var desc = row.querySelector('.feature-desc').value.trim();
                if (title || desc) {
                    features.push('<strong>' + title + '</strong> ' + desc);
                }
            });
            if (features.length > 0) data.features = features;

            // The admin exposes a single product description field, while some
            // website views may still read longDescription. Keep them aligned.
            if (data.description) data.longDescription = data.description;
            else if (data.longDescription) data.description = data.longDescription;
        }

        // Features (Services)
        if (currentEditType === 'services') {
            var sFeatures = [];
            document.querySelectorAll('#service-features-container .service-feature-input').forEach(function (input) {
                if (input.value.trim()) sFeatures.push(input.value.trim());
            });
            if (sFeatures.length > 0) data.features = sFeatures;

            // The website renders service names from `name`, while the admin form edits `title`.
            if (data.title) data.name = data.title;
            else if (data.name) data.title = data.name;
        }

        if (currentEditType === 'locations') {
            if (data.name) data.companyName = data.name;
            else if (data.companyName) data.name = data.companyName;

            if (!data.designation && data.type) data.designation = data.type;
        }

        // Gallery
        var galleryField = document.getElementById('field-gallery');
        if (galleryField) {
            try {
                data.gallery = JSON.parse(galleryField.value) || [];
                if (data.gallery.length > 0) {
                    data.image = data.gallery[0];
                }
            } catch (e) {
                data.gallery = [];
            }
        }

        // Clients logo
        if (currentEditType === 'clients' && data.gallery && data.gallery.length > 0) {
            data.logo = data.gallery[0];
            delete data.gallery;
            delete data.image;
        }

        // Stories/Home cleanup
        if ((currentEditType === 'stories' || currentEditType === 'home') && data.gallery) {
            delete data.gallery;
        }

        // Push or merge data BEFORE nesting so dataObj reference is correct
        if (currentEditIndex !== null) {
            Object.assign(arr[currentEditIndex], data);
        } else {
            arr.push(data);
        }

        // Nesting (must come after push so new items exist in arr)
        var parentField = document.getElementById('field-parent');
        if (parentField && (currentEditType === 'products' || currentEditType === 'services')) {
            var parentId = parentField.value;
            var dataObj = currentEditIndex !== null ? arr[currentEditIndex] : arr[arr.length - 1];

            // Clean up old relationships
            arr.forEach(function (p) {
                if (currentEditType === 'products') {
                    if (p.subProducts) {
                        p.subProducts = p.subProducts.filter(function (ref) { return (ref.id || ref) !== dataObj.id; });
                        if (p.subProducts.length === 0) delete p.subProducts;
                    }
                } else {
                    if (p.subServices) {
                        p.subServices = p.subServices.filter(function (ref) { return (ref.id || ref) !== dataObj.id; });
                        if (p.subServices.length === 0) delete p.subServices;
                    }
                }
            });

            // Establish new relationship
            if (parentId) {
                dataObj.isNested = true;
                var newParent = arr.find(function (p) { return p.id === parentId; });
                if (newParent) {
                    if (currentEditType === 'products') {
                        if (!newParent.subProducts) newParent.subProducts = [];
                        newParent.subProducts.push({ id: dataObj.id });
                    } else {
                        if (!newParent.subServices) newParent.subServices = [];
                        newParent.subServices.push({ id: dataObj.id });
                    }
                }
            } else {
                dataObj.isNested = false;
            }
        }
    }

    markAsPending(currentEditType);
    closeModal();
    renderSection(currentEditType);
}

function deleteItem(type, index) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    var arr = getDataArray(type);
    arr.splice(index, 1);
    markAsPending(type);
    renderSection(type);
}

// ==========================================
// 17. PENDING CHANGES & PUBLISH
// ==========================================

var pendingChanges = new Set();

// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', function (e) {
    if (pendingChanges.size > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});


async function publishPendingChangeToServer(serverType, data) {
    var response = await fetch('/api/data/' + serverType, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        return response.json().catch(function () { return {}; });
    }

    if (response.status === 401) {
        showToast('Session expired - please login again', 'error');
        showLogin();
        throw new Error('Session expired - please login again');
    }

    var err = await response.json().catch(function () { return {}; });
    throw new Error(err.error || ('Server publish failed (' + response.status + ')'));
}


// ==========================================
// 18. SAVE TO SERVER
// ==========================================

async function saveToServer(type, data) {
    if (hasConfiguredGitHub()) {
        await saveToGitHub(type, data);
        return;
    }

    try {
        var response = await fetch('/api/data/' + type, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': authToken
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            var result = await response.json();
            showToast(type + ' saved to file! (' + result.count + ' items)', 'success');
        } else if (response.status === 401) {
            showToast('Session expired - please login again', 'error');
            showLogin();
        } else {
            var err = await response.json();
            showToast('Failed to save: ' + err.error, 'error');
        }
    } catch (err) {
        showToast('Configure GitHub in Settings to save changes online', 'error');
    }
}

// ==========================================
// 19. PREVIEW
// ==========================================

function showPreview() {
    if (!currentEditType || !['products', 'services'].includes(currentEditType)) {
        showToast('Preview only available for Products and Services', 'error');
        return;
    }

    var name = (document.getElementById('field-name') || document.getElementById('field-title') || {}).value || 'Untitled';
    var cat = (document.getElementById('field-category') || {}).value || '';
    var description = (document.getElementById('field-description') || {}).value || '';
    var gallery = [];
    try {
        gallery = JSON.parse((document.getElementById('field-gallery') || {}).value || '[]');
    } catch (e) { gallery = []; }

    var mainImage = gallery[0] || 'assets/images/logo/tridel.png';

    var previewHTML = '<div class="preview-card">' +
        '<div class="preview-image">' +
        '<img loading="lazy" src="' + escapeHTML(mainImage) + '" alt="' + escapeHTML(name) + '" onerror="this.src=\'assets/images/logo/tridel.png\'">' +
        (gallery.length > 1 ? '<span class="preview-gallery-count"><i class="fas fa-images"></i> ' + gallery.length + ' images</span>' : '') +
        '</div>' +
        '<div class="preview-content">' +
        '<span class="preview-category">' + cat + '</span>' +
        '<h3 class="preview-title">' + name + '</h3>' +
        '<p class="preview-description">' + description + '</p>' +
        '</div></div>';

    document.getElementById('preview-body').innerHTML = previewHTML;
    document.getElementById('preview-overlay').style.display = 'flex';
}

function closePreview() {
    document.getElementById('preview-overlay').style.display = 'none';
}

// ==========================================
// 20. HEALTH SCAN
// ==========================================

async function runHealthScan() {
    var btn = document.getElementById('run-scan-btn');
    var originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
    btn.disabled = true;

    var results = {
        brokenImages: [],
        missingFields: [],
        totalItems: 0
    };

    var types = ['products', 'services', 'clients', 'stories', 'home', 'team', 'testimonials'];

    for (var t = 0; t < types.length; t++) {
        var type = types[t];
        var arr = getDataArray(type);
        if (!arr || !Array.isArray(arr)) continue;

        results.totalItems += arr.length;

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];

            var img = item.image || item.logo || (item.gallery && item.gallery[0]);
            if (img && !img.startsWith('http')) {
                try {
                    var res = await fetch(img, { method: 'HEAD' });
                    if (!res.ok) {
                        results.brokenImages.push({
                            type: type, index: i,
                            name: item.name || item.title || 'Item ' + i,
                            path: img
                        });
                    }
                } catch (e) {
                    results.brokenImages.push({
                        type: type, index: i,
                        name: item.name || item.title || 'Item ' + i,
                        path: img
                    });
                }
            }

            if (type === 'products' && !item.name) results.missingFields.push(type + ' #' + (i + 1) + ': Missing Name');
            if (type === 'services' && (!item.title && !item.name)) results.missingFields.push(type + ' #' + (i + 1) + ': Missing Title');
        }
    }

    renderHealthResults(results);
    btn.innerHTML = originalText;
    btn.disabled = false;
}

function renderHealthResults(results) {
    var container = document.getElementById('health-results');

    if (results.brokenImages.length === 0 && results.missingFields.length === 0) {
        container.innerHTML = '<div class="toast success" style="position:static; transform:none; max-width:100%; text-align:center;">' +
            '<i class="fas fa-check-circle"></i> System Healthy! Scanned ' + results.totalItems + ' items.</div>';
        return;
    }

    var html = '<div style="display:flex; flex-direction:column; gap:10px;">';

    if (results.brokenImages.length > 0) {
        html += '<div style="background:#2d1518; border:1px solid #5c2b2e; padding:15px; border-radius:8px; color:#f8d7da;">' +
            '<h4 style="color:#ef4444; margin-top:0;"><i class="fas fa-broken-image"></i> Broken Images (' + results.brokenImages.length + ')</h4>' +
            '<ul style="margin-bottom:0; padding-left:20px; color:#fca5a5;">' +
            results.brokenImages.map(function (err) {
                return '<li><strong>' + err.type + '</strong>: ' + err.name + ' (<span style="font-family:monospace; color:#fecaca;">' + err.path + '</span>)</li>';
            }).join('') +
            '</ul></div>';
    }

    if (results.missingFields.length > 0) {
        html += '<div style="background:#2d2518; border:1px solid #5c4b2e; padding:15px; border-radius:8px; color:#fef3c7;">' +
            '<h4 style="color:#f59e0b; margin-top:0;"><i class="fas fa-exclamation-triangle"></i> Data Issues (' + results.missingFields.length + ')</h4>' +
            '<ul style="margin-bottom:0; padding-left:20px;">' +
            results.missingFields.map(function (err) { return '<li>' + err + '</li>'; }).join('') +
            '</ul></div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// 21. GLOBAL SETTINGS
// ==========================================

function loadSettingsToForm() {
    var legacyContact = (window.CONTACT_DATA && typeof window.CONTACT_DATA === 'object' && !Array.isArray(window.CONTACT_DATA))
        ? window.CONTACT_DATA
        : {};
    var config = window.CONTACT_PAGE_CONFIG || {};
    var enquiry = config.enquiry || {};
    var social = legacyContact.social || {};

    document.getElementById('setting-address').value = legacyContact.address || '';
    document.getElementById('setting-phone').value = config.phone || legacyContact.phone || '';
    document.getElementById('setting-email').value = enquiry.email || legacyContact.email || '';
    document.getElementById('setting-linkedin').value = enquiry.linkedinUrl || social.linkedin || '';
    document.getElementById('setting-youtube').value = social.youtube || '';
    document.getElementById('setting-instagram').value = social.instagram || '';

    if (typeof SETTINGS_DATA !== 'undefined') {
        document.getElementById('form-contact-email').value = SETTINGS_DATA.contactEmail || '';
        document.getElementById('form-careers-email').value = SETTINGS_DATA.careersEmail || '';
    }
}

async function saveGlobalSettings() {
    var newContactSettings = {
        address: document.getElementById('setting-address').value.trim(),
        phone: document.getElementById('setting-phone').value.trim(),
        email: document.getElementById('setting-email').value.trim(),
        social: {
            linkedin: document.getElementById('setting-linkedin').value.trim(),
            youtube: document.getElementById('setting-youtube').value.trim(),
            instagram: document.getElementById('setting-instagram').value.trim()
        }
    };

    var newFormSettings = {
        contactEmail: document.getElementById('form-contact-email').value.trim(),
        careersEmail: document.getElementById('form-careers-email').value.trim()
    };

    if (!newContactSettings.address || !newContactSettings.phone || !newContactSettings.email) {
        showToast('Address, Phone, and Public Email are required in Contact Info', 'error');
        return;
    }

    if (!newFormSettings.contactEmail || !newFormSettings.careersEmail) {
        showToast('Both Form Destination Emails are required.', 'error');
        return;
    }

    if (!window.CONTACT_PAGE_CONFIG) window.CONTACT_PAGE_CONFIG = {};
    if (!window.CONTACT_PAGE_CONFIG.enquiry) window.CONTACT_PAGE_CONFIG.enquiry = {};

    window.CONTACT_DATA = newContactSettings;
    window.SETTINGS_DATA = Object.assign({}, window.SETTINGS_DATA || {}, newFormSettings);
    window.CONTACT_PAGE_CONFIG.phone = newContactSettings.phone;
    window.CONTACT_PAGE_CONFIG.enquiry.email = newContactSettings.email;
    window.CONTACT_PAGE_CONFIG.enquiry.linkedinUrl = newContactSettings.social.linkedin;
    if (!window.CONTACT_PAGE_CONFIG.enquiry.linkedinLabel) {
        window.CONTACT_PAGE_CONFIG.enquiry.linkedinLabel = 'Tridel Technologies';
    }

    markAsPending('settings');
    markAsPending('form_settings');
    markAsPending('contact_content');

    showToast('Settings draft saved. Click "Publish Website" to apply changes to the website.', 'success');
}

// ==========================================
// 22. EXPORT
// ==========================================


// ==========================================
// 23. TOAST
// ==========================================

// showToast() -> admin-ui.js

// ==========================================
// 24. GALLERY MANAGEMENT
// ==========================================


// ==========================================
// 25. PAGE CONTENT MANAGEMENT
// ==========================================

function loadPageContentToForm() {
    // Hero
    var hero = window.INDEX_HERO || {};
    var heroTitle = document.getElementById('content-hero-title');
    var heroSubtitle = document.getElementById('content-hero-subtitle');
    if (heroTitle) heroTitle.value = hero.title || '';
    if (heroSubtitle) heroSubtitle.value = hero.subtitle || '';

    // Stats
    renderStatsRows();

    // What We Do
    var wwd = window.INDEX_WHAT_WE_DO || {};
    var wwdTitle = document.getElementById('content-wwd-title');
    var wwdSubtitle = document.getElementById('content-wwd-subtitle');
    if (wwdTitle) wwdTitle.value = wwd.title || '';
    if (wwdSubtitle) wwdSubtitle.value = wwd.subtitle || '';
    renderWwdCards();

    // Why Choose
    var wc = window.INDEX_WHY_CHOOSE || {};
    var wcTitle = document.getElementById('content-wc-title');
    var wcSubtitle = document.getElementById('content-wc-subtitle');
    if (wcTitle) wcTitle.value = wc.title || '';
    if (wcSubtitle) wcSubtitle.value = wc.subtitle || '';
    renderWhyChooseReasons();

    // Case Study
    var cs = window.INDEX_CASE_STUDY || {};
    var csLabel = document.getElementById('content-cs-label');
    var csTitle = document.getElementById('content-cs-title');
    var csDesc = document.getElementById('content-cs-desc');
    var csImage = document.getElementById('content-cs-image');
    var csLinkText = document.getElementById('content-cs-link-text');
    var csLinkHref = document.getElementById('content-cs-link-href');
    if (csLabel) csLabel.value = cs.label || '';
    if (csTitle) csTitle.value = cs.title || '';
    if (csDesc) csDesc.value = cs.desc || '';
    if (csImage) csImage.value = cs.image || '';
    if (csLinkText) csLinkText.value = cs.linkText || '';
    if (csLinkHref) csLinkHref.value = cs.linkHref || '';

    // CTA
    var cta = window.INDEX_CTA || {};
    var ctaTitle = document.getElementById('content-cta-title');
    var ctaDesc = document.getElementById('content-cta-desc');
    var ctaPrimaryText = document.getElementById('content-cta-primary-text');
    var ctaPrimaryHref = document.getElementById('content-cta-primary-href');
    var ctaSecondaryText = document.getElementById('content-cta-secondary-text');
    var ctaSecondaryHref = document.getElementById('content-cta-secondary-href');
    if (ctaTitle) ctaTitle.value = cta.title || '';
    if (ctaDesc) ctaDesc.value = cta.desc || '';
    if (ctaPrimaryText) ctaPrimaryText.value = (cta.primaryBtn && cta.primaryBtn.text) || '';
    if (ctaPrimaryHref) ctaPrimaryHref.value = (cta.primaryBtn && cta.primaryBtn.href) || '';
    if (ctaSecondaryText) ctaSecondaryText.value = (cta.secondaryBtn && cta.secondaryBtn.text) || '';
    if (ctaSecondaryHref) ctaSecondaryHref.value = (cta.secondaryBtn && cta.secondaryBtn.href) || '';

    // Section Order
    renderSectionOrderList();
}

// --- Section Order Drag-and-Drop ---
var SECTION_LABEL_MAP = {
    hero: { label: 'Hero Banner', icon: 'fa-image' },
    stats: { label: 'Stats Bar', icon: 'fa-chart-bar' },
    whatWeDo: { label: 'What We Do', icon: 'fa-tasks' },
    whyChoose: { label: 'Why Choose Us', icon: 'fa-star' },
    highlights: { label: 'Highlights', icon: 'fa-fire' },
    news: { label: 'Latest News', icon: 'fa-newspaper' },
    clients: { label: 'Clients & Partners', icon: 'fa-building' },
    caseStudy: { label: 'Case Study', icon: 'fa-briefcase' },
    cta: { label: 'Call to Action', icon: 'fa-bullhorn' },
    testimonialMap: { label: 'Testimonial Map', icon: 'fa-globe' }
};

function renderSectionOrderList() {
    var container = document.getElementById('section-order-list');
    if (!container) return;

    var defaultOrder = ['hero', 'stats', 'whatWeDo', 'whyChoose', 'highlights', 'news', 'clients', 'caseStudy', 'cta', 'testimonialMap'];
    var order = (window.INDEX_SECTION_ORDER && window.INDEX_SECTION_ORDER.length)
        ? window.INDEX_SECTION_ORDER
        : defaultOrder;

    var html = '';
    order.forEach(function (key, idx) {
        var info = SECTION_LABEL_MAP[key] || { label: key, icon: 'fa-puzzle-piece' };
        html +=
            '<div class="section-order-item" data-section-key="' + key + '">' +
                '<span class="grip"><i class="fas fa-grip-vertical"></i></span>' +
                '<span class="section-order-icon"><i class="fas ' + info.icon + '"></i></span>' +
                '<span class="section-order-label">' + info.label + '</span>' +
                '<span class="section-order-num">#' + (idx + 1) + '</span>' +
            '</div>';
    });
    container.innerHTML = html;

    // Initialize SortableJS
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            animation: 200,
            handle: '.grip',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function () {
                // Update position numbers
                var items = container.querySelectorAll('.section-order-item');
                items.forEach(function (item, i) {
                    var num = item.querySelector('.section-order-num');
                    if (num) num.textContent = '#' + (i + 1);
                });
            }
        });
    }
}


function savePageContent() {
    // Hero
    window.INDEX_HERO = {
        title: (document.getElementById('content-hero-title').value || '').trim(),
        subtitle: (document.getElementById('content-hero-subtitle').value || '').trim()
    };

    // Stats — read from dynamic rows
    var statsContainer = document.getElementById('content-stats-list');
    var statRows = statsContainer ? statsContainer.querySelectorAll('[data-stat-row]') : [];
    var newStats = [];
    statRows.forEach(function (row) {
        var target = parseInt(row.querySelector('.stat-target').value) || 0;
        var suffix = row.querySelector('.stat-suffix').value || '';
        var label = (row.querySelector('.stat-label').value || '').trim();
        if (label) {
            newStats.push({ target: target, suffix: suffix, label: label });
        }
    });
    window.INDEX_STATS = newStats;

    // What We Do
    var wwdCards = [];
    var wwdContainer = document.getElementById('content-wwd-cards');
    if (wwdContainer) {
        var cardEls = wwdContainer.querySelectorAll('[data-wwd-card]');
        cardEls.forEach(function (el) {
            var icon = (el.querySelector('.wwd-icon').value || '').trim();
            var title = (el.querySelector('.wwd-title').value || '').trim();
            var desc = (el.querySelector('.wwd-desc').value || '').trim();
            if (title) {
                wwdCards.push({ icon: icon, title: title, desc: desc });
            }
        });
    }
    window.INDEX_WHAT_WE_DO = {
        title: (document.getElementById('content-wwd-title').value || '').trim(),
        subtitle: (document.getElementById('content-wwd-subtitle').value || '').trim(),
        cards: wwdCards
    };

    // Case Study
    window.INDEX_CASE_STUDY = {
        label: (document.getElementById('content-cs-label').value || '').trim(),
        title: (document.getElementById('content-cs-title').value || '').trim(),
        desc: (document.getElementById('content-cs-desc').value || '').trim(),
        image: (document.getElementById('content-cs-image').value || '').trim(),
        imageAlt: (document.getElementById('content-cs-title').value || '').trim(),
        linkText: (document.getElementById('content-cs-link-text').value || '').trim(),
        linkHref: (document.getElementById('content-cs-link-href').value || '').trim()
    };

    // CTA
    window.INDEX_CTA = {
        title: (document.getElementById('content-cta-title').value || '').trim(),
        desc: (document.getElementById('content-cta-desc').value || '').trim(),
        primaryBtn: {
            text: (document.getElementById('content-cta-primary-text').value || '').trim(),
            href: (document.getElementById('content-cta-primary-href').value || '').trim(),
            icon: 'fa-arrow-right'
        },
        secondaryBtn: {
            text: (document.getElementById('content-cta-secondary-text').value || '').trim(),
            href: (document.getElementById('content-cta-secondary-href').value || '').trim()
        }
    };

    // Why Choose
    var wcReasons = [];
    var wcContainer = document.getElementById('content-wc-reasons');
    if (wcContainer) {
        var reasonEls = wcContainer.querySelectorAll('[data-wc-reason]');
        reasonEls.forEach(function (el) {
            var icon = (el.querySelector('.wc-icon').value || '').trim();
            var title = (el.querySelector('.wc-title').value || '').trim();
            var desc = (el.querySelector('.wc-desc').value || '').trim();
            if (title) {
                wcReasons.push({ icon: icon, title: title, desc: desc });
            }
        });
    }
    window.INDEX_WHY_CHOOSE = {
        title: (document.getElementById('content-wc-title').value || '').trim(),
        subtitle: (document.getElementById('content-wc-subtitle').value || '').trim(),
        reasons: wcReasons
    };

    // Section Order
    var orderList = document.getElementById('section-order-list');
    if (orderList) {
        var items = orderList.querySelectorAll('.section-order-item');
        var newOrder = [];
        items.forEach(function (item) {
            newOrder.push(item.getAttribute('data-section-key'));
        });
        if (newOrder.length) {
            window.INDEX_SECTION_ORDER = newOrder;
        }
    }

    markAsPending('index_content');
}

function serializeIndexPageData() {
    var lines = [];
    lines.push('/**');
    lines.push(' * Index / Home Page Data');
    lines.push(' * Content data for the home page hero, stats, value props, case study, and CTA');
    lines.push(' */');
    lines.push('var INDEX_HERO = ' + JSON.stringify(window.INDEX_HERO || {}, null, 2) + ';');
    lines.push('');
    lines.push('var INDEX_STATS = ' + JSON.stringify(window.INDEX_STATS || [], null, 2) + ';');
    lines.push('');
    lines.push('var INDEX_WHAT_WE_DO = ' + JSON.stringify(window.INDEX_WHAT_WE_DO || {}, null, 2) + ';');
    lines.push('');
    lines.push('var INDEX_CASE_STUDY = ' + JSON.stringify(window.INDEX_CASE_STUDY || {}, null, 2) + ';');
    lines.push('');
    lines.push('var INDEX_CTA = ' + JSON.stringify(window.INDEX_CTA || {}, null, 2) + ';');
    lines.push('');
    lines.push('var INDEX_WHY_CHOOSE = ' + JSON.stringify(window.INDEX_WHY_CHOOSE || {}, null, 2) + ';');
    lines.push('');
    lines.push('var INDEX_SECTION_ORDER = ' + JSON.stringify(window.INDEX_SECTION_ORDER || [], null, 2) + ';');
    lines.push('');
    return lines.join('\n');
}

// ==========================================
// 26. PAGE CONTENT TAB SWITCHING
// ==========================================

var currentContentTab = 'home';

function switchContentTab(tab) {
    currentContentTab = tab;
    var tabs = ['home', 'about', 'contact'];
    tabs.forEach(function (t) {
        var el = document.getElementById('content-tab-' + t);
        if (el) el.style.display = t === tab ? '' : 'none';
    });
    document.querySelectorAll('.content-tab').forEach(function (btn) {
        var isActive = btn.getAttribute('data-tab') === tab;
        btn.className = 'btn ' + (isActive ? 'btn-primary' : 'btn-secondary') + ' content-tab';
    });
}

// ==========================================
// 27. ABOUT PAGE CONTENT MANAGEMENT
// ==========================================

function loadAboutContentToForm() {
    var data = window.ABOUT_DATA || {};
    var header = data.pageHeader || {};
    var wwa = data.whoWeAre || {};
    var gallery = Array.isArray(wwa.gallery) && wwa.gallery.length
        ? wwa.gallery
        : (wwa.image ? [wwa.image] : []);
    var el;
    el = document.getElementById('about-header-title'); if (el) el.value = header.title || '';
    el = document.getElementById('about-header-subtitle'); if (el) el.value = header.subtitle || '';
    el = document.getElementById('about-wwa-title'); if (el) el.value = wwa.title || '';
    el = document.getElementById('about-wwa-text'); if (el) el.value = wwa.text || '';
    el = document.getElementById('about-wwa-image'); if (el) el.value = wwa.image || '';
    el = document.getElementById('about-wwa-image-alt'); if (el) el.value = wwa.imageAlt || '';
    el = document.getElementById('about-wwa-gallery'); if (el) el.value = gallery.join('\n');
}

function saveAboutContent() {
    if (!window.ABOUT_DATA) window.ABOUT_DATA = {};
    if (!window.ABOUT_DATA.pageHeader) window.ABOUT_DATA.pageHeader = {};
    if (!window.ABOUT_DATA.whoWeAre) window.ABOUT_DATA.whoWeAre = {};
    var primaryImage = (document.getElementById('about-wwa-image') || {}).value || '';
    var galleryValue = (document.getElementById('about-wwa-gallery') || {}).value || '';
    var gallery = galleryValue
        .split(/\r?\n/)
        .map(function (item) { return item.trim(); })
        .filter(Boolean);

    if (!gallery.length && primaryImage) {
        gallery = [primaryImage];
    }

    window.ABOUT_DATA.pageHeader.title = (document.getElementById('about-header-title') || {}).value || '';
    window.ABOUT_DATA.pageHeader.subtitle = (document.getElementById('about-header-subtitle') || {}).value || '';
    window.ABOUT_DATA.whoWeAre.title = (document.getElementById('about-wwa-title') || {}).value || '';
    window.ABOUT_DATA.whoWeAre.text = (document.getElementById('about-wwa-text') || {}).value || '';
    window.ABOUT_DATA.whoWeAre.image = primaryImage || gallery[0] || '';
    window.ABOUT_DATA.whoWeAre.imageAlt = (document.getElementById('about-wwa-image-alt') || {}).value || '';
    window.ABOUT_DATA.whoWeAre.gallery = gallery;
    markAsPending('about_content');
}

function parseAboutPageContent(content) {
    var match = content.match(/var\s+ABOUT_DATA\s*=\s*(\{[\s\S]*\});?\s*$/m);
    if (match) {
        try {
            var raw = match[1].replace(/;+$/, '').replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            raw = raw.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":');
            window.ABOUT_DATA = JSON.parse(raw);
        } catch (e) { console.warn('Could not parse ABOUT_DATA:', e.message); }
    }
}

function serializeAboutPageData() {
    var lines = [];
    lines.push('/**');
    lines.push(' * About Page Data');
    lines.push(' * Content for the Who We Are section');
    lines.push(' */');
    lines.push('var ABOUT_DATA = ' + JSON.stringify(window.ABOUT_DATA || {}, null, 2) + ';');
    lines.push('');
    return lines.join('\n');
}

// ==========================================
// 28. CONTACT PAGE CONTENT MANAGEMENT
// ==========================================

function loadContactContentToForm() {
    renderContactInfoCards();
    renderContactFaqRows();
    renderContactConfigEditor();
}


// ── Dynamic Config Editor (auto-generates fields from CONTACT_PAGE_CONFIG) ──


function readContactConfigFromForm() {
    var config = window.CONTACT_PAGE_CONFIG || {};
    var keys = Object.keys(config);

    keys.forEach(function (key) {
        if (key === 'offices') return; // preserve as-is

        var val = config[key];

        if (Array.isArray(val)) {
            var ta = document.getElementById('cfg-' + key);
            if (ta) {
                config[key] = ta.value.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
            }
        } else if (typeof val === 'object' && val !== null) {
            var subKeys = Object.keys(val);
            subKeys.forEach(function (sk) {
                var input = document.getElementById('cfg-' + key + '-' + sk);
                if (input) {
                    config[key][sk] = input.value;
                }
            });
        } else {
            var input = document.getElementById('cfg-' + key);
            if (input) {
                config[key] = input.value;
            }
        }
    });

    window.CONTACT_PAGE_CONFIG = config;
}

function saveContactContent() {
    // Read info cards from form
    var cards = window.CONTACT_INFO_CARDS || [];
    for (var i = 0; i < cards.length; i++) {
        cards[i].icon = (document.getElementById('ci-icon-' + i) || {}).value || '';
        cards[i].title = (document.getElementById('ci-title-' + i) || {}).value || '';
        cards[i].detail = (document.getElementById('ci-detail-' + i) || {}).value || '';
    }
    window.CONTACT_INFO_CARDS = cards;
    // Read FAQ from form
    var faqs = window.CONTACT_FAQ_DATA || [];
    for (var j = 0; j < faqs.length; j++) {
        faqs[j].question = (document.getElementById('faq-q-' + j) || {}).value || '';
        faqs[j].answer = (document.getElementById('faq-a-' + j) || {}).value || '';
    }
    window.CONTACT_FAQ_DATA = faqs;
    // Read page config from dynamic form
    readContactConfigFromForm();
    markAsPending('contact_content');
}

function parseContactPageContent(content) {
    // Parse CONTACT_INFO_CARDS
    var match1 = content.match(/var\s+CONTACT_INFO_CARDS\s*=\s*(\[[\s\S]*?\]);/);
    if (match1) {
        try {
            var raw1 = match1[1].replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            raw1 = raw1.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":');
            window.CONTACT_INFO_CARDS = JSON.parse(raw1);
        } catch (e) { console.warn('Could not parse CONTACT_INFO_CARDS:', e.message); }
    }
    // Parse CONTACT_FAQ_DATA
    var match2 = content.match(/var\s+CONTACT_FAQ_DATA\s*=\s*(\[[\s\S]*?\]);/);
    if (match2) {
        try {
            var raw2 = match2[1].replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            raw2 = raw2.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":');
            window.CONTACT_FAQ_DATA = JSON.parse(raw2);
        } catch (e) { console.warn('Could not parse CONTACT_FAQ_DATA:', e.message); }
    }
    // Parse CONTACT_PAGE_CONFIG
    var match3 = content.match(/var\s+CONTACT_PAGE_CONFIG\s*=\s*(\{[\s\S]*?\});/);
    if (match3) {
        try {
            var raw3 = match3[1];
            // Remove LOCATIONS_DATA reference (not JSON-safe), replace with empty array
            raw3 = raw3.replace(/\(typeof\s+LOCATIONS_DATA\s*!==\s*['"]undefined['"]\)\s*\?\s*LOCATIONS_DATA\s*:\s*\[\]/g, '[]');
            // Strip comments and trailing commas
            raw3 = raw3.replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            // Quote unquoted keys
            raw3 = raw3.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":');
            // Remove unicode escapes in strings that break JSON (e.g., \u2013)
            raw3 = raw3.replace(/\\u([\da-fA-F]{4})/g, function (m, hex) {
                return String.fromCharCode(parseInt(hex, 16));
            });
            var parsed = JSON.parse(raw3);
            // Restore offices.locations to reference LOCATIONS_DATA
            if (parsed.offices) {
                parsed.offices.locations = (typeof LOCATIONS_DATA !== 'undefined') ? LOCATIONS_DATA : [];
            }
            window.CONTACT_PAGE_CONFIG = parsed;
        } catch (e) { console.warn('Could not parse CONTACT_PAGE_CONFIG:', e.message); }
    }
}

function serializeContactPageData() {
    var lines = [];
    lines.push('/**');
    lines.push(' * Contact Page Data');
    lines.push(' * Contact info cards, FAQ data, and page configuration');
    lines.push(' */');
    lines.push('var CONTACT_INFO_CARDS = ' + JSON.stringify(window.CONTACT_INFO_CARDS || [], null, 2) + ';');
    lines.push('');
    lines.push('var CONTACT_FAQ_DATA = ' + JSON.stringify(window.CONTACT_FAQ_DATA || [], null, 2) + ';');
    lines.push('');
    // Serialize CONTACT_PAGE_CONFIG with special handling for offices.locations
    var configCopy = JSON.parse(JSON.stringify(window.CONTACT_PAGE_CONFIG || {}));
    // Replace offices.locations array with placeholder
    if (configCopy.offices) {
        configCopy.offices.locations = '__LOCATIONS_DATA_REF__';
    }
    var configStr = JSON.stringify(configCopy, null, 2);
    // Replace placeholder with actual code reference
    configStr = configStr.replace('"__LOCATIONS_DATA_REF__"', "(typeof LOCATIONS_DATA !== 'undefined') ? LOCATIONS_DATA : []");
    lines.push('var CONTACT_PAGE_CONFIG = ' + configStr + ';');
    lines.push('');
    return lines.join('\n');
}

// ==========================================
// 29. SAVE PAGE CONTENT (CONSOLIDATED)
// ==========================================

// Override savePageContent to handle tabs
var _originalSavePageContent = typeof savePageContent === 'function' ? savePageContent : null;

// We need to redefine savePageContent to handle all tabs
// The original saves home tab data, we wrap it
function savePageContentAll() {
    if (currentContentTab === 'about') {
        saveAboutContent();
        showToast('About page content saved!', 'success');
    } else if (currentContentTab === 'contact') {
        saveContactContent();
        showToast('Contact page content saved!', 'success');
    } else {
        // Home tab - call original logic
        if (_originalSavePageContent) _originalSavePageContent();
    }
}

// ==========================================
// 30. NAVIGATION & FOOTER MANAGEMENT
// ==========================================


function saveNavigation() {
    // Save nav links from form
    var links = window.NAV_LINKS || [];
    for (var i = 0; i < links.length; i++) {
        links[i].label = (document.getElementById('nav-label-' + i) || {}).value || '';
        links[i].href = (document.getElementById('nav-href-' + i) || {}).value || '';
        links[i].icon = (document.getElementById('nav-icon-' + i) || {}).value || '';
        links[i].shortLabel = (document.getElementById('nav-short-label-' + i) || {}).value || '';
        links[i].hasMegaMenu = !!((document.getElementById('nav-has-mega-' + i) || {}).checked);
        links[i].megaMenuClass = (document.getElementById('nav-mega-class-' + i) || {}).value || '';
        links[i].chevron = !!((document.getElementById('nav-chevron-' + i) || {}).checked);
        links[i].key = (links[i].href || '').replace(/^#/, '') || '/';
        if (!links[i].shortLabel) delete links[i].shortLabel;
        if (!links[i].hasMegaMenu) {
            delete links[i].hasMegaMenu;
            delete links[i].megaMenuClass;
            delete links[i].chevron;
        } else if (!links[i].megaMenuClass) {
            links[i].megaMenuClass = links[i].href && links[i].href.indexOf('/products') !== -1 ? 'mm-products' : 'mm-services';
        }
    }
    window.NAV_LINKS = links;

    var megaConfig = ensureMegaMenuConfig();
    ['products', 'services'].forEach(function (scopeKey) {
        var scope = megaConfig[scopeKey] || {};
        scope.columns = (scope.columns || []).map(function (column, index) {
            return Object.assign({}, column, {
                title: (document.getElementById('mega-' + scopeKey + '-col-title-' + index) || {}).value || column.title || column.key || '',
                icon: (document.getElementById('mega-' + scopeKey + '-col-icon-' + index) || {}).value || column.icon || ''
            });
        });
        scope.spotlight = Object.assign({}, scope.spotlight || {}, {
            tag: (document.getElementById('mega-' + scopeKey + '-spotlight-tag') || {}).value || '',
            title: (document.getElementById('mega-' + scopeKey + '-spotlight-title') || {}).value || '',
            description: (document.getElementById('mega-' + scopeKey + '-spotlight-description') || {}).value || '',
            link: (document.getElementById('mega-' + scopeKey + '-spotlight-link') || {}).value || '',
            buttonText: (document.getElementById('mega-' + scopeKey + '-spotlight-button-text') || {}).value || '',
            image: (document.getElementById('mega-' + scopeKey + '-spotlight-image') || {}).value || ''
        });
        megaConfig[scopeKey] = scope;
    });
    window.MEGA_MENU_CONFIG = megaConfig;

    // Save footer data
    if (!window.FOOTER_DATA) window.FOOTER_DATA = {};
    window.FOOTER_DATA.tagline = (document.getElementById('footer-tagline') || {}).value || '';
    window.FOOTER_DATA.linkedIn = (document.getElementById('footer-linkedin') || {}).value || '';
    window.FOOTER_DATA.copyright = (document.getElementById('footer-copyright') || {}).value || '';

    // Save quick links
    var ql = window.FOOTER_DATA.quickLinks || [];
    for (var qi = 0; qi < ql.length; qi++) {
        ql[qi].label = (document.getElementById('fql-label-' + qi) || {}).value || '';
        ql[qi].href = (document.getElementById('fql-href-' + qi) || {}).value || '';
    }
    window.FOOTER_DATA.quickLinks = ql;

    // Save company links
    var cl = window.FOOTER_DATA.companyLinks || [];
    for (var ci = 0; ci < cl.length; ci++) {
        cl[ci].label = (document.getElementById('fcl-label-' + ci) || {}).value || '';
        cl[ci].href = (document.getElementById('fcl-href-' + ci) || {}).value || '';
    }
    window.FOOTER_DATA.companyLinks = cl;

    // Save page SEO
    var meta = window.PAGE_META || {};
    Object.keys(meta).forEach(function (route) {
        var inputId = route.replace(/[^a-zA-Z0-9]/g, '_');
        meta[route].title = (document.getElementById('seo-title-' + inputId) || {}).value || '';
        meta[route].description = (document.getElementById('seo-desc-' + inputId) || {}).value || '';
    });
    window.PAGE_META = meta;

    markAsPending('layout');
    showToast('Navigation, mega menu, and footer saved!', 'success');
}

function parseLayoutData(content) {
    // Parse NAV_LINKS
    var match1 = content.match(/var\s+NAV_LINKS\s*=\s*(\[[\s\S]*?\]);/);
    if (match1) {
        try {
            var raw1 = match1[1].replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            raw1 = raw1.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":');
            // Handle true/false not quoted
            window.NAV_LINKS = JSON.parse(raw1);
        } catch (e) { console.warn('Could not parse NAV_LINKS:', e.message); }
    }
    // Parse FOOTER_DATA
    var match2 = content.match(/var\s+FOOTER_DATA\s*=\s*(\{[\s\S]*?\});/);
    if (match2) {
        try {
            var raw2 = match2[1].replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            raw2 = raw2.replace(/([{,]\s*)(?!")(\w+)\s*:/g, '$1"$2":');
            // Handle unicode escape
            raw2 = raw2.replace(/\\u([0-9a-fA-F]{4})/g, function (m, p) { return String.fromCharCode(parseInt(p, 16)); });
            window.FOOTER_DATA = JSON.parse(raw2);
        } catch (e) { console.warn('Could not parse FOOTER_DATA:', e.message); }
    }
    // Parse MEGA_MENU_CONFIG
    var matchMega = content.match(/var\s+MEGA_MENU_CONFIG\s*=\s*(\{[\s\S]*?\});/);
    if (matchMega) {
        try {
            var rawMega = matchMega[1].replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            rawMega = rawMega.replace(/([{,]\s*)(?!")([A-Za-z0-9_\/-]+)\s*:/g, '$1"$2":');
            window.MEGA_MENU_CONFIG = normalizeMegaMenuConfig(JSON.parse(rawMega));
        } catch (e) { console.warn('Could not parse MEGA_MENU_CONFIG:', e.message); }
    } else {
        ensureMegaMenuConfig();
    }
    // Parse PAGE_META
    var match3 = content.match(/var\s+PAGE_META\s*=\s*(\{[\s\S]*\});?\s*$/m);
    if (match3) {
        try {
            var raw3 = match3[1].replace(/;+$/, '').replace(/\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1');
            raw3 = raw3.replace(/([{,]\s*)(?!")([\/\w-]+)\s*:/g, function (m, pre, key) {
                return pre + '"' + key + '":';
            });
            // Handle escaped quotes within strings
            raw3 = raw3.replace(/\\'/g, "'");
            window.PAGE_META = JSON.parse(raw3);
        } catch (e) { console.warn('Could not parse PAGE_META:', e.message); }
    }
}

function serializeLayoutData() {
    var lines = [];
    lines.push('/**');
    lines.push(' * Layout Data \u2014 Navigation links, footer data, and page metadata');
    lines.push(' */');
    lines.push('var NAV_LINKS = ' + JSON.stringify(window.NAV_LINKS || [], null, 2) + ';');
    lines.push('');
    lines.push('var MEGA_MENU_CONFIG = ' + JSON.stringify(ensureMegaMenuConfig(), null, 2) + ';');
    lines.push('');
    lines.push('var FOOTER_DATA = ' + JSON.stringify(window.FOOTER_DATA || {}, null, 2) + ';');
    lines.push('');
    lines.push('var PAGE_META = ' + JSON.stringify(window.PAGE_META || {}, null, 2) + ';');
    lines.push('');
    return lines.join('\n');
}

// ==========================================
// 31. SECTION VISIBILITY MANAGEMENT
// ==========================================

var VISIBILITY_MAP = {
    home: {
        label: 'Home', icon: 'fa-home',
        sections: { hero: 'Hero Banner', stats: 'Statistics', whatWeDo: 'What We Do', whyChoose: 'Why Choose Us', caseStudy: 'Case Study', cta: 'Call to Action' }
    },
    about: {
        label: 'About', icon: 'fa-building',
        sections: { pageHeader: 'Page Header', whoWeAre: 'Who We Are' }
    },
    products: {
        label: 'Products', icon: 'fa-cube',
        sections: { hero: 'Hero Section', grid: 'Product Grid' }
    },
    services: {
        label: 'Services', icon: 'fa-layer-group',
        sections: { hero: 'Hero Section', grid: 'Service Grid' }
    },
    successStories: {
        label: 'Success Stories', icon: 'fa-trophy',
        sections: { hero: 'Hero Section', grid: 'Stories Grid' }
    },
    contact: {
        label: 'Contact', icon: 'fa-envelope',
        sections: { hero: 'Page Header', infoCards: 'Info Cards', faq: 'FAQ Section', form: 'Contact Form', map: 'Map' }
    },
    careers: {
        label: 'Careers', icon: 'fa-briefcase',
        sections: { hero: 'Hero Section', listings: 'Job Listings' }
    }
};

function getVisibilityData() {
    if (!window.SETTINGS_DATA) window.SETTINGS_DATA = {};
    if (!window.SETTINGS_DATA.sectionVisibility) {
        window.SETTINGS_DATA.sectionVisibility = {};
        for (var page in VISIBILITY_MAP) {
            window.SETTINGS_DATA.sectionVisibility[page] = {};
            for (var sec in VISIBILITY_MAP[page].sections) {
                window.SETTINGS_DATA.sectionVisibility[page][sec] = true;
            }
        }
    }
    return window.SETTINGS_DATA.sectionVisibility;
}

function loadVisibilityEditor() {
    var container = document.getElementById('visibility-editor');
    if (!container) return;
    var vis = getVisibilityData();
    var html = '';
    for (var pageKey in VISIBILITY_MAP) {
        var pageCfg = VISIBILITY_MAP[pageKey];
        var pageVis = vis[pageKey] || {};
        html += '<div class="item-card" style="max-width:800px;margin:0 auto 20px;">' +
            '<h3 style="margin-bottom:15px;border-bottom:1px solid var(--border);padding-bottom:10px;">' +
                '<i class="fas ' + pageCfg.icon + '"></i> ' + escapeHTML(pageCfg.label) +
            '</h3>';
        for (var secKey in pageCfg.sections) {
            var checked = pageVis[secKey] !== false ? 'checked' : '';
            html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">' +
                '<span>' + escapeHTML(pageCfg.sections[secKey]) + '</span>' +
                '<label style="position:relative;display:inline-block;width:50px;height:26px;">' +
                    '<input type="checkbox" ' + checked + ' onchange="toggleSectionVisibility(\'' + pageKey + '\',\'' + secKey + '\',this.checked)" style="opacity:0;width:0;height:0;">' +
                    '<span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:' + (checked ? 'var(--accent)' : '#ccc') + ';border-radius:26px;transition:.3s;">' +
                        '<span style="position:absolute;content:\'\';height:20px;width:20px;left:' + (checked ? '26px' : '3px') + ';bottom:3px;background:white;border-radius:50%;transition:.3s;display:block;"></span>' +
                    '</span>' +
                '</label>' +
            '</div>';
        }
        html += '</div>';
    }
    container.innerHTML = html;
}

function toggleSectionVisibility(page, section, checked) {
    var vis = getVisibilityData();
    if (!vis[page]) vis[page] = {};
    vis[page][section] = checked;
    // Re-render to update toggle visual
    loadVisibilityEditor();
}

function saveVisibility() {
    markAsPending('form_settings');
    showToast('Visibility settings saved!', 'success');
}

// ==========================================
// 32. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async function () {
    await checkAuth();
    await loadServerGitHubConfig();
    initNavigation();

    // Update theme icon now that DOM is ready
    var savedTheme = localStorage.getItem('adminTheme') || 'dark';
    updateThemeIcon(savedTheme);

    // Load data from GitHub if configured
    if (hasConfiguredGitHub()) {
        await loadDataFromGitHub();
    }

    renderAllSections(); // includes renderDashboard()
    loadSettingsToForm();
    updatePublishButton();

    // Close modals on overlay click
    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target.id === 'modal-overlay') closeModal();
    });

    var previewOverlay = document.getElementById('preview-overlay');
    if (previewOverlay) {
        previewOverlay.addEventListener('click', function (e) {
            if (e.target.id === 'preview-overlay') closePreview();
        });
    }

    // Ctrl/Cmd+S — quick publish
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            publishAllChanges();
        }
    });
});

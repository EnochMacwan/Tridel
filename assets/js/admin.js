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
        default: return [];
    }
    return Array.isArray(data) ? data : [];
}

// ==========================================
// 2. SECURITY
// ==========================================

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, function (tag) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[tag];
    });
}

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
    gitHubConfig = JSON.parse(localStorage.getItem('tridel_github_config') || '{}');
} catch (e) {
    gitHubConfig = {};
}

var GITHUB_DATA_FILES = {
    'products': 'assets/js/products-data.js',
    'services': 'assets/js/services-data.js',
    'clients': 'assets/js/clients-data.js',
    'stories': 'assets/js/success-stories-data.js',
    'home': 'assets/js/home-data.js',
    'news': 'assets/js/news-data.js',
    'team': 'assets/js/team-data.js',
    'testimonials': 'assets/js/testimonials-data.js',
    'settings': 'assets/js/contact-data.js',
    'form_settings': 'assets/js/settings-data.js'
};

var GITHUB_VAR_NAMES = {
    'products': 'PRODUCTS_DATA',
    'services': 'SERVICES_DATA',
    'clients': 'CLIENTS_DATA',
    'stories': 'SUCCESS_STORIES_DATA',
    'home': 'HOME_CARDS_DATA',
    'news': 'NEWS_DATA',
    'team': 'TEAM_DATA',
    'testimonials': 'TESTIMONIALS_DATA',
    'settings': 'CONTACT_DATA',
    'form_settings': 'SETTINGS_DATA'
};

async function loadDataFromGitHub() {
    if (!gitHubConfig.token) {
        showToast('GitHub not configured', 'error');
        return;
    }

    showToast('Loading data from GitHub...', 'success');

    var types = ['products', 'services', 'clients', 'stories', 'home', 'team', 'testimonials', 'settings'];

    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var filePath = GITHUB_DATA_FILES[type];
        var varName = GITHUB_VAR_NAMES[type];

        try {
            var res = await fetch(
                'https://raw.githubusercontent.com/' + gitHubConfig.owner + '/' + gitHubConfig.repo + '/' + gitHubConfig.branch + '/' + filePath
            );

            if (res.ok) {
                var content = await res.text();
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
            }
        } catch (e) {
            console.log('Could not load ' + type + ' from GitHub:', e.message);
        }
    }

    renderDashboard();
    renderAllSections();
    showToast('Data loaded from GitHub!', 'success');
}

async function saveToGitHub(type, data) {
    if (!gitHubConfig.token) {
        showToast('GitHub not configured', 'error');
        return;
    }

    var filePath = GITHUB_DATA_FILES[type];
    var varName = GITHUB_VAR_NAMES[type];

    if (!filePath || !varName) return;

    // Generate file content
    var fileContent = 'const ' + varName + ' = ' + JSON.stringify(data, null, 2) + ';';

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
            buttonText: "View All Services",
            image: "assets/images/services/port-monitoring.png"
        };
        fileContent += '\n\n// Featured Service for Spotlight Card in Mega Menu\nconst featuredService = ' + JSON.stringify(featuredServiceData, null, 2) + ';';
    }

    // For team, we want to export only the array
    if (type === 'team') {
        fileContent = 'const ' + varName + ' = ' + JSON.stringify(data, null, 2) + ';';
    }

    // 1. Get current SHA
    var apiUrl = 'https://api.github.com/repos/' + gitHubConfig.owner + '/' + gitHubConfig.repo + '/contents/' + filePath;

    var sha = null;
    try {
        var getRes = await fetch(apiUrl, {
            headers: {
                'Authorization': 'token ' + gitHubConfig.token,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (getRes.ok) {
            var fileData = await getRes.json();
            sha = fileData.sha;
        }
    } catch (e) { console.log('File not found, creating new...'); }

    // 2. Update file
    var body = {
        message: 'Update ' + type + ' via Admin Panel',
        content: btoa(unescape(encodeURIComponent(fileContent))),
        branch: gitHubConfig.branch
    };
    if (sha) body.sha = sha;

    var putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': 'token ' + gitHubConfig.token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (!putRes.ok) {
        var err = await putRes.json();
        throw new Error(err.message || putRes.statusText);
    }
}

function openGitHubConfig() {
    document.getElementById('github-owner').value = gitHubConfig.owner || '';
    document.getElementById('github-repo').value = gitHubConfig.repo || '';
    document.getElementById('github-branch').value = gitHubConfig.branch || 'main';
    document.getElementById('github-token').value = gitHubConfig.token || '';

    var statusEl = document.getElementById('github-status');
    if (statusEl) statusEl.innerHTML = '';

    document.getElementById('github-config-overlay').style.display = 'flex';
}

function closeGitHubConfig() {
    document.getElementById('github-config-overlay').style.display = 'none';
}

function saveGitHubConfig() {
    var owner = document.getElementById('github-owner').value.trim();
    var repo = document.getElementById('github-repo').value.trim();
    var branch = document.getElementById('github-branch').value.trim();
    var token = document.getElementById('github-token').value.trim();

    if (!owner || !repo || !branch || !token) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    gitHubConfig = { owner: owner, repo: repo, branch: branch, token: token };
    localStorage.setItem('tridel_github_config', JSON.stringify(gitHubConfig));

    closeGitHubConfig();
    showToast('Settings saved. Reloading...', 'success');
    setTimeout(function () { location.reload(); }, 1000);
}

async function testGitHubConnection() {
    var owner = document.getElementById('github-owner').value.trim();
    var repo = document.getElementById('github-repo').value.trim();
    var token = document.getElementById('github-token').value.trim();
    var statusEl = document.getElementById('github-status');

    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    statusEl.style.color = 'var(--text)';

    try {
        var res = await fetch('https://api.github.com/repos/' + owner + '/' + repo, {
            headers: { 'Authorization': 'token ' + token }
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

async function checkAuth() {
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

    if (!gitHubConfig.token) {
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
    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').style.display = 'none';
}

function hideLogin() {
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

    document.getElementById('stats-grid').innerHTML = stats.map(function (s) {
        return '<div class="stat-card">' +
            '<i class="fas ' + s.icon + '"></i>' +
            '<div class="value">' + s.value + '</div>' +
            '<div class="label">' + s.label + '</div>' +
            '</div>';
    }).join('');
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
// 10. FILTERING
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
    var title = escapeHTML(item.title || item.name);
    var category = escapeHTML(item.category || (type === 'products' ? 'Uncategorized' : 'Service'));

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
        '<img src="' + imageUrl + '" alt="' + title + '" onerror="this.src=\'assets/images/logo/tridel.png\'">' +
        '</div>' : '';

    return '<div class="item-card ' + (isChild ? 'nested-card' : '') + '">' +
        imageHtml +
        '<div class="item-card-header">' +
        '<div class="item-header-content">' +
        (!isChild ? '<input type="checkbox" class="checkbox-sm" ' +
            (isSelected ? 'checked' : '') +
            ' onchange="toggleSelection(\'' + type + '\', ' + index + ', this.checked)">' : '') +
        (!isChild ? '<i class="fas fa-grip-vertical drag-handle drag-handle-icon"></i>' : '') +
        '<div>' +
        '<h3>' + title + ' ' + badge + '</h3>' +
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
    var data = getDataArray('stories');
    if (!data) return;
    var grid = document.getElementById('stories-grid');
    if (!grid) return;

    grid.innerHTML = data.map(function (s, i) {
        return '<div class="item-card">' +
            '<div class="item-card-header"><div>' +
            '<h3>' + escapeHTML(s.title) + '</h3>' +
            '<span class="category">' + escapeHTML(s.category || 'Story') + '</span>' +
            '</div></div>' +
            '<p>' + escapeHTML(s.description || '').substring(0, 100) + '...</p>' +
            '<div class="item-card-actions">' +
            '<button type="button" class="btn btn-secondary btn-icon" onclick="editItem(\'stories\', ' + i + ')">' +
            '<i class="fas fa-edit"></i> Edit</button>' +
            '<button type="button" class="btn btn-danger btn-icon" onclick="deleteItem(\'stories\', ' + i + ')">' +
            '<i class="fas fa-trash"></i></button>' +
            '</div></div>';
    }).join('');
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
    if (grid) {
        grid.innerHTML = data.map(function (post, i) {
            var item = typeof post === 'string'
                ? { urn: post, text: '', date: '', image: '', url: '' }
                : post;
            var displayText = item.text
                ? (item.text.length > 80 ? escapeHTML(item.text.substring(0, 77)) + '...' : escapeHTML(item.text))
                : '<em style="opacity:0.5;">(No text)</em>';
            return '<div class="item-card">' +
                '<div class="item-card-header"><div>' +
                '<h3><i class="fab fa-linkedin" style="color: #0077b5;"></i> Post ' + (i + 1) + '</h3>' +
                (item.date ? '<small style="color:var(--text-muted);">' + escapeHTML(item.date) + '</small>' : '') +
                '</div></div>' +
                '<p style="margin-bottom:6px;">' + displayText + '</p>' +
                '<p class="text-xs font-mono break-all" style="opacity:0.5;">' + escapeHTML(item.urn || '') + '</p>' +
                (item.image ? '<img src="' + escapeHTML(item.image) + '" style="max-width:100%;max-height:80px;border-radius:4px;margin-top:8px;" alt="Post image">' : '') +
                '<div class="item-card-actions">' +
                '<button type="button" class="btn btn-secondary btn-icon" onclick="editItem(\'linkedin\', ' + i + ')">' +
                '<i class="fas fa-edit"></i> Edit</button>' +
                '<button type="button" class="btn btn-danger btn-icon" onclick="deleteItem(\'linkedin\', ' + i + ')">' +
                '<i class="fas fa-trash"></i></button>' +
                '</div></div>';
        }).join('');
    }
}

function renderTeam() {
    var grid = document.getElementById('team-grid');

    if (typeof TEAM_DATA === 'undefined') {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error: TEAM_DATA is not defined.</div>';
        return;
    }

    if (!Array.isArray(TEAM_DATA)) {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error: TEAM_DATA is not an array.</div>';
        return;
    }

    if (TEAM_DATA.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No team members found.</div>';
        return;
    }

    try {
        grid.innerHTML = '<div class="items-grid">' +
            TEAM_DATA.map(function (member, i) { return renderItemCard('team', member, i); }).join('') +
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
                            var item = TEAM_DATA.splice(oldIndex, 1)[0];
                            TEAM_DATA.splice(newIndex, 0, item);
                            markAsPending('team');
                        }
                    }
                });
            }
        }
    } catch (e) {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error rendering cards: ' + escapeHTML(e.message) + '</div>';
    }
}

function renderTestimonials() {
    var grid = document.getElementById('testimonials-grid');

    if (typeof TESTIMONIALS_DATA === 'undefined') {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error: TESTIMONIALS_DATA is not defined.</div>';
        return;
    }

    if (TESTIMONIALS_DATA.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No testimonials found.</div>';
        return;
    }

    try {
        grid.innerHTML = '<div class="items-grid">' +
            TESTIMONIALS_DATA.map(function (item, i) { return renderItemCard('testimonials', item, i); }).join('') +
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
                            var item = TESTIMONIALS_DATA.splice(oldIndex, 1)[0];
                            TESTIMONIALS_DATA.splice(newIndex, 0, item);
                            markAsPending('testimonials');
                        }
                    }
                });
            }
        }
    } catch (e) {
        grid.innerHTML = '<div style="color:red; padding:20px;">Error: ' + escapeHTML(e.message) + '</div>';
    }
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

function getSingleImageFieldHTML(label, fieldId, value) {
    return '<div class="form-group">' +
        '<label>' + label + '</label>' +
        '<div class="single-image-upload" id="container-' + fieldId + '">' +
        '<div class="image-preview-container" id="preview-' + fieldId + '">' +
        (value ? '<img src="' + value + '" alt="Preview" onerror="this.src=\'assets/images/logo/tridel.png\'">' : '<div class="preview-placeholder">No image selected</div>') +
        '</div>' +
        '<div class="upload-controls">' +
        '<input type="text" class="form-control" id="' + fieldId + '" value="' + (value || '') + '" placeholder="Path or upload image...">' +
        '<button type="button" class="btn btn-secondary" onclick="document.getElementById(\'upload-' + fieldId + '\').click()">' +
        '<i class="fas fa-upload"></i> Upload</button>' +
        '<input type="file" id="upload-' + fieldId + '" accept="image/*" style="display:none" onchange="handleFileUpload(this, \'' + fieldId + '\', false)">' +
        '</div></div></div>';
}

function renderSingleImagePreview(fieldId, value) {
    var container = document.getElementById('preview-' + fieldId);
    if (container) {
        container.innerHTML = value ? '<img src="' + value + '" alt="Preview" onerror="this.src=\'assets/images/logo/tridel.png\'">' : '<div class="preview-placeholder">No image selected</div>';
    }
}

function getGalleryHTML(images) {
    var gallery = images || [];
    return '<div class="form-group">' +
        '<label>Gallery Images <small class="text-muted-sm">(Drag to reorder)</small></label>' +
        '<div class="gallery-upload">' +
        '<div class="gallery-thumbnails" id="gallery-thumbs">' +
        (gallery.length > 0 ? gallery.map(function (img, i) {
            return '<div class="gallery-thumb" draggable="true" data-index="' + i + '">' +
                '<img src="' + img + '" alt="Image ' + (i + 1) + '" onerror="this.src=\'assets/images/logo/tridel.png\'">' +
                '<button type="button" class="thumb-delete" onclick="removeGalleryImage(' + i + ')"><i class="fas fa-times"></i></button>' +
                '<span class="thumb-order">' + (i + 1) + '</span></div>';
        }).join('') : '<div class="gallery-empty">No images added yet</div>') +
        '</div>' +
        '<div class="gallery-add-btn" onclick="addGalleryImage()"><i class="fas fa-plus"></i> Add Path</div>' +
        '<div class="gallery-add-btn" onclick="document.getElementById(\'gallery-upload-input\').click()"><i class="fas fa-upload"></i> Upload</div>' +
        '<input type="file" id="gallery-upload-input" accept="image/*" multiple style="display:none" onchange="handleFileUpload(this, \'field-gallery\', true)">' +
        '</div>' +
        '<input type="hidden" id="field-gallery" value=\'' + JSON.stringify(gallery) + '\'>' +
        '</div>';
}

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
        var name = item.name || item.title || 'Untitled';
        options += '<option value="' + item.id + '" ' + selected + '>' + name + '</option>';
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
                '<textarea class="form-control" id="field-description" placeholder="Product description...">' + (data.description || '') + '</textarea>' +
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
                getSingleImageFieldHTML('Project Image <span style="color:red">*</span>', 'field-image', data.image);

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
            var liData = typeof data === 'string' ? { urn: data } : (data || {});
            return '<div class="form-group">' +
                '<label>LinkedIn Post URN <span style="color:red">*</span></label>' +
                '<input type="text" class="form-control" id="field-urn" value="' + (liData.urn || '') + '" placeholder="urn:li:ugcPost:1234567890">' +
                '<small style="color: var(--text-muted); display: block; margin-top: 8px;">' +
                '<i class="fas fa-info-circle"></i> You can find the URN in the LinkedIn post URL or embed code.</small>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Post Text <span style="color:red">*</span></label>' +
                '<textarea class="form-control" id="field-text" rows="3" placeholder="Summary of the LinkedIn post...">' + (liData.text || '') + '</textarea>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Date</label>' +
                '<input type="text" class="form-control" id="field-date" value="' + (liData.date || '') + '" placeholder="e.g. 2025-05-15 or 2 days ago">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>Image URL</label>' +
                '<input type="text" class="form-control" id="field-image-url" value="' + (liData.image || '') + '" placeholder="https://example.com/image.jpg">' +
                '</div>' +
                '<div class="form-group">' +
                '<label>LinkedIn URL</label>' +
                '<input type="text" class="form-control" id="field-url" value="' + (liData.url || '') + '" placeholder="Auto-generated from URN if left empty">' +
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
                '<input type="text" class="form-control" id="field-name" value="' + (data.name || '') + '" placeholder="e.g. Mumbai Office">' +
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

function addFeature() {
    var container = document.getElementById('features-container');
    var div = document.createElement('div');
    div.className = 'feature-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.style.alignItems = 'start';
    div.innerHTML = '<div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">' +
        '<input type="text" class="form-control feature-title" placeholder="Title (e.g. Dimensions:)">' +
        '<input type="text" class="form-control feature-desc" placeholder="Description">' +
        '</div>' +
        '<button type="button" class="btn btn-danger" style="height: fit-content; padding: 5px 10px;" onclick="this.closest(\'.feature-row\').remove()"><i class="fas fa-times"></i></button>';
    container.appendChild(div);
}

function addServiceFeature() {
    var container = document.getElementById('service-features-container');
    var div = document.createElement('div');
    div.className = 'service-feature-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = '<input type="text" class="form-control service-feature-input" placeholder="Feature description">' +
        '<button type="button" class="btn btn-danger" style="padding: 5px 10px;" onclick="this.closest(\'.service-feature-row\').remove()"><i class="fas fa-times"></i></button>';
    container.appendChild(div);
}

function validateForm(type) {
    var errors = [];
    var requiredFields = {
        products: ['field-name', 'field-image'],
        services: ['field-title', 'field-image'],
        clients: ['field-name', 'field-logo'],
        stories: ['field-title', 'field-image'],
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
        var urnVal = document.getElementById('field-urn').value.trim();
        var textVal = document.getElementById('field-text').value.trim();
        if (!urnVal) { showToast('Validation Error: LinkedIn URN is required', 'error'); return; }
        if (!textVal) { showToast('Validation Error: Post text is required', 'error'); return; }
    }

    var arr = getDataArray(currentEditType);

    // LinkedIn
    if (currentEditType === 'linkedin') {
        var urn = document.getElementById('field-urn').value.trim();
        var text = document.getElementById('field-text').value.trim();
        var date = document.getElementById('field-date').value.trim();
        var image = document.getElementById('field-image-url').value.trim();
        var url = document.getElementById('field-url').value.trim();

        if (!url && urn) {
            url = 'https://www.linkedin.com/feed/update/' + urn;
        }

        var postObj = { urn: urn, text: text, date: date, image: image, url: url };

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
        }

        // Features (Services)
        if (currentEditType === 'services') {
            var sFeatures = [];
            document.querySelectorAll('#service-features-container .service-feature-input').forEach(function (input) {
                if (input.value.trim()) sFeatures.push(input.value.trim());
            });
            if (sFeatures.length > 0) data.features = sFeatures;
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

        // Nesting
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

        if (currentEditIndex !== null) {
            Object.assign(arr[currentEditIndex], data);
        } else {
            arr.push(data);
        }
    }

    markAsPending(currentEditType);
    closeModal();
    renderAllSections();
    renderDashboard();
}

function deleteItem(type, index) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    var arr = getDataArray(type);
    arr.splice(index, 1);
    markAsPending(type);
    renderAllSections();
    renderDashboard();
}

// ==========================================
// 17. PENDING CHANGES & PUBLISH
// ==========================================

var pendingChanges = new Set();

function markAsPending(type) {
    pendingChanges.add(type);
    updatePublishButton();

    var undoBtn = document.getElementById('undo-btn-' + type);
    if (undoBtn) undoBtn.style.display = 'inline-block';

    showToast('Changes saved locally. Click "Publish All" to push to GitHub.', 'success');
}

function updatePublishButton() {
    var btn = document.getElementById('publish-btn');
    var badge = document.getElementById('pending-count');

    if (!btn) return;

    if (pendingChanges.size > 0) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-success');
        btn.style.opacity = '1';
        btn.title = 'Save pending changes';

        if (badge) {
            badge.style.display = 'inline-flex';
            badge.textContent = pendingChanges.size;
        }
    } else {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-secondary');
        btn.style.opacity = '0.7';
        btn.title = 'No pending changes';

        if (badge) {
            badge.style.display = 'none';
        }
    }
}

async function publishAllChanges() {
    if (pendingChanges.size === 0) {
        showToast('No pending changes to save', 'info');
        return;
    }

    var btn = document.getElementById('publish-btn');
    var originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
        var successCount = 0;
        var types = Array.from(pendingChanges);

        var useGitHub = !!(gitHubConfig.token && gitHubConfig.owner && gitHubConfig.repo);
        var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var data = getDataArray(type);

            if (isLocal && authToken) {
                try {
                    var res = await fetch('/api/data/' + type, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok && res.status === 401) {
                        showToast('Session expired - please login again', 'error');
                        showLogin();
                        return;
                    }
                } catch (e) {
                    console.warn('Local server save failed:', e.message);
                }
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

        var mode = useGitHub ? 'GitHub' : 'Local Server';
        showToast('Successfully saved ' + successCount + ' update(s) to ' + mode + '!', 'success');
    } catch (error) {
        showToast('Error saving: ' + error.message, 'error');
        console.error(error);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function reloadSectionData(type) {
    var filePath = GITHUB_DATA_FILES[type];
    var varName = GITHUB_VAR_NAMES[type];
    if (!filePath || !varName) return;

    try {
        var content = '';
        var t = Date.now();

        if (gitHubConfig.token) {
            var res = await fetch('https://raw.githubusercontent.com/' + gitHubConfig.owner + '/' + gitHubConfig.repo + '/' + gitHubConfig.branch + '/' + filePath + '?t=' + t);
            if (res.ok) content = await res.text();
        } else {
            var res2 = await fetch(filePath + '?t=' + t);
            if (res2.ok) content = await res2.text();
        }

        if (content) {
            var match = content.match(/const\s+\w+\s*=\s*(\[[\s\S]*\]);?/);
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

// ==========================================
// 18. SAVE TO SERVER
// ==========================================

async function saveToServer(type, data) {
    if (gitHubConfig.token) {
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
        '<img src="' + mainImage + '" alt="' + name + '" onerror="this.src=\'assets/images/logo/tridel.png\'">' +
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
    if (typeof CONTACT_DATA !== 'undefined') {
        document.getElementById('setting-address').value = CONTACT_DATA.address || '';
        document.getElementById('setting-phone').value = CONTACT_DATA.phone || '';
        document.getElementById('setting-email').value = CONTACT_DATA.email || '';

        if (CONTACT_DATA.social) {
            document.getElementById('setting-linkedin').value = CONTACT_DATA.social.linkedin || '';
            document.getElementById('setting-youtube').value = CONTACT_DATA.social.youtube || '';
            document.getElementById('setting-instagram').value = CONTACT_DATA.social.instagram || '';
        }
    }

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

    window.CONTACT_DATA = newContactSettings;
    window.SETTINGS_DATA = newFormSettings;

    markAsPending('settings');
    markAsPending('form_settings');

    showToast('Settings saved! Remember to Publish All to apply changes.', 'success');
}

// ==========================================
// 22. EXPORT
// ==========================================

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

// ==========================================
// 23. TOAST
// ==========================================

function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle') + '"></i>' +
        '<span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
}

// ==========================================
// 24. GALLERY MANAGEMENT
// ==========================================

function addGalleryImage() {
    var path = prompt('Enter image path:', 'assets/images/');
    if (!path || path.trim() === '') return;

    var galleryField = document.getElementById('field-gallery');
    var images = [];
    try { images = JSON.parse(galleryField.value) || []; } catch (e) { images = []; }

    images.push(path.trim());
    galleryField.value = JSON.stringify(images);
    renderGalleryThumbs(images);
}

function handleFileUpload(input, targetFieldId, isGallery) {
    var files = input.files;
    var fileCount = files.length;

    if (!fileCount) {
        showToast('No files selected', 'error');
        return;
    }

    var targetField = document.getElementById(targetFieldId);
    if (!targetField) {
        showToast('Target field ' + targetFieldId + ' not found', 'error');
        return;
    }

    var processed = 0;
    var processedImages = [];

    showToast('Processing ' + fileCount + ' image(s)...', 'info');

    Array.from(files).forEach(function (file) {
        compressImage(file, 800, 0.7).then(function (compressedBase64) {
            processed++;
            processedImages.push(compressedBase64);

            if (processed === fileCount) {
                if (isGallery) {
                    var existingImages = [];
                    try { existingImages = JSON.parse(targetField.value) || []; } catch (e) { existingImages = []; }

                    var newGallery = existingImages.concat(processedImages);
                    targetField.value = JSON.stringify(newGallery);
                    renderGalleryThumbs(newGallery);
                } else {
                    var val = processedImages[0];
                    targetField.value = val;
                    renderSingleImagePreview(targetFieldId, val);
                }

                input.value = '';
                showToast(fileCount + ' image(s) processed!', 'success');
            }
        }).catch(function () {
            processed++;
            showToast('Error compressing ' + file.name, 'error');
        });
    });
}

function compressImage(file, maxSize, quality) {
    maxSize = maxSize || 800;
    quality = quality || 0.7;
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = new Image();

            img.onload = function () {
                var canvas = document.createElement('canvas');
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                var compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = function () { reject(new Error('Image load failed')); };
            img.src = e.target.result;
        };

        reader.onerror = function () { reject(new Error('File read failed')); };
        reader.readAsDataURL(file);
    });
}

function removeGalleryImage(index) {
    var galleryField = document.getElementById('field-gallery');
    var images = [];
    try { images = JSON.parse(galleryField.value) || []; } catch (e) { images = []; }

    images.splice(index, 1);
    galleryField.value = JSON.stringify(images);
    renderGalleryThumbs(images);
}

function renderGalleryThumbs(images) {
    var container = document.getElementById('gallery-thumbs');
    if (!container) return;

    if (images.length === 0) {
        container.innerHTML = '<div class="gallery-empty">No images added yet</div>';
    } else {
        container.innerHTML = images.map(function (img, i) {
            return '<div class="gallery-thumb" draggable="true" data-index="' + i + '">' +
                '<img src="' + img + '" alt="Image ' + (i + 1) + '" onerror="this.src=\'assets/images/logo/tridel.png\'">' +
                '<button type="button" class="thumb-delete" onclick="removeGalleryImage(' + i + ')"><i class="fas fa-times"></i></button>' +
                '<span class="thumb-order">' + (i + 1) + '</span></div>';
        }).join('');

        initGalleryDragDrop();
    }
}

function initGalleryDragDrop() {
    var thumbs = document.querySelectorAll('.gallery-thumb');
    var draggedEl = null;

    thumbs.forEach(function (thumb) {
        thumb.addEventListener('dragstart', function (e) {
            draggedEl = thumb;
            thumb.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        thumb.addEventListener('dragend', function () {
            thumb.classList.remove('dragging');
            document.querySelectorAll('.gallery-thumb').forEach(function (t) { t.classList.remove('drag-over'); });
            draggedEl = null;
        });

        thumb.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (draggedEl && thumb !== draggedEl) {
                thumb.classList.add('drag-over');
            }
        });

        thumb.addEventListener('dragleave', function () {
            thumb.classList.remove('drag-over');
        });

        thumb.addEventListener('drop', function (e) {
            e.preventDefault();
            thumb.classList.remove('drag-over');

            if (!draggedEl || thumb === draggedEl) return;

            var galleryField = document.getElementById('field-gallery');
            var images = [];
            try { images = JSON.parse(galleryField.value) || []; } catch (err) { images = []; }

            var fromIndex = parseInt(draggedEl.dataset.index);
            var toIndex = parseInt(thumb.dataset.index);

            var moved = images.splice(fromIndex, 1)[0];
            images.splice(toIndex, 0, moved);

            galleryField.value = JSON.stringify(images);
            renderGalleryThumbs(images);
        });
    });
}

// ==========================================
// 25. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async function () {
    checkAuth();
    initNavigation();

    // Update theme icon now that DOM is ready
    var savedTheme = localStorage.getItem('adminTheme') || 'dark';
    updateThemeIcon(savedTheme);

    // Load data from GitHub if configured
    if (gitHubConfig.token && gitHubConfig.owner && gitHubConfig.repo) {
        await loadDataFromGitHub();
    }

    renderDashboard();
    renderAllSections();
    loadSettingsToForm();

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
});

/**
 * admin-github.js
 * GitHub config/auth helpers and LinkedIn embed utilities, extracted from admin.js.
 * Depends on: escapeHTML (utils.js), showToast (admin.js global).
 * Load order: utils.js -> admin-github.js -> admin.js
 */


// -- GitHub Config & Auth Headers --

function getAdminAuthHeaders() {
    var token = sessionStorage.getItem('adminToken') || '';
    return token ? { 'X-Auth-Token': token } : {};
}

function isServerGitHubManaged() {
    return !!(serverGitHubProxyAvailable && serverGitHubConfig && serverGitHubConfig.mode === 'server' && serverGitHubConfig.hasToken);
}

function getEffectiveGitHubConfig() {
    if (isServerGitHubManaged()) {
        return {
            owner: serverGitHubConfig.owner || '',
            repo: serverGitHubConfig.repo || '',
            branch: serverGitHubConfig.branch || 'main',
            token: ''
        };
    }

    return {
        owner: gitHubConfig.owner || '',
        repo: gitHubConfig.repo || '',
        branch: gitHubConfig.branch || 'main',
        token: gitHubConfig.token || ''
    };
}

function getGitHubFormConfig() {
    return {
        owner: ((document.getElementById('github-owner') || {}).value || '').trim(),
        repo: ((document.getElementById('github-repo') || {}).value || '').trim(),
        branch: ((document.getElementById('github-branch') || {}).value || 'main').trim() || 'main',
        token: ((document.getElementById('github-token') || {}).value || '').trim()
    };
}

function hasConfiguredGitHub() {
    var config = getEffectiveGitHubConfig();
    return !!(config.owner && config.repo && (isServerGitHubManaged() || config.token));
}

function buildGitHubProxyPayload(baseConfig) {
    var config = baseConfig || getEffectiveGitHubConfig();
    var payload = {
        owner: config.owner,
        repo: config.repo,
        branch: config.branch || 'main'
    };

    if (!isServerGitHubManaged()) {
        payload.token = config.token || '';
    }

    return payload;
}

function updateGitHubConfigUI() {
    var ownerInput = document.getElementById('github-owner');
    var repoInput = document.getElementById('github-repo');
    var branchInput = document.getElementById('github-branch');
    var tokenInput = document.getElementById('github-token');
    var statusEl = document.getElementById('github-status');
    var saveBtn = document.getElementById('github-save-btn');

    if (!ownerInput || !repoInput || !branchInput || !tokenInput) return;

    var config = getEffectiveGitHubConfig();
    var managed = isServerGitHubManaged();

    ownerInput.value = config.owner || '';
    repoInput.value = config.repo || '';
    branchInput.value = config.branch || 'main';
    tokenInput.value = managed ? '' : (config.token || '');

    ownerInput.disabled = managed;
    repoInput.disabled = managed;
    branchInput.disabled = managed;
    tokenInput.disabled = managed;

    if (saveBtn) {
        saveBtn.disabled = managed;
        saveBtn.title = managed ? 'GitHub settings are managed by server environment variables.' : '';
    }

    if (statusEl) {
        if (managed) {
            statusEl.innerHTML = '<i class="fas fa-shield-alt"></i> Using server-managed GitHub credentials from environment variables.';
            statusEl.style.color = 'var(--accent)';
        } else {
            statusEl.innerHTML = '';
            statusEl.style.color = 'var(--text)';
        }
    }
}

function openGitHubConfig() {
    updateGitHubConfigUI();
    document.getElementById('github-config-overlay').style.display = 'flex';
}

function closeGitHubConfig() {
    document.getElementById('github-config-overlay').style.display = 'none';
}

function saveGitHubConfig() {
    if (isServerGitHubManaged()) {
        showToast('GitHub is managed by server environment variables', 'info');
        closeGitHubConfig();
        return;
    }

    var owner = document.getElementById('github-owner').value.trim();
    var repo = document.getElementById('github-repo').value.trim();
    var branch = document.getElementById('github-branch').value.trim();
    var token = document.getElementById('github-token').value.trim();

    if (!owner || !repo || !branch || !token) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    gitHubConfig = { owner: owner, repo: repo, branch: branch, token: token };
    sessionStorage.setItem('tridel_github_config', JSON.stringify(gitHubConfig));

    closeGitHubConfig();
    showToast('Settings saved. Reloading...', 'success');
    setTimeout(function () { location.reload(); }, 1000);
}


// -- LinkedIn Embed Helpers --

function normalizeLinkedInEmbedUrl(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';

    var srcMatch = raw.match(/src\s*=\s*["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
        raw = srcMatch[1].trim();
    }

    var embedMatch = raw.match(/https:\/\/www\.linkedin\.com\/embed\/feed\/update\/urn:li:(?:share|ugcPost):\d+(?:\?[^"'\s<>]*)?/i);
    if (embedMatch && embedMatch[0]) {
        raw = embedMatch[0];
    } else {
        var activityMatch = raw.match(/linkedin\.com\/posts\/[^?\s/]+(?:-[^?\s/]+)*-activity-(\d+)/i);
        if (activityMatch && activityMatch[1]) {
            raw = 'https://www.linkedin.com/embed/feed/update/urn:li:share:' + activityMatch[1];
        }
    }

    raw = raw.replace(/["'<>\s].*$/, '');

    if (raw.indexOf('linkedin.com/embed/feed/update/urn:li:') === -1) {
        return '';
    }

    if (raw.indexOf('?') === -1) {
        raw += '?collapsed=1';
    } else if (!/[?&]collapsed=/i.test(raw)) {
        raw += '&collapsed=1';
    }

    return raw;
}

function previewLinkedInEmbed(url) {
    var container = document.getElementById('linkedin-embed-preview');
    if (!container) return;

    url = normalizeLinkedInEmbedUrl(url);
    if (url && url.includes('linkedin.com/embed/')) {
        container.innerHTML = '<iframe src="' + escapeHTML(url) + '" height="400" width="100%" frameborder="0" ' +
            'style="border:none; border-radius:4px;" loading="lazy" title="LinkedIn Preview"></iframe>';
    } else if (url) {
        container.innerHTML = '<span style="color:var(--text-muted);"><i class="fas fa-exclamation-triangle" style="color:var(--warning); margin-right:8px;"></i> URL should contain "linkedin.com/embed/"</span>';
    } else {
        container.innerHTML = '<span style="color:var(--text-muted);"><i class="fab fa-linkedin" style="font-size:2rem; opacity:0.3; margin-right:10px;"></i> Enter an embed URL above to preview</span>';
    }
}


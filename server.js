/**
 * Tridel Content Manager - Backend Server
 * Enables direct file saving for the admin panel
 * With password authentication and security hardening
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
        if (!match) return;

        const key = match[1];
        let value = match[2] || '';

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (typeof process.env[key] === 'undefined') {
            process.env[key] = value;
        }
    });
}

loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '.env.local'));

const app = express();
const PORT = 3000;

app.disable('x-powered-by');

// ============================================
// SECURITY: Password Configuration
// ============================================
// In production, TRIDEL_ADMIN_PASSWORD env var is REQUIRED.
// In development, generate a high-entropy password if one is not provided.
function generateDevelopmentAdminPassword() {
    return crypto.randomBytes(18).toString('base64url');
}

function hashAdminPassword(password, saltHex) {
    const salt = saltHex || crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt$${salt}$${derivedKey}`;
}

function verifyAdminPassword(password, storedHash) {
    if (!password || !storedHash) return false;

    const parts = String(storedHash).split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

    const salt = parts[1];
    const expected = Buffer.from(parts[2], 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length);

    return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

function isSupportedAdminPasswordHash(storedHash) {
    const parts = String(storedHash || '').split('$');
    return parts.length === 3 && parts[0] === 'scrypt' && /^[0-9a-f]+$/i.test(parts[1]) && /^[0-9a-f]+$/i.test(parts[2]);
}

let ADMIN_PASSWORD = null;
let ADMIN_PASSWORD_HASH = null;

if (process.env.TRIDEL_ADMIN_PASSWORD_HASH) {
    ADMIN_PASSWORD_HASH = process.env.TRIDEL_ADMIN_PASSWORD_HASH.trim();
} else if (process.env.TRIDEL_ADMIN_PASSWORD) {
    ADMIN_PASSWORD = process.env.TRIDEL_ADMIN_PASSWORD;
} else if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: TRIDEL_ADMIN_PASSWORD_HASH or TRIDEL_ADMIN_PASSWORD environment variable is required in production.');
    process.exit(1);
} else {
    ADMIN_PASSWORD = generateDevelopmentAdminPassword();
    console.warn('WARNING: TRIDEL_ADMIN_PASSWORD is not set.');
    console.warn(`Generated one-time development admin password for this server process: ${ADMIN_PASSWORD}`);
    console.warn('Set TRIDEL_ADMIN_PASSWORD to use a stable admin secret.');
}

if (ADMIN_PASSWORD_HASH && !isSupportedAdminPasswordHash(ADMIN_PASSWORD_HASH)) {
    console.error('FATAL: TRIDEL_ADMIN_PASSWORD_HASH is not in the expected scrypt format.');
    process.exit(1);
}

function isValidAdminPassword(password) {
    if (ADMIN_PASSWORD_HASH) {
        return verifyAdminPassword(password, ADMIN_PASSWORD_HASH);
    }
    return password === ADMIN_PASSWORD;
}

const SERVER_GITHUB_CONFIG = {
    owner: (process.env.TRIDEL_GITHUB_OWNER || '').trim(),
    repo: (process.env.TRIDEL_GITHUB_REPO || '').trim(),
    branch: (process.env.TRIDEL_GITHUB_BRANCH || 'main').trim() || 'main',
    token: (process.env.TRIDEL_GITHUB_TOKEN || '').trim()
};

const sessions = new Map();  // In-memory session store

// ============================================
// SECURITY: Rate Limiting for Login
// ============================================
const loginAttempts = new Map(); // Map<ip, { count, firstAttempt }>
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Auto-cleanup expired rate limit entries every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of loginAttempts) {
        if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
            loginAttempts.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW_MS);

function checkRateLimit(ip) {
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (!record) {
        return true; // No previous attempts
    }

    // Window expired, reset
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        loginAttempts.delete(ip);
        return true;
    }

    return record.count < RATE_LIMIT_MAX;
}

function recordFailedAttempt(ip) {
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
    } else {
        record.count++;
    }
}

function clearFailedAttempts(ip) {
    loginAttempts.delete(ip);
}

// ============================================
// SECURITY: Input Sanitization
// ============================================
// Recursively strip __proto__, constructor, prototype keys from objects
function sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const cleaned = {};
    for (const key of Object.keys(obj)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue; // Strip dangerous keys
        }
        cleaned[key] = sanitizeObject(obj[key]);
    }
    return cleaned;
}

// Check nesting depth to prevent DoS via deeply nested payloads
function checkDepth(obj, maxDepth, currentDepth) {
    currentDepth = currentDepth || 0;
    if (currentDepth > maxDepth) return false;
    if (obj === null || typeof obj !== 'object') return true;
    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            if (!checkDepth(obj[i], maxDepth, currentDepth + 1)) return false;
        }
    } else {
        for (const key of Object.keys(obj)) {
            if (!checkDepth(obj[key], maxDepth, currentDepth + 1)) return false;
        }
    }
    return true;
}

// Generate session token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function hasServerGitHubConfig() {
    return !!(SERVER_GITHUB_CONFIG.owner && SERVER_GITHUB_CONFIG.repo && SERVER_GITHUB_CONFIG.token);
}

function getRequestGitHubConfig(req) {
    if (hasServerGitHubConfig()) {
        return { ...SERVER_GITHUB_CONFIG };
    }

    const body = req.body || {};
    return {
        owner: String(body.owner || '').trim(),
        repo: String(body.repo || '').trim(),
        branch: String(body.branch || 'main').trim() || 'main',
        token: String(body.token || '').trim()
    };
}

function isValidGitHubConfig(config) {
    return !!(config && config.owner && config.repo && config.branch && config.token);
}

function encodeGitHubPath(filePath) {
    return String(filePath || '')
        .split('/')
        .filter(Boolean)
        .map(segment => encodeURIComponent(segment))
        .join('/');
}

function getGitHubHeaders(token, accept) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
    };

    if (accept) {
        headers.Accept = accept;
    }

    return headers;
}

async function readGitHubContent(config, filePath) {
    const encodedPath = encodeGitHubPath(filePath);
    const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}?ref=${encodeURIComponent(config.branch)}`;
    const res = await fetch(url, {
        headers: getGitHubHeaders(config.token, 'application/vnd.github+json')
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`GitHub read failed (${res.status}): ${errorText || res.statusText}`);
    }

    const payload = await res.json();
    const rawContent = String(payload.content || '').replace(/\n/g, '');
    return {
        sha: payload.sha || null,
        content: Buffer.from(rawContent, 'base64').toString('utf8')
    };
}

async function writeGitHubContent(config, filePath, content, message) {
    const encodedPath = encodeGitHubPath(filePath);
    const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}`;
    let sha = null;

    const getRes = await fetch(`${url}?ref=${encodeURIComponent(config.branch)}`, {
        headers: getGitHubHeaders(config.token, 'application/vnd.github+json')
    });

    if (getRes.ok) {
        const existingFile = await getRes.json();
        sha = existingFile.sha || null;
    } else if (getRes.status !== 404) {
        const errorText = await getRes.text();
        throw new Error(`GitHub preflight failed (${getRes.status}): ${errorText || getRes.statusText}`);
    }

    const body = {
        message,
        content: Buffer.from(String(content || ''), 'utf8').toString('base64'),
        branch: config.branch
    };

    if (sha) {
        body.sha = sha;
    }

    const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
            ...getGitHubHeaders(config.token, 'application/vnd.github+json'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!putRes.ok) {
        const errorText = await putRes.text();
        throw new Error(`GitHub write failed (${putRes.status}): ${errorText || putRes.statusText}`);
    }

    return putRes.json();
}

// Auth middleware - protects API routes
function requireAuth(req, res, next) {
    const token = req.headers['x-auth-token'];
    if (token && sessions.has(token) && sessions.get(token) > Date.now()) {
        next();
    } else {
        if (token) sessions.delete(token);
        res.status(401).json({ error: 'Authentication required' });
    }
}

// ============================================
// SECURITY: Headers Middleware
// ============================================
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    // HSTS: enforce HTTPS for 1 year (only effective when served over HTTPS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // CSP: Add domains to frame-src/img-src as needed when embedding new sources
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "base-uri 'self'; " +
        "object-src 'none'; " +
        "frame-ancestors 'none'; " +
        "form-action 'self' https://formsubmit.co; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://raw.githubusercontent.com; " +
        "frame-src 'self' https://www.linkedin.com https://www.youtube.com https://www.google.com; " +
        "connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://formsubmit.co https://*.basemaps.cartocdn.com"
    );
    next();
});

// ============================================
// SECURITY: CORS with Whitelist
// ============================================
const allowedOrigins = [
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`
];

// Add any production domains from env var (comma-separated)
if (process.env.TRIDEL_ALLOWED_ORIGINS) {
    const extras = process.env.TRIDEL_ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
    allowedOrigins.push(...extras);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, curl, same-origin)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));

app.use(express.json({ limit: '2mb' }));

const BLOCKED_PUBLIC_FILES = new Set([
    '/server.js',
    '/package.json',
    '/package-lock.json',
    '/readme.md',
    '/technical_documentation.md',
    '/verify_news.txt',
    '/.gitignore',
    '/_headers',
    '/_redirects',
    '/crossdomain.xml',
    '/sitemap.xml'
]);

const BLOCKED_PUBLIC_EXTENSIONS = new Set([
    '.md',
    '.txt',
    '.json',
    '.lock',
    '.toml',
    '.yaml',
    '.yml'
]);

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }

    const normalizedPath = (req.path || '').toLowerCase();
    const ext = path.extname(normalizedPath);
    const baseName = path.basename(normalizedPath);

    if (normalizedPath.startsWith('/logs/')) {
        return res.status(404).type('text/plain').send('Not found');
    }

    if (baseName.startsWith('.')) {
        return res.status(404).type('text/plain').send('Not found');
    }

    if (BLOCKED_PUBLIC_FILES.has(normalizedPath) || BLOCKED_PUBLIC_EXTENSIONS.has(ext)) {
        return res.status(404).type('text/plain').send('Not found');
    }

    next();
});

app.use(express.static('.'));  // Serve static files from current directory

// ============================================
// AUTH ENDPOINTS (no auth required)
// ============================================

// Login (with rate limiting)
app.post('/api/login', (req, res) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
        console.log(`Rate limited login attempt from ${ip}`);
        return res.status(429).json({
            error: 'Too many login attempts. Please try again in 15 minutes.'
        });
    }

    const { password } = req.body;
    if (isValidAdminPassword(password)) {
        clearFailedAttempts(ip);
        const token = generateToken();
        sessions.set(token, Date.now() + 3600000); // 1 hour expiry
        console.log('Admin logged in successfully');
        res.json({ success: true, token });
    } else {
        recordFailedAttempt(ip);
        console.log(`Failed login attempt from ${ip}`);
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    const token = req.headers['x-auth-token'];
    if (token) sessions.delete(token);
    res.json({ success: true });
});

// Check if authenticated
app.get('/api/check-auth', (req, res) => {
    const token = req.headers['x-auth-token'];
    if (token && sessions.has(token) && sessions.get(token) > Date.now()) {
        res.json({ authenticated: true });
    } else {
        if (token) sessions.delete(token);
        res.json({ authenticated: false });
    }
});

app.get('/api/github/config', requireAuth, (req, res) => {
    res.json({
        mode: hasServerGitHubConfig() ? 'server' : 'client',
        owner: SERVER_GITHUB_CONFIG.owner,
        repo: SERVER_GITHUB_CONFIG.repo,
        branch: SERVER_GITHUB_CONFIG.branch,
        hasToken: hasServerGitHubConfig()
    });
});

app.post('/api/github/test', requireAuth, async (req, res) => {
    const config = getRequestGitHubConfig(req);

    if (!isValidGitHubConfig(config)) {
        return res.status(400).json({ error: 'GitHub owner, repo, branch, and token are required' });
    }

    try {
        const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;
        const ghRes = await fetch(url, {
            headers: getGitHubHeaders(config.token, 'application/vnd.github+json')
        });

        if (!ghRes.ok) {
            const errorText = await ghRes.text();
            return res.status(400).json({ error: errorText || ghRes.statusText });
        }

        res.json({
            success: true,
            mode: hasServerGitHubConfig() ? 'server' : 'client',
            owner: config.owner,
            repo: config.repo,
            branch: config.branch
        });
    } catch (err) {
        console.error('GitHub connection test failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/github/load', requireAuth, async (req, res) => {
    const config = getRequestGitHubConfig(req);
    const filePath = String((req.body || {}).path || '').trim();

    if (!filePath) {
        return res.status(400).json({ error: 'GitHub file path is required' });
    }

    if (!isValidGitHubConfig(config)) {
        return res.status(400).json({ error: 'GitHub owner, repo, branch, and token are required' });
    }

    try {
        const result = await readGitHubContent(config, filePath);
        res.json({
            success: true,
            content: result.content,
            sha: result.sha,
            mode: hasServerGitHubConfig() ? 'server' : 'client'
        });
    } catch (err) {
        console.error(`GitHub load failed for ${filePath}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/github/save', requireAuth, async (req, res) => {
    const config = getRequestGitHubConfig(req);
    const filePath = String((req.body || {}).path || '').trim();
    const content = String((req.body || {}).content || '');
    const message = String((req.body || {}).message || 'Update content via Admin Panel').trim();

    if (!filePath) {
        return res.status(400).json({ error: 'GitHub file path is required' });
    }

    if (!isValidGitHubConfig(config)) {
        return res.status(400).json({ error: 'GitHub owner, repo, branch, and token are required' });
    }

    try {
        await writeGitHubContent(config, filePath, content, message);
        res.json({
            success: true,
            mode: hasServerGitHubConfig() ? 'server' : 'client',
            owner: config.owner,
            repo: config.repo,
            branch: config.branch,
            path: filePath
        });
    } catch (err) {
        console.error(`GitHub save failed for ${filePath}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// Clean expired sessions every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [token, expiry] of sessions) {
        if (expiry < now) sessions.delete(token);
    }
}, 600000);

// ============================================
// DATA FILE PATHS
// ============================================
const DATA_FILES = {
    products: 'assets/js/products-data.js',
    services: 'assets/js/services-data.js',
    clients: 'assets/js/clients-data.js',
    stories: 'assets/js/success-stories-data.js',
    home: 'assets/js/home-data.js',
    news: 'assets/js/news-data.js',
    team: 'assets/js/team-data.js',
    testimonials: 'assets/js/testimonials-data.js',
    locations: 'assets/js/locations-data.js',
    contact: 'assets/js/contact-data.js',
    settings: 'assets/js/settings-data.js',
    index_content: 'assets/js/index-page-data.js',
    about_content: 'assets/js/about-page-data.js',
    contact_content: 'assets/js/contact-page-data.js',
    layout: 'assets/js/layout-data.js'
};

const VAR_NAMES = {
    products: 'PRODUCTS_DATA',
    services: 'SERVICES_DATA',
    clients: 'CLIENTS_DATA',
    stories: 'SUCCESS_STORIES_DATA',
    home: 'HOME_CARDS_DATA',
    news: 'NEWS_DATA',
    team: 'TEAM_DATA',
    testimonials: 'TESTIMONIALS_DATA',
    locations: 'LOCATIONS_DATA',
    contact: 'CONTACT_DATA',
    settings: 'SETTINGS_DATA',
    index_content: 'INDEX_HERO',
    about_content: 'ABOUT_DATA',
    contact_content: 'CONTACT_INFO_CARDS',
    layout: 'NAV_LINKS'
};

// ============================================
// PROTECTED API ENDPOINTS (auth required)
// ============================================

// API: Get all data (protected)
app.get('/api/data/:type', requireAuth, (req, res) => {
    const type = req.params.type;
    const filePath = DATA_FILES[type];

    if (!filePath) {
        return res.status(400).json({ error: 'Invalid data type' });
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Extract JSON from JS const/var declaration (arrays or objects)
        const match = content.match(/(?:const|var|let)\s+\w+\s*=\s*([\[{][\s\S]*[\]}]);?/);
        if (match) {
            const data = JSON.parse(match[1]);
            res.json(data);
        } else {
            res.json([]);
        }
    } catch (err) {
        console.error(`Error reading ${type}:`, err.message);
        res.json([]);
    }
});

// API: Save data (protected, with input validation)
app.post('/api/data/:type', requireAuth, (req, res) => {
    const type = req.params.type;
    const filePath = DATA_FILES[type];
    const varName = VAR_NAMES[type];

    if (!filePath || !varName) {
        return res.status(400).json({ error: 'Invalid data type' });
    }

    // Input validation: body must be an array or a plain object
    const rawData = req.body;
    if (rawData === null || rawData === undefined || typeof rawData === 'string' || typeof rawData === 'number' || typeof rawData === 'boolean') {
        return res.status(400).json({ error: 'Invalid data format: expected an array or object' });
    }

    // Depth check: prevent deeply nested payloads from causing stack overflow
    if (!checkDepth(rawData, 10)) {
        return res.status(400).json({ error: 'Payload too deeply nested (max 10 levels)' });
    }

    // Array length check: prevent excessively large payloads
    if (Array.isArray(rawData) && rawData.length > 500) {
        return res.status(400).json({ error: 'Too many items (max 500)' });
    }

    try {
        const data = sanitizeObject(rawData);
        let content;
        if (type === 'index_content') {
            // Special: multi-var file with INDEX_HERO, INDEX_STATS, etc.
            const lines = [
                '/**',
                ' * Index / Home Page Data',
                ' * Content data for the home page hero, stats, value props, case study, and CTA',
                ' */',
            ];
            lines.push(`var INDEX_HERO = ${JSON.stringify(data.INDEX_HERO || {}, null, 2)};`);
            lines.push('');
            lines.push(`var INDEX_STATS = ${JSON.stringify(data.INDEX_STATS || [], null, 2)};`);
            lines.push('');
            lines.push(`var INDEX_WHAT_WE_DO = ${JSON.stringify(data.INDEX_WHAT_WE_DO || {}, null, 2)};`);
            lines.push('');
            lines.push(`var INDEX_CASE_STUDY = ${JSON.stringify(data.INDEX_CASE_STUDY || {}, null, 2)};`);
            lines.push('');
            lines.push(`var INDEX_CTA = ${JSON.stringify(data.INDEX_CTA || {}, null, 2)};`);
            lines.push('');
            lines.push(`var INDEX_WHY_CHOOSE = ${JSON.stringify(data.INDEX_WHY_CHOOSE || {}, null, 2)};`);
            lines.push('');
            lines.push(`var INDEX_SECTION_ORDER = ${JSON.stringify(data.INDEX_SECTION_ORDER || [], null, 2)};`);
            lines.push('');
            content = lines.join('\n');
        } else if (type === 'about_content') {
            // Single var file
            const aboutLines = [
                '/**',
                ' * About Page Data',
                ' * Content for the Who We Are section',
                ' */',
            ];
            aboutLines.push(`var ABOUT_DATA = ${JSON.stringify(data, null, 2)};`);
            aboutLines.push('');
            content = aboutLines.join('\n');
        } else if (type === 'contact_content') {
            // Multi-var: CONTACT_INFO_CARDS + CONTACT_FAQ_DATA + CONTACT_PAGE_CONFIG
            const contactLines = [
                '/**',
                ' * Contact Page Data',
                ' * Contact info cards, FAQ data, and page configuration',
                ' */',
            ];
            contactLines.push(`var CONTACT_INFO_CARDS = ${JSON.stringify(data.CONTACT_INFO_CARDS || [], null, 2)};`);
            contactLines.push('');
            contactLines.push(`var CONTACT_FAQ_DATA = ${JSON.stringify(data.CONTACT_FAQ_DATA || [], null, 2)};`);
            contactLines.push('');
            contactLines.push(`var CONTACT_PAGE_CONFIG = ${JSON.stringify(data.CONTACT_PAGE_CONFIG || {}, null, 2)};`);
            contactLines.push('');
            content = contactLines.join('\n');
        } else if (type === 'layout') {
            // Multi-var: NAV_LINKS + FOOTER_DATA + PAGE_META
            const layoutLines = [
                '/**',
                ' * Layout Data \u2014 Navigation links, footer data, and page metadata',
                ' */',
            ];
            layoutLines.push(`var NAV_LINKS = ${JSON.stringify(data.NAV_LINKS || [], null, 2)};`);
            layoutLines.push('');
            layoutLines.push(`var FOOTER_DATA = ${JSON.stringify(data.FOOTER_DATA || {}, null, 2)};`);
            layoutLines.push('');
            layoutLines.push(`var PAGE_META = ${JSON.stringify(data.PAGE_META || {}, null, 2)};`);
            layoutLines.push('');
            content = layoutLines.join('\n');
        } else {
            content = `const ${varName} = ${JSON.stringify(data, null, 2)};`;
        }
        fs.writeFileSync(filePath, content, 'utf8');
        const count = Array.isArray(data) ? data.length : 1;
        console.log(`Saved ${type} (${count} items)`);
        res.json({ success: true, message: `${type} saved successfully`, count });
    } catch (err) {
        console.error(`Error saving ${type}:`, err.message);
        res.status(500).json({ error: 'Failed to save data. Check server logs for details.' });
    }
});

// API: Get all data types at once (protected)
app.get('/api/all-data', requireAuth, (req, res) => {
    const allData = {};

    for (const [type, filePath] of Object.entries(DATA_FILES)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const match = content.match(/(?:const|var|let)\s+\w+\s*=\s*([\[{][\s\S]*[\]}]);?/);
            allData[type] = match ? JSON.parse(match[1]) : [];
        } catch (err) {
            allData[type] = [];
        }
    }

    res.json(allData);
});

// API: Save all data at once (protected, with input validation)
app.post('/api/save-all', requireAuth, (req, res) => {
    const results = {};

    // Validate that all keys in the body correspond to valid DATA_FILES keys
    for (const key of Object.keys(req.body)) {
        if (!DATA_FILES[key]) {
            return res.status(400).json({ error: `Invalid data type: ${key}` });
        }
    }

    // Multi-var file types that need special serialization
    const MULTI_VAR_TYPES = new Set(['index_content', 'about_content', 'contact_content', 'layout']);

    for (const [type, rawData] of Object.entries(req.body)) {
        const filePath = DATA_FILES[type];
        const varName = VAR_NAMES[type];

        if (filePath && varName && rawData != null) {
            // Validate each entry is an array or object
            if (typeof rawData === 'string' || typeof rawData === 'number' || typeof rawData === 'boolean') {
                results[type] = { success: false, error: 'Invalid data format: expected an array or object' };
                continue;
            }

            try {
                const data = sanitizeObject(rawData);
                let content;

                if (MULTI_VAR_TYPES.has(type)) {
                    // Delegate to the same logic as POST /api/data/:type
                    // Re-use the individual save endpoint's serialization
                    if (type === 'index_content') {
                        const lines = ['/**', ' * Index / Home Page Data', ' */'];
                        lines.push(`var INDEX_HERO = ${JSON.stringify(data.INDEX_HERO || {}, null, 2)};`);
                        lines.push('');
                        lines.push(`var INDEX_STATS = ${JSON.stringify(data.INDEX_STATS || [], null, 2)};`);
                        lines.push('');
                        lines.push(`var INDEX_WHAT_WE_DO = ${JSON.stringify(data.INDEX_WHAT_WE_DO || {}, null, 2)};`);
                        lines.push('');
                        lines.push(`var INDEX_CASE_STUDY = ${JSON.stringify(data.INDEX_CASE_STUDY || {}, null, 2)};`);
                        lines.push('');
                        lines.push(`var INDEX_CTA = ${JSON.stringify(data.INDEX_CTA || {}, null, 2)};`);
                        lines.push('');
                        lines.push(`var INDEX_WHY_CHOOSE = ${JSON.stringify(data.INDEX_WHY_CHOOSE || {}, null, 2)};`);
                        lines.push('');
                        lines.push(`var INDEX_SECTION_ORDER = ${JSON.stringify(data.INDEX_SECTION_ORDER || [], null, 2)};`);
                        content = lines.join('\n');
                    } else if (type === 'about_content') {
                        content = `/**\n * About Page Data\n */\nvar ABOUT_DATA = ${JSON.stringify(data, null, 2)};\n`;
                    } else if (type === 'contact_content') {
                        const lines = ['/**', ' * Contact Page Data', ' */'];
                        lines.push(`var CONTACT_INFO_CARDS = ${JSON.stringify(data.CONTACT_INFO_CARDS || [], null, 2)};`);
                        lines.push('');
                        lines.push(`var CONTACT_FAQ_DATA = ${JSON.stringify(data.CONTACT_FAQ_DATA || [], null, 2)};`);
                        lines.push('');
                        lines.push(`var CONTACT_PAGE_CONFIG = ${JSON.stringify(data.CONTACT_PAGE_CONFIG || {}, null, 2)};`);
                        content = lines.join('\n');
                    } else if (type === 'layout') {
                        const lines = ['/**', ' * Layout Data', ' */'];
                        lines.push(`var NAV_LINKS = ${JSON.stringify(data.NAV_LINKS || [], null, 2)};`);
                        lines.push('');
                        lines.push(`var FOOTER_DATA = ${JSON.stringify(data.FOOTER_DATA || {}, null, 2)};`);
                        lines.push('');
                        lines.push(`var PAGE_META = ${JSON.stringify(data.PAGE_META || {}, null, 2)};`);
                        content = lines.join('\n');
                    }
                } else {
                    content = `const ${varName} = ${JSON.stringify(data, null, 2)};`;
                }

                fs.writeFileSync(filePath, content, 'utf8');
                const count = Array.isArray(data) ? data.length : 1;
                results[type] = { success: true, count };
                console.log(`Saved ${type} (${count} items)`);
            } catch (err) {
                results[type] = { success: false, error: err.message };
            }
        }
    }

    res.json({ success: true, results });
});

// ============================================
// SPA FALLBACK: Serve index.html for all non-API routes
// ============================================
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' });
    }

    // Do not rewrite unknown file-like requests into the SPA shell.
    if (path.extname(req.path)) {
        return res.status(404).type('text/plain').send('Not found');
    }

    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('========================================================');
    console.log('   Tridel Content Manager (SECURED)                     ');
    console.log('========================================================');
    console.log(`   Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`   Website:     http://localhost:${PORT}/index.html`);
    console.log('--------------------------------------------------------');
    console.log('   Password required to make changes');
    if (hasServerGitHubConfig()) {
        console.log(`   GitHub Sync:  ${SERVER_GITHUB_CONFIG.owner}/${SERVER_GITHUB_CONFIG.repo} (${SERVER_GITHUB_CONFIG.branch})`);
    } else {
        console.log('   GitHub Sync:  Browser token or env vars required');
    }
    console.log('   Press Ctrl+C to stop the server');
    console.log('========================================================');
    console.log('');
});

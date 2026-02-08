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

const app = express();
const PORT = 3000;

// ============================================
// SECURITY: Password Configuration
// ============================================
// In production, TRIDEL_ADMIN_PASSWORD env var is REQUIRED.
// In development, a fallback is used with a warning.
let ADMIN_PASSWORD;
if (process.env.TRIDEL_ADMIN_PASSWORD) {
    ADMIN_PASSWORD = process.env.TRIDEL_ADMIN_PASSWORD;
} else if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: TRIDEL_ADMIN_PASSWORD environment variable is required in production.');
    process.exit(1);
} else {
    ADMIN_PASSWORD = 'tridel2026';
    console.warn('WARNING: Using default admin password. Set TRIDEL_ADMIN_PASSWORD env var for production.');
}

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

// Generate session token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
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
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://raw.githubusercontent.com; " +
        "connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://formsubmit.co https://unpkg.com https://*.basemaps.cartocdn.com"
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

app.use(express.json({ limit: '10mb' }));
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
    if (password === ADMIN_PASSWORD) {
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
    index_content: 'assets/js/index-page-data.js'
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
    index_content: 'INDEX_HERO'
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
        // Extract JSON from JS const declaration (arrays or objects)
        const match = content.match(/const\s+\w+\s*=\s*([\[{][\s\S]*[\]}]);?/);
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
            content = lines.join('\n');
        } else {
            content = `const ${varName} = ${JSON.stringify(data, null, 2)};`;
        }
        fs.writeFileSync(filePath, content, 'utf8');
        const count = Array.isArray(data) ? data.length : 1;
        console.log(`Saved ${type} (${count} items)`);
        res.json({ success: true, message: `${type} saved successfully`, count });
    } catch (err) {
        console.error(`Error saving ${type}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// API: Get all data types at once (protected)
app.get('/api/all-data', requireAuth, (req, res) => {
    const allData = {};

    for (const [type, filePath] of Object.entries(DATA_FILES)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const match = content.match(/const\s+\w+\s*=\s*([\[{][\s\S]*[\]}]);?/);
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
                const content = `const ${varName} = ${JSON.stringify(data, null, 2)};`;
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
    // Skip API routes and known static files
    if (req.path.startsWith('/api/')) return;
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
    console.log('   Press Ctrl+C to stop the server');
    console.log('========================================================');
    console.log('');
});

/**
 * Tridel Content Manager - Backend Server
 * Enables direct file saving for the admin panel
 * With password authentication for security
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// ============================================
// SECURITY CONFIGURATION - CHANGE THIS PASSWORD!
// ============================================
const ADMIN_PASSWORD = 'tridel2026';  // Change this to your secure password!
const sessions = new Map();  // In-memory session store

// Generate session token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Auth middleware - protects API routes
function requireAuth(req, res, next) {
    const token = req.headers['x-auth-token'];
    if (token && sessions.has(token)) {
        // Refresh session expiry
        sessions.set(token, Date.now() + 3600000); // 1 hour
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized - Please login' });
    }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));  // Serve static files from current directory

// ============================================
// AUTH ENDPOINTS (no auth required)
// ============================================

// Login
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = generateToken();
        sessions.set(token, Date.now() + 3600000); // 1 hour expiry
        console.log('✅ Admin logged in successfully');
        res.json({ success: true, token });
    } else {
        console.log('❌ Failed login attempt');
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
    if (token && sessions.has(token)) {
        res.json({ authenticated: true });
    } else {
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
    news: 'assets/js/news-data.js'
};

const VAR_NAMES = {
    products: 'PRODUCTS_DATA',
    services: 'SERVICES_DATA',
    clients: 'CLIENTS_DATA',
    stories: 'SUCCESS_STORIES_DATA',
    home: 'HOME_CARDS_DATA',
    news: 'NEWS_DATA'
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
        // Extract JSON from JS const declaration
        const match = content.match(/const\s+\w+\s*=\s*(\[[\s\S]*\]);?/);
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

// API: Save data (protected)
app.post('/api/data/:type', requireAuth, (req, res) => {
    const type = req.params.type;
    const filePath = DATA_FILES[type];
    const varName = VAR_NAMES[type];
    
    if (!filePath || !varName) {
        return res.status(400).json({ error: 'Invalid data type' });
    }
    
    try {
        const data = req.body;
        const content = `const ${varName} = ${JSON.stringify(data, null, 2)};`;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Saved ${type} (${data.length} items)`);
        res.json({ success: true, message: `${type} saved successfully`, count: data.length });
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
            const match = content.match(/const\s+\w+\s*=\s*(\[[\s\S]*\]);?/);
            allData[type] = match ? JSON.parse(match[1]) : [];
        } catch (err) {
            allData[type] = [];
        }
    }
    
    res.json(allData);
});

// API: Save all data at once (protected)
app.post('/api/save-all', requireAuth, (req, res) => {
    const results = {};
    
    for (const [type, data] of Object.entries(req.body)) {
        const filePath = DATA_FILES[type];
        const varName = VAR_NAMES[type];
        
        if (filePath && varName && Array.isArray(data)) {
            try {
                const content = `const ${varName} = ${JSON.stringify(data, null, 2)};`;
                fs.writeFileSync(filePath, content, 'utf8');
                results[type] = { success: true, count: data.length };
                console.log(`✅ Saved ${type} (${data.length} items)`);
            } catch (err) {
                results[type] = { success: false, error: err.message };
            }
        }
    }
    
    res.json({ success: true, results });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   🔒 Tridel Content Manager (SECURED)                ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║   📍 Admin Panel: http://localhost:${PORT}/admin.html    ║`);
    console.log(`║   📍 Website:     http://localhost:${PORT}/index.html    ║`);
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║   🔑 Password required to make changes               ║');
    console.log('║   Press Ctrl+C to stop the server                    ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
});

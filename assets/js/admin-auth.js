/**
 * Admin Authentication Script
 * Provides a simple client-side lock for the admin panel.
 * note: This is not server-side secure but prevents casual access.
 */

const AdminAuth = {
    // Fallback hash for offline/GitHub Pages mode only (server-side auth is preferred)
    // SHA-256 Hash of 'tridel2026' — used ONLY when server is unreachable
    FALLBACK_HASH: 'd4de1e781e29cf9ea1e9fbe380017478bfb37554d53a9094a836e22e2b605c7c',
    SESSION_KEY: 'tridel_secure_session_v1',

    init() {
        // Simple session check
        const session = sessionStorage.getItem(this.SESSION_KEY);
        if (!session || !session.startsWith('auth_')) {
            this.renderLoginModal();
        } else {
            this.showContent();
        }
    },

    isAuthenticated() {
        const session = sessionStorage.getItem(this.SESSION_KEY);
        return session && session.startsWith('auth_');
    },

    async sha256(message) {
        // crypto.subtle requires a secure context (HTTPS or localhost)
        if (window.crypto && window.crypto.subtle) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Fallback: basic hash for non-secure contexts (e.g. HTTP deployment)
        // WARNING: This is NOT cryptographically secure — only a deterrent
        console.warn('crypto.subtle unavailable (non-HTTPS context). Using fallback hash — deploy over HTTPS for proper security.');
        let hash = 0;
        for (let i = 0; i < message.length; i++) {
            const char = message.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return 'fallback_' + Math.abs(hash).toString(16);
    },

    async login(password) {
        try {
            // Strategy 1: Try server-side auth first (preferred — uses env var password)
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.token) {
                        sessionStorage.setItem('adminToken', data.token);
                    }
                    sessionStorage.setItem(this.SESSION_KEY, 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
                    this.removeModal();
                    this.showContent();
                    return true;
                }
                if (res.status === 401 || res.status === 429) {
                    return false; // Server says wrong password or rate limited
                }
            } catch (networkErr) {
                // Server not available — fall through to client-side fallback
                console.warn('Server unreachable, falling back to client-side auth.');
            }

            // Strategy 2: Client-side fallback (for GitHub Pages / offline mode)
            const hash = await this.sha256(password);
            if (hash === this.FALLBACK_HASH) {
                sessionStorage.setItem(this.SESSION_KEY, 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
                this.removeModal();
                this.showContent();
                return true;
            }
        } catch (e) {
            // Auth error handled silently — returning false below
        }
        return false;
    },

    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        location.reload();
    },

    renderLoginModal() {
        // Hide main content initially
        document.body.style.overflow = 'hidden';
        const mainContainer = document.querySelector('.admin-container');
        if(mainContainer) mainContainer.style.filter = 'blur(10px)';

        const modal = document.createElement('div');
        modal.className = 'auth-overlay';
        modal.innerHTML = `
            <div class="auth-card">
                <img src="assets/images/logo/tridel.png" alt="Tridel Logo" class="auth-logo">
                <h2 class="auth-title">Admin Access</h2>
                <p class="auth-subtitle">Please enter your credentials to continue</p>
                
                <form class="auth-form" onsubmit="AdminAuth.handleSubmit(event)">
                    <div class="auth-input-group">
                        <input type="password" id="admin-pass" class="auth-input" placeholder="Password" required autofocus>
                        <i class="fas fa-eye auth-toggle-password" onclick="AdminAuth.togglePassword()"></i>
                    </div>
                    <button type="submit" class="auth-btn">
                        <i class="fas fa-lock"></i> Login
                    </button>
                    <div id="auth-error" class="auth-error">Invalid password</div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    },

    async handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('admin-pass');
        const error = document.getElementById('auth-error');
        const btn = e.target.querySelector('button');
        
        // Show loading state
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verifying...';
        btn.disabled = true;

        const success = await this.login(input.value);
        
        if (success) {
            // Success handled in login()
        } else {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
            
            error.classList.add('visible');
            input.value = '';
            input.focus();
            
            // Shake animation
            const card = document.querySelector('.auth-card');
            card.style.animation = 'none';
            card.offsetHeight; /* trigger reflow */
            card.style.animation = 'shake 0.4s ease';
        }
    },

    removeModal() {
        const modal = document.querySelector('.auth-overlay');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    },

    showContent() {
        document.body.style.overflow = '';
        const mainContainer = document.querySelector('.admin-container');
        if(mainContainer) {
            mainContainer.style.filter = 'none';
            mainContainer.style.display = 'flex'; // Restore layout
        }
        
        // Add Logout Button to Header if not exists
        this.addLogoutButton();
    },

    addLogoutButton() {
        const actions = document.querySelector('.header-actions');
        if (actions && !document.getElementById('logout-btn')) {
            const btn = document.createElement('button');
            btn.id = 'logout-btn';
            btn.className = 'btn btn-secondary btn-icon';
            btn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
            btn.title = 'Logout';
            btn.onclick = () => this.logout();
            actions.appendChild(btn);
        }
    },

    togglePassword() {
        const input = document.getElementById('admin-pass');
        const icon = document.querySelector('.auth-toggle-password');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS first
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/admin-auth.css';
    document.head.appendChild(link);
    
    // Init Auth
    AdminAuth.init();
    
    // Bind global logout for existing HTML button
    window.doLogout = () => AdminAuth.logout();
});

// Add shake animation style dynamically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

/**
 * Admin Authentication Script
 * Keeps the admin UI locked until the Express auth API accepts a login.
 */

document.documentElement.classList.add('admin-auth-pending');

const AdminAuth = {
    SESSION_KEY: 'tridel_secure_session_v1',
    // Public fallback for static hosting only. This is intentionally weaker than server-side auth.
    FALLBACK_HASH: 'b7e109ffa35bfdf3ec2b32ce41b266d6cb39d80d76ac43f7b8d4fc7d95447a7b',

    createSessionMarker() {
        return 'auth_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    },

    async sha256(message) {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('Web Crypto is unavailable in this browser.');
        }

        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    },

    completeLogin(token) {
        if (token) {
            sessionStorage.setItem('adminToken', token);
        }
        sessionStorage.setItem(this.SESSION_KEY, this.createSessionMarker());
        this.removeModal();
        this.showContent();
        return { ok: true };
    },

    async tryFallbackLogin(password) {
        try {
            const hash = await this.sha256(password);
            if (hash === this.FALLBACK_HASH) {
                return this.completeLogin();
            }
            return { ok: false, message: 'Invalid password.' };
        } catch (e) {
            return {
                ok: false,
                message: 'Login fallback is unavailable in this browser.'
            };
        }
    },

    setAuthState(state) {
        const root = document.documentElement;
        root.classList.remove('admin-auth-pending', 'admin-auth-locked', 'admin-auth-ready');
        root.classList.add(state);
    },

    init() {
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

    async login(password) {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password })
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                return this.completeLogin(data.token);
            }

            if (res.status === 401 || res.status === 429) {
                return {
                    ok: false,
                    message: data.error || 'Login failed.'
                };
            }

            return this.tryFallbackLogin(password);
        } catch (e) {
            console.warn('Admin login server is unavailable. Falling back to public hash check.');
            return this.tryFallbackLogin(password);
        }
    },

    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        location.reload();
    },

    renderLoginModal() {
        this.setAuthState('admin-auth-locked');

        if (document.querySelector('.auth-overlay')) {
            return;
        }

        document.body.style.overflow = 'hidden';
        const mainContainer = document.querySelector('.admin-container');
        if (mainContainer) {
            mainContainer.style.filter = 'blur(10px)';
        }

        const modal = document.createElement('div');
        modal.className = 'auth-overlay';
        modal.innerHTML = `
            <div class="auth-card">
                <img src="assets/images/logo/tridel.png" alt="Tridel Logo" class="auth-logo">
                <h2 class="auth-title">Admin Access</h2>
                <p class="auth-subtitle">Enter the admin password to continue</p>

                <form class="auth-form" onsubmit="AdminAuth.handleSubmit(event)">
                    <div class="auth-input-group">
                        <input type="password" id="admin-pass" class="auth-input" placeholder="Password" required autofocus>
                        <i class="fas fa-eye auth-toggle-password" onclick="AdminAuth.togglePassword()"></i>
                    </div>
                    <button type="submit" class="auth-btn">
                        <i class="fas fa-lock"></i> Login
                    </button>
                    <div id="auth-error" class="auth-error">Login failed</div>
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

        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verifying...';
        btn.disabled = true;
        error.classList.remove('visible');

        const result = await this.login(input.value);

        if (result.ok) {
            return;
        }

        btn.innerHTML = originalBtnText;
        btn.disabled = false;
        error.textContent = result.message || 'Login failed';
        error.classList.add('visible');
        input.value = '';
        input.focus();

        const card = document.querySelector('.auth-card');
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'shake 0.4s ease';
    },

    removeModal() {
        const modal = document.querySelector('.auth-overlay');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    },

    showContent() {
        this.setAuthState('admin-auth-ready');
        document.body.style.overflow = '';
        const mainContainer = document.querySelector('.admin-container');
        if (mainContainer) {
            mainContainer.style.filter = 'none';
            mainContainer.style.display = 'flex';
        }

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

document.addEventListener('DOMContentLoaded', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/admin-auth.css';
    document.head.appendChild(link);

    AdminAuth.init();
    window.doLogout = () => AdminAuth.logout();
});

const style = document.createElement('style');
style.innerHTML = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

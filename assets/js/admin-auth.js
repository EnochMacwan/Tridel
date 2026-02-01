/**
 * Admin Authentication Script
 * Provides a simple client-side lock for the admin panel.
 * note: This is not server-side secure but prevents casual access.
 */

const AdminAuth = {
    // Default password (change this!)
    HASH: 'tridel2024', // In a real app, use a hash, not plain text
    SESSION_KEY: 'tridel_admin_session',

    init() {
        if (this.isAuthenticated()) {
            this.showContent();
        } else {
            this.renderLoginModal();
        }
    },

    isAuthenticated() {
        return sessionStorage.getItem(this.SESSION_KEY) === 'true';
    },

    login(password) {
        if (password === this.HASH) {
            sessionStorage.setItem(this.SESSION_KEY, 'true');
            this.removeModal();
            this.showContent();
            return true;
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

    handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('admin-pass');
        const error = document.getElementById('auth-error');
        
        if (this.login(input.value)) {
            // Success handled in login()
        } else {
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
        if(mainContainer) mainContainer.style.filter = 'none';
        
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

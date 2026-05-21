/**
 * Admin Panel UI Interactions
 * Exports: toggleSidebar(), showToast(message, type)
 */

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    
    // Optional: Toggle overlay if we decide to use one
    // const overlay = document.querySelector('.sidebar-overlay');
    // if(overlay) overlay.classList.toggle('active');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var safeMessage = escapeHTML(message);
    toast.innerHTML =
        '<i class="fas ' +
        (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle') +
        '"></i>' +
        '<span>' + safeMessage + '</span>';
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
}

// ==========================================
// SIDEBAR
// ==========================================

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    
    // Only apply on mobile where sidebar is initially hidden/toggled
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});

/**
 * Team Loader
 * Dynamically generates the team member grid.
 *
 * Exports:
 *   window.renderTeamGrid(container)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/**
 * Renders the Team Grid
 * Exported as window.renderTeamGrid for SPA router usage.
 */
window.renderTeamGrid = function(container) {
    if (!container) container = document.querySelector('.team-grid');
    if (!container) return;

    if (typeof TEAM_DATA === 'undefined' || !Array.isArray(TEAM_DATA)) {
        console.error('TEAM_DATA is not loaded or not an array.');
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }

    // Clear existing static content if we have dynamic data
    if (TEAM_DATA.length > 0) {
        container.innerHTML = TEAM_DATA.map(member => `
            <div class="grid-card-wrapper">
                <div class="grid-card-visual">
                    <img loading="lazy" alt="${escapeHtml(member.name)}" class="team-member__photo-full"
                        src="${member.image ? member.image : 'assets/images/logo/tridel.png'}"
                        style="object-position: center;"
                        onerror="this.src='assets/images/logo/tridel.png'">
                </div>
                <div class="grid-content-outside">
                    <h3 class="team-member__name">${escapeHtml(member.name)}</h3>
                    <p class="team-member__title">${escapeHtml(member.role || member.title || '')}</p>
                    <p class="team-member__bio">${escapeHtml(member.bio || '')}</p>
                </div>
            </div>
        `).join('');
    }
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', function () {
    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
        window.renderTeamGrid(teamGrid);
    }
});

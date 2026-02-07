document.addEventListener('DOMContentLoaded', function () {
    const teamGrid = document.querySelector('.team-grid');
    if (!teamGrid) return;

    if (typeof TEAM_DATA === 'undefined' || !Array.isArray(TEAM_DATA)) {
        console.error('TEAM_DATA is not loaded or not an array.');
        if (teamGrid) teamGrid.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:40px;">Content is currently unavailable. Please try again later.</p>';
        return;
    }

    // Clear existing static content if we have dynamic data
    if (TEAM_DATA.length > 0) {
        teamGrid.innerHTML = TEAM_DATA.map(member => `
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
});

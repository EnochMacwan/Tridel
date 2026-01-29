document.addEventListener('DOMContentLoaded', function () {
    const teamGrid = document.querySelector('.team-grid');
    if (!teamGrid) return;

    if (typeof TEAM_DATA === 'undefined' || !Array.isArray(TEAM_DATA)) {
        console.error('TEAM_DATA is not loaded or not an array.');
        return;
    }

    // Clear existing static content if we have dynamic data
    if (TEAM_DATA.length > 0) {
        teamGrid.innerHTML = TEAM_DATA.map(member => `
            <div class="grid-card-wrapper">
                <div class="grid-card-visual">
                    <img loading="lazy" alt="${member.name}" class="team-member__photo-full" 
                        src="${member.photo ? (member.photo.startsWith('http') ? member.photo : 'assets/images/team/' + member.photo) : 'assets/images/team/team.jpg'}">
                </div>
                <div class="grid-content-outside">
                    <h3 class="team-member__name">${member.name}</h3>
                    <p class="team-member__title">${member.role || member.title || ''}</p>
                    <p class="team-member__bio">${member.bio || ''}</p>
                </div>
            </div>
        `).join('');
    }
});

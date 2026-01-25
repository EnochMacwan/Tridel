document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.client-logo-track');
    if (!track || typeof clientsData === 'undefined') return;

    // Clear existing static content
    track.innerHTML = '';

    // Function to create logo element
    const createLogo = (client) => {
        const div = document.createElement('div');
        div.className = 'client-logo';
        div.innerHTML = `<img loading="lazy" alt="${client.name}" src="${client.logo}">`;
        return div;
    };

    // 1. Render Original Set
    clientsData.forEach(client => {
        track.appendChild(createLogo(client));
    });

    // 2. Render Duplicate Set (for seamless scroll)
    // We typically duplicate the list enough times to fill the specific width.
    // For CSS infinite scroll, we usually need at least 2 sets.
    clientsData.forEach(client => {
        track.appendChild(createLogo(client));
    });
    
    // 3. Triplicate (as in original HTML for wide screens)
    clientsData.forEach(client => {
        track.appendChild(createLogo(client));
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.client-logo-track');
    
    // Support both variable names
    const data = typeof CLIENTS_DATA !== 'undefined' ? CLIENTS_DATA : (typeof clientsData !== 'undefined' ? clientsData : null);
    if (!track || !data) return;

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
    data.forEach(client => {
        track.appendChild(createLogo(client));
    });

    // 2. Render Duplicate Set (for seamless scroll)
    // We typically duplicate the list enough times to fill the specific width.
    // For CSS infinite scroll, we usually need at least 2 sets.
    data.forEach(client => {
        track.appendChild(createLogo(client));
    });
    
    // 3. Triplicate (as in original HTML for wide screens)
    data.forEach(client => {
        track.appendChild(createLogo(client));
    });
});

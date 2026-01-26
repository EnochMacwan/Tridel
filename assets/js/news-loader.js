document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('news-feed-container');

    // Support both variable names
    const data = typeof LINKEDIN_POSTS !== 'undefined' ? LINKEDIN_POSTS : (typeof linkedInPosts !== 'undefined' ? linkedInPosts : null);
    
    if (!container || !data) {
        console.error('News Feed Error: Container not found or data missing.');
        return;
    }

    // Clear existing content (fallback content)
    container.innerHTML = '';

    data.forEach((urn, index) => {
        // Create Card
        const card = document.createElement('div');
        card.className = 'news-card';

        // 1. Iframe
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.linkedin.com/embed/feed/update/${urn}`;
        iframe.setAttribute('allowfullscreen', '');
        iframe.title = `Tridel LinkedIn Post ${index + 1}`;
        // Basic styling handled by CSS class .news-card iframe

        // 2. Footer
        const footer = document.createElement('div');
        footer.className = 'news-card__footer';

        // 3. View Post Button
        const link = document.createElement('a');
        link.href = `https://www.linkedin.com/feed/update/${urn}`;
        link.target = '_blank';
        link.className = 'news-card__button';
        
        // Button Text & Icon
        link.innerHTML = `
            View Post
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        `;

        // Assemble
        footer.appendChild(link);
        card.appendChild(iframe);
        card.appendChild(footer);
        container.appendChild(card);
    });
});

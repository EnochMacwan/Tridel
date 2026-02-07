document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('news-feed-container');

    // Support all variable names, prioritize NEWS_DATA
    const data = typeof NEWS_DATA !== 'undefined' ? NEWS_DATA
               : typeof LINKEDIN_POSTS !== 'undefined' ? LINKEDIN_POSTS
               : typeof linkedInPosts !== 'undefined' ? linkedInPosts
               : null;

    if (!container || !data || !data.length) {
        if (container) {
            container.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:40px;">No news updates available.</p>';
        }
        return;
    }

    // Format ISO date to friendly string (e.g. "May 15, 2025")
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr; // Return as-is if not parseable
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    // Clear loading placeholder
    container.innerHTML = '';

    data.forEach((item) => {
        // Backward compatibility: if item is a string (old URN-only format), wrap it
        const post = typeof item === 'string'
            ? { urn: item, text: 'Tridel Technologies Update', date: '', image: '', url: '' }
            : item;

        const linkedInUrl = post.url || `https://www.linkedin.com/feed/update/${post.urn}`;
        const friendlyDate = formatDate(post.date);

        const card = document.createElement('div');
        card.className = 'news-card';

        // Build image section (only if image URL provided)
        let imageHTML = '';
        if (post.image) {
            imageHTML = `<div class="news-card__image">
                <img src="${post.image}" alt="Post image" loading="lazy">
            </div>`;
        }

        // Text (truncated to ~180 chars for card display)
        const displayText = post.text
            ? (post.text.length > 180 ? post.text.substring(0, 177) + '...' : post.text)
            : 'Tridel Technologies Update';

        card.innerHTML = `
            <div class="news-card__header">
                <div class="news-card__avatar">
                    <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </div>
                <div class="news-card__meta">
                    <span class="news-card__author">Tridel Technologies</span>
                    ${friendlyDate ? `<span class="news-card__date">${friendlyDate}</span>` : ''}
                </div>
            </div>
            <div class="news-card__body">
                <p class="news-card__text">${displayText}</p>
            </div>
            ${imageHTML}
            <div class="news-card__footer">
                <a href="${linkedInUrl}" target="_blank" rel="noopener noreferrer" class="news-card__button">
                    <svg class="news-card__li-icon" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                    View on LinkedIn
                    <svg class="news-card__ext-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        `;

        container.appendChild(card);
    });
});

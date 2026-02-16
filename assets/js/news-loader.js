/**
 * News Feed Loader
 * Dynamically generates the LinkedIn news feed cards.
 *
 * Exports:
 *   window.renderNewsFeed(container)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// Format ISO date to friendly string (e.g. "May 15, 2025")
function _newsFormatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // Return as-is if not parseable
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}

// Helper: Process hashtags in text
function _processHashtags(text) {
    if (!text) return '';
    // Replace #word with span
    return text.replace(/#(\w+)/g, '<a href="#" class="hashtag" onclick="event.preventDefault()">#$1</a>');
}

// Helper: Generate deterministic random stats based on index/text length
function _getRandomStats(seed) {
    const base = seed % 50; 
    const likes = 40 + base * 3;
    const comments = Math.floor(base / 2);
    const reposts = Math.floor(base / 5);
    return { likes, comments, reposts };
}

/**
 * Renders the News Feed
 * Exported as window.renderNewsFeed for SPA router usage.
 */
window.renderNewsFeed = function(container) {
    if (!container) container = document.getElementById('news-feed-container');
    // Support all variable names, prioritize NEWS_DATA
    const data = typeof NEWS_DATA !== 'undefined' ? NEWS_DATA
               : typeof LINKEDIN_POSTS !== 'undefined' ? LINKEDIN_POSTS
               : typeof linkedInPosts !== 'undefined' ? linkedInPosts
               : null;

    if (!container || !data || !data.length) {
        if (container) {
            container.innerHTML = '<p class="empty-state">No news updates available.</p>';
        }
        return;
    }

    // Clear loading placeholder
    container.innerHTML = '';
    // Remove feed-layout class if present
    container.classList.remove('feed-layout');

    data.forEach((item, index) => {
        // Backward compatibility: if item is a string (old URN-only format), wrap it
        const post = typeof item === 'string'
            ? { urn: item, text: 'Tridel Technologies Update', date: '', image: '', url: '' }
            : item;

        // Use new embedUrl if available, otherwise construct one (less reliable for activity URNs)
        const embedSrc = post.embedUrl || `https://www.linkedin.com/embed/feed/update/${post.urn}`;

        const card = document.createElement('div');
        // Add 'news-card' class for grid sizing, and 'news-card--iframe' for specific overrides
        card.className = 'news-card news-card--iframe';
        
        // Remove padding if needed via inline style or CSS class, and ensure transparent background
        // LinkedIn iframes have their own styling/border/shadow
        card.style.padding = '0';
        card.style.background = 'transparent';
        card.style.boxShadow = 'none';
        card.style.border = 'none';

        card.innerHTML = `
            <iframe 
                src="${embedSrc}" 
                height="500" 
                width="100%" 
                frameborder="0" 
                allowfullscreen="" 
                title="LinkedIn Update"
                loading="lazy"
                style="border-radius: 8px; border: 1px solid #e0e0e0;"
            ></iframe>
        `;

        container.appendChild(card);
    });
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('news-feed-container');
    if (container) {
        window.renderNewsFeed(container);
    }
});

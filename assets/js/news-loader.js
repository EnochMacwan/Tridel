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

/**
 * Renders the News Feed
 * Exported as window.renderNewsFeed for SPA router usage.
 */
window.renderNewsFeed = function(container) {
    if (!container) container = document.getElementById('news-feed-container');

    if (!container) return;

    if (!container) return;

    // Use NEWS_DATA if available
    const data = typeof NEWS_DATA !== 'undefined' ? NEWS_DATA : [];

    if (!data.length) {
        container.innerHTML = '<p class="empty-state">No news updates available.</p>';
        return;
    }

    container.innerHTML = '';
    
    // Create a wrapper for grid layout if needed, or just stack them
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '20px'; 
    wrapper.style.width = '100%';
    
    // Force 4 columns, but ensure they don't collapse below 300px
    wrapper.style.gridTemplateColumns = 'repeat(4, minmax(300px, 1fr))';
    
    data.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'linkedin-embed-wrapper';
        // Remove flex centering which might allow collapsing
        itemContainer.style.width = '100%';
        itemContainer.style.overflow = 'hidden'; 
        
        // item.url contains the full <iframe> string
        itemContainer.innerHTML = item.url;
        
        // Add responsiveness and force width
        const iframe = itemContainer.querySelector('iframe');
        if (iframe) {
            iframe.style.width = '100%';
            iframe.style.minWidth = '100%'; // Force full width
            iframe.style.height = '500px'; 
            iframe.style.border = 'none';
        }
        
        wrapper.appendChild(itemContainer);
    });

    container.appendChild(wrapper);
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('news-feed-container');
    if (container) {
        window.renderNewsFeed(container);
    }
});

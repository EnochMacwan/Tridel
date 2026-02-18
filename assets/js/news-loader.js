/**
 * News Feed Loader — Premium LinkedIn Embed Cards
 * Renders LinkedIn embed iframes from NEWS_DATA (embedUrl only).
 *
 * Exports:
 *   window.renderNewsFeed(container)
 */

window.renderNewsFeed = function (container) {
    if (!container) container = document.getElementById('news-feed-container');
    var data = typeof NEWS_DATA !== 'undefined' ? NEWS_DATA : null;

    if (!container || !data || !data.length) {
        if (container) {
            container.innerHTML =
                '<div class="linkedin-empty">' +
                '<i class="fab fa-linkedin linkedin-empty__icon"></i>' +
                '<p class="linkedin-empty__text">No updates available right now.</p>' +
                '</div>';
        }
        return;
    }

    // Clear loading placeholder
    container.innerHTML = '';

    // Build cards
    data.forEach(function (item, index) {
        var embedSrc = item.embedUrl || item;
        if (!embedSrc || typeof embedSrc !== 'string') return;

        var card = document.createElement('div');
        card.className = 'linkedin-embed-card reveal';
        card.style.animationDelay = (index * 0.1) + 's';

        // Loading shimmer
        var shimmer =
            '<div class="linkedin-embed-card__shimmer">' +
            '<div class="shimmer-bar shimmer-bar--header"></div>' +
            '<div class="shimmer-bar shimmer-bar--text"></div>' +
            '<div class="shimmer-bar shimmer-bar--text shimmer-bar--short"></div>' +
            '<div class="shimmer-bar shimmer-bar--image"></div>' +
            '</div>';

        card.innerHTML =
            shimmer +
            '<iframe ' +
            'src="' + embedSrc + '" ' +
            'height="570" ' +
            'width="100%" ' +
            'frameborder="0" ' +
            'allowfullscreen ' +
            'title="LinkedIn Update" ' +
            'loading="lazy" ' +
            'class="linkedin-embed-card__iframe"' +
            '></iframe>';

        // When iframe loads, hide shimmer
        var iframe = card.querySelector('iframe');
        iframe.addEventListener('load', function () {
            var shimmerEl = card.querySelector('.linkedin-embed-card__shimmer');
            if (shimmerEl) shimmerEl.style.display = 'none';
            iframe.classList.add('linkedin-embed-card__iframe--loaded');
        });

        container.appendChild(card);
    });

    // Add "Follow on LinkedIn" CTA below the feed
    var ctaExists = container.parentElement && container.parentElement.querySelector('.linkedin-follow-cta');
    if (!ctaExists && container.parentElement) {
        var cta = document.createElement('div');
        cta.className = 'linkedin-follow-cta reveal';
        cta.innerHTML =
            '<a href="https://www.linkedin.com/company/tridel-technologies-company/" ' +
            'target="_blank" rel="noopener noreferrer" ' +
            'class="linkedin-follow-cta__link">' +
            '<i class="fab fa-linkedin"></i>' +
            '<span>Follow us on LinkedIn</span>' +
            '<i class="fas fa-arrow-right linkedin-follow-cta__arrow"></i>' +
            '</a>';
        container.parentElement.appendChild(cta);
    }
};

// --- DOMContentLoaded Fallback ---
document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('news-feed-container');
    if (container) {
        window.renderNewsFeed(container);
    }
});

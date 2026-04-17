/**
 * News Feed Loader — Premium LinkedIn Embed Cards
 * Renders LinkedIn embed iframes from NEWS_DATA (embedUrl only).
 *
 * Exports:
 *   window.renderNewsFeed(container)
 */
var _newsEsc = escapeHtml;
var _linkedInInteractionBound = false;

function normalizeLinkedInNewsEmbedUrl(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';

    var srcMatch = raw.match(/src\s*=\s*["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
        raw = srcMatch[1].trim();
    }

    var embedMatch = raw.match(/https:\/\/www\.linkedin\.com\/embed\/feed\/update\/urn:li:(?:share|ugcPost):\d+(?:\?[^"'\s<>]*)?/i);
    if (embedMatch && embedMatch[0]) {
        raw = embedMatch[0];
    } else {
        var activityMatch = raw.match(/linkedin\.com\/posts\/[^?\s/]+(?:-[^?\s/]+)*-activity-(\d+)/i);
        if (activityMatch && activityMatch[1]) {
            raw = 'https://www.linkedin.com/embed/feed/update/urn:li:share:' + activityMatch[1];
        }
    }

    raw = raw.replace(/["'<>\s].*$/, '');

    if (raw.indexOf('linkedin.com/embed/feed/update/urn:li:') === -1) {
        return '';
    }

    if (raw.indexOf('?') === -1) {
        raw += '?collapsed=1';
    } else if (!/[?&]collapsed=/i.test(raw)) {
        raw += '&collapsed=1';
    }

    return raw;
}

function getLinkedInPostUrl(embedUrl) {
    var normalized = normalizeLinkedInNewsEmbedUrl(embedUrl);
    if (!normalized) return 'https://www.linkedin.com/company/tridel-technologies-company/';
    return normalized
        .replace('/embed/feed/update/', '/feed/update/')
        .replace(/[?&]collapsed=1/ig, '')
        .replace(/\?$/, '');
}

function deactivateLinkedInCards(exceptCard) {
    document.querySelectorAll('.linkedin-embed-card.linkedin-embed-card--interactive').forEach(function (card) {
        if (exceptCard && card === exceptCard) return;
        card.classList.remove('linkedin-embed-card--interactive');
    });
}

function bindLinkedInInteractionDismiss() {
    if (_linkedInInteractionBound) return;
    _linkedInInteractionBound = true;

    document.addEventListener('click', function (event) {
        if (event.target.closest('.linkedin-embed-card')) return;
        deactivateLinkedInCards();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            deactivateLinkedInCards();
        }
    });
}

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
        var embedSrc = normalizeLinkedInNewsEmbedUrl(item.embedUrl || item);
        if (!embedSrc || typeof embedSrc !== 'string') return;
        var postUrl = getLinkedInPostUrl(embedSrc);

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
            '<div class="linkedin-embed-card__chrome">' +
            '<div class="linkedin-embed-card__brand">' +
            '<i class="fab fa-linkedin"></i>' +
            '</div>' +
            '<div class="linkedin-embed-card__chrome-actions">' +
              '<a href="' + _newsEsc(postUrl) + '" target="_blank" rel="noopener noreferrer" class="linkedin-embed-card__readmore">' +
                '<span>Read full post</span>' +
                '<i class="fas fa-arrow-up-right-from-square"></i>' +
              '</a>' +
            '</div>' +
            '</div>' +
            '<div class="linkedin-embed-card__viewport">' +
              shimmer +
              '<iframe ' +
              'src="' + _newsEsc(embedSrc) + '" ' +
              'height="570" ' +
              'width="100%" ' +
              'frameborder="0" ' +
              'allowfullscreen ' +
              'title="LinkedIn Update" ' +
              'loading="lazy" ' +
              'sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" ' +
              'class="linkedin-embed-card__iframe"' +
              '></iframe>' +
              '<button type="button" class="linkedin-embed-card__activate" aria-label="Activate LinkedIn post interaction">' +
                '<i class="fas fa-hand-pointer"></i>' +
                '<span>Interact</span>' +
              '</button>' +
            '</div>';

        // When iframe loads, hide shimmer
        var iframe = card.querySelector('iframe');
        if (iframe) {
            iframe.addEventListener('load', function () {
                var shimmerEl = card.querySelector('.linkedin-embed-card__shimmer');
                if (shimmerEl) shimmerEl.style.display = 'none';
                iframe.classList.add('linkedin-embed-card__iframe--loaded');
            });
        }

        var activateButton = card.querySelector('.linkedin-embed-card__activate');
        if (activateButton) {
            activateButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                deactivateLinkedInCards(card);
                card.classList.add('linkedin-embed-card--interactive');
            });
        }

        container.appendChild(card);
    });

    bindLinkedInInteractionDismiss();

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

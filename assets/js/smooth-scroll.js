document.addEventListener("DOMContentLoaded", function() {
    // Check if Lenis is loaded
    if (typeof Lenis !== 'undefined') {

        // Patch querySelector to handle SPA route hashes (e.g. #/contact)
        // Lenis internally calls querySelector(hash) on hashchange,
        // which throws a SyntaxError on SPA-style selectors like '#/contact'
        const _origQS = document.querySelector.bind(document);
        document.querySelector = function(selector) {
            try { return _origQS(selector); }
            catch(e) {
                // Only suppress SyntaxError from SPA-style hash selectors
                if (e instanceof SyntaxError && typeof selector === 'string' && selector.includes('/')) {
                    return null;
                }
                throw e; // Re-throw all other errors to avoid masking real bugs
            }
        };

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });
        window.__lenis = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Handle Anchor Links for Smooth Scroll
        // Skip SPA route links (e.g. #/contact) — only handle page anchors (e.g. #section)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#' && !targetId.startsWith('#/')) {
                    e.preventDefault();
                    lenis.scrollTo(targetId);
                }
            });
        });

    } else {
        // Lenis not loaded — Smooth scroll unavailable
    }
});

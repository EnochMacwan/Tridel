document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation ---
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
            const isNavOpen = document.body.classList.contains('nav-open');
            menuToggle.setAttribute('aria-expanded', isNavOpen);
        });
    }

    // --- Interactive Testimonial Slider ---
    const sliderContainer = document.querySelector('.testimonial-slider-container');
    if (sliderContainer) {
        const slider = sliderContainer.querySelector('.testimonial-slider');
        const slides = slider.querySelectorAll('.testimonial-slide');
        const prevButton = sliderContainer.querySelector('.slider-btn--prev');
        const nextButton = sliderContainer.querySelector('.slider-btn--next');

        if (slides.length > 0) {
            let currentSlide = 0;
            let slideInterval;

            function showSlide(index) {
                slider.style.transform = `translateX(-${index * 100}%)`;
            }

            function nextSlide() {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }

            function prevSlide() {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            }

            function startSlider() {
                // Autoplay every 5 seconds
                slideInterval = setInterval(nextSlide, 5000);
            }

            function resetSlider() {
                clearInterval(slideInterval);
                startSlider();
            }

            if (nextButton && prevButton) {
                nextButton.addEventListener('click', () => {
                    nextSlide();
                    resetSlider();
                });

                prevButton.addEventListener('click', () => {
                    prevSlide();
                    resetSlider();
                });
            }

            // Show the first slide and start autoplay
            showSlide(currentSlide);
            startSlider();
        }
    }

    // --- Dynamic News Feed Logic Removed --- 
    // Allowing static iframe in HTML to load instead.

    // --- Map JS ---
    // This logic runs only if a div with id="map" is on the page
    if (document.getElementById('map') && typeof L !== 'undefined') {
        const LOCATIONS = [
            {
                id: 'uae',
                name: 'Tridel Technologies FZCO',
                address: 'QD01, DAFZA Industrial Park, Qusais, Dubai, UAE',
                coords: [25.2893458, 55.4034675]
            },
            {
                id: 'india',
                name: 'Tridel Technologies Pvt Ltd',
                address: 'No 10/1, 2nd Street, Thirumurugan Nagar, Arcot Road, Porur, Chennai, TN 600116',
                coords: [13.0371328, 80.1607926]
            },
            {
                id: 'australia',
                name: 'Tridel Technologies Pty Ltd',
                address: 'Eden Hills, Adelaide, SA',
                coords: [-35.0240257, 138.5861123]
            }
        ];

        const map = L.map('map', { scrollWheelZoom: false });
        // Using Esri World Imagery for premium Satellite/Marine look
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        }).addTo(map);

        // Optional: Add labels on top (Stamen Toner Lite or Hybrid) - keeping it simple satellite for now or adding a hybrid reference layer would be ideal but simple satellite is "richer".


        const group = L.featureGroup().addTo(map);

        LOCATIONS.forEach(loc => {
            // Create a custom icon that displays the name directly
            const textIcon = L.divIcon({
                className: 'custom-map-pin',
                html: `<div class="pin-wrapper"><div class="pin-text">${loc.name}</div><div class="pin-dot"></div></div>`,
                iconSize: null, // Let CSS handle sizing independent of content
                iconAnchor: [0, 0] // We will translate using CSS relative to this point
            });

            const marker = L.marker(loc.coords, { icon: textIcon }).addTo(map);

            // Keep full details in popup for click
            marker.bindPopup(`<strong>${loc.name}</strong><br>${loc.address}`);
            group.addLayer(marker);

            // Add click listener to text
            const detailEl = document.getElementById(`location-details-${loc.id}`);
            if (detailEl) {
                detailEl.addEventListener('click', () => {
                    map.flyTo(loc.coords, 13);
                    marker.openPopup();
                });
            }
        });

        map.fitBounds(group.getBounds().pad(0.5));
    }
});
/* ---------------------------------- */
/* 13. Accessible Modal Logic       */
/* ---------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('product-modal');
    if (!modal) return; // Do nothing if the modal isn't on the page

    const modalTitleEl = document.getElementById('product-modal-title');
    const modalContentEl = document.getElementById('product-modal-content');
    const openButtons = document.querySelectorAll('[data-modal-trigger]');
    const closeButtons = modal.querySelectorAll('[data-modal-close]');
    let lastFocusedElement;

    // --- Focus Tabbing ---
    // Get all focusable elements inside the modal
    const focusableEls = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    function openModal(triggerButton) {
        lastFocusedElement = triggerButton; // Save the element that opened the modal
        const contentId = triggerButton.getAttribute('data-modal-trigger');
        const contentSource = document.getElementById(`modal-content-${contentId}`);
        const titleSource = document.getElementById(`modal-title-${contentId}`);

        if (contentSource) {
            // Inject content
            modalContentEl.innerHTML = contentSource.innerHTML;

            // Inject title (if it exists, otherwise use default)
            if (titleSource) {
                modalTitleEl.textContent = titleSource.textContent;
            } else {
                modalTitleEl.textContent = 'Product Details';
            }

            // Show modal
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Set focus inside the modal
            firstFocusableEl.focus();

            // Add event listeners
            // Product Modal Functionality (Only on Products Page)
            const modal = document.getElementById('product-modal');
            if (modal) {
                const modalTitle = document.getElementById('modal-title');
                const modalDesc = document.getElementById('modal-description');
                const modalSpecs = document.getElementById('modal-specs');
                const closeModal = document.querySelector('.close-modal');

                document.querySelectorAll('.view-details-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const card = btn.closest('.product-card');
                        const title = card.querySelector('h3').textContent;
                        const desc = card.querySelector('p').textContent;
                        // In a real app, specs would come from a data attribute or API
                        const specs = "<strong>Specifications:</strong><br>High-grade sensors<br>Real-time telemetry<br>Solar powered option available.";

                        modalTitle.textContent = title;
                        modalDesc.textContent = desc;
                        modalSpecs.innerHTML = specs;

                        modal.style.display = 'block';
                        document.body.style.overflow = 'hidden';
                    });
                });

                closeModal.addEventListener('click', () => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });

                window.addEventListener('click', (e) => {
                    if (e.target == modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            } modal.addEventListener('keydown', trapFocus);
            modal.addEventListener('keydown', closeOnEscape);
            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
            modal.querySelector('.modal__backdrop').addEventListener('click', closeModal);

        } else {
            console.error('Modal content source not found:', `modal-content-${contentId}`);
        }
    }

    function closeModal() {
        // Hide modal
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore background scrolling

        // Clear content
        modalContentEl.innerHTML = '';
        modalTitleEl.textContent = 'Product Details';

        // Remove event listeners
        modal.removeEventListener('keydown', trapFocus);
        modal.removeEventListener('keydown', closeOnEscape);
        closeButtons.forEach(btn => btn.removeEventListener('click', closeModal));
        modal.querySelector('.modal__backdrop').removeEventListener('click', closeModal);

        // Restore focus to the element that opened the modal
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }

    function trapFocus(e) {
        if (e.key !== 'Tab') return;

        // If Shift + Tab are pressed
        if (e.shiftKey) {
            if (document.activeElement === firstFocusableEl) {
                lastFocusableEl.focus(); // Go to last
                e.preventDefault();
            }
        } else {
            // If Tab is pressed
            if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus(); // Go to first
                e.preventDefault();
            }
        }
    }

    // Add click listener to all "View Details" buttons
    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            openModal(e.currentTarget);
        });
    });
});
/* ---------------------------------- */
/* 14. Accessible Modal & Carousel (DEBUG VERSION) */
/* ---------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    console.log("1. Script started. Looking for modal...");

    const modal = document.getElementById('product-modal');

    if (!modal) {
        console.error("❌ FATAL ERROR: The element <div id='product-modal'> was not found in your HTML.");
        console.error("Please make sure you pasted the 'MODAL SHELL' HTML at the very bottom of products.html");
        return; // Stop here
    }

    console.log("2. Modal found! Looking for buttons...");

    const modalTitleEl = document.getElementById('product-modal-title');
    const modalContentEl = document.getElementById('product-modal-content');
    const openButtons = document.querySelectorAll('[data-modal-trigger]');
    const closeButtons = modal.querySelectorAll('[data-modal-close]');
    let lastFocusedElement;

    console.log(`3. Found ${openButtons.length} 'View Details' buttons.`);

    if (openButtons.length === 0) {
        console.warn("⚠️ No buttons found. Check that your buttons have 'data-modal-trigger' attributes.");
    }

    // --- Focus Tabbing ---
    const focusableEls = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    function openModal(triggerButton) {
        console.log("4. Button clicked! Opening modal...");
        lastFocusedElement = triggerButton;
        const contentId = triggerButton.getAttribute('data-modal-trigger');
        const contentSource = document.getElementById(`modal-content-${contentId}`);

        if (!contentSource) {
            console.error(`❌ ERROR: Could not find hidden details for id: modal-content-${contentId}`);
            console.error("Check that your hidden <div> has the correct ID.");
            return;
        }

        console.log("5. Content found. Building carousel...");

        // --- 1. Find and Build Image Carousel ---
        const imageSourceDiv = contentSource.querySelector('.product-item__modal-images');
        let carouselHTML = '';

        if (imageSourceDiv) {
            const images = imageSourceDiv.querySelectorAll('img');
            if (images.length > 0) {
                let slidesHTML = '';
                images.forEach(img => {
                    // Fix: Ensure we handle 404ing images gracefully in the carousel
                    slidesHTML += `<div class="modal-carousel__slide"><img src="${img.src}" alt="${img.alt}"></div>`;
                });

                carouselHTML = `
                    <div class="modal-carousel">
                        <div class="modal-carousel__track" style="transform: translateX(0%)">
                            ${slidesHTML}
                        </div>
                        ${images.length > 1 ? `
                            <button class="modal-carousel__btn modal-carousel__btn--prev" aria-label="Previous image">&lt;</button>
                            <button class="modal-carousel__btn modal-carousel__btn--next" aria-label="Next image">&gt;</button>
                            <div class="modal-carousel__counter">1 / ${images.length}</div>
                        ` : ''}
                    </div>
                `;
            }
        }

        // --- 2. Inject Content ---
        const titleSource = contentSource.querySelector('h2');
        modalTitleEl.textContent = titleSource ? titleSource.textContent : 'Product Details';

        // Inject content
        modalContentEl.innerHTML = carouselHTML + contentSource.innerHTML;

        // Clean up duplicate image div
        const dupImages = modalContentEl.querySelector('.product-item__modal-images');
        if (dupImages) dupImages.remove();

        // --- 3. Activate Carousel ---
        const carousel = modal.querySelector('.modal-carousel');
        if (carousel) initCarousel(carousel);

        // --- 4. Show Modal ---
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (firstFocusableEl) firstFocusableEl.focus();

        // Listeners
        modal.addEventListener('keydown', trapFocus);
        modal.addEventListener('keydown', closeOnEscape);
        closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
        const backdrop = modal.querySelector('.modal__backdrop');
        if (backdrop) backdrop.addEventListener('click', closeModal);
    }

    function closeModal() {
        console.log("Closing modal...");
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        modalContentEl.innerHTML = '';

        modal.removeEventListener('keydown', trapFocus);
        modal.removeEventListener('keydown', closeOnEscape);
        closeButtons.forEach(btn => btn.removeEventListener('click', closeModal));
        const backdrop = modal.querySelector('.modal__backdrop');
        if (backdrop) backdrop.removeEventListener('click', closeModal);

        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function closeOnEscape(e) { if (e.key === 'Escape') closeModal(); }

    function trapFocus(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === firstFocusableEl) {
                lastFocusableEl.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                e.preventDefault();
            }
        }
    }

    function initCarousel(carousel) {
        const track = carousel.querySelector('.modal-carousel__track');
        const slides = Array.from(track.children);
        const nextBtn = carousel.querySelector('.modal-carousel__btn--next');
        const prevBtn = carousel.querySelector('.modal-carousel__btn--prev');
        const counter = carousel.querySelector('.modal-carousel__counter');
        let currentIndex = 0;

        if (slides.length <= 1) return;

        function updateSlide(targetIndex) {
            track.style.transform = `translateX(-${targetIndex * 100}%)`;
            counter.textContent = `${targetIndex + 1} / ${slides.length}`;
            currentIndex = targetIndex;
        }

        nextBtn.addEventListener('click', () => {
            let nextIndex = currentIndex + 1;
            if (nextIndex > slides.length - 1) nextIndex = 0;
            updateSlide(nextIndex);
        });

        prevBtn.addEventListener('click', () => {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = slides.length - 1;
            updateSlide(prevIndex);
        });
    }

});



/* 17. Product Gallery Logic          */
/* ---------------------------------- */

// Global functions for inline HTML calls
window.changeImage = function (src) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        // Fade out
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = src;
            mainImage.style.opacity = '1';
        }, 200);
    }

    // Update active thumb
    const thumbs = document.querySelectorAll('.gallery-thumbs img');
    thumbs.forEach(img => {
        if (img.src === src) img.classList.add('active');
        else img.classList.remove('active');
    });
};

// --- 22. Back to Top Button (Auto-Inject) ---
document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.ariaLabel = 'Back to Top';
    backToTopBtn.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    `;
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

window.openLightbox = function (el) {
    const src = el.querySelector('img') ? el.querySelector('img').src : el.src;

    // Create Modal if not exists
    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lightbox-modal';
        modal.className = 'lightbox-modal';
        modal.innerHTML = `
            <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
            <img class="lightbox-content" id="lightbox-img" src="">
        `;
        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLightbox();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    document.getElementById('lightbox-img').src = src;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function () {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('is-open');
        document.body.style.overflow = 'auto';
    }
};
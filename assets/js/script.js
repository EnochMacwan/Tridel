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
                name: 'Tridel Technologies FZCO (Dubai, UAE)',
                address: 'QD01, DAFZA Industrial Park, Qusais, Dubai, UAE',
                coords: [25.2893458, 55.4034675]
            },
            {
                id: 'india',
                name: 'Tridel Technologies Pvt. Ltd. (Chennai, India)',
                address: 'No 10/1, 2nd Street, Thirumurugan Nagar, Arcot Road, Porur, Chennai, TN 600116',
                coords: [13.0371328, 80.1607926]
            },
            {
                id: 'australia',
                name: 'Tridel Technologies Pty. Ltd. (Eden Hills, Adelaide, AU)',
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
            const marker = L.marker(loc.coords).addTo(map);
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
            modal.addEventListener('keydown', trapFocus);
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

    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            openModal(e.currentTarget);
        });
    });
});
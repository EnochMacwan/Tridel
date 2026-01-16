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

    // --- Dynamic News Feed from JSON ---
    const newsFeedContainer = document.getElementById('news-feed-container');
    if (newsFeedContainer) {
        // This assumes you have a file at 'assets/data/updates.json'
        fetch('assets/data/updates.json') 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const ul = document.createElement('ul');
                data.slice(0, 3).forEach(item => { // Show first 3 items
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${item.date}:</strong> <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.text}</a>`;
                    ul.appendChild(li);
                });
                newsFeedContainer.innerHTML = ''; // Clear "Loading..." message
                newsFeedContainer.appendChild(ul);
            })
            .catch(error => {
                newsFeedContainer.innerHTML = '<p>Could not load latest news.</p>';
                console.error('Error fetching news:', error);
            });
    }

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
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

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
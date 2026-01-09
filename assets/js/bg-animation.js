/**
 * Tridel Technologies - Animated Backdrops
 * Theme: Multi-Page Generative Animations with Mouse Interactivity
 */

const canvas = document.getElementById('hero-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let width, height;
let animationId;
let globalTime = 0;

// Mouse State
let mouse = { x: 0, y: 0 };
let mouseHasMoved = false;

// Configuration
const config = {
    colors: {
        accent: '#00AAE7',
        accentGlow: 'rgba(0, 170, 231, 0.4)',
        bg: '#001220',
        text: '#ffffff'
    }
};

// State
let particles = [];
let waves = [];
let boat = { x: -100, y: 0, speed: 1.5 };

// Initialization
function init() {
    if (!canvas) return;
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouseHasMoved = true;
    });

    // Default center mouse if not moved
    mouse.x = width / 2;
    mouse.y = height / 2;

    // Determine which animation to run based on page URL or Body Class
    const path = window.location.pathname;

    if (path.includes('products')) {
        initProducts();
        animateProducts();
    } else if (path.includes('services')) {
        initServices();
        animateServices();
    } else if (path.includes('about')) {
        initAbout();
        animateAbout();
    } else if (path.includes('success-stories')) {
        initSuccess();
        animateSuccess();
    } else if (path.includes('careers')) {
        initCareers();
        animateCareers();
    } else if (path.includes('contact')) {
        initContact();
        animateContact();
    } else {
        // Default / Home
        initHome();
        animateHome();
    }
}

function resize() {
    if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    }
}

/* =========================================
   1. HOME: Magical Boat & Math
   ========================================= */
function initHome() {
    waves = [
        { y: height * 0.75, length: 0.01, amplitude: 15, speed: 0.02, color: 'rgba(0, 170, 231, 0.1)' },
        { y: height * 0.75, length: 0.006, amplitude: 20, speed: 0.015, color: 'rgba(0, 170, 231, 0.2)' },
        { y: height * 0.75, length: 0.003, amplitude: 25, speed: 0.01, color: 'rgba(0, 200, 255, 0.3)' }
    ];

    // Math Particles
    const symbols = ['∫', '∑', 'π', 'e', 'x²', 'sin', '∇'];
    particles = [];
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            velocity: 0.5 + Math.random(),
            opacity: Math.random(),
            size: 14 + Math.random() * 10
        });
    }
}

function animateHome() {
    ctx.clearRect(0, 0, width, height);
    globalTime++;

    // Interaction: Mouse Y affects wave height slightly
    const waveMouseMod = (mouse.y / height) * 10;

    // Math Background
    particles.forEach(p => {
        p.y -= p.velocity;

        // Interaction: X Parallax
        let dx = (mouse.x - width / 2) * 0.02 * p.velocity;

        if (p.y < -50) p.y = height + 50;
        ctx.font = `${p.size}px "Outfit", sans-serif`;
        ctx.fillStyle = `rgba(100, 200, 255, ${0.3})`;
        ctx.fillText(p.symbol, p.x + dx, p.y);
    });

    // Boat Logic
    boat.x += boat.speed;
    if (boat.x > width + 100) boat.x = -100;

    const primaryWave = waves[1];
    const waveY = Math.sin(primaryWave.length * boat.x + globalTime * primaryWave.speed) * (primaryWave.amplitude + waveMouseMod) + primaryWave.y;
    const waveSlope = Math.cos(primaryWave.length * boat.x + globalTime * primaryWave.speed) * (primaryWave.amplitude + waveMouseMod) * primaryWave.length;

    // Draw Waves
    waves.forEach((wave, i) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 10) {
            ctx.lineTo(x, Math.sin(x * wave.length + globalTime * wave.speed) * (wave.amplitude + waveMouseMod) + wave.y);
        }
        ctx.lineTo(width, height);
        ctx.shadowBlur = 15;
        ctx.shadowColor = wave.color;
        ctx.fillStyle = wave.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        if (i === 1) {
            // Draw Boat
            ctx.save();
            ctx.translate(boat.x, waveY - 5);
            ctx.rotate(Math.atan(waveSlope));
            ctx.shadowBlur = 20;
            ctx.shadowColor = "white";
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(30, -10); ctx.lineTo(20, 10); ctx.lineTo(-20, 10); ctx.fill();
            ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -50); ctx.stroke();
            ctx.shadowColor = "#00AAE7"; ctx.fillStyle = "#00AAE7"; ctx.beginPath(); ctx.moveTo(2, -48); ctx.lineTo(2, -15); ctx.lineTo(25, -15); ctx.fill();
            ctx.restore();
        }
    });

    animationId = requestAnimationFrame(animateHome);
}

/* =========================================
   2. PRODUCTS: Blueprints / Wireframes
   ========================================= */
let blueprintOffset = 0;

function initProducts() {
    // Setup generic grid or schematic lines
}

function animateProducts() {
    ctx.clearRect(0, 0, width, height);
    blueprintOffset += 0.5;

    // Draw Grid
    ctx.strokeStyle = 'rgba(0, 170, 231, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 50;

    // Interaction: Mouse moves grid slightly
    const gridX = (mouse.x - width / 2) * 0.05;
    const gridY = (mouse.y - height / 2) * 0.05;

    for (let x = (blueprintOffset % gridSize); x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x + gridX, 0); ctx.lineTo(x + gridX, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y + gridY); ctx.lineTo(width, y + gridY); ctx.stroke();
    }

    // Draw Rotating Wireframe Cube (Abstract Product)
    const size = 100;
    const cx = width * 0.8 + gridX;
    const cy = height * 0.5 + gridY;

    // Interaction: Rotation controlled by mouse X
    const t = Date.now() * 0.001 + (mouse.x / width) * 2;

    ctx.strokeStyle = 'rgba(0, 170, 231, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Simple 2D rotation simulation
    for (let i = 0; i < 4; i++) {
        let angle = t + (i * Math.PI / 2);
        let x = cx + Math.cos(angle) * size;
        let y = cy + Math.sin(angle) * size * 0.5; // flatten for 3D effect
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    animationId = requestAnimationFrame(animateProducts);
}

/* =========================================
   3. SERVICES: Sonar Scan
   ========================================= */
let sonarAngle = 0;

function initServices() { }

function animateServices() {
    // Fade out effect
    ctx.fillStyle = 'rgba(0, 18, 32, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Interaction: Sonar origin follows mouse slowly (or fixed with target interaction)
    // Let's make the scan line point towards mouse if active, else rotate

    const cx = width / 2;
    const cy = height * 1.2;
    const radius = Math.max(width, height);

    sonarAngle += 0.02;

    // Draw Radar Line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sonarAngle + Math.PI * 1.25) * radius, cy + Math.sin(sonarAngle + Math.PI * 1.25) * radius);
    ctx.strokeStyle = 'rgba(0, 170, 231, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Interaction: Draw target crosshair at mouse
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
    ctx.beginPath();
    ctx.moveTo(mouse.x - 10, mouse.y); ctx.lineTo(mouse.x + 10, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 10); ctx.lineTo(mouse.x, mouse.y + 10);
    ctx.stroke();

    // Random Blips
    if (Math.random() < 0.05) {
        ctx.fillStyle = '#00AAE7';
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    animationId = requestAnimationFrame(animateServices);
}

/* =========================================
   4. ABOUT: Global Network
   ========================================= */
function initAbout() {
    particles = [];
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }
}

function animateAbout() {
    ctx.clearRect(0, 0, width, height);

    // Update and Draw Particles
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interaction: Particles flee/attract to mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            ctx.strokeStyle = 'rgba(0, 170, 231, 0.4)';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }

        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
    });

    // Draw Connections
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            if (dx * dx + dy * dy < 10000) {
                ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    }

    animationId = requestAnimationFrame(animateAbout);
}

/* =========================================
   5. SUCCESS STORIES: Data Stream
   ========================================= */
function initSuccess() {
    particles = [];
    for (let i = 0; i < width / 20; i++) {
        particles.push({
            x: i * 20,
            y: Math.random() * height,
            speed: 2 + Math.random() * 5,
            len: 10 + Math.random() * 30,
            baseX: i * 20
        });
    }
}

function animateSuccess() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(0, 170, 231, 0.3)';
    particles.forEach(p => {
        p.y += p.speed;
        if (p.y > height) p.y = -p.len;

        // Interaction: X Distortion near mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
            const shift = (100 - dist) * (dx > 0 ? 1 : -1) * 0.5;
            p.x += shift;
        } else {
            // Return to base
            p.x += (p.baseX - p.x) * 0.05;
        }

        ctx.fillRect(p.x, p.y, 2, p.len);
    });

    animationId = requestAnimationFrame(animateSuccess);
}

/* =========================================
   6. CAREERS: Rising DNA
   ========================================= */
function initCareers() { }
let careerTime = 0;

function animateCareers() {
    ctx.clearRect(0, 0, width, height);

    // Interaction: Speed controlled by mouse Y, Twist by mouse X
    const speed = 0.02 + (mouse.y / height) * 0.05;
    careerTime += speed;

    const phaseShift = (mouse.x / width) * Math.PI;

    for (let i = 0; i < 20; i++) {
        let x = width / 2 + Math.sin(careerTime + i * 0.5 + phaseShift) * 100;
        let y = height - ((careerTime * 50 + i * 40) % height);

        ctx.fillStyle = 'rgba(0, 170, 231, 0.5)';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();

        // Second Helix
        let x2 = width / 2 + Math.sin(careerTime + i * 0.5 + Math.PI + phaseShift) * 100;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath(); ctx.arc(x2, y, 4, 0, Math.PI * 2); ctx.fill();

        // Connector
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y); ctx.stroke();
    }

    animationId = requestAnimationFrame(animateCareers);
}

/* =========================================
   7. CONTACT: Signal Waves
   ========================================= */
function initContact() { }
let signalRadius = 0;

function animateContact() {
    // Fade trail
    ctx.fillStyle = 'rgba(0, 18, 32, 0.2)';
    ctx.fillRect(0, 0, width, height);

    signalRadius += 2;
    if (signalRadius > width) signalRadius = 0;

    // Interaction: Center follows mouse (smoothed)
    // For now direct follow for responsiveness
    const cx = mouseHasMoved ? mouse.x : width / 2;
    const cy = mouseHasMoved ? mouse.y : height / 2;

    ctx.strokeStyle = 'rgba(0, 170, 231, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, signalRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Echo
    ctx.strokeStyle = 'rgba(0, 170, 231, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, (signalRadius + 50) % width, 0, Math.PI * 2);
    ctx.stroke();

    animationId = requestAnimationFrame(animateContact);
}


document.addEventListener('DOMContentLoaded', init);

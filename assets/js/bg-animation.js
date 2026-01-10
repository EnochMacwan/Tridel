/**
 * Tridel Technologies - Animated Backdrops
 * Theme: Multi-Page Generative Animations with Mouse Interactivity
 */

let canvas, ctx, width, height;
let animationId;
let globalTime = 0;

// Mouse State
let mouse = { x: 0, y: 0 };
let mouseHasMoved = false;

// Configuration
const config = {
    colors: {
        accent: '#4285F4',
        accentGlow: 'rgba(66, 133, 244, 0.4)',
        bg: '#050505',
        text: '#ffffff'
    }
};

// State
let particles = [];
let waves = [];
let boat = { x: -100, y: 0, speed: 1.5 };

// Initialization
function init() {
    canvas = document.getElementById('hero-canvas');
    if (!canvas) {
        console.warn("Canvas element 'hero-canvas' not found.");
        return;
    }
    ctx = canvas.getContext('2d');

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

    // Home Page gets the unique Boat Animation
    if (path.endsWith('index.html') || path.endsWith('/') || path.endsWith('tridel-main/')) {
        initHome();
        animateHome();
    } else {
        // All other pages get the Uniform "Plain" Network Animation
        // (Products, Services, About, Success, Careers, Contact)
        initUniform();
        animateUniform();
    }
}

function resize() {
    if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
}

/* =========================================
   1. HOME: Magical Boat & Math
   ========================================= */
function initHome() {
    waves = [
        { y: height * 0.75, length: 0.01, amplitude: 15, speed: 0.02, color: 'rgba(66, 133, 244, 0.1)' },
        { y: height * 0.75, length: 0.006, amplitude: 20, speed: 0.015, color: 'rgba(66, 133, 244, 0.2)' },
        { y: height * 0.75, length: 0.003, amplitude: 25, speed: 0.01, color: 'rgba(138, 180, 248, 0.3)' }
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

// Helper for color interpolation
function lerpColor(a, b, amount) {
    const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

// Marine Snow State
let marineSnow = [];

function initMarineSnow() {
    marineSnow = [];
    for (let i = 0; i < 50; i++) {
        marineSnow.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            speed: 0.5 + Math.random() * 1.5,
            opacity: Math.random() * 0.5
        });
    }
}

function animateHome() {
    ctx.clearRect(0, 0, width, height);
    globalTime++;

    // --- DEEP DIVE SCROLL LOGIC ---
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

    // Interpolate Colors
    // Top: #1A1C20 (Surface Dark) -> Bottom: #000000 (Deep Black)
    // Top: #050505 (Dark Void)   -> Bottom: #000000 (Abyssal)
    const colorA = lerpColor('#1A1C20', '#000000', scrollProgress);
    const colorB = lerpColor('#050505', '#000000', scrollProgress);

    // Apply Gradient to Background Div
    const bgDiv = document.querySelector('.hero__bg');
    if (bgDiv) {
        bgDiv.style.background = `radial-gradient(circle at 70% 30%, ${colorA} 0%, ${colorB} 100%)`;
    }

    // --- EXISTING ANIMATION ---

    // Interaction: Mouse Y affects wave height slightly
    const waveMouseMod = (mouse.y / height) * 10;

    // Math Particles (Fade out as we go deeper)
    const surfaceOpacity = 1 - scrollProgress;

    if (surfaceOpacity > 0.1) {
        particles.forEach(p => {
            p.y -= p.velocity;
            let dx = (mouse.x - width / 2) * 0.02 * p.velocity;
            if (p.y < -50) p.y = height + 50;
            ctx.font = `${p.size}px "Outfit", sans-serif`;
            ctx.fillStyle = `rgba(100, 200, 255, ${0.3 * surfaceOpacity})`; // Fade out
            ctx.fillText(p.symbol, p.x + dx, p.y);
        });
    }

    // --- MARINE SNOW (Appears as we go deeper) ---
    if (marineSnow.length === 0) initMarineSnow();

    const depthOpacity = scrollProgress; // More visible at bottom
    if (depthOpacity > 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * depthOpacity})`;
        marineSnow.forEach(s => {
            s.y += s.speed;
            if (s.y > height) s.y = -5;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Boat Logic (Only calculate if near top/surface)
    if (scrollProgress < 0.3) {
        boat.x += boat.speed;
        if (boat.x > width + 100) boat.x = -100;

        const primaryWave = waves[1];
        const waveY = Math.sin(primaryWave.length * boat.x + globalTime * primaryWave.speed) * (primaryWave.amplitude + waveMouseMod) + primaryWave.y;
        const waveSlope = Math.cos(primaryWave.length * boat.x + globalTime * primaryWave.speed) * (primaryWave.amplitude + waveMouseMod) * primaryWave.length;

        // Draw Waves (Fade out depth)
        const waveAlpha = 1 - (scrollProgress * 3); // Quickly fade waves
        if (waveAlpha > 0) {
            waves.forEach((wave, i) => {
                ctx.beginPath();
                ctx.moveTo(0, height);
                for (let x = 0; x <= width; x += 10) {
                    ctx.lineTo(x, Math.sin(x * wave.length + globalTime * wave.speed) * (wave.amplitude + waveMouseMod) + wave.y);
                }
                ctx.lineTo(width, height);
                ctx.shadowBlur = 15;
                ctx.shadowColor = wave.color;

                // Parse RGBA to modify alpha
                // Simple hack: assume wave.color is rgba(r,g,b, a)
                // Just use globalAlpha for simplicity
                ctx.save();
                ctx.globalAlpha = waveAlpha;
                ctx.fillStyle = wave.color;
                ctx.fill();
                ctx.shadowBlur = 0;

                if (i === 1) {
                    // Draw Boat
                    ctx.translate(boat.x, waveY - 5);
                    ctx.rotate(Math.atan(waveSlope));
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = "white";
                    ctx.fillStyle = "white";
                    ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(30, -10); ctx.lineTo(20, 10); ctx.lineTo(-20, 10); ctx.fill();
                    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -50); ctx.stroke();
                    ctx.shadowColor = "#4285F4"; ctx.fillStyle = "#4285F4"; ctx.beginPath(); ctx.moveTo(2, -48); ctx.lineTo(2, -15); ctx.lineTo(25, -15); ctx.fill();
                    // ctx.restore() is at end of loop scope in original, but we moved save up.
                    // Actually original logic had restore inside the if.
                }
                ctx.restore();
            });
        }
    } else {
        // Keep boat loop running logically or just hide
        boat.x += boat.speed;
        if (boat.x > width + 100) boat.x = -100;
    }

    animationId = requestAnimationFrame(animateHome);
}

/* =========================================
   2. UNIFORM: Google Blue Confetti (Reference Style)
   ========================================= */
function initUniform() {
    particles = [];
    const count = Math.floor(width / 15); // Higher density confetti
    const colors = ['#4285F4', '#8AB4F8', '#1967D2', '#D2E3FC']; // Google Blue Spectrum

    // FORCE Clear Background (Fix for "Still Not White" issue)
    const bgDiv = document.querySelector('.hero__bg');
    if (bgDiv) {
        bgDiv.style.background = 'transparent';
        bgDiv.style.backgroundImage = 'none';
        bgDiv.style.backgroundColor = 'transparent';
    }

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1, // Varied sizes (1px to 4px)
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: Math.random() > 0.5 ? 'circle' : 'rect', // Mix shapes
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
        });
    }
}

function animateUniform() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Wrap around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Interaction: Gentle drift away from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
            const force = (150 - dist) / 150;
            p.x += (dx / dist) * force * 2;
            p.y += (dy / dist) * force * 2;
        }

        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
    });

    animationId = requestAnimationFrame(animateUniform);
}

document.addEventListener('DOMContentLoaded', init);

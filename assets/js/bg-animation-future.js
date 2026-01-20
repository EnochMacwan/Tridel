
/**
 * Tridel Technologies - Animated Backdrops (Futuristic Edition V2.4)
 * Theme: Cyber-Seas // Stealth USV // Mothership Support
 */

let canvas, ctx, width, height;
let animationId;
let globalTime = 0;

// Mouse State
let mouse = { x: 0, y: 0 };

// Configuration
const config = {
    colors: {
        primary: '#00AAE7', // Tridel Blue
        accent: '#00FFCC',  // Cyan/Teal
        alert: '#FF3366',   // Red/Pink for active states
        dark: '#001220',
        text: '#ffffff'
    }
};

// State
let particles = [];
let waves = [];
let boat = {
    x: -150,
    y: 0,
    speed: 0.6,        // LOCKED SPEED (6 KN)
    targetSpeed: 0.6,
    tilt: 0
};
let engineTrail = [];

// New Assets
let buoys = [];

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
    });

    mouse.x = width / 2;
    mouse.y = height / 2;

    initCyberWorld();
    animateCyberWorld();
}

function resize() {
    if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        // Re-distribute buoys on resize if needed, or just let them be
    }
}

function initCyberWorld() {
    // Cyber Waves: Multiple layers for depth
    waves = [];
    // Background interference waves
    waves.push({ y: height * 0.75, length: 0.005, amplitude: 50, speed: 0.01, color: 'rgba(0, 170, 231, 0.03)' });
    // Mid layer
    waves.push({ y: height * 0.75, length: 0.01, amplitude: 30, speed: 0.02, color: 'rgba(0, 170, 231, 0.08)' });
    // Foreground interaction layer (Boat rides this)
    waves.push({ y: height * 0.75, length: 0.003, amplitude: 25, speed: 0.025, color: 'rgba(0, 170, 231, 0.15)' });

    // Data Particles
    particles = [];
    for (let i = 0; i < 40; i++) {
        particles.push(createParticle());
    }

    // Initialize Random Buoys (4 random locations)
    buoys = [];
    for (let i = 0; i < 4; i++) {
        buoys.push({
            x: Math.random() * width, // Random X position
            offset: Math.random() * Math.PI * 2, // Random wave offset
            scale: 0.6 + Math.random() * 0.4
        });
    }
}

function createParticle() {
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        speedY: 0.5 + Math.random() * 1.5,
        opacity: Math.random() * 0.5,
        type: Math.random() > 0.8 ? 'data' : 'dust' // 'data' = vertical lines, 'dust' = dots
    };
}

// --- DRAWING FUNCTIONS ---


function drawCyberBuoy(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Float Base
    ctx.fillStyle = "rgba(255, 200, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI, false);
    ctx.fill();

    // Tower
    ctx.strokeStyle = "rgba(255, 200, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -30);
    ctx.stroke();

    // Light (Blinking)
    if (globalTime % 60 < 20) {
        ctx.fillStyle = config.colors.alert;
        ctx.shadowBlur = 10;
        ctx.shadowColor = config.colors.alert;
        ctx.beginPath();
        ctx.arc(0, -30, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

function drawStealthUSV(ctx, x, y, angle, speed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const scale = 0.8;
    ctx.scale(scale, scale);

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = config.colors.primary;

    // --- HULL DESIGN (Sleek Trimaran / Stealth Style) ---
    // 1. Main Hull Body (Dark Metallic)
    ctx.fillStyle = "rgba(10, 25, 40, 0.95)";
    ctx.strokeStyle = config.colors.primary;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(120, -10); ctx.lineTo(20, -15);
    ctx.lineTo(-60, -10); ctx.lineTo(-70, 5);
    ctx.lineTo(0, 15); ctx.lineTo(100, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Cockpit / Sensor Array
    ctx.fillStyle = "rgba(0, 170, 231, 0.2)";
    ctx.strokeStyle = config.colors.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, -15); ctx.lineTo(30, -35);
    ctx.lineTo(-20, -35); ctx.lineTo(-40, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- 3. PAYLOAD (LiDAR / Survey Equipment) ---
    ctx.save();
    ctx.translate(0, -35);
    ctx.fillStyle = "#001220";
    ctx.strokeStyle = config.colors.accent;
    ctx.lineWidth = 1;
    ctx.fillRect(-10, -5, 20, 5);
    ctx.strokeRect(-10, -5, 20, 5);

    // Rotating LiDAR Head
    const time = Date.now() / 200;
    const headWidth = 15 + Math.sin(time) * 5;
    ctx.fillStyle = config.colors.accent;
    ctx.shadowBlur = 10; ctx.shadowColor = config.colors.accent;
    ctx.beginPath(); ctx.ellipse(0, -10, headWidth / 2, 4, 0, 0, Math.PI * 2); ctx.fill();

    // LiDAR Beams
    ctx.strokeStyle = "rgba(0, 255, 204, 0.3)";
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(-20, -60);
    ctx.moveTo(0, -10); ctx.lineTo(20, -60);
    ctx.stroke();
    ctx.restore();

    // 4. Side Pontoons
    ctx.fillStyle = "rgba(5, 15, 25, 0.8)";
    ctx.strokeStyle = "rgba(0, 170, 231, 0.5)";
    ctx.beginPath();
    ctx.moveTo(80, 5); ctx.lineTo(0, 25);
    ctx.lineTo(-50, 15); ctx.lineTo(-40, 5);
    ctx.fill();
    ctx.stroke();

    // 5. Engine Glow
    ctx.shadowBlur = 20; ctx.shadowColor = config.colors.accent;
    ctx.fillStyle = config.colors.accent;
    ctx.beginPath(); ctx.arc(-70, 2, 5, 0, Math.PI * 2); ctx.fill();

    // 6. Active Scan Effect (Underwater Sonar)
    const scanLen = 200;
    const dx = mouse.x - x;
    const dy = mouse.y - y;
    let effectiveDy = Math.max(dy, 20);
    let worldAngle = Math.atan2(effectiveDy, dx);
    let localAngle = worldAngle - angle;

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(0, 255, 204, 0.08)`;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.arc(5, 5, scanLen, localAngle - 0.15, localAngle + 0.15);
    ctx.lineTo(5, 5); ctx.fill();

    ctx.strokeStyle = `rgba(0, 255, 204, 0.6)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(5 + Math.cos(localAngle) * scanLen, 5 + Math.sin(localAngle) * scanLen);
    ctx.stroke();

    ctx.restore();
}

function updateEngineTrails(x, y, speed) {
    if (Math.random() > 0.5) {
        engineTrail.push({
            x: x - 60 - Math.random() * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: -speed * 0.8 - Math.random(),
            vy: (Math.random() - 0.5) * 0.5,
            life: 1.0,
            size: Math.random() * 2
        });
    }

    for (let i = engineTrail.length - 1; i >= 0; i--) {
        let p = engineTrail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.size *= 0.95;

        if (p.life <= 0) engineTrail.splice(i, 1);
    }
}

function drawEngineTrails(ctx) {
    ctx.fillStyle = config.colors.accent;
    engineTrail.forEach(p => {
        ctx.globalAlpha = p.life * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

function animateCyberWorld() {
    ctx.clearRect(0, 0, width, height);
    globalTime++;

    // 1. Draw Grid (Floor)
    ctx.strokeStyle = "rgba(0, 170, 231, 0.1)";
    ctx.lineWidth = 1;
    let gridY = height * 0.6;

    ctx.beginPath();
    for (let i = -width; i < width * 2; i += 100) {
        ctx.moveTo(i, height);
        ctx.lineTo(width / 2 + (i - width / 2) * 0.2, gridY);
    }
    for (let j = gridY; j < height; j += (height - gridY) / 10) {
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
    }
    ctx.stroke();

    // 2. Random Buoys (Midground)
    buoys.forEach(b => {
        // Bobbing effect
        let bY = height * 0.62 + Math.sin(globalTime * 0.03 + b.offset) * 8;
        // Check if buoy is roughly on screen (random X was set at init)
        drawCyberBuoy(ctx, b.x, bY, b.scale);
    });


    // 4. Hero Boat Navigation Physics
    boat.speed = 0.6;
    boat.x += boat.speed;
    if (boat.x > width + 200) boat.x = -200;

    // Wave Integration
    const waveLayer = waves[2];
    const waveY = Math.sin(waveLayer.length * boat.x + globalTime * waveLayer.speed) * waveLayer.amplitude + waveLayer.y;
    const slope = Math.cos(waveLayer.length * boat.x + globalTime * waveLayer.speed) * waveLayer.amplitude * waveLayer.length;
    const angle = Math.atan(slope);

    // Update Particles
    particles.forEach(p => {
        p.y += p.speedY;
        if (p.y > height) { p.y = -10; p.x = Math.random() * width; }

        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;

        if (p.type === 'data') {
            ctx.fillRect(p.x, p.y, 1, p.size * 5);
        } else {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
    });

    // 5. Draw Waves
    waves.forEach((wave, i) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 10) {
            ctx.lineTo(x, Math.sin(x * wave.length + globalTime * wave.speed) * wave.amplitude + wave.y);
        }
        ctx.lineTo(width, height);
        ctx.fillStyle = wave.color;

        if (i === 2) {
            ctx.strokeStyle = "rgba(0, 170, 231, 0.3)";
            ctx.lineWidth = 2;
            ctx.stroke();

            updateEngineTrails(boat.x, waveY, boat.speed);
            drawEngineTrails(ctx);
            drawStealthUSV(ctx, boat.x, waveY - 8, angle, boat.speed);
        }
        ctx.fill();
    });

    // 6. HUD Overlay
    if (boat.x > 0 && boat.x < width) {
        ctx.fillStyle = "white";
        ctx.font = "12px monospace";
        ctx.fillText(`VEL: 6.0 KN`, boat.x - 20, waveY - 80);
    }

    animationId = requestAnimationFrame(animateCyberWorld);
}

document.addEventListener('DOMContentLoaded', init);


/**
 * Tridel Technologies - Animated Backdrops (Fleet Ecosystem V2 - Merged)
 * Theme: Clean Coastal // Stealth USV // Data Buoys
 */

let canvas, ctx, width, height;
let animationId;
let globalTime = 0;

// Mouse for interaction (Data Buoy details?)
let mouse = { x: 0, y: 0 };

const config = {
    colors: {
        skyTop: '#87CEEB',
        skyBottom: '#E0F7FA',
        waterTop: 'rgba(0, 119, 190, 0.6)',
        waterBottom: 'rgba(0, 30, 60, 0.9)',
        seabed: '#D4C4A8', // Lighter sand

        // Stealth USV colors (Adapted for Day/Coastal)
        usvDark: '#0A1928',
        usvAccent: '#00FFCC', // Cyan for tech look

        // Data Buoy
        buoyYellow: '#FFD700',
        buoyDark: '#333333'
    }
};

let waves = [];
let particles = []; // Underwater dust

// Assets
let usv = { x: 0, y: 0, speed: 0.8, tilt: 0 }; // Stealth USV (Hero)
let ship = { x: -300, y: 0, speed: 0.3 }; // Large Vessel (Background)
let dataBuoy = { x: 150, y: 0 }; // Complex Data Buoy (Left corner)
let navBuoys = []; // Array of simple buoys

function init() {
    canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // Wave Layers
    waves = [
        { y: 0, length: 0.003, amplitude: 15, speed: 0.01, color: 'rgba(0, 160, 220, 0.15)' },
        { y: 0, length: 0.006, amplitude: 12, speed: 0.015, color: 'rgba(0, 130, 200, 0.25)' },
        { y: 0, length: 0.01, amplitude: 18, speed: 0.02, color: 'rgba(0, 90, 180, 0.35)' } // Main surface
    ];

    // Nav Buoys positions relative to width
    navBuoys = [
        { xRatio: 0.4, speed: 0, offset: 0, color: 'red' },
        { xRatio: 0.7, speed: 0, offset: 2, color: 'green' },
        { xRatio: 0.85, speed: 0, offset: 4, color: 'red' }
    ];

    animateMergedFleet();
}

function resize() {
    if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        // Update Data Buoy position
        dataBuoy.x = width * 0.15; // Left side
    }
}

// --- DRAWING FUNCTIONS ---

function drawEnvironment(ctx) {
    // 1. Sky Gradient (Clean, no buildings)
    let grad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    grad.addColorStop(0, config.colors.skyTop);
    grad.addColorStop(1, config.colors.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Distant Horizon / Mountains (Low profile)
    ctx.fillStyle = "rgba(100, 120, 140, 0.5)"; // Atmospheric Fade
    ctx.beginPath();
    ctx.moveTo(0, height * 0.58);
    for (let i = 0; i <= width; i += 100) {
        ctx.lineTo(i, height * 0.58 - Math.random() * 15); // Very low mountains
    }
    ctx.lineTo(width, height * 0.58);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // 3. Seabed
    ctx.fillStyle = config.colors.seabed;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.75);
    ctx.bezierCurveTo(width * 0.4, height * 0.85, width * 0.7, height * 0.9, width, height * 0.9);
    ctx.lineTo(width, height);
    ctx.fill();

    // Underwater Water fill
    let wGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
    wGrad.addColorStop(0, config.colors.waterTop);
    wGrad.addColorStop(1, config.colors.waterBottom);
    ctx.fillStyle = wGrad;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);
}

// STEALTH USV (From Concept 5) - Adapted for Day Scene
function drawStealthUSV(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const scale = 0.75;
    ctx.scale(scale, scale);

    // Glow (Reduced for day, but still technical)
    ctx.shadowBlur = 0; // Less glow in day

    // --- HULL DESIGN ---
    // Main Hull Body (Dark Metallic)
    ctx.fillStyle = config.colors.usvDark;
    ctx.strokeStyle = config.colors.usvAccent; // Retain Cyan trim
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(120, -10); // Bow
    ctx.lineTo(20, -15);
    ctx.lineTo(-60, -10);
    ctx.lineTo(-70, 5);
    ctx.lineTo(0, 15);
    ctx.lineTo(100, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Side Pontoons
    ctx.fillStyle = "#05101A";
    ctx.beginPath();
    ctx.moveTo(80, 5);
    ctx.lineTo(0, 25);
    ctx.lineTo(-50, 15);
    ctx.lineTo(-40, 5);
    ctx.fill();
    ctx.stroke();

    // --- PAYLOAD (LiDAR) --- 
    // Top-mounted sensor
    ctx.save();
    ctx.translate(0, -35);

    ctx.fillStyle = "#111";
    ctx.strokeStyle = config.colors.usvAccent;
    ctx.lineWidth = 1;
    ctx.fillRect(-10, -5, 20, 5); // Base

    // Head
    const time = Date.now() / 200;
    const headWidth = 15 + Math.sin(time) * 5;
    ctx.fillStyle = config.colors.usvAccent;
    ctx.beginPath(); ctx.ellipse(0, -10, headWidth / 2, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Scanning Beams (Subtle in day)
    ctx.strokeStyle = "rgba(0, 255, 204, 0.4)";
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(-20, -60);
    ctx.moveTo(0, -10); ctx.lineTo(20, -60);
    ctx.stroke();
    ctx.restore();

    // Thruster
    ctx.fillStyle = config.colors.usvAccent;
    ctx.beginPath(); ctx.arc(-70, 2, 4, 0, Math.PI * 2); ctx.fill();

    // --- UNDERWATER SCAN (Interactive) ---
    // Only if mouse is nearby? Or keep it global like C5
    // Let's keep the C5 constrained scan
    const dx = mouse.x - (x); // Adjusted for translation? No, mouse is global, x is global drawn
    // Need global X here, we are in local context.
    // Actually drawStealthUSV is called at (x,y).
    // So dx, dy calc needs x, y passed in.

    // Convert mouse relative to boat
    const relX = mouse.x - x;
    const relY = mouse.y - y;

    let effectiveDy = Math.max(relY, 20);
    let worldAngle = Math.atan2(effectiveDy, relX);
    let localAngle = worldAngle - angle;

    ctx.globalCompositeOperation = 'screen'; // works ok in light bg too?
    const scanLen = 200;
    ctx.fillStyle = `rgba(0, 255, 204, 0.15)`; // Slightly stronger for day
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.arc(5, 5, scanLen, localAngle - 0.15, localAngle + 0.15);
    ctx.lineTo(5, 5);
    ctx.fill();

    // Scan Ray
    ctx.strokeStyle = `rgba(0, 255, 204, 0.8)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(5 + Math.cos(localAngle) * scanLen, 5 + Math.sin(localAngle) * scanLen);
    ctx.stroke();

    ctx.restore();
}

// LARGE VESSEL (Background) - Draft Reduced
function drawLargeVessel(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.0, 1.0);

    // Draft Reduced: Hull bottom is flatter/higher
    ctx.fillStyle = "#34495E"; // Gray
    ctx.beginPath();
    ctx.moveTo(150, -20); // Bow
    ctx.lineTo(-100, -20);
    ctx.lineTo(-100, 10); // REDUCED DRAFT (was 20)
    ctx.lineTo(120, 15);  // REDUCED DRAFT
    ctx.closePath();
    ctx.fill();

    // Cabin
    ctx.fillStyle = "#ECF0F1";
    ctx.beginPath();
    ctx.moveTo(80, -20);
    ctx.lineTo(90, -50);
    ctx.lineTo(0, -50);
    ctx.lineTo(-10, -20);
    ctx.fill();
    // Windows
    ctx.fillStyle = "#111";
    ctx.fillRect(10, -45, 70, 10);

    ctx.fillStyle = "white";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("TRIDEL SURVEY", -90, -5);

    ctx.restore();
}

// COMPLEX DATA BUOY (MESN-SJI Reference)
function drawDataBuoy(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // Bobbing
    ctx.translate(0, Math.sin(globalTime * 0.03) * 5);

    // Base (Yellow, wide, segmented)
    ctx.fillStyle = config.colors.buoyYellow;
    ctx.strokeStyle = "#B8860B"; // Darker gold outline
    ctx.lineWidth = 1;

    // Float ring
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central Tower (Hexagonal prism style)
    ctx.fillStyle = "#FFD700"; // Gold
    ctx.fillRect(-20, -60, 40, 60);
    ctx.strokeRect(-20, -60, 40, 60); // Edges

    // Solar Ring (Top)
    ctx.fillStyle = "#222"; // Solar panel dark
    ctx.beginPath();
    ctx.moveTo(-45, -60);
    ctx.lineTo(45, -60);
    ctx.lineTo(40, -50);
    ctx.lineTo(-40, -50);
    ctx.fill();

    // Top Mast structure
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(0, -100); // Mast
    ctx.stroke();

    // Sensors (Wind vane etc)
    ctx.fillStyle = "white";
    ctx.fillRect(-5, -100, 10, 10); // Sensor box

    // Label
    ctx.fillStyle = "black";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MESN-SJI", 0, -30);

    ctx.restore();
}

// SIMPLE NAV BUOY
function drawNavBuoy(ctx, x, y, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.translate(0, Math.sin(globalTime * 0.04) * 8);

    ctx.fillStyle = color === 'red' ? '#E74C3C' : '#2ECC71';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, -30);
    ctx.fill();

    // Base float
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI, false);
    ctx.fill();

    ctx.restore();
}

function animateMergedFleet() {
    ctx.clearRect(0, 0, width, height);
    globalTime++;

    drawEnvironment(ctx);

    // BACKGROUND ASSETS
    // Ship
    ship.x += ship.speed;
    if (ship.x > width + 200) ship.x = -200;
    let shipY = height * 0.58 + Math.sin(globalTime * 0.01) * 3;
    drawLargeVessel(ctx, ship.x, shipY);

    // Nav Buoys
    navBuoys.forEach(nb => {
        let buY = height * 0.6 + Math.sin(globalTime * 0.02 + nb.offset) * 5;
        drawNavBuoy(ctx, width * nb.xRatio, buY, nb.color);
    });

    // FOREGROUND ASSETS
    // Data Buoy (Left corner)
    drawDataBuoy(ctx, dataBuoy.x, height * 0.65);

    // Stealth USV (Hero)
    usv.x += usv.speed;
    if (usv.x > width + 150) usv.x = -150;

    // Wave Riding
    let mainWave = waves[2];
    let usvY = height * 0.62;
    let wy = Math.sin(usv.x * 0.01 + globalTime * 0.02) * 10;
    let slope = Math.cos(usv.x * 0.01 + globalTime * 0.02) * 0.1;

    drawStealthUSV(ctx, usv.x, usvY + wy, Math.atan(slope));

    // Waves Overlay
    waves.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 10) {
            ctx.lineTo(x, height * 0.6 + Math.sin(x * w.length + globalTime * w.speed) * w.amplitude + w.y);
        }
        ctx.lineTo(width, height);
        ctx.fillStyle = w.color;
        ctx.fill();
    });

    animationId = requestAnimationFrame(animateMergedFleet);
}

document.addEventListener('DOMContentLoaded', init);

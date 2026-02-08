/**
 * Tridel Technologies - Animated Backdrops (Futuristic Edition V2.4)
 * Theme: Cyber-Seas // Stealth USV // Mothership Support
 *
 * Exports:
 *   window.initBgAnimationFuture()   – start futuristic homepage animation
 *   window.cleanupBgAnimationFuture() – cancel frame, remove listeners
 */
(function () {
  'use strict';

  var canvas, ctx, w, h;
  var animationId;
  var globalTime = 0;
  var mouse = { x: 0, y: 0 };

  var config = {
    colors: {
      primary: '#00AAE7',
      accent: '#00FFCC',
      alert: '#FF3366',
      dark: '#001220',
      text: '#ffffff'
    }
  };

  var particles = [];
  var waves = [];
  var boat = { x: -150, y: 0, speed: 0.6, targetSpeed: 0.6, tilt: 0 };
  var engineTrail = [];
  var buoys = [];

  var resizeHandler, mousemoveHandler;

  function resize() {
    if (canvas) {
      var hero = canvas.closest('.hero') || canvas.parentElement;
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }
  }

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2,
      speedY: 0.5 + Math.random() * 1.5,
      opacity: Math.random() * 0.5,
      type: Math.random() > 0.8 ? 'data' : 'dust'
    };
  }

  function initCyberWorld() {
    waves = [];
    waves.push({ y: h * 0.75, length: 0.005, amplitude: 50, speed: 0.01, color: 'rgba(0, 170, 231, 0.03)' });
    waves.push({ y: h * 0.75, length: 0.01, amplitude: 30, speed: 0.02, color: 'rgba(0, 170, 231, 0.08)' });
    waves.push({ y: h * 0.75, length: 0.003, amplitude: 25, speed: 0.025, color: 'rgba(0, 170, 231, 0.15)' });

    particles = [];
    for (var i = 0; i < 40; i++) {
      particles.push(createParticle());
    }

    buoys = [];
    for (var j = 0; j < 4; j++) {
      buoys.push({
        x: Math.random() * w,
        offset: Math.random() * Math.PI * 2,
        scale: 0.6 + Math.random() * 0.4
      });
    }
  }

  function drawCyberBuoy(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI, false);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -30);
    ctx.stroke();

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

  function drawStealthUSV(x, y, angle, speed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    var scale = 0.8;
    ctx.scale(scale, scale);

    ctx.shadowBlur = 15;
    ctx.shadowColor = config.colors.primary;

    // Main Hull
    ctx.fillStyle = 'rgba(10, 25, 40, 0.95)';
    ctx.strokeStyle = config.colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, -10); ctx.lineTo(20, -15);
    ctx.lineTo(-60, -10); ctx.lineTo(-70, 5);
    ctx.lineTo(0, 15); ctx.lineTo(100, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = 'rgba(0, 170, 231, 0.2)';
    ctx.strokeStyle = config.colors.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, -15); ctx.lineTo(30, -35);
    ctx.lineTo(-20, -35); ctx.lineTo(-40, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Payload (LiDAR)
    ctx.save();
    ctx.translate(0, -35);
    ctx.fillStyle = '#001220';
    ctx.strokeStyle = config.colors.accent;
    ctx.lineWidth = 1;
    ctx.fillRect(-10, -5, 20, 5);
    ctx.strokeRect(-10, -5, 20, 5);

    var time = Date.now() / 200;
    var headWidth = 15 + Math.sin(time) * 5;
    ctx.fillStyle = config.colors.accent;
    ctx.shadowBlur = 10; ctx.shadowColor = config.colors.accent;
    ctx.beginPath(); ctx.ellipse(0, -10, headWidth / 2, 4, 0, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(-20, -60);
    ctx.moveTo(0, -10); ctx.lineTo(20, -60);
    ctx.stroke();
    ctx.restore();

    // Side Pontoons
    ctx.fillStyle = 'rgba(5, 15, 25, 0.8)';
    ctx.strokeStyle = 'rgba(0, 170, 231, 0.5)';
    ctx.beginPath();
    ctx.moveTo(80, 5); ctx.lineTo(0, 25);
    ctx.lineTo(-50, 15); ctx.lineTo(-40, 5);
    ctx.fill();
    ctx.stroke();

    // Engine Glow
    ctx.shadowBlur = 20; ctx.shadowColor = config.colors.accent;
    ctx.fillStyle = config.colors.accent;
    ctx.beginPath(); ctx.arc(-70, 2, 5, 0, Math.PI * 2); ctx.fill();

    // Sonar scan
    var scanLen = 200;
    var dx = mouse.x - x;
    var dy = mouse.y - y;
    var effectiveDy = Math.max(dy, 20);
    var worldAngle = Math.atan2(effectiveDy, dx);
    var localAngle = worldAngle - angle;

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(0, 255, 204, 0.08)';
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.arc(5, 5, scanLen, localAngle - 0.15, localAngle + 0.15);
    ctx.lineTo(5, 5); ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 204, 0.6)';
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

    for (var i = engineTrail.length - 1; i >= 0; i--) {
      var p = engineTrail[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.size *= 0.95;
      if (p.life <= 0) engineTrail.splice(i, 1);
    }
  }

  function drawEngineTrails() {
    ctx.fillStyle = config.colors.accent;
    engineTrail.forEach(function (p) {
      ctx.globalAlpha = p.life * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }

  function animateCyberWorld() {
    ctx.clearRect(0, 0, w, h);
    globalTime++;

    // Grid
    ctx.strokeStyle = 'rgba(0, 170, 231, 0.1)';
    ctx.lineWidth = 1;
    var gridY = h * 0.6;

    ctx.beginPath();
    for (var gi = -w; gi < w * 2; gi += 100) {
      ctx.moveTo(gi, h);
      ctx.lineTo(w / 2 + (gi - w / 2) * 0.2, gridY);
    }
    for (var gj = gridY; gj < h; gj += (h - gridY) / 10) {
      ctx.moveTo(0, gj);
      ctx.lineTo(w, gj);
    }
    ctx.stroke();

    // Buoys
    buoys.forEach(function (b) {
      var bY = h * 0.62 + Math.sin(globalTime * 0.03 + b.offset) * 8;
      drawCyberBuoy(b.x, bY, b.scale);
    });

    // Boat
    boat.speed = 0.6;
    boat.x += boat.speed;
    if (boat.x > w + 200) boat.x = -200;

    var waveLayer = waves[2];
    var waveY = Math.sin(waveLayer.length * boat.x + globalTime * waveLayer.speed) * waveLayer.amplitude + waveLayer.y;
    var slope = Math.cos(waveLayer.length * boat.x + globalTime * waveLayer.speed) * waveLayer.amplitude * waveLayer.length;
    var angle = Math.atan(slope);

    // Particles
    particles.forEach(function (p) {
      p.y += p.speedY;
      if (p.y > h) { p.y = -10; p.x = Math.random() * w; }

      ctx.fillStyle = 'rgba(255, 255, 255, ' + p.opacity + ')';
      if (p.type === 'data') {
        ctx.fillRect(p.x, p.y, 1, p.size * 5);
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
    });

    // Waves
    waves.forEach(function (wave, i) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 10) {
        ctx.lineTo(x, Math.sin(x * wave.length + globalTime * wave.speed) * wave.amplitude + wave.y);
      }
      ctx.lineTo(w, h);
      ctx.fillStyle = wave.color;

      if (i === 2) {
        ctx.strokeStyle = 'rgba(0, 170, 231, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        updateEngineTrails(boat.x, waveY, boat.speed);
        drawEngineTrails();
        drawStealthUSV(boat.x, waveY - 8, angle, boat.speed);
      }
      ctx.fill();
    });

    // HUD
    if (boat.x > 0 && boat.x < w) {
      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.fillText('VEL: 6.0 KN', boat.x - 20, waveY - 80);
    }

    animationId = requestAnimationFrame(animateCyberWorld);
  }

  /* =========================================
     PUBLIC API
     ========================================= */
  window.initBgAnimationFuture = function () {
    window.cleanupBgAnimationFuture();

    canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();

    resizeHandler = resize;
    window.addEventListener('resize', resizeHandler);

    mousemoveHandler = function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', mousemoveHandler);

    mouse.x = w / 2;
    mouse.y = h / 2;
    globalTime = 0;
    boat = { x: -150, y: 0, speed: 0.6, targetSpeed: 0.6, tilt: 0 };
    engineTrail = [];

    initCyberWorld();
    animateCyberWorld();
  };

  window.cleanupBgAnimationFuture = function () {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    if (mousemoveHandler) {
      window.removeEventListener('mousemove', mousemoveHandler);
      mousemoveHandler = null;
    }
    particles = [];
    waves = [];
    engineTrail = [];
    buoys = [];
    canvas = null;
    ctx = null;
  };
})();

/**
 * Tridel Technologies - Animated Backdrops (SPA-compatible)
 * Theme: Multi-Page Generative Animations with Mouse Interactivity
 *
 * Exports:
 *   window.initBgAnimation(mode)  – start the canvas animation
 *     mode = 'home'    → boat + waves + math particles
 *     mode = 'uniform' → confetti particles (default)
 *   window.cleanupBgAnimation()   – cancel frame, remove listeners
 */
(function () {
  'use strict';

  var canvas, ctx, w, h;
  var animationId;
  var globalTime = 0;
  var mouse = { x: 0, y: 0 };
  var mouseHasMoved = false;
  var particles = [];
  var waves = [];
  var boat = { x: -100, y: 0, speed: 1.5 };
  var marineSnow = [];

  var config = {
    colors: {
      accent: '#00AAE7',
      accentGlow: 'rgba(0, 170, 231, 0.4)',
      bg: '#050505',
      text: '#ffffff'
    }
  };

  // --- Listeners (stored for cleanup) ---
  var resizeHandler, mousemoveHandler;

  function resize() {
    if (canvas) {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
  }

  /* =========================================
     HOME: Magical Boat & Math
     ========================================= */
  function initHome() {
    waves = [
      { y: h * 0.75, length: 0.01, amplitude: 15, speed: 0.02, color: 'rgba(0, 170, 231, 0.1)' },
      { y: h * 0.75, length: 0.006, amplitude: 20, speed: 0.015, color: 'rgba(0, 170, 231, 0.2)' },
      { y: h * 0.75, length: 0.003, amplitude: 25, speed: 0.01, color: 'rgba(51, 187, 236, 0.3)' }
    ];

    var symbols = ['\u222B', '\u2211', '\u03C0', 'e', 'x\u00B2', 'sin', '\u2207'];
    particles = [];
    for (var i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        velocity: 0.5 + Math.random(),
        opacity: Math.random(),
        size: 14 + Math.random() * 10
      });
    }
  }

  function lerpColor(a, b, amount) {
    var ah = parseInt(a.replace(/#/g, ''), 16),
      ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff,
      bh = parseInt(b.replace(/#/g, ''), 16),
      br = bh >> 16, bg2 = (bh >> 8) & 0xff, bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg2 - ag),
      rb = ab + amount * (bb - ab);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
  }

  function initMarineSnow() {
    marineSnow = [];
    for (var i = 0; i < 50; i++) {
      marineSnow.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2,
        speed: 0.5 + Math.random() * 1.5,
        opacity: Math.random() * 0.5
      });
    }
  }

  function animateHome() {
    ctx.clearRect(0, 0, w, h);
    globalTime++;

    var scrollTop = window.scrollY;
    var maxScroll = document.body.scrollHeight - window.innerHeight;
    var scrollProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

    var colorA = lerpColor('#1A1C20', '#000000', scrollProgress);
    var colorB = lerpColor('#050505', '#000000', scrollProgress);

    var bgDiv = document.querySelector('.hero__bg');
    if (bgDiv) {
      bgDiv.style.background = 'radial-gradient(circle at 70% 30%, ' + colorA + ' 0%, ' + colorB + ' 100%)';
    }

    var waveMouseMod = (mouse.y / h) * 10;
    var surfaceOpacity = 1 - scrollProgress;

    if (surfaceOpacity > 0.1) {
      particles.forEach(function (p) {
        p.y -= p.velocity;
        var dx = (mouse.x - w / 2) * 0.02 * p.velocity;
        if (p.y < -50) p.y = h + 50;
        ctx.font = p.size + 'px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(100, 200, 255, ' + (0.3 * surfaceOpacity) + ')';
        ctx.fillText(p.symbol, p.x + dx, p.y);
      });
    }

    if (marineSnow.length === 0) initMarineSnow();

    var depthOpacity = scrollProgress;
    if (depthOpacity > 0.1) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.4 * depthOpacity) + ')';
      marineSnow.forEach(function (s) {
        s.y += s.speed;
        if (s.y > h) s.y = -5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (scrollProgress < 0.3) {
      boat.x += boat.speed;
      if (boat.x > w + 100) boat.x = -100;

      var primaryWave = waves[1];
      var waveY = Math.sin(primaryWave.length * boat.x + globalTime * primaryWave.speed) * (primaryWave.amplitude + waveMouseMod) + primaryWave.y;
      var waveSlope = Math.cos(primaryWave.length * boat.x + globalTime * primaryWave.speed) * (primaryWave.amplitude + waveMouseMod) * primaryWave.length;

      var waveAlpha = 1 - (scrollProgress * 3);
      if (waveAlpha > 0) {
        waves.forEach(function (wave, i) {
          ctx.beginPath();
          ctx.moveTo(0, h);
          for (var x = 0; x <= w; x += 10) {
            ctx.lineTo(x, Math.sin(x * wave.length + globalTime * wave.speed) * (wave.amplitude + waveMouseMod) + wave.y);
          }
          ctx.lineTo(w, h);
          ctx.shadowBlur = 15;
          ctx.shadowColor = wave.color;

          ctx.save();
          ctx.globalAlpha = waveAlpha;
          ctx.fillStyle = wave.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (i === 1) {
            ctx.translate(boat.x, waveY - 5);
            ctx.rotate(Math.atan(waveSlope));
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'white';
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(30, -10); ctx.lineTo(20, 10); ctx.lineTo(-20, 10); ctx.fill();
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -50); ctx.stroke();
            ctx.shadowColor = '#4285F4'; ctx.fillStyle = '#4285F4'; ctx.beginPath(); ctx.moveTo(2, -48); ctx.lineTo(2, -15); ctx.lineTo(25, -15); ctx.fill();
          }
          ctx.restore();
        });
      }
    } else {
      boat.x += boat.speed;
      if (boat.x > w + 100) boat.x = -100;
    }

    animationId = requestAnimationFrame(animateHome);
  }

  /* =========================================
     UNIFORM: Confetti Particles
     ========================================= */
  function initUniform() {
    particles = [];
    var count = Math.floor(w / 15);
    var colors = ['#00AAE7', '#33BBEC', '#FF7F00', '#FFA040'];

    var bgDiv = document.querySelector('.hero__bg');
    if (bgDiv) {
      bgDiv.style.background = 'transparent';
      bgDiv.style.backgroundImage = 'none';
      bgDiv.style.backgroundColor = 'transparent';
    }

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }

  function animateUniform() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      var dx = p.x - mouse.x;
      var dy = p.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        var force = (150 - dist) / 150;
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

  /* =========================================
     PUBLIC API
     ========================================= */

  /**
   * Start the background canvas animation.
   * @param {string} mode - 'home' or 'uniform' (default)
   */
  window.initBgAnimation = function (mode) {
    // Cleanup any existing animation first
    window.cleanupBgAnimation();

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
      mouseHasMoved = true;
    };
    window.addEventListener('mousemove', mousemoveHandler);

    mouse.x = w / 2;
    mouse.y = h / 2;
    globalTime = 0;

    if (mode === 'home') {
      boat = { x: -100, y: 0, speed: 1.5 };
      marineSnow = [];
      initHome();
      animateHome();
    } else {
      initUniform();
      animateUniform();
    }
  };

  /**
   * Stop animation and remove listeners.
   */
  window.cleanupBgAnimation = function () {
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
    marineSnow = [];
    canvas = null;
    ctx = null;
  };
})();

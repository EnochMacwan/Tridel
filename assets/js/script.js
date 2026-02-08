/**
 * Tridel SPA - Global Behaviors
 * All functions exported as window.* for layout.js and page renderers to call.
 */

/* ---------------------------------- */
/* Hamburger Menu Toggle              */
/* ---------------------------------- */
window.initMenuToggle = function () {
  var trigger = document.querySelector('.header__menu-toggle');
  if (!trigger) return;

  trigger.addEventListener('click', function () {
    document.body.classList.toggle('nav-open');
  });

  // Close menu on hash change (i.e. page navigation happened)
  window.addEventListener('hashchange', function () {
    document.body.classList.remove('nav-open');
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      trigger.focus();
    }
  });
};

/* ---------------------------------- */
/* Mobile Accordion Navigation        */
/* ---------------------------------- */
window.initMobileNav = function () {
  // On mobile, mega-menus are hidden — all links navigate directly.
  // Accordion behavior removed for cleaner mobile UX.
};

/* ---------------------------------- */
/* Desktop Mega Menu Hover + Keyboard */
/* ---------------------------------- */
window.initMegaMenu = function () {
  if (window.innerWidth <= 1024) return;

  var megaMenuLinks = document.querySelectorAll('.header__nav-list > li');

  function closeAllMegaMenus() {
    megaMenuLinks.forEach(function (li) {
      var mm = li.querySelector('.mega-menu');
      var lk = li.querySelector('.header__nav-link');
      if (mm) {
        mm.classList.remove('is-visible');
        if (lk) lk.setAttribute('aria-expanded', 'false');
      }
    });
  }

  megaMenuLinks.forEach(function (li) {
    var megaMenu = li.querySelector('.mega-menu');
    if (!megaMenu) return;

    var link = li.querySelector('.header__nav-link');
    var hideTimeout = null;
    var showTimeout = null;

    link.setAttribute('aria-expanded', 'false');

    function showMenu() {
      megaMenu.classList.add('is-visible');
      link.setAttribute('aria-expanded', 'true');
    }

    function hideMenu() {
      megaMenu.classList.remove('is-visible');
      link.setAttribute('aria-expanded', 'false');
    }

    link.addEventListener('mouseenter', function () {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
      showTimeout = setTimeout(showMenu, 50);
    });

    megaMenu.addEventListener('mouseenter', function () {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
    });

    link.addEventListener('mouseleave', function () {
      clearTimeout(showTimeout);
      hideTimeout = setTimeout(hideMenu, 150);
    });

    megaMenu.addEventListener('mouseleave', function () {
      clearTimeout(showTimeout);
      hideTimeout = setTimeout(hideMenu, 100);
    });

    link.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeAllMegaMenus();
        showMenu();
        var firstLink = megaMenu.querySelector('a, button');
        if (firstLink) firstLink.focus();
      }
    });

    megaMenu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        hideMenu();
        link.focus();
      }
    });

    // Close mega menu when any link inside is clicked (delegated for dynamic content)
    megaMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        closeAllMegaMenus();
      }
    });
  });
};

/* ---------------------------------- */
/* Mega Menu Glass Card Interaction   */
/* ---------------------------------- */
window.initGlassCards = function () {
  var glassLinks = document.querySelectorAll('.glass-link');
  var updateTimeout;

  function updateGlassCard(card, titleEl, descEl, imgEl, btnEl, title, desc, img, href) {
    card.style.opacity = '0.7';
    if (imgEl) imgEl.style.transform = 'scale(0.95)';

    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(function () {
      if (imgEl && img) imgEl.src = img;
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
      if (btnEl) btnEl.href = href;
      card.style.opacity = '1';
      if (imgEl) imgEl.style.transform = 'scale(1)';
    }, 200);
  }

  glassLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      var container = link.closest('.mm-glass-grid');
      if (!container) return;
      var card = container.querySelector('.glass-spotlight');
      if (!card) return;

      var imgEl = card.querySelector('img');
      var titleEl = card.querySelector('h5');
      var descEl = card.querySelector('p');
      var btnEl = card.querySelector('a');

      var title = link.getAttribute('data-title');
      var desc = link.getAttribute('data-desc');
      var img = link.getAttribute('data-img');
      var href = link.getAttribute('href');

      if (title) {
        updateGlassCard(card, titleEl, descEl, imgEl, btnEl, title, desc, img, href);
      }
    });
  });
};

/* ---------------------------------- */
/* Scroll Reveal - IntersectionObserver */
/* ---------------------------------- */
window.initScrollReveal = function () {
  var revealElements = document.querySelectorAll('.reveal:not(.visible)');
  if (!revealElements.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(function (el) { observer.observe(el); });
};

/* ---------------------------------- */
/* Back to Top Button                  */
/* ---------------------------------- */
(function () {
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.ariaLabel = 'Back to Top';
  btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(btn);
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) btn.classList.add('visible');
    else btn.classList.remove('visible');

    // Fade out hero scroll indicator on scroll
    var indicator = document.querySelector('.hero__scroll-indicator');
    if (indicator) {
      indicator.style.opacity = window.scrollY > 50 ? '0' : '';
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ---------------------------------- */
/* Product Gallery (global)           */
/* ---------------------------------- */
window.changeImage = function (src) {
  var mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    mainImage.style.opacity = '0';
    setTimeout(function () {
      mainImage.src = src;
      mainImage.style.opacity = '1';
    }, 200);
  }
  document.querySelectorAll('.gallery-thumbs img').forEach(function (img) {
    img.classList.toggle('active', img.src === src);
  });
};

/* ---------------------------------- */
/* Lightbox Modal (global)            */
/* ---------------------------------- */
var _lightboxTrigger = null;

window.openLightbox = function (el) {
  _lightboxTrigger = el;
  var src = el.querySelector('img') ? el.querySelector('img').src : el.src;

  var modal = document.getElementById('lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.className = 'lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Image viewer');
    modal.innerHTML =
      '<button class="lightbox-close" aria-label="Close image viewer" onclick="closeLightbox()">&times;</button>' +
      '<img class="lightbox-content" id="lightbox-img" src="" alt="Enlarged product image">';
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  document.getElementById('lightbox-img').src = src;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  var closeBtn = modal.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.focus();
};

window.closeLightbox = function () {
  var modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if (_lightboxTrigger) {
    _lightboxTrigger.focus();
    _lightboxTrigger = null;
  }
};

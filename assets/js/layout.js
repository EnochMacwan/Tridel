/**
 * Layout — Renders shared header and footer for the SPA
 */
(function () {
  'use strict';

  var esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  };

  function getCurrentPath() {
    if (typeof window.parseHash === 'function') {
      return window.parseHash().path;
    }

    var hash = window.location.hash.replace(/^#/, '') || '/';
    var qIndex = hash.indexOf('?');
    return qIndex >= 0 ? hash.substring(0, qIndex) : hash;
  }

  function updateLogoState(path) {
    var isHome = path === '/';
    document.querySelectorAll('.header__logo, .footer__logo').forEach(function (logo) {
      logo.classList.toggle('logo-link--current', isHome);
      if (isHome) {
        logo.setAttribute('aria-current', 'page');
      } else {
        logo.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Render the header into #header-root
   */
  function renderHeader() {
    var root = document.getElementById('header-root');
    if (!root) return;

    var navItems = '';
    NAV_LINKS.forEach(function (link) {
      var chevron = link.chevron ? ' <i class="fas fa-chevron-down nav-icon-small"></i>' : '';
      var megaMenu = '';
      if (link.hasMegaMenu) {
        megaMenu =
          '<div class="mega-menu glass-mode">' +
            '<div class="mm-glass-grid ' + esc(link.megaMenuClass) + '">' +
              '<div style="grid-column: 1/-1; text-align: center; color: white;">Loading...</div>' +
            '</div>' +
          '</div>';
      }
      navItems +=
        '<li>' +
          '<a class="header__nav-link" href="' + esc(link.href) + '">' +
            esc(link.label) + chevron +
          '</a>' +
          megaMenu +
        '</li>';
    });

    root.innerHTML =
      '<header class="header">' +
        '<div class="container header__container">' +
          '<a class="header__logo" href="#/">' +
            '<img alt="Tridel Logo" src="assets/images/logo/tridel.png">' +
          '</a>' +
          '<nav aria-label="Main Navigation" class="header__nav mobile-hud-menu" id="main-nav">' +
            '<ul class="header__nav-list">' + navItems + '</ul>' +
          '</nav>' +
          '<div class="header__actions">' +
            '<button type="button" id="theme-toggle" class="button button--icon theme-toggle-btn" aria-label="Switch to dark mode" title="Switch to dark mode">' +
              '<i class="fas fa-moon"></i>' +
            '</button>' +
            '<a class="button button--primary" href="#/contact?focus=form&subject=General%20Enquiry">Enquire Now</a>' +
            '<button type="button" class="header__menu-toggle menu-trigger" aria-label="Open menu">' +
              '<span class="icon-menu"><i class="fas fa-bars"></i></span>' +
              '<span class="icon-close"><i class="fas fa-times"></i></span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  /**
   * Render the footer into #footer-root
   */
  function renderFooter() {
    var root = document.getElementById('footer-root');
    if (!root) return;

    var quickLinks = '';
    FOOTER_DATA.quickLinks.forEach(function (link) {
      quickLinks += '<li><a class="footer__link" href="' + esc(link.href) + '">' + esc(link.label) + '</a></li>';
    });

    var companyLinks = '';
    FOOTER_DATA.companyLinks.forEach(function (link) {
      companyLinks += '<li><a class="footer__link" href="' + esc(link.href) + '">' + esc(link.label) + '</a></li>';
    });

    root.innerHTML =
      '<footer class="footer">' +
        '<div class="container footer__container">' +
          '<div class="footer__brand">' +
            '<a class="footer__logo" href="#/">' +
              '<img alt="Tridel Logo" src="assets/images/logo/tridel1.png" class="footer-logo-style">' +
            '</a>' +
            '<p class="footer__tagline">' + esc(FOOTER_DATA.tagline) + '</p>' +
          '</div>' +
          '<div class="footer__links">' +
            '<div class="footer__links-col">' +
              '<h3 class="footer__heading">Quick Links</h3>' +
              '<ul>' + quickLinks + '</ul>' +
            '</div>' +
            '<div class="footer__links-col">' +
              '<h3 class="footer__heading">Company</h3>' +
              '<ul>' + companyLinks + '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="footer__social">' +
            '<h3 class="footer__heading">Connect</h3>' +
            '<a aria-label="LinkedIn" class="footer__social-link" href="' + esc(FOOTER_DATA.linkedIn) + '">' +
              '<svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>' +
                '<rect height="12" width="4" x="2" y="9"></rect>' +
                '<circle cx="4" cy="4" r="2"></circle>' +
              '</svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<div class="container">' +
            '<p>' + esc(FOOTER_DATA.copyright) + '</p>' +
            '<a href="admin.html" class="footer__admin-link"><i class="fas fa-cog"></i> Admin</a>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /**
   * Update active state on nav links based on current route
   */
  window.updateActiveNav = function (path) {
    // Desktop nav
    document.querySelectorAll('.header__nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPath = href.replace('#', '');
      // Check exact match or if current path starts with link path (for detail pages)
      var isActive = (path === linkPath) ||
        (linkPath !== '/' && path.indexOf(linkPath) === 0);
      link.classList.toggle('active', isActive);
    });

    updateLogoState(path);
  };

  /**
   * Initialize the layout — called once on app start
   */
  window.initLayout = function () {
    renderHeader();
    renderFooter();

    // Init theme toggle after header is in DOM
    if (typeof window.initThemeToggle === 'function') {
      window.initThemeToggle();
    }

    // Init mega menu behavior after header is in DOM
    if (typeof window.initMegaMenu === 'function') {
      window.initMegaMenu();
    }

    // Init mobile nav behavior
    if (typeof window.initMobileNav === 'function') {
      window.initMobileNav();
    }

    // Init hamburger menu toggle
    if (typeof window.initMenuToggle === 'function') {
      window.initMenuToggle();
    }

    // Load mega menu content
    if (typeof window.renderProductsMegaMenu === 'function') {
      var productsContainer = document.querySelector('.mm-products');
      if (productsContainer) window.renderProductsMegaMenu(productsContainer);
    }
    if (typeof window.renderServicesMegaMenu === 'function') {
      var servicesContainer = document.querySelector('.mm-services');
      if (servicesContainer) window.renderServicesMegaMenu(servicesContainer);
    }

    updateLogoState(getCurrentPath());
  };
})();

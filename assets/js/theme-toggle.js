/**
 * Theme Toggle
 * Applies saved theme immediately on parse (prevents flash).
 * Exports initThemeToggle() for layout.js to call after header is in DOM.
 */
(function () {
  'use strict';

  var htmlElement = document.documentElement;

  // Apply saved theme immediately (before paint)
  var savedTheme = localStorage.getItem('theme');
  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
  }

  function updateIcon(icon, theme) {
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  function updateToggleText(button, theme) {
    if (!button) return;
    var nextAction = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', nextAction);
    button.setAttribute('title', nextAction);
  }

  /**
   * Bind the theme toggle button. Call after #theme-toggle is in the DOM.
   */
  window.initThemeToggle = function () {
    var toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    var icon = toggleButton.querySelector('i');
    var currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    updateIcon(icon, currentTheme);
    updateToggleText(toggleButton, currentTheme);

    toggleButton.addEventListener('click', function () {
      var current = htmlElement.getAttribute('data-theme');
      var newTheme = current === 'dark' ? 'light' : 'dark';

      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateIcon(icon, newTheme);
      updateToggleText(toggleButton, newTheme);

      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    });
  };
})();

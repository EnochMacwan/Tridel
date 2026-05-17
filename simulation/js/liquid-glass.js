/**
 * Liquid Glass — injects the 4-layer glass structure into every panel card.
 *
 * Mirrors the macOS dock effect from lucasromerodb/liquid-glass-effect-macos:
 *   - .liquidGlass-effect : backdrop-filter blur + SVG fractal-noise distortion
 *   - .liquidGlass-tint   : translucent colour tint
 *   - .liquidGlass-shine  : inset highlight on the inner edges
 *   - .liquidGlass-text   : the original card content (raised above all layers)
 *
 * We mutate the DOM after app.js has built the panel so we do not have to
 * touch the static markup of each individual section-card. Idempotent — safe
 * to call multiple times; cards already wrapped are skipped.
 */
(function () {
  'use strict';

  var SELECTORS = '.section-card, .current-scenario-card, .map-legend';
  var WRAPPER_CLASS = 'liquidGlass-wrapper';

  function wrapCard(card) {
    if (!card || card.classList.contains(WRAPPER_CLASS)) return;

    // Move the current children into a content layer.
    var text = document.createElement('div');
    text.className = 'liquidGlass-text';
    while (card.firstChild) {
      text.appendChild(card.firstChild);
    }

    // Build the three glass layers in z-order (effect → tint → shine).
    var effect = document.createElement('div');
    effect.className = 'liquidGlass-effect';
    var tint = document.createElement('div');
    tint.className = 'liquidGlass-tint';
    var shine = document.createElement('div');
    shine.className = 'liquidGlass-shine';

    card.appendChild(effect);
    card.appendChild(tint);
    card.appendChild(shine);
    card.appendChild(text);

    card.classList.add(WRAPPER_CLASS);
  }

  function applyAll(root) {
    (root || document).querySelectorAll(SELECTORS).forEach(wrapCard);
  }

  function init() {
    applyAll(document);

    // Some cards (e.g. oil-budget-card, response-card) may be re-rendered or
    // toggled to display:block later by app.js. Watch the side panel for
    // newly added section-cards and wrap them as they appear.
    var side = document.getElementById('side');
    if (!side || typeof MutationObserver === 'undefined') return;

    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue; // ELEMENT_NODE
          if (node.matches && node.matches(SELECTORS)) wrapCard(node);
          if (node.querySelectorAll) applyAll(node);
        }
      }
    });
    obs.observe(side, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

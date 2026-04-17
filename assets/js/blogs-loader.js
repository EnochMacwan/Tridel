/**
 * Blogs / Articles Loader
 * Renders BLOGS_DATA as cards into a container.
 *
 * Exports:
 *   window.renderBlogCards(container, { limit })
 */
(function () {
  'use strict';

  var esc = escapeHtml;

  function fallbackImage() {
    return 'assets/images/logo/tridel.png';
  }

  function buildCard(blog, index) {
    var hasImage = !!(blog.image && String(blog.image).trim());
    var imgSrc = hasImage ? blog.image : fallbackImage();
    var external = /^https?:\/\//i.test(blog.url || '');
    var hrefAttr = blog.url ? ' href="' + esc(blog.url) + '"' : ' href="#/articles-blogs"';
    var targetAttr = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    var meta = [];
    if (blog.date) meta.push(esc(blog.date));
    if (blog.author) meta.push(esc(blog.author));
    var metaHtml = meta.length ? '<span class="blog-card__meta">' + meta.join(' &middot; ') + '</span>' : '';
    var tagHtml = blog.tag ? '<span class="blog-card__tag">' + esc(blog.tag) + '</span>' : '';

    return (
      '<a class="blog-card reveal"' + hrefAttr + targetAttr + ' style="animation-delay:' + (index * 0.1) + 's">' +
        '<div class="blog-card__media">' +
          '<img loading="lazy" alt="' + esc(blog.title || '') + '" src="' + esc(imgSrc) + '"' +
            ' onerror="this.onerror=null;this.src=\'' + fallbackImage() + '\'">' +
          tagHtml +
        '</div>' +
        '<div class="blog-card__body">' +
          (blog.title ? '<h3 class="blog-card__title">' + esc(blog.title) + '</h3>' : '') +
          (blog.excerpt ? '<p class="blog-card__excerpt">' + esc(blog.excerpt) + '</p>' : '') +
          '<div class="blog-card__footer">' +
            metaHtml +
            '<span class="blog-card__read">Read article <i class="fas fa-arrow-right"></i></span>' +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  window.renderBlogCards = function (container, options) {
    if (!container) container = document.getElementById('blogs-feed-container');
    if (!container) return;

    var data = (typeof BLOGS_DATA !== 'undefined' && Array.isArray(BLOGS_DATA)) ? BLOGS_DATA : [];
    var limit = (options && typeof options.limit === 'number') ? options.limit : 0;
    var items = limit > 0 ? data.slice(0, limit) : data;

    if (!items.length) {
      container.innerHTML =
        '<div class="blog-card blog-card--empty">' +
          '<div class="blog-card__body">' +
            '<h3 class="blog-card__title">No articles yet</h3>' +
            '<p class="blog-card__excerpt">New blog posts and articles will appear here as they are published.</p>' +
          '</div>' +
        '</div>';
      return;
    }

    container.innerHTML = items.map(buildCard).join('');
  };
})();

/**
 * Reusable SPA Components
 * Shared UI builders used by multiple page renderers
 */
(function () {
  'use strict';

  var esc = escapeHtml;

  /**
   * Render a page header with breadcrumb and hero canvas
   * @param {object} config - { title, subtitle, breadcrumbs: [{label, href?}], extraClass? }
   * @returns {string} HTML string
   */
  window.renderPageHeader = function (config) {
    var breadcrumbItems = '';
    if (config.breadcrumbs && config.breadcrumbs.length) {
      config.breadcrumbs.forEach(function (crumb, i) {
        var isLast = i === config.breadcrumbs.length - 1;
        if (isLast) {
          breadcrumbItems +=
            '<li class="breadcrumb__item">' +
              '<span class="breadcrumb__current">' + esc(crumb.label) + '</span>' +
            '</li>';
        } else {
          breadcrumbItems +=
            '<li class="breadcrumb__item">' +
              '<a href="' + esc(crumb.href || '#/') + '" class="breadcrumb__link">' + esc(crumb.label) + '</a>' +
              '<span class="breadcrumb__separator"><i class="fas fa-chevron-right"></i></span>' +
            '</li>';
        }
      });
    }

    var cls = 'page-header' + (config.extraClass ? ' ' + config.extraClass : '');

    return (
      '<section class="' + cls + '">' +
        '<div class="hero__bg"><canvas id="hero-canvas"></canvas></div>' +
        '<nav class="breadcrumb container" aria-label="Breadcrumb">' +
          '<ol class="breadcrumb__list">' + breadcrumbItems + '</ol>' +
        '</nav>' +
        '<div class="container">' +
          '<h1 class="page-header__title">' + esc(config.title) + '</h1>' +
          (config.subtitle ? '<p class="page-header__subtitle">' + esc(config.subtitle) + '</p>' : '') +
        '</div>' +
      '</section>'
    );
  };

  /**
   * Render a FAQ accordion
   * @param {Array} items - [{question, answer}]
   * @returns {string} HTML string
   */
  window.renderFaqAccordion = function (items) {
    if (!items || !items.length) return '';

    var faqItems = '';
    items.forEach(function (item) {
      faqItems +=
        '<div class="faq-item">' +
          '<button class="faq-question" aria-expanded="false">' +
            esc(item.question) +
            '<span class="faq-question__icon"><i class="fas fa-chevron-down"></i></span>' +
          '</button>' +
          '<div class="faq-answer" role="region">' +
            '<p class="faq-answer__content">' + esc(item.answer) + '</p>' +
          '</div>' +
        '</div>';
    });

    return (
      '<div class="section__header">' +
        '<h2 class="section__title">Frequently Asked Questions</h2>' +
      '</div>' +
      '<div class="faq-section">' + faqItems + '</div>'
    );
  };

  /**
   * Initialize FAQ accordion toggle behavior
   * Call after FAQ HTML is in the DOM
   */
  window.initFaqAccordion = function () {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.closest('.faq-item');
        var isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(function (el) {
          el.classList.remove('active');
          el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  };

  /**
   * Build a form from config
   * @param {object} config - { title?, action, method?, fields: [{type, name, label, required?, placeholder?, options?, accept?, helpText?}], submitText }
   * @returns {string} HTML string
   */
  window.renderForm = function (config) {
    function buildField(field) {
      var input = '';
      if (field.type === 'select') {
        var opts = '<option disabled selected value="">' + esc(field.placeholder || 'Select an option') + '</option>';
        (field.options || []).forEach(function (opt) {
          opts += '<option value="' + esc(opt) + '">' + esc(opt) + '</option>';
        });
        input = '<select class="form-control" id="' + esc(field.name) + '" name="' + esc(field.name) + '"' + (field.required ? ' required' : '') + '>' + opts + '</select>';
      } else if (field.type === 'textarea') {
        input = '<textarea class="form-control" id="' + esc(field.name) + '" name="' + esc(field.name) + '"' +
          (field.required ? ' required aria-required="true"' : '') +
          (field.placeholder ? ' placeholder="' + esc(field.placeholder) + '"' : '') +
          ' rows="' + (field.rows || 5) + '"></textarea>';
      } else if (field.type === 'file') {
        input = '<input class="form-control" type="file" id="' + esc(field.name) + '" name="' + esc(field.name) + '"' +
          (field.accept ? ' accept="' + esc(field.accept) + '"' : '') +
          (field.required ? ' required aria-required="true"' : '') + '>';
        if (field.helpText) {
          input += '<small class="form-help">' + esc(field.helpText) + '</small>';
        }
      } else {
        input = '<input class="form-control" type="' + esc(field.type || 'text') + '" id="' + esc(field.name) + '" name="' + esc(field.name) + '"' +
          (field.required ? ' required aria-required="true"' : '') +
          (field.placeholder ? ' placeholder="' + esc(field.placeholder) + '"' : '') + '>';
      }

      return '<div class="form-group">' +
        '<label class="form-label" for="' + esc(field.name) + '">' + esc(field.label) + '</label>' +
        input +
      '</div>';
    }

    var fieldsHtml = '';
    var i = 0;
    var fields = config.fields;
    while (i < fields.length) {
      if (fields[i].row && fields[i + 1] && fields[i + 1].row === fields[i].row) {
        fieldsHtml += '<div class="form-row">' + buildField(fields[i]) + buildField(fields[i + 1]) + '</div>';
        i += 2;
      } else {
        fieldsHtml += buildField(fields[i]);
        i++;
      }
    }

    var method = config.method || 'POST';

    var formAttrs = '';
    if (config.formId) formAttrs += ' id="' + esc(config.formId) + '"';
    if (config.formClass) formAttrs += ' class="' + esc(config.formClass) + '"';
    if (config.formType) formAttrs += ' data-form-type="' + esc(config.formType) + '"';

    return (
      '<div class="contact-form">' +
        (config.title ? '<div class="section__header" style="text-align:left;"><h2 class="section__title">' + esc(config.title) + '</h2></div>' : '') +
        (config.subtitle ? '<p style="margin-bottom:var(--space-lg);color:var(--color-text-muted);">' + esc(config.subtitle) + '</p>' : '') +
        '<form action="' + esc(config.action) + '" method="' + esc(method) + '"' +
          formAttrs +
          (config.enctype ? ' enctype="' + esc(config.enctype) + '"' : '') + '>' +
          '<input type="hidden" name="_captcha" value="false">' +
          fieldsHtml +
          '<button class="button button--large" type="submit">' + esc(config.submitText || 'Submit') + '</button>' +
        '</form>' +
      '</div>'
    );
  };
})();

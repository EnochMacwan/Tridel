/**
 * Careers Page Renderer (/careers)
 * Renders the careers page with page header and Expression of Interest form.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/careers']) || {};

  function getCareersFormAction() {
    if (typeof SETTINGS_DATA !== 'undefined' && SETTINGS_DATA && SETTINGS_DATA.careersEmail) {
      return 'https://formsubmit.co/' + SETTINGS_DATA.careersEmail;
    }
    return 'https://formsubmit.co/geminibaba1@gmail.com';
  }

  function renderCareersPage(mainEl) {
    var html = '';

    // Page header with breadcrumb
    if (isSectionVisible('careers', 'hero'))
    html += window.renderPageHeader({
      title: 'Join Our Team',
      subtitle: 'We are always looking for passionate, talented individuals to help us innovate in the maritime technology sector. See a future with us? Get in touch.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Careers' }
      ]
    });

    // EOI Form section
    if (isSectionVisible('careers', 'listings')) {
    html +=
      '<section class="section" id="eoi-form">' +
        '<div class="container form-container">' +
          '<div class="section__header">' +
            '<h2 class="section__title">Expression of Interest</h2>' +
            '<p>If you don\'t see a current opening that fits your profile, please use this form to tell us about yourself and we\'ll keep your details on file for future opportunities.</p>' +
          '</div>';

    html += window.renderForm({
      action: getCareersFormAction(),
      method: 'POST',
      enctype: 'multipart/form-data',
      formId: 'careers-form',
      formType: 'careers',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name',
          autocomplete: 'name',
          row: 'a'
        },
        {
          type: 'date',
          name: 'dob',
          label: 'Date of Birth',
          required: true,
          autocomplete: 'off',
          row: 'a'
        },
        {
          type: 'text',
          name: 'qualification',
          label: 'Highest Qualification',
          required: true,
          placeholder: 'e.g., Master of Hydrography',
          autocomplete: 'off',
          row: 'b'
        },
        {
          type: 'select',
          name: 'location',
          label: 'Preferred Location',
          required: true,
          placeholder: 'Select a location',
          autocomplete: 'off',
          options: [
            'Australia',
            'UAE',
            'India',
            'Remote / Flexible'
          ],
          row: 'b'
        },
        {
          type: 'textarea',
          name: 'interest',
          label: 'Interested Areas & Position',
          required: true,
          placeholder: 'Tell us about the roles and fields you are interested in...',
          autocomplete: 'off',
          rows: 3
        },
        {
          type: 'textarea',
          name: 'cover-letter',
          label: 'Cover Letter',
          required: false,
          placeholder: 'Tell us why you\'d be a great fit for TRIDEL...',
          autocomplete: 'off',
          rows: 3
        },
        {
          type: 'file',
          name: 'attachment',
          label: 'Upload Resume',
          required: true,
          accept: '.pdf,.doc,.docx',
          helpText: 'Accepted formats: PDF, DOC, DOCX. Max size: 5MB.'
        }
      ],
      submitText: 'Submit Application'
    });

    html += '</div></section>';
    } // end isSectionVisible

    mainEl.innerHTML = html;

    // Initialize scroll reveal
    if (typeof window.initScrollReveal === 'function') {
      window.initScrollReveal();
    }

    // Initialize hero canvas
    if (typeof window.initHeroCanvas === 'function') {
      window.initHeroCanvas();
    }
  }

  window.registerRoute('/careers', {
    render: renderCareersPage,
    title: meta.title || 'Join Our Team | TRIDEL Careers',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-careers'
  });
})();

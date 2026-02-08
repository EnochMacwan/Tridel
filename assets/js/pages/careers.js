/**
 * Careers Page Renderer (/careers)
 * Renders the careers page with page header and Expression of Interest form.
 */
(function () {
  'use strict';

  var meta = (typeof PAGE_META !== 'undefined' && PAGE_META['/careers']) || {};

  function render(mainEl) {
    var html = '';

    // Page header with breadcrumb
    html += window.renderPageHeader({
      title: 'Join Our Team',
      subtitle: 'We are always looking for passionate, talented individuals to help us innovate in the maritime technology sector. See a future with us? Get in touch.',
      breadcrumbs: [
        { label: 'Home', href: '#/' },
        { label: 'Careers' }
      ]
    });

    // EOI Form section
    html +=
      '<section class="section" id="eoi-form">' +
        '<div class="container form-container">' +
          '<div class="section__header">' +
            '<h2 class="section__title">Expression of Interest</h2>' +
            '<p>If you don\'t see a current opening that fits your profile, please use this form to tell us about yourself and we\'ll keep your details on file for future opportunities.</p>' +
          '</div>';

    html += window.renderForm({
      action: 'https://formsubmit.co/geminibaba1@gmail.com',
      method: 'POST',
      enctype: 'multipart/form-data',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          type: 'date',
          name: 'dob',
          label: 'Date of Birth',
          required: true
        },
        {
          type: 'text',
          name: 'qualification',
          label: 'Highest Qualification',
          required: true,
          placeholder: 'e.g., Master of Hydrography'
        },
        {
          type: 'textarea',
          name: 'interest',
          label: 'Interested Areas & Position',
          required: true,
          placeholder: 'Tell us about the roles and fields you are interested in...'
        },
        {
          type: 'select',
          name: 'location',
          label: 'Preferred Location',
          required: true,
          placeholder: 'Select a location',
          options: [
            'Australia',
            'UAE',
            'India',
            'Remote / Flexible'
          ]
        },
        {
          type: 'textarea',
          name: 'cover-letter',
          label: 'Cover Letter',
          required: false,
          placeholder: 'Tell us why you\'d be a great fit for TRIDEL...'
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
    render: render,
    title: meta.title || 'Join Our Team | TRIDEL Careers',
    description: meta.description || '',
    bodyClass: meta.bodyClass || 'page-careers'
  });
})();

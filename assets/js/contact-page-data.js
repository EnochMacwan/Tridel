/**
 * Contact Page Data
 * Contact info cards, FAQ data, and page configuration
 */
var CONTACT_INFO_CARDS = [
  {
    "icon": "fa-envelope",
    "title": "Email Us",
    "detail": "<a href=\"mailto:mail@trideltechnologies.com\">mail@trideltechnologies.com</a>"
  },
  {
    "icon": "fa-map-marker-alt",
    "title": "Headquarters",
    "detail": "DAFZA Industrial Park,<br>Dubai, UAE"
  },
  {
    "icon": "fa-globe",
    "title": "Global Offices",
    "detail": "UAE &middot; India &middot; Australia"
  }
];

var CONTACT_FAQ_DATA = [
  {
    "question": "What industries does Tridel serve?",
    "answer": "Tridel Technologies serves a wide range of industries including oil & gas, marine construction, port development, environmental monitoring, government agencies, and coastal infrastructure management across varied geographies."
  },
  {
    "question": "Do you offer custom solutions?",
    "answer": "Yes. Our engineering team designs and builds custom hardware (dataloggers, buoys, monitoring stations) and software platforms tailored to your specific project requirements. Contact us to discuss your needs."
  },
  {
    "question": "What is the typical project timeline?",
    "answer": "Project timelines vary based on scope and complexity. Standard product deployments can be completed within weeks, while large-scale survey or monitoring projects typically range from a few months to over a year. We provide detailed timelines during the proposal stage."
  },
  {
    "question": "How can I request a quote?",
    "answer": "Simply fill out the contact form above, select your area of interest, and provide details about your project. Our team will review your requirements and respond within 1-2 business days with a tailored proposal."
  },
  {
    "question": "Do you provide training and support?",
    "answer": "Absolutely. We offer comprehensive training programs for all our products and systems, including on-site installation support, operator training, and ongoing technical assistance through our global support network."
  }
];

var CONTACT_PAGE_CONFIG = {
  "hero": {
    "label": "Get in Touch",
    "title": "Let's Work Together",
    "subtitle": "Have a project in mind? We'd love to hear about it. Reach out and let's explore how we can help."
  },
  "enquiry": {
    "email": "mail@trideltechnologies.com",
    "linkedinLabel": "Tridel Technologies",
    "linkedinUrl": "https://www.linkedin.com/company/tridel-technologies-company/"
  },
  "phone": "+971 4 288 4395",
  "responseGuarantee": {
    "title": "Quick Response",
    "desc": "Our team responds to all project enquiries within 24–48 business hours."
  },
  "offices": {
    "label": "Our Offices",
    "locations": (typeof LOCATIONS_DATA !== 'undefined') ? LOCATIONS_DATA : []
  },
  "sectorOptions": [
    "Product Enquiry",
    "Service Enquiry",
    "Custom Solution",
    "Partnership",
    "General Question"
  ]
};

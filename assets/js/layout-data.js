/**
 * Layout Data — Navigation links, footer data, and page metadata
 */
var NAV_LINKS = [
  { label: 'Home', href: '#/', icon: 'fa-home', key: '/' },
  { label: 'About Us', href: '#/about', icon: 'fa-info-circle', key: '/about' },
  {
    label: 'Products', href: '#/products', icon: 'fa-cube', key: '/products',
    hasMegaMenu: true, megaMenuClass: 'mm-products',
    chevron: true
  },
  {
    label: 'Services', href: '#/services', icon: 'fa-layer-group', key: '/services',
    hasMegaMenu: true, megaMenuClass: 'mm-services',
    chevron: true
  },
  { label: 'Success Stories', href: '#/success-stories', icon: 'fa-trophy', key: '/success-stories', shortLabel: 'Stories' },
  { label: 'Careers', href: '#/careers', icon: 'fa-briefcase', key: '/careers' },
  { label: 'Contact', href: '#/contact', icon: 'fa-envelope', key: '/contact' }
];

var FOOTER_DATA = {
  tagline: 'Connecting Environmental Science, Engineering, and Technology',
  quickLinks: [
    { label: 'About Us', href: '#/about' },
    { label: 'Products', href: '#/products' },
    { label: 'Services', href: '#/services' }
  ],
  companyLinks: [
    { label: 'Success Stories', href: '#/success-stories' },
    { label: 'Careers', href: '#/careers' },
    { label: 'Contact', href: '#/contact' }
  ],
  linkedIn: 'https://www.linkedin.com/company/tridel-technologies/',
  copyright: '\u00A9 2026 Tridel Technologies. All Rights Reserved.'
};

var PAGE_META = {
  '/': {
    title: 'Tridel Technologies',
    description: 'Tridel Technologies is a multinational organization in Environmental Industry, specialized in developing end-to-end solutions for Surveying, Monitoring and Mapping.',
    bodyClass: 'page-home'
  },
  '/about': {
    title: 'About Us | TRIDEL',
    description: 'Meet the team of engineers, scientists, and hydrographers at Tridel who are dedicated to solving complex challenges in the marine environment.',
    bodyClass: 'page-about'
  },
  '/products': {
    title: 'Products | Hardware & Software Solutions by Tridel',
    description: 'Explore Tridel\'s innovative hardware and software products, including custom dataloggers, buoys, survey vessels, and our TEMS & eSpecia data platforms.',
    bodyClass: 'page-products'
  },
  '/products/detail': {
    title: 'Product Details | Tridel',
    description: 'Detailed information about Tridel products.',
    bodyClass: 'page-product-detail'
  },
  '/services': {
    title: 'Services | TRIDEL',
    description: 'Tridel provides a full range of environmental and geo-engineering services, including geoscience studies, geoinformatics solutions, and geoengineering applications.',
    bodyClass: 'page-services'
  },
  '/services/detail': {
    title: 'Service Details | Tridel',
    description: 'Detailed information about Tridel services.',
    bodyClass: 'page-service-detail'
  },
  '/success-stories': {
    title: 'Success Stories | Tridel Projects',
    description: 'Explore our portfolio of successful projects, showcasing our expertise in environmental monitoring, hydrographic surveying, and custom solution development.',
    bodyClass: 'page-success-stories'
  },
  '/contact': {
    title: 'Contact Us | TRIDEL',
    description: 'Get in touch with the Tridel team. Enquire about our products, services, or solutions. Find contact details for our offices in the UAE, India, and Australia.',
    bodyClass: 'page-contact'
  },
  '/careers': {
    title: 'Join Our Team | TRIDEL Careers',
    description: 'Explore career opportunities at Tridel Technologies. We are looking for talented professionals in environmental science, engineering, and technology.',
    bodyClass: 'page-careers'
  }
};

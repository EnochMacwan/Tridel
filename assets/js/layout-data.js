/**
 * Layout Data — Navigation links, footer data, and page metadata
 */
var NAV_LINKS = [
  {
    "label": "Home",
    "href": "#/",
    "icon": "fa-home",
    "key": "/"
  },
  {
    "label": "About Us",
    "href": "#/about",
    "icon": "fa-info-circle",
    "key": "/about"
  },
  {
    "label": "Products",
    "href": "#/products",
    "icon": "fa-cube",
    "key": "/products",
    "hasMegaMenu": true,
    "megaMenuClass": "mm-products",
    "chevron": true
  },
  {
    "label": "Services",
    "href": "#/services",
    "icon": "fa-layer-group",
    "key": "/services",
    "hasMegaMenu": true,
    "megaMenuClass": "mm-services",
    "chevron": true
  },
  {
    "label": "Success Stories",
    "href": "#/success-stories",
    "icon": "fa-trophy",
    "key": "/success-stories",
    "shortLabel": "Stories"
  },
  {
    "label": "Simulation",
    "href": "simulation/index.html",
    "icon": "fa-water",
    "key": "/hormuz-simulation",
    "shortLabel": "Simulation",
    "external": true,
    "customClass": "nav-cta-hormuz"
  },
  {
    "label": "Careers",
    "href": "#/careers",
    "icon": "fa-briefcase",
    "key": "/careers"
  },
  {
    "label": "Contact",
    "href": "#/contact",
    "icon": "fa-envelope",
    "key": "/contact"
  }
];

var MEGA_MENU_CONFIG = {
  "products": {
    "columns": [
      {
        "key": "Buoys",
        "title": "Buoys",
        "icon": "fas fa-life-ring"
      },
      {
        "key": "Vessels",
        "title": "Vessels",
        "icon": "fas fa-ship"
      },
      {
        "key": "Equipment",
        "title": "Equipment",
        "icon": "fas fa-screwdriver-wrench"
      },
      {
        "key": "Software",
        "title": "Software",
        "icon": "fas fa-laptop-code"
      },
      {
        "key": "Integrated Solutions",
        "title": "Integrated Solutions",
        "icon": "fas fa-layer-group"
      }
    ],
    "spotlight": {
      "tag": "Featured",
      "title": "Tridel Aquilon 8000",
      "description": "Our flagship USV for advanced autonomous hydrographic surveys.",
      "link": "#/products/detail?id=aquilon-8000",
      "buttonText": "Learn More",
      "image": "assets/images/products/aquilon-8000/aquilon-8000-01.jpg"
    }
  },
  "services": {
    "columns": [
      {
        "key": "Environmental Monitoring",
        "title": "Environmental Monitoring",
        "icon": "fas fa-satellite-dish",
        "excludeSubcategories": []
      },
      {
        "key": "Environmental Surveying",
        "title": "Environmental Surveying",
        "icon": "fas fa-map-marked-alt",
        "excludeSubcategories": [
          "Geoscience Studies"
        ]
      }
    ],
    "spotlight": {
      "tag": "Featured",
      "title": "Air Quality Monitoring",
      "description": "Precision air quality monitoring for offshore and coastal projects. Our setups measure key pollutants and meteorological parameters to ensure compliance with environmental regulations and safeguard operational health.",
      "link": "#/services",
      "buttonText": "Learn More",
      "image": "assets/images/integrated-solutions/aqms/aqms.png"
    }
  }
};

var FOOTER_DATA = {
  "tagline": "Connecting Environmental Science, Engineering, and Technology",
  "quickLinks": [
    {
      "label": "About Us",
      "href": "#/about"
    },
    {
      "label": "Products",
      "href": "#/products"
    },
    {
      "label": "Services",
      "href": "#/services"
    }
  ],
  "companyLinks": [
    {
      "label": "Articles & Blogs",
      "href": "#/articles-blogs"
    },
    {
      "label": "Honors & Awards",
      "href": "#/honors-awards"
    },
    {
      "label": "Success Stories",
      "href": "#/success-stories"
    },
    {
      "label": "Careers",
      "href": "#/careers"
    },
    {
      "label": "Contact",
      "href": "#/contact"
    }
  ],
  "linkedIn": "https://www.linkedin.com/company/tridel-technologies-company/",
  "copyright": "© 2026 Tridel Technologies. All Rights Reserved."
};

var PAGE_META = {
  "/": {
    "title": "Tridel Technologies",
    "description": "Tridel Technologies is a multinational organisation in Environmental Industry, specialised in developing end-to-end solutions for Surveying, Monitoring and Mapping.",
    "bodyClass": "page-home"
  },
  "/about": {
    "title": "About Us | TRIDEL",
    "description": "Meet the team of engineers, scientists, and hydrographers at Tridel who are dedicated to solving complex challenges in the marine environment.",
    "bodyClass": "page-about"
  },
  "/products": {
    "title": "Products | Hardware & Software Solutions by Tridel",
    "description": "Explore Tridel's innovative hardware and software products, including custom dataloggers, buoys, survey vessels, and our TEMS & eSpecia data platforms.",
    "bodyClass": "page-products"
  },
  "/products/detail": {
    "title": "Product Details | Tridel",
    "description": "Detailed information about Tridel products.",
    "bodyClass": "page-product-detail"
  },
  "/services": {
    "title": "Services | TRIDEL",
    "description": "Tridel provides a full range of environmental and geo-engineering services, including geoscience studies, geoinformatics solutions, and geoengineering applications.",
    "bodyClass": "page-services"
  },
  "/services/detail": {
    "title": "Service Details | Tridel",
    "description": "Detailed information about Tridel services.",
    "bodyClass": "page-service-detail"
  },
    "/success-stories": {
      "title": "Success Stories | Tridel Projects",
      "description": "Explore our portfolio of successful projects, showcasing our expertise in environmental monitoring, hydrographic surveying, and custom solution development.",
      "bodyClass": "page-success-stories"
    },
    "/articles-blogs": {
      "title": "Articles & Blogs | Tridel",
      "description": "Read Tridel updates, industry notes, and LinkedIn posts from across our environmental, marine, and engineering work.",
      "bodyClass": "page-articles-blogs"
    },
    "/honors-awards": {
      "title": "Honors & Awards | Tridel",
      "description": "Explore Tridel's awards, recognitions, and event highlights across environmental monitoring, surveying, and engineering delivery.",
      "bodyClass": "page-honors-awards"
    },
    "/contact": {
      "title": "Contact Us | TRIDEL",
      "description": "Get in touch with the Tridel team. Enquire about our products, services, or solutions. Find contact details for our offices in the UAE, India, and Australia.",
      "bodyClass": "page-contact"
  },
  "/careers": {
    "title": "Join Our Team | TRIDEL Careers",
    "description": "Explore career opportunities at Tridel Technologies. We are looking for talented professionals in environmental science, engineering, and technology.",
    "bodyClass": "page-careers"
  }
};

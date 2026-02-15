const TESTIMONIALS_DATA = [
  {
    "lat": 19.076,
    "lng": 72.8777,
    "name": "Shankar Surveys",
    "location": "Navi Mumbai, India.",
    "logo": "assets/images/testimonials/shankar-surveys.png",
    "quote": "The assistance provided by the team helped us initiate the field programs at Adani Vizhinjam Port with a complete success. We value the support and look forward to our cooperation with Tridel.",
    "author": "Sreenivasan Shankar",
    "role": "Founder & Director"
  },
  {
    "lat": 46.8139,
    "lng": -71.208,
    "name": "Probiosphere",
    "location": "Quebec, Canada",
    "logo": "assets/images/testimonials/probiosphere.png",
    "quote": "The environmental services you are providing are more than essential. If you cannot measure it, you cannot improve it. That is exactly where your collaboration is crucial for us.",
    "author": "Dr. Pierre Naider Fanfan",
    "role": "President and CEO"
  },
  {
    "lat": 63.4305,
    "lng": 10.3951,
    "name": "Norseatech",
    "location": "TRØNDELAG, Norway",
    "logo": "data:image/jpeg;base64,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",
    "quote": "We see potential in our partnership with Tridel Technologies for jointly delivering value added services to the growing aquaculture market in Middle East.",
    "author": "Dr. Rahman Mankettikkara",
    "role": "Director"
  },
  {
    "lat": 11.4102,
    "lng": 79.6953,
    "name": "Annamalai University",
    "location": "Tamil Nadu, India",
    "logo": "assets/images/testimonials/annamalai-university.png",
    "quote": "I whole heartedly appreciate and congratulate the excellent initiative of Tridel. Hats off to the team with great fire and enthusiasm.",
    "author": "Professor K. Kathiresan",
    "role": "Former Dean & Director"
  },
  {
    "lat": -34.9285,
    "lng": 138.6007,
    "name": "Austides Consulting",
    "location": "Adelaide, Australia",
    "logo": "data:image/jpeg;base64,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",
    "quote": "I have witnessed the growth of Tridel, which I attribute to the hard work of its dynamic team, as well as to the vision of its leadership.",
    "author": "Dr. John Luick",
    "role": "CEO"
  },
  {
    "lat": 25.2048,
    "lng": 55.2708,
    "name": "DDCR",
    "location": "Dubai, UAE",
    "logo": "assets/images/testimonials/ddcr.png",
    "quote": "During the whole study of 'Biodiversity Baseline Survey for Dubai Emirate', Tridel team demonstrated excellent work ethics and professional skills supporting the research activities.",
    "author": "Tamer Khafaga",
    "role": "Conservation Research Manager"
  },
  {
    "lat": 15.2993,
    "lng": 74.124,
    "name": "NIO",
    "location": "Goa, India",
    "logo": "assets/images/testimonials/nio.png",
    "quote": "I must complement the Tridel Management for their striving to be fully committed... the best asset created for Dubai Municipality.",
    "author": "Dr. Ramaiah Nagappa",
    "role": "Former Chief Scientist"
  },
  {
    "lat": 30.3165,
    "lng": 78.0322,
    "name": "CEDAR",
    "location": "Dehradun, India",
    "logo": "assets/images/testimonials/cedar.png",
    "quote": "My experience working with Tridel Technologies... has been extremely positive. This project has been very challenging... However, the team has been up to the task.",
    "author": "Dr. Ghazala Shahabuddin",
    "role": "Senior Ecologist"
  },
  {
    "lat": 25.276987,
    "lng": 55.296249,
    "name": "Dubai Municipality",
    "location": "Dubai, UAE",
    "logo": "assets/images/testimonials/dubai-municipality.png",
    "quote": "Tridel Technologies has delivered high quality projects which enabled them to gain Dubai Municipality's trust.",
    "author": "Hind Mahmoud Mahaba",
    "role": "Head of EPSS"
  },
  {
    "lat": 25.1124,
    "lng": 55.139,
    "name": "Nakheel",
    "location": "Palm Jumeirah, Dubai",
    "logo": "assets/images/testimonials/nakheel.png",
    "quote": "I really appreciate the efforts of your team members, who have worked day and night to make our valuable tenants happy.",
    "author": "Kumar Giri",
    "role": "Facilities Supervisor"
  },
  {
    "lat": 24.4539,
    "lng": 54.3773,
    "name": "NMDC",
    "location": "Abu Dhabi, UAE",
    "logo": "assets/images/testimonials/nmdc.png",
    "quote": "The customized Tidal analysis and modelling tool build by Tridel meets with our expectation. Best wishes to the Tridel team.",
    "author": "Firman Christopherus Minar",
    "role": "Area Survey Manager"
  },
  {
    "lat": 25.3463,
    "lng": 55.4209,
    "name": "EPAA",
    "location": "Sharjah, UAE",
    "logo": "assets/images/testimonials/epaa.png",
    "quote": "We see Tridel eSpecia GIS application as an efficient platform for collating and managing environmental and ecological data.",
    "author": "Dr. Osama M Wahba",
    "role": "Environmental Specialist"
  },
  {
    "lat": 25.0657,
    "lng": 55.1713,
    "name": "Vibrocomp",
    "location": "Dubai, UAE",
    "logo": "data:image/jpeg;base64,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",
    "quote": "I continue to be impressed with their skills and professionalism. Our collaboration has always been smooth and very effective.",
    "author": "Dr. Tijana Kosanic",
    "role": "Head of Environment"
  },
  {
    "lat": 24.9857,
    "lng": 55.0712,
    "name": "ENOC",
    "location": "Jebel Ali, Dubai",
    "logo": "assets/images/testimonials/enoc.png",
    "quote": "We are satisfied by the services offered by M/s Tridel. The odour monitoring station supplied meets requirement.",
    "author": "Pawan Rai",
    "role": "EHS Manager"
  }
];
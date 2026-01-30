const TESTIMONIALS_DATA = [
  {
    "lat": 19.076,
    "lng": 72.8777,
    "name": "Shankar Surveys",
    "location": "Navi Mumbai, India",
    "logo": "data:image/jpeg;base64,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",
    "quote": "“The assistance provided by the team helped us initiate the field programs at Adani Vizhinjam Port with a complete success. We value the support and look forward to our cooperation with Tridel on similar large environmental monitoring and survey programs”.",
    "author": "Sreenivasan Shankar",
    "role": "Founder & Director"
  },
  {
    "lat": 46.8139,
    "lng": -71.208,
    "name": "Probiosphere",
    "location": "Quebec, Canada",
    "logo": "data:image/jpeg;base64,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",
    "quote": "“I really appreciate the work you are doing, and the environmental services you are providing to your community are more than essential. There is a saying: if you cannot measure it, you cannot improve it. That is exactly where your collaboration is crucial for us.”",
    "author": "Dr. Pierre Naider Fanfan",
    "role": "President and CEO"
  },
  {
    "lat": 63.4305,
    "lng": 10.3951,
    "name": "Norseatech",
    "location": "TRØNDELAG, Norway",
    "logo": "testimonial-03.png",
    "quote": "We see potential in our partnership with Tridel Technologies for jointly delivering value added services to the growing aquaculture market in Middle East.",
    "author": "Dr. Rahman Mankettikkara",
    "role": "Director"
  },
  {
    "lat": 11.4102,
    "lng": 79.6953,
    "name": "Annamalai University",
    "location": "Tamil Nadu, India",
    "logo": "testimonial-04.png",
    "quote": "I whole heartedly appreciate and congratulate the excellent initiative of Tridel. Hats off to the team with great fire and enthusiasm.",
    "author": "Professor K. Kathiresan",
    "role": "Former Dean & Director"
  },
  {
    "lat": -34.9285,
    "lng": 138.6007,
    "name": "Austides Consulting",
    "location": "Adelaide, Australia",
    "logo": "testimonial-05.png",
    "quote": "I have witnessed the growth of Tridel, which I attribute to the hard work of its dynamic team, as well as to the vision of its leadership.",
    "author": "Dr. John Luick",
    "role": "CEO"
  },
  {
    "lat": 25.2048,
    "lng": 55.2708,
    "name": "DDCR",
    "location": "Dubai, UAE",
    "logo": "testimonial-06.png",
    "quote": "During the whole study of 'Biodiversity Baseline Survey for Dubai Emirate', Tridel team demonstrated excellent work ethics and professional skills supporting the research activities.",
    "author": "Tamer Khafaga",
    "role": "Conservation Research Manager"
  },
  {
    "lat": 15.2993,
    "lng": 74.124,
    "name": "NIO",
    "location": "Goa, India",
    "logo": "testimonial-07.png",
    "quote": "I must complement the Tridel Management for their striving to be fully committed... the best asset created for Dubai Municipality.",
    "author": "Dr. Ramaiah Nagappa",
    "role": "Former Chief Scientist"
  },
  {
    "lat": 30.3165,
    "lng": 78.0322,
    "name": "CEDAR",
    "location": "Dehradun, India",
    "logo": "testimonial-08.png",
    "quote": "My experience working with Tridel Technologies... has been extremely positive. This project has been very challenging... However, the team has been up to the task.",
    "author": "Dr. Ghazala Shahabuddin",
    "role": "Senior Ecologist"
  },
  {
    "lat": 25.276987,
    "lng": 55.296249,
    "name": "Dubai Municipality",
    "location": "Dubai, UAE",
    "logo": "../clients/client-1.png",
    "quote": "Tridel Technologies has delivered high quality projects which enabled them to gain Dubai Municipality’s trust.",
    "author": "Hind Mahmoud Mahaba",
    "role": "Head of EPSS"
  },
  {
    "lat": 25.1124,
    "lng": 55.139,
    "name": "Nakheel",
    "location": "Palm Jumeirah, Dubai",
    "logo": "../clients/Nakheel.png",
    "quote": "I really appreciate the efforts of your team members, who have worked day and night to make our valuable tenants happy.",
    "author": "Kumar Giri",
    "role": "Facilities Supervisor"
  },
  {
    "lat": 24.4539,
    "lng": 54.3773,
    "name": "NMDC",
    "location": "Abu Dhabi, UAE",
    "logo": "testimonial-11.png",
    "quote": "The customized Tidal analysis and modelling tool build by Tridel meets with our expectation. Best wishes to the Tridel team.",
    "author": "Firman Christopherus Minar",
    "role": "Area Survey Manager"
  },
  {
    "lat": 25.3463,
    "lng": 55.4209,
    "name": "EPAA",
    "location": "Sharjah, UAE",
    "logo": "../clients/client-4.png",
    "quote": "We see Tridel eSpecia GIS application as an efficient platform for collating and managing environmental and ecological data.",
    "author": "Dr. Osama M Wahba",
    "role": "Environmental Specialist"
  },
  {
    "lat": 25.0657,
    "lng": 55.1713,
    "name": "Vibrocomp",
    "location": "Dubai, UAE",
    "logo": "testimonial-13.png",
    "quote": "I continue to be impressed with their skills and professionalism. Our collaboration has always been smooth and very effective.",
    "author": "Dr. Tijana Kosanic",
    "role": "Head of Environment"
  },
  {
    "lat": 24.9857,
    "lng": 55.0712,
    "name": "ENOC",
    "location": "Jebel Ali, Dubai",
    "logo": "../clients/client-3.png",
    "quote": "We are satisfied by the services offered by M/s Tridel. The odour monitoring station supplied meets requirement.",
    "author": "Pawan Rai",
    "role": "EHS Manager"
  }
];
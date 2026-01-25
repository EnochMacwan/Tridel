const productsData = [
  {
    id: "aqms",
    name: "AQMS (VBS)",
    category: "Integrated Solutions",
    image: "assets/images/Integrated Solutions/AQMS/aqms.png",
    description: "Our Air Quality Monitoring System (Vessel Based System) is designed for continuous monitoring of air quality parameters in marine environments."
  },
  {
    id: "aquilon-5600a",
    name: "Tridel Aquilon 5600A",
    category: "Vessels",
    image: "assets/images/products/aquilon-5600a/aquilon-5600-new.png",
    description: "The Tridel Aquilon 5600A Carbon Fiber Hybrid USV is designed for shallow to medium-depth coastal and offshore surveys. Its streamlined catamaran hull features rotatable pods for precise maneuvering."
  },
  {
    id: "aquilon-8000",
    name: "Tridel Aquilon 8000",
    category: "Vessels",
    image: "assets/images/products/aquilon-8000/aquilon-8000-new.png",
    description: "The Aquilon 8000 is a diesel-electric hybrid ASV designed for comprehensive hydrographic and oceanographic missions. It features a full oceanographic suite including LiDAR, Radar, and Forward Looking Sonar (FLS)."
  },
  {
    id: "attide",
    name: "ATtide - Tidal Analysis Software",
    category: "Software",
    image: "assets/images/software/attide.png",
    description: "A hand-crafted, custom software for complex tidal analysis. We automate the process to minimize user error and provide the most reliable results on the market.\u0026lt;[...]"
  },
  {
    id: "beach-ms",
    name: "Beach MS",
    category: "Integrated Solutions",
    image: "assets/images/logo/tridel1.png",
    description: "Beach Monitoring System employed for coastal usage and erosion monitoring."
  },
  {
    id: "catamaran-vessel",
    name: "Catamaran Survey Vessel",
    category: "Vessels",
    image: "assets/images/products/catamaran-vessel/catamaran-new.jpg",
    description: "This 25 m GRP catamaran is purpose-built for coastal and offshore hydrographic survey missions, including multibeam sonar, sub-bottom profiling, and environmental data collection."
  },
  {
    id: "coastal-buoy",
    name: "Coastal Buoys",
    category: "Buoys",
    image: "assets/images/products/coastal-buoy/tcb-quality.png",
    description: "The Tridel Coastal Buoy (TCB) is a robust floating platform engineered for nearshore and coastal marine applications. It offers an ideal balance of stability, visibility, and payload capacity for demanding environments."
  },
  {
    id: "customized-met-ocean-buoy",
    name: "[Product Name]",
    category: "Uncategorized",
    image: "assets/images/products/tridel-data-buoy.jpg",
    description: "[Full product description goes here. This text should be more detailed than the excerpt on the main products page.]"
  },
  {
    id: "data-buoy",
    name: "Data Buoys",
    category: "Buoys",
    image: "assets/images/products/data-buoy/data-buoy-1.png",
    description: "Our TDBs (Tridel Data Buoys) are bespoke-design buoy platforms built for advanced marine monitoring and research applications. They are designed for sensor-agnostic, autonomous operation in demanding environments."
  },
  {
    id: "deepwater-buoy",
    name: "Deepwater Buoys",
    category: "Buoys",
    image: "assets/images/products/deepwater-buoy/deepwater-new.jpg",
    description: "Tridel Technologies has proven expertise in designing and deploying Deep-water buoys for complex, long-term scientific applications. These platforms are engineered to withstand harsh open-ocean conditions while providing reliable data for oceanographic research."
  },
  {
    id: "drifter-buoy",
    name: "Drifter Buoys",
    category: "Buoys",
    image: "assets/images/products/drifter-buoy/drifter-1.jpg",
    description: "Autonomous floating devices that provide cost-effective, real-time data for understanding and monitoring marine environments."
  },
  {
    id: "ecfs",
    name: "ECFS",
    category: "Integrated Solutions",
    image: "assets/images/Integrated Solutions/ECFS/ECFS.jpg",
    description: "Electronic Charting \u0026 Forecasting System."
  },
  {
    id: "especia",
    name: "eSpecia GIS Application",
    category: "Software",
    image: "assets/images/software/especia.png",
    description: "An efficient platform for collating and managing environmental and ecological data, selected for monitoring systems in protected areas like Sir Bo Naair Island.[...]"
  },
  {
    id: "forecasting-systems",
    name: "Forecasting Systems",
    category: "Integrated Solutions",
    image: "assets/images/Integrated Solutions/Forecasting/forecasting.png",
    description: "Advanced met-ocean forecasting systems for operational planning."
  },
  {
    id: "geodb",
    name: "GeoDB",
    category: "Integrated Solutions",
    image: "assets/images/Integrated Solutions/GeoDB/geodb.png",
    description: "Geospatial Database solutions for large-scale hydrographic data storage and retrieval."
  },
  {
    id: "monohull-vessel",
    name: "Monohull Vessel",
    category: "Vessels",
    image: "assets/images/products/monohull-vessel/monohull-new.png",
    description: "Built for performance and comfort, this 11m fiberglass-reinforced hydrographic survey vessel is ideal for extended offshore missions. Powered by twin 250 HP Suzuki outboard engines, offering high speed and reliability."
  },
  {
    id: "mooring-buoy",
    name: "Mooring Buoys",
    category: "Buoys",
    image: "assets/images/products/mooring-buoy/mooring-new.jpg",
    description: "Tridel manufactures a versatile range of mooring buoys suitable for commercial, Naval, and offshore applications."
  },
  {
    id: "mooring-frame",
    name: "Mooring Frames \u0026amp; Bottom Mounts",
    category: "Equipment",
    image: "assets/images/products/mooring-frame/Mooring-Frames.png",
    description: "We design and fabricate robust, non-corrosive bottom mounts and mooring frames for deploying underwater instrumentation. These frames are engineered to protect critical underwater assets and ensure long-term data stability."
  },
  {
    id: "nav-buoy",
    name: "Navigation Buoys",
    category: "Buoys",
    image: "assets/images/products/nav-buoy/nav-buoy-new.jpg",
    description: "Tailor-made platforms suitable for environmental monitoring and as official Aids to Navigation (AtoN). Includes skirted tail tubes and flat-based hulls for easy deployment in rivers, inner harbours, and oceans."
  },
  {
    id: "port-ms",
    name: "Port MS",
    category: "Integrated Solutions",
    image: "assets/images/Integrated Solutions/Port Monitoring System/PMS.png",
    description: "Port Monitoring System for operational efficiency and environmental compliance."
  },
  {
    id: "sub-floats",
    name: "Surface and Sub-Surface Floats",
    category: "Buoys",
    image: "assets/images/products/sub-floats/hdpe-floats.png",
    description: "We provide a full range of surface and sub-surface floats (pick-up buoys) used to mark the position of underwater oceanographic moorings."
  },
  {
    id: "t-sms",
    name: "T-SMS - Survey Management System",
    category: "Software",
    image: "assets/images/software/tsms.png",
    description: "Our survey workflow management and reporting software, designed for efficient project management and utilization of survey data, as delivered for the Hydrograph[...]"
  },
  {
    id: "tacs-software",
    name: "TACS Software",
    category: "Software",
    image: "assets/images/software/tems.png",
    description: "Advanced Command and control software for autonomous vessels, ensuring reliable navigation and operations."
  },
  {
    id: "tdl720",
    name: "Tridel Data Logger (TDL 720)",
    category: "Equipment",
    image: "assets/images/products/tdl720/tdl720-new.png",
    description: "The TDL 720 is a robust, low-power data logger specifically designed for remote environmental monitoring and industrial applications. Equipped with state-of-the-art processors and extensive connectivity options."
  },
  {
    id: "tems",
    name: "TEMS (Tridel Environmental Monitoring System)",
    category: "Software",
    image: "assets/images/software/tems.png",
    description: "A customized real-time data publishing platform that integrates multiple environmental monitoring systems. Instrument and transmission-independent, available on[...]"
  },
  {
    id: "tew1500",
    name: "TEW1500 Heavy-Duty Winch",
    category: "Equipment",
    image: "assets/images/products/tew1500/tew1500-new.png",
    description: "The TEW1500 is a heavy-duty electric winch built for demanding deep-water and heavy-payload survey missions. Designed for reliability and strength, it supports a wide range of oceanographic deployment needs."
  },
  {
    id: "tew500",
    name: "TEW500 Compact Winch",
    category: "Equipment",
    image: "assets/images/products/tew500/p-winch.png",
    description: "The TEW series represents a range of robust electric winches specifically engineered for Marine Oceanographic, Hydrographic, and Geophysical Survey applications. The TEW500 is a compact, high-performance model designed for precision operations."
  },
  {
    id: "wind-farm-buoy",
    name: "Wind Farm Buoy",
    category: "Buoys",
    image: "assets/images/products/nav-buoy/nav-buoy-new.jpg",
    description: "Specialized marking and monitoring solutions designed specifically for the rigorous demands of offshore wind energy infrastructures. These buoys ensure safety and compliance during both construction and operational phases."
  }
];

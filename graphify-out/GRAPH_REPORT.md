# Graph Report - .  (2026-05-16)

## Corpus Check
- Large corpus: 395 files · ~11,940,941 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1030 nodes · 1797 edges · 76 communities (60 shown, 16 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 262 edges (avg confidence: 0.8)
- Token cost: 45,000 input · 2,500 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin CMS Core|Admin CMS Core]]
- [[_COMMUNITY_SPA Page Renderers|SPA Page Renderers]]
- [[_COMMUNITY_Admin Form Editors|Admin Form Editors]]
- [[_COMMUNITY_Content Data Store|Content Data Store]]
- [[_COMMUNITY_Express Server Config|Express Server Config]]
- [[_COMMUNITY_Simulation UI & Controls|Simulation UI & Controls]]
- [[_COMMUNITY_Static Content Config|Static Content Config]]
- [[_COMMUNITY_Admin Panel Sections|Admin Panel Sections]]
- [[_COMMUNITY_Services Page Renderer|Services Page Renderer]]
- [[_COMMUNITY_Admin Dashboard UI|Admin Dashboard UI]]
- [[_COMMUNITY_Products Page Renderer|Products Page Renderer]]
- [[_COMMUNITY_Content Manager PS Tools|Content Manager PS Tools]]
- [[_COMMUNITY_Simulation Analytics|Simulation Analytics]]
- [[_COMMUNITY_TDL714 Data Logger|TDL714 Data Logger]]
- [[_COMMUNITY_Marine Sensor Equipment|Marine Sensor Equipment]]
- [[_COMMUNITY_Simulation Boot & Presets|Simulation Boot & Presets]]
- [[_COMMUNITY_Drift & Oil Visualization|Drift & Oil Visualization]]
- [[_COMMUNITY_Site Content Loaders|Site Content Loaders]]
- [[_COMMUNITY_Organization Metadata|Organization Metadata]]
- [[_COMMUNITY_Lagrangian Drift Engine|Lagrangian Drift Engine]]
- [[_COMMUNITY_SPA Router|SPA Router]]
- [[_COMMUNITY_Core Site Shell|Core Site Shell]]
- [[_COMMUNITY_Forcing Field Grid|Forcing Field Grid]]
- [[_COMMUNITY_Simulation Architecture|Simulation Architecture]]
- [[_COMMUNITY_Marine Vessels & Hardware|Marine Vessels & Hardware]]
- [[_COMMUNITY_Responsive UI State|Responsive UI State]]
- [[_COMMUNITY_Third-Party Integrations|Third-Party Integrations]]
- [[_COMMUNITY_Service Detail Page|Service Detail Page]]
- [[_COMMUNITY_Scenario Export Tools|Scenario Export Tools]]
- [[_COMMUNITY_Data Export & Download|Data Export & Download]]
- [[_COMMUNITY_Product Detail Page|Product Detail Page]]
- [[_COMMUNITY_Site Metrics & Analytics|Site Metrics & Analytics]]
- [[_COMMUNITY_Navigation Buoy Products|Navigation Buoy Products]]
- [[_COMMUNITY_Data & Deepwater Buoys|Data & Deepwater Buoys]]
- [[_COMMUNITY_USV & Winch Products|USV & Winch Products]]
- [[_COMMUNITY_Oil Budget Model|Oil Budget Model]]
- [[_COMMUNITY_Cyber-Seas Animation|Cyber-Seas Animation]]
- [[_COMMUNITY_Marine Snow Animation|Marine Snow Animation]]
- [[_COMMUNITY_Testimonials Carousel|Testimonials Carousel]]
- [[_COMMUNITY_Global Nav & Mega Menu|Global Nav & Mega Menu]]
- [[_COMMUNITY_LinkedIn Feed Prototypes|LinkedIn Feed Prototypes]]
- [[_COMMUNITY_Smooth Scroll|Smooth Scroll]]
- [[_COMMUNITY_OpenDrift Case Builder|OpenDrift Case Builder]]
- [[_COMMUNITY_News & LinkedIn Feed|News & LinkedIn Feed]]
- [[_COMMUNITY_Auth Design Rationale|Auth Design Rationale]]
- [[_COMMUNITY_Image Upload Tools|Image Upload Tools]]
- [[_COMMUNITY_Admin Sidebar UI|Admin Sidebar UI]]
- [[_COMMUNITY_Success Stories|Success Stories]]
- [[_COMMUNITY_Canvas & Media Tools|Canvas & Media Tools]]
- [[_COMMUNITY_Auth Module|Auth Module]]
- [[_COMMUNITY_Rate Limiting|Rate Limiting]]
- [[_COMMUNITY_GitHub API Helpers|GitHub API Helpers]]
- [[_COMMUNITY_Simulation Worker|Simulation Worker]]
- [[_COMMUNITY_Home Page Loader|Home Page Loader]]
- [[_COMMUNITY_Contact Data|Contact Data]]
- [[_COMMUNITY_Home Cards Data|Home Cards Data]]
- [[_COMMUNITY_Locations Data|Locations Data]]
- [[_COMMUNITY_Settings Data|Settings Data]]
- [[_COMMUNITY_Team Data|Team Data]]
- [[_COMMUNITY_Team Loader|Team Loader]]
- [[_COMMUNITY_News Data|News Data]]
- [[_COMMUNITY_Testimonials Data|Testimonials Data]]
- [[_COMMUNITY_GitHub Config Check|GitHub Config Check]]
- [[_COMMUNITY_Password Verification|Password Verification]]
- [[_COMMUNITY_LinkedIn URL Normalizer|LinkedIn URL Normalizer]]
- [[_COMMUNITY_Generic Form Builder|Generic Form Builder]]

## God Nodes (most connected - your core abstractions)
1. `Tridel Admin Panel` - 45 edges
2. `escapeHtml()` - 33 edges
3. `boot()` - 24 edges
4. `showToast()` - 23 edges
5. `esc()` - 20 edges
6. `index.html — Main Site SPA Shell` - 19 edges
7. `renderAllSections()` - 18 edges
8. `getDataArray()` - 16 edges
9. `renderHomePage` - 16 edges
10. `markAsPending()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `GITHUB_DATA_FILES Map (client)` --semantically_similar_to--> `DATA_FILES & VAR_NAMES Map`  [INFERRED] [semantically similar]
  assets/js/admin.js → server.js
- `Service Detail Page Renderer` --calls--> `Simulation App — UI and Orchestration`  [AMBIGUOUS]
  assets/js/pages/service-detail.js → simulation/js/app.js
- `Tridel Admin Panel` --references--> `admin-github.js — Admin GitHub Integration`  [EXTRACTED]
  admin.html → assets/js/admin-github.js
- `Tridel Admin Panel` --references--> `admin-publish.js — Admin Publish Logic`  [EXTRACTED]
  admin.html → assets/js/admin-publish.js
- `Tridel Admin Panel` --references--> `utils.js — Core Utilities`  [EXTRACTED]
  admin.html → assets/js/utils.js

## Communities (76 total, 16 thin omitted)

### Community 0 - "Admin CMS Core"
Cohesion: 0.05
Nodes (91): checkAuth(), closeModal(), deleteItem(), doLogin(), doLogout(), editItem(), enableOfflineMode(), executeBulkDelete() (+83 more)

### Community 1 - "SPA Page Renderers"
Cohesion: 0.05
Nodes (46): createLogo(), track, buildField(), renderFooter(), renderHeader(), ensureLeaflet(), initMap(), markers (+38 more)

### Community 2 - "Admin Form Editors"
Cohesion: 0.07
Nodes (47): adminGlobalSearch(), addContactFaq(), addContactInfoCard(), addFooterLink(), addGalleryImage(), addNavLink(), addStatRow(), addWhyChooseReason() (+39 more)

### Community 3 - "Content Data Store"
Cohesion: 0.05
Nodes (37): product_extraction.json — Extracted Product Data, services_extraction.json — Extracted Service Data, CLIENTS_DATA, featuredProduct, PRODUCTS_DATA, featuredService, SERVICES_DATA, SUCCESS_STORIES_DATA (+29 more)

### Community 4 - "Express Server Config"
Cohesion: 0.04
Nodes (36): aboutLines, allData, allowedOrigins, app, baseName, BLOCKED_PUBLIC_EXTENSIONS, BLOCKED_PUBLIC_FILES, config (+28 more)

### Community 5 - "Simulation UI & Controls"
Cohesion: 0.06
Nodes (36): bgParticles, buildShareParams(), buildShareUrl(), copyShareLink(), copyTextToClipboard(), currentSpeedStats(), dataSourceKind(), DEFAULT_CONTEXT_CENTER (+28 more)

### Community 6 - "Static Content Config"
Cohesion: 0.09
Nodes (44): ABOUT_DATA, CONTACT_PAGE_CONFIG, HONORS_AWARDS_DATA, INDEX_HERO, INDEX_STATS, INDEX_WHAT_WE_DO, PAGE_META, SETTINGS_DATA (+36 more)

### Community 7 - "Admin Panel Sections"
Cohesion: 0.1
Nodes (31): ABOUT_DATA (About Page Content), AdminAuth Object (client-side login), Static Fallback Password Hash, Contact Page Form Row Editor, Navigation / Mega Menu Editor, Homepage Stats Row Editor, getAdminAuthHeaders (token helper), Server GitHub Proxy Client (+23 more)

### Community 8 - "Services Page Renderer"
Cohesion: 0.08
Nodes (21): appendServiceMegaMenuLink(), getServiceDisplayName(), getServiceGallery(), getServicePrimaryImage(), getServicesMegaMenuConfig(), groupedServices, items, mainItems (+13 more)

### Community 9 - "Admin Dashboard UI"
Cohesion: 0.07
Nodes (27): Tridel Admin Panel, Admin Bulk Action Bar, Admin Clients Section, Admin Page Content Section, Admin Dashboard, Admin GitHub Configuration Modal, Admin System Health and Broken Links, Admin Home Cards Section (+19 more)

### Community 10 - "Products Page Renderer"
Cohesion: 0.09
Nodes (17): appendProductMegaMenuLink(), appendProductMegaMenuViewAll(), getProductHref(), getProductsMegaMenuConfig(), groupedProducts, itemHref, items, megaMenuConfig (+9 more)

### Community 11 - "Content Manager PS Tools"
Cohesion: 0.11
Nodes (13): Get-JS-Blocks(), Get-JS-Objects-Table(), Get-News-Items(), Get-RelativePath(), Import-SmartImage(), Initialize-DetailItems(), Load-HomeCards(), Save-DetailBlock() (+5 more)

### Community 12 - "Simulation Analytics"
Cohesion: 0.18
Nodes (22): buildAnalystSummary(), fmt(), formatPercent(), formatRunOffset(), formatTimelineUtc(), makeBgParticles(), maxDataSec(), maxRunHoursFrom() (+14 more)

### Community 13 - "TDL714 Data Logger"
Cohesion: 0.17
Nodes (20): TDL714 PCB Case Render 1 (Top View, Blue), TDL714 PCB Case Render 2 (Angled, Blue LED Strip), TDL714 PCB Case Render 3 (Front-Angled, Connector Row), TDL714 PCB Case Render 4 (Top-Down, Matte Blue), TDL714 PCB Case Render 5 (Top View, Dark Lid), TDL714 PCB Case Render 6 (Top View, Tri-tone Blue), TDL714 PCB Case Render 7 (Angled, Slim Profile), TDL714 PCB Case Render (Top-Down, Tridel Logo) (+12 more)

### Community 14 - "Marine Sensor Equipment"
Cohesion: 0.21
Nodes (20): ADCP (Acoustic Doppler Current Profiler), Drifter Buoy, Marine Buoy Deployment Operations, Ocean Current Sensing, Satellite Telemetry, Sea Surface Temperature Measurement, Solar Power System, Tridel Coastal Buoy (TCB) (+12 more)

### Community 15 - "Simulation Boot & Presets"
Cohesion: 0.18
Nodes (20): applyPreset(), applyStateFromUrl(), boot(), buildPresetOptions(), collectDomRefs(), presetDescription(), renderPresetCards(), selectedPreset() (+12 more)

### Community 16 - "Drift & Oil Visualization"
Cohesion: 0.13
Nodes (18): buildLeewayOptions(), buildOilOptions(), collectResponses(), convexHullAreaKm2(), drawDensity(), drawDrift(), drawOilBudgetCanvas(), drawReleaseMarker() (+10 more)

### Community 17 - "Site Content Loaders"
Cohesion: 0.2
Nodes (18): Honors & Awards Data, Index / Home Page Data, Layout Data (Nav, Footer, Meta), Layout Renderer (Header/Footer SPA), Locations Data (Global Offices), Locations Loader (Global Presence Renderer), News Data (LinkedIn Embeds), News Feed Loader (LinkedIn Cards Renderer) (+10 more)

### Community 18 - "Organization Metadata"
Cohesion: 0.13
Nodes (17): Tridel Headquarters — Vadodara, Gujarat, India, Schema.org Organization Structured Data, Tridel Technologies — Organization, layout-data.js — Layout and Navigation Data, js/app.js — Simulation App Boot, Austides Consulting — Simulation Partner, data/currents.json — Forcing Data Manifest, data/chunks/ — Forcing Data Chunks (11 × ~19 MB JSON) (+9 more)

### Community 19 - "Lagrangian Drift Engine"
Cohesion: 0.22
Nodes (8): drawUncertaintyEllipse(), ellipseLatLngs(), Drifter, mPerDegLat(), mPerDegLon(), OilSlick, randn(), spawnEnsemble()

### Community 20 - "SPA Router"
Cohesion: 0.27
Nodes (14): findLazyScript(), findRoute(), generateTrackingId(), getStoredId(), getVisitorId(), getVisitSessionId(), handleRoute(), loadScript() (+6 more)

### Community 21 - "Core Site Shell"
Cohesion: 0.14
Nodes (16): 404 Not Found Page, index.html — Main Site SPA Shell, clients-data.js — Clients Data File, contact-data.js — Contact Data File, home-data.js — Home Page Data File, locations-data.js — Locations Data File, news-data.js — LinkedIn News Data File, products-data.js — Products Data File (+8 more)

### Community 22 - "Forcing Field Grid"
Cohesion: 0.12
Nodes (10): current, endIdx, F, idx, index, loads, manifestUrl, startIdx (+2 more)

### Community 23 - "Simulation Architecture"
Cohesion: 0.19
Nodes (15): data/currents.json — Forcing Data Manifest, Simulation App — UI and Orchestration, Drifter — Lagrangian Particle Tracker, LEEWAY_CATEGORIES — NOAA Leeway Catalog, OIL_TYPES — Oil Presets (drift.js lite), OilSlick — Fay Slick Spreading Helper, spawnEnsemble — Ensemble Launcher, Field — Forcing Data Loader and Sampler (+7 more)

### Community 24 - "Marine Vessels & Hardware"
Cohesion: 0.25
Nodes (15): Al-Masaha Catamaran Survey Vessel (View 1), Al-Masaha Catamaran Survey Vessel, Monohull Survey Vessel, TDL720 Data Logger (White), TEW1500 Electric Winch (View 1), TEW1500 Electric Winch (View 2), Testimonial 1 - Nakheel, NMDC, Fitness Arabia, VideoGram, Testimonial 2 - Sreenivasan Shankar, Dr. Rahman Mankettikaraa, Norstat, Adam Vistesen Port (+7 more)

### Community 25 - "Responsive UI State"
Cohesion: 0.27
Nodes (14): applyState(), bindMediaQuery(), changed(), emit(), getDensity(), getHeaderHeight(), getHeightSize(), getSize() (+6 more)

### Community 26 - "Third-Party Integrations"
Cohesion: 0.16
Nodes (15): Font Awesome 6 — Icon Library, FormSubmit — Form Delivery Service, GitHub Contents API — Publish and Sync, Leaflet.js — Interactive Map Library, Lenis — Smooth Scrolling Library, admin-github.js — Admin GitHub Integration, admin-publish.js — Admin Publish Logic, Tridel Website README (+7 more)

### Community 27 - "Service Detail Page"
Cohesion: 0.15
Nodes (12): container, galleryImages, getServiceGallery(), getServicePrimaryImage(), mainImage, metaDesc, params, service (+4 more)

### Community 28 - "Scenario Export Tools"
Cohesion: 0.23
Nodes (14): buildOpenDriftCaseConfig(), buildPygnomeScript(), clamp(), clearRun(), collectScenarioParams(), constrainedDurationHours(), hideRunProgress(), numericInputValue() (+6 more)

### Community 29 - "Data Export & Download"
Cohesion: 0.23
Nodes (12): downloadPygnomeScript(), downloadText(), exportOilBudgetCsv(), exportRunCsv(), exportRunJson(), fitMapToDataDomain(), marineTrafficViewUrl(), openMarineTrafficView() (+4 more)

### Community 30 - "Product Detail Page"
Cohesion: 0.18
Nodes (7): container, galleryImages, metaDesc, params, product, productId, thumbsHtml

### Community 31 - "Site Metrics & Analytics"
Cohesion: 0.4
Nodes (11): buildSiteMetricsSummary(), ensureSiteMetricsFile(), getDefaultSiteMetrics(), normalizeSiteMetrics(), readSiteMetrics(), recordSiteEnquiry(), recordSiteVisit(), sanitizeMetricId() (+3 more)

### Community 32 - "Navigation Buoy Products"
Cohesion: 0.31
Nodes (10): Tridel 0.75m Conical Navigation Buoy (Orange), Tridel 1.2m Conical Navigation Buoy (Red) with Light and Ballast, Tridel 1750mm Navigational Buoy (Red) with No Fishing Allowed Sign, Tridel 2.5m Navigational Buoy (Yellow) with Lattice Superstructure, Tridel 2.5m Steel Navigational Buoy (Green) with Lattice Tower and Arrow Topmark, Tridel 2.6m Navigation Buoy (Green) Pillar Type with Lattice Tower and Arrow Topmark, Tridel 3.5m Steel Navigational Buoy (Yellow) with Walkway Railing and Lattice Tower, Wind Profiler Buoy Design Exploded Diagram with Modular Sensor Payload (+2 more)

### Community 33 - "Data & Deepwater Buoys"
Cohesion: 0.36
Nodes (10): Tridel Data Buoy (CAD Model), Tridel Data Buoy (Photo), Tridel Deepwater Buoy Deployment 1, Tridel Deepwater Buoy At Sea, Tridel Deepwater Buoy Field Inspection, Tridel 12 Feet Mooring Buoy Alternate View, Tridel 12 Feet Mooring Buoy Front View, Tridel 1.2m Mooring Buoy (CAD) (+2 more)

### Community 34 - "USV & Winch Products"
Cohesion: 0.31
Nodes (10): 3TEW1500 Triple Electric Winch, TEW1500 Electric Winch, Aquilon USV Fleet (Two Vessels), Aquilon 5600 USV (Side View), Aquilon 5600 USV (Aerial View), HydroCat 550 USV, Profiling Winch (CAD Model), TriDrone USV (Yellow Catamaran) (+2 more)

### Community 36 - "Cyber-Seas Animation"
Cohesion: 0.36
Nodes (7): animateCyberWorld(), createParticle(), drawCyberBuoy(), drawEngineTrails(), drawStealthUSV(), initCyberWorld(), updateEngineTrails()

### Community 37 - "Marine Snow Animation"
Cohesion: 0.32
Nodes (3): animateHome(), initMarineSnow(), lerpColor()

### Community 38 - "Testimonials Carousel"
Cohesion: 0.46
Nodes (7): clearTimers(), getCardsPerView(), padNumber(), scrollToIndex(), setActiveCard(), startAutoplay(), syncToNearestCard()

### Community 40 - "LinkedIn Feed Prototypes"
Cohesion: 0.48
Nodes (7): Admin LinkedIn News Feed Section, LinkedIn Card Prototype — Detailed Card Concepts, fonts.css — Font Definitions, styles.css — Main Stylesheet, LinkedIn Feed Concept — Feed Layout Prototype, LinkedIn Card Gallery — Card Variation Prototypes, Aquilon 8000 — 360 USV Viewer Page

### Community 41 - "Smooth Scroll"
Cohesion: 0.4
Nodes (3): lenis, _origQS, targetId

### Community 42 - "OpenDrift Case Builder"
Cohesion: 0.4
Nodes (5): buildOpenDriftCommand(), buildValidationSummary(), copyValidationSummary(), downloadOpenDriftCase(), getScenarioLabel()

### Community 43 - "News & LinkedIn Feed"
Cohesion: 0.6
Nodes (4): bindLinkedInInteractionDismiss(), deactivateLinkedInCards(), getLinkedInPostUrl(), normalizeLinkedInNewsEmbedUrl()

### Community 44 - "Auth Design Rationale"
Cohesion: 0.4
Nodes (5): admin-auth.js — Login Gate and Browser Fallback Auth, Admin Authentication Model, Env Var: TRIDEL_ADMIN_PASSWORD_HASH (scrypt), Rationale: scrypt Hash Preferred Over Plaintext Password, Rationale: Static Fallback Auth is Intentionally Weaker

### Community 45 - "Image Upload Tools"
Cohesion: 0.5
Nodes (4): compressImage (Canvas-based), Gallery Image Manager (upload/drag-drop), showToast Notification Helper, toggleSidebar (mobile nav)

### Community 47 - "Success Stories"
Cohesion: 0.5
Nodes (3): categories, container, section

### Community 48 - "Canvas & Media Tools"
Cohesion: 0.67
Nodes (4): initBgAnimationFuture (Cyber-Seas canvas), initBgAnimation (home/uniform canvas), renderPageHeader (SPA page header), Compress Images PowerShell Script

### Community 49 - "Auth Module"
Cohesion: 0.5
Nodes (3): AdminAuth, link, style

### Community 50 - "Rate Limiting"
Cohesion: 0.5
Nodes (4): checkRateLimit(), now, recordFailedAttempt(), requireAuth()

### Community 51 - "GitHub API Helpers"
Cohesion: 0.67
Nodes (4): encodeGitHubPath(), getGitHubHeaders(), readGitHubContent(), writeGitHubContent()

### Community 52 - "Simulation Worker"
Cohesion: 0.5
Nodes (3): drifters, n, serialized

## Ambiguous Edges - Review These
- `initBgAnimationFuture (Cyber-Seas canvas)` → `Compress Images PowerShell Script`  [AMBIGUOUS]
  assets/images/products/aquilon-8000/compress_images.ps1 · relation: conceptually_related_to
- `Service Detail Page Renderer` → `Simulation App — UI and Orchestration`  [AMBIGUOUS]
  assets/js/pages/service-detail.js · relation: calls

## Knowledge Gaps
- **239 isolated node(s):** `express`, `cors`, `fs`, `path`, `crypto` (+234 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `initBgAnimationFuture (Cyber-Seas canvas)` and `Compress Images PowerShell Script`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Service Detail Page Renderer` and `Simulation App — UI and Orchestration`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **Why does `escapeHtml()` connect `Admin Form Editors` to `Admin CMS Core`, `Services Page Renderer`, `Products Page Renderer`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `renderHomeCards()` connect `Admin CMS Core` to `SPA Page Renderers`, `Admin Form Editors`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `renderHomePage()` connect `SPA Page Renderers` to `Admin CMS Core`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 32 inferred relationships involving `escapeHtml()` (e.g. with `getSingleImageFieldHTML()` and `renderSingleImagePreview()`) actually correct?**
  _`escapeHtml()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `showToast()` (e.g. with `handleFileUpload()` and `saveGitHubConfig()`) actually correct?**
  _`showToast()` has 22 INFERRED edges - model-reasoned connections that need verification._
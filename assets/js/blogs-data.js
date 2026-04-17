/**
 * Blogs / Articles Data
 * Static articles and blog posts published by Tridel Technologies.
 * Each entry renders as a card on the home page "Articles & Blogs" panel
 * and (in future) on the dedicated /articles-blogs page.
 *
 * Schema:
 *   title       — headline shown on the card
 *   excerpt     — 1-2 sentence teaser
 *   image       — cover image URL (optional, falls back to logo)
 *   url         — destination link (external blog, PDF, or internal hash route)
 *   date        — display date string (e.g. "Mar 2026")
 *   author      — optional byline
 *   tag         — short category badge (e.g. "Insight", "Case Study")
 */
var BLOGS_DATA = [
  {
    "title": "Designing Resilient Coastal Monitoring Networks",
    "excerpt": "How distributed sensor arrays and edge analytics are reshaping environmental compliance for ports and offshore developers.",
    "image": "assets/images/services/environmental-monitoring.jpg",
    "url": "#/articles-blogs",
    "date": "Mar 2026",
    "author": "Tridel Engineering",
    "tag": "Insight"
  },
  {
    "title": "Inside a Hydrographic Survey: From Plan to Deliverable",
    "excerpt": "A walkthrough of the methods, equipment, and QA workflow we use on multi-beam bathymetric surveys.",
    "image": "assets/images/services/hydrographic-surveying.jpg",
    "url": "#/articles-blogs",
    "date": "Feb 2026",
    "author": "Survey Team",
    "tag": "Case Study"
  },
  {
    "title": "Automating Air Quality Reporting for Industrial Sites",
    "excerpt": "Continuous monitoring with auto-generated regulatory reports cuts compliance overhead by 60%.",
    "image": "assets/images/services/air-quality.jpg",
    "url": "#/articles-blogs",
    "date": "Jan 2026",
    "author": "Tridel Technologies",
    "tag": "Engineering"
  }
];

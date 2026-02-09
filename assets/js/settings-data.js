const SETTINGS_DATA = {
    contactEmail: "geminibaba1@gmail.com",
    careersEmail: "geminibaba1@gmail.com"
};

/**
 * Check if a section is visible on a given page.
 * Usage: if (isSectionVisible('home', 'hero')) { ... }
 * Returns true by default (sections visible unless explicitly hidden).
 */
function isSectionVisible(page, section) {
    try {
        var vis = window.SETTINGS_DATA && window.SETTINGS_DATA.sectionVisibility;
        if (!vis || !vis[page]) return true;
        return vis[page][section] !== false;
    } catch (e) { return true; }
}

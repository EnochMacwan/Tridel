document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = toggleButton ? toggleButton.querySelector('i') : null;

    // Check for saved user preference, if any, on load of the website
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);
    } else if (systemPrefersDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateIcon('dark');
    }

    // Function to update the icon based on the current theme
    function updateIcon(theme) {
        if (!icon) return;
        // Assuming we use a sun icon for light mode (to switch to dark) 
        // and a moon icon for dark mode (to switch to light)
        // OR standard practice: Show the icon of the mode you are IN or the mode you switch TO?
        // Usually: Sun icon means "Switch to Light", Moon icon means "Switch to Dark".

        if (theme === 'dark') {
            icon.className = 'fas fa-sun'; // Show Sun to switch back to light
        } else {
            icon.className = 'fas fa-moon'; // Show Moon to switch to dark
        }
    }

    // Toggle event listener
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });
    }
});

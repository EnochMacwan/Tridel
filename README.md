# Tridel Technologies Website

Official website for Tridel Technologies, featuring a dynamic content management system and modern responsive design.

## 🚀 Features

- **Dynamic Content**: Manage Products, Services, Clients, Team, and more via JSON-based data files.
- **Admin Panel**: A comprehensive `admin.html` interface for managing all website content.
    - **Dashboard**: Real-time stats, system health checks, and quick actions.
    - **CRUD Operations**: Add, Edit, and Delete content with intuitive forms.
    - **Global Presence**: Manage office locations and map pins directly.
    - **Data Persistence**: Changes can be exported or synced via GitHub integration.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile experiences.
- **Interactive Elements**: Integrated Leaflet.js maps, dynamic sliders, and modals.

## 📂 Project Structure

- **Core Pages**:
    - `index.html`: Main landing page.
    - `admin.html`: The Content Management System (CMS).
    - `products.html`, `services.html`, `contact.html`, `about.html`: Primary site sections.

- **Data Layer (`assets/js/`)**:
    - Acts as a flat-file database.
    - `products-data.js`, `services-data.js`, `locations-data.js`, etc.
    - `*-loader.js` files handle frontend rendering logic.

- **Styles (`assets/css/`)**:
    - `styles.css`: Main stylesheet.
    - `admin.css` (embedded/separate): Styles specific to the Admin Panel.

## 🛠️ Setup & Usage

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/EnochMacwan/Tridel.git
   ```

2. **Run Locally**:
   - Simply open `index.html` in any modern web browser.
   - To manage content, open `admin.html`.

## ⚙️ Admin Panel Guide

1. **Access**: Open `admin.html`. No server-side setup required for local editing.
2. **Dashboard**: View an overview of all content and system status.
3. **Editing Content**: 
   - Navigate to a section (e.g., "Products") using the sidebar.
   - Click **"Add"** to create new items or **"Edit"** to modify existing ones.
   - Use **"Global Settings"** to update contact info and social links.
4. **Saving Changes**:
   - Changes are initially saved to the browser's local storage.
   - Use the **"Export"** or **"Publish"** buttons to generate the updated data files for the repository.

## 🌍 Global Locations
Office locations are managed via the **"Locations"** section in the Admin Panel. The Contact page uses this data to dynamically render address cards and map pins.

## 📝 License
Copyright © Tridel Technologies. All rights reserved.

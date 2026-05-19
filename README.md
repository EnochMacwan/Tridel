# Tridel Technologies Website

Official website for Tridel Technologies, featuring a dynamic content management system and modern responsive design.

## Technical Documentation

See [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) for the current stack, deployment model, admin authentication details, and server environment variable requirements.

## 🚀 Features

- **Dynamic Content**: Manage Products, Services, Clients, Team, and more via JSON-based data files.
- **Admin Panel**: A comprehensive `admin.html` interface for managing all website content.
    - **Dashboard**: Real-time stats, system health checks, and quick actions.
    - **CRUD Operations**: Add, Edit, and Delete content with intuitive forms.
    - **Global Presence**: Manage office locations and map pins directly.
    - **Data Persistence**: Changes can be exported or saved to local data files through the localhost admin server.
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

1. **Open the Project Folder**:
   ```bash
   cd Tridel
   ```

2. **Run Locally**:
   - Start the local server with `npm start`.
   - Browse the public site at `http://localhost:3000/index.html`.
   - Manage content at `http://localhost:3000/admin.html`.

## ⚙️ Admin Panel Guide

1. **Access**: Open `http://localhost:3000/admin.html`. The admin panel is intentionally disabled on deployed or remote domains.
2. **Dashboard**: View an overview of all content and system status.
3. **Editing Content**: 
   - Navigate to a section (e.g., "Products") using the sidebar.
   - Click **"Add"** to create new items or **"Edit"** to modify existing ones.
   - Use **"Global Settings"** to update contact info and social links.
4. **Saving Changes**:
   - Changes are initially drafts inside the admin session.
   - Use **"Save Local Files"** to write the updated `assets/js/*-data.js` files through the local Express API.
   - Use **"Export"** only when you want browser-downloaded copies of the current data.

## 🌍 Global Locations
Office locations are managed via the **"Locations"** section in the Admin Panel. The Contact page uses this data to dynamically render address cards and map pins.

## 📝 License
Copyright © Tridel Technologies. All rights reserved.

const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '../products');
const outputFile = path.join(__dirname, '../product_extraction.json');

// Read all files in products directory
fs.readdir(productsDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    const products = [];

    files.forEach(file => {
        if (path.extname(file) === '.html') {
            const filePath = path.join(productsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            console.log(`Processing ${file}...`);
            
            // Extract Product ID (filename without extension)
            const id = path.basename(file, '.html').replace('product-', '');

            // Extract Title
            const titleMatch = content.match(/<h1 class="detail-layout__title">\s*([\s\S]*?)\s*<\/h1>/);
            const title = titleMatch ? titleMatch[1].trim() : '';

            // Extract Description
            const descMatch = content.match(/<p class="detail-layout__description">\s*([\s\S]*?)\s*<\/p>/);
            const description = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ') : '';

            // Extract Features
            const features = [];
            const featureListMatch = content.match(/<ul class="detail-layout__list">\s*([\s\S]*?)\s*<\/ul>/);
            if (featureListMatch) {
                const listContent = featureListMatch[1];
                // Regex to find <li> content, handling newlines
                const liRegex = /<li>([\s\S]*?)<\/li>/g;
                let match;
                while ((match = liRegex.exec(listContent)) !== null) {
                    // Clean up feature text: remove tags like <strong> but maybe keep the text clean
                    // Actually, let's keep the HTML inside <li> as it might have bolding for keys
                    let featureHtml = match[1].trim().replace(/\s+/g, ' ');
                    features.push(featureHtml);
                }
            }

            // Extract Gallery Images
            const galleryImages = [];
            // Look for the gallery-thumbs container first
            const thumbsMatch = content.match(/<div class="gallery-thumbs">\s*([\s\S]*?)\s*<\/div>/);
            if (thumbsMatch) {
                const thumbsContent = thumbsMatch[1];
                const imgRegex = /<img[^>]+src="([^"]+)"/g;
                let imgMatch;
                while ((imgMatch = imgRegex.exec(thumbsContent)) !== null) {
                    // Fix relative paths: "../assets/" -> "assets/"
                    let src = imgMatch[1].replace('../', '');
                    galleryImages.push(src);
                }
            }
            
            // Fallback: If no gallery thumbs, grab main image
            if (galleryImages.length === 0) {
                 const mainImgMatch = content.match(/id="main-product-image"[^>]+src="([^"]+)"/);
                 if (mainImgMatch) {
                    galleryImages.push(mainImgMatch[1].replace('../', '')); 
                 }
            }

            products.push({
                id: id,
                file: file,
                title: title,
                longDescription: description,
                features: features,
                gallery: galleryImages
            });
        }
    });

    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
    console.log(`Extracted data for ${products.length} products to ${outputFile}`);
});

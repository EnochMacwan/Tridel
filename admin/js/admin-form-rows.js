/**
 * admin-form-rows.js
 * Inline form-row add / remove / render helpers extracted from admin.js.
 * Depends on: escapeHTML (alias in utils.js), showToast (admin.js global),
 *             window.*_DATA globals set by data files.
 * Load order: utils.js -> admin-form-rows.js -> admin.js
 */


// -- Form Image / Gallery HTML Builders --

function getSingleImageFieldHTML(label, fieldId, value) {
    return '<div class="form-group">' +
        '<label>' + label + '</label>' +
        '<div class="single-image-upload" id="container-' + fieldId + '">' +
        '<div class="image-preview-container" id="preview-' + fieldId + '">' +
        (value ? '<img src="' + escapeHTML(value) + '" alt="Preview" onerror="this.src=\'../assets/images/logo/tridel.png\'">' : '<div class="preview-placeholder">No image selected</div>') +
        '</div>' +
        '<div class="upload-controls">' +
        '<input type="text" class="form-control" id="' + fieldId + '" value="' + escapeHTML(value || '') + '" placeholder="Path or upload image...">' +
        '<button type="button" class="btn btn-secondary" onclick="document.getElementById(\'upload-' + fieldId + '\').click()">' +
        '<i class="fas fa-upload"></i> Upload</button>' +
        '<input type="file" id="upload-' + fieldId + '" accept="image/*" style="display:none" onchange="handleFileUpload(this, \'' + fieldId + '\', false)">' +
        '</div></div></div>';
}

function renderSingleImagePreview(fieldId, value) {
    var container = document.getElementById('preview-' + fieldId);
    if (container) {
        container.innerHTML = value ? '<img src="' + escapeHTML(value) + '" alt="Preview" onerror="this.src=\'../assets/images/logo/tridel.png\'">' : '<div class="preview-placeholder">No image selected</div>';
    }
}

function getGalleryHTML(images) {
    var gallery = images || [];
    return '<div class="form-group">' +
        '<label>Gallery Images <small class="text-muted-sm">(Drag to reorder)</small></label>' +
        '<div class="gallery-upload">' +
        '<div class="gallery-thumbnails" id="gallery-thumbs">' +
        (gallery.length > 0 ? gallery.map(function (img, i) {
            return '<div class="gallery-thumb" draggable="true" data-index="' + i + '">' +
                '<img src="' + escapeHTML(img) + '" alt="Image ' + (i + 1) + '" onerror="this.src=\'../assets/images/logo/tridel.png\'">' +
                '<button type="button" class="thumb-delete" onclick="removeGalleryImage(' + i + ')"><i class="fas fa-times"></i></button>' +
                '<span class="thumb-order">' + (i + 1) + '</span></div>';
        }).join('') : '<div class="gallery-empty">No images added yet</div>') +
        '</div>' +
        '<div class="gallery-add-btn" onclick="addGalleryImage()"><i class="fas fa-plus"></i> Add Path</div>' +
        '<div class="gallery-add-btn" onclick="document.getElementById(\'gallery-upload-input\').click()"><i class="fas fa-upload"></i> Upload</div>' +
        '<input type="file" id="gallery-upload-input" accept="image/*" multiple style="display:none" onchange="handleFileUpload(this, \'field-gallery\', true)">' +
        '</div>' +
        '<input type="hidden" id="field-gallery" value="' + escapeHTML(JSON.stringify(gallery)) + '">' +
        '</div>';
}


// -- Product / Service Feature Rows --

function addFeature() {
    var container = document.getElementById('features-container');
    var div = document.createElement('div');
    div.className = 'feature-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.style.alignItems = 'start';
    div.innerHTML = '<div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">' +
        '<input type="text" class="form-control feature-title" placeholder="Title (e.g. Dimensions:)">' +
        '<input type="text" class="form-control feature-desc" placeholder="Description">' +
        '</div>' +
        '<button type="button" class="btn btn-danger" style="height: fit-content; padding: 5px 10px;" onclick="this.closest(\'.feature-row\').remove()"><i class="fas fa-times"></i></button>';
    container.appendChild(div);
}

function addServiceFeature() {
    var container = document.getElementById('service-features-container');
    var div = document.createElement('div');
    div.className = 'service-feature-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = '<input type="text" class="form-control service-feature-input" placeholder="Feature description">' +
        '<button type="button" class="btn btn-danger" style="padding: 5px 10px;" onclick="this.closest(\'.service-feature-row\').remove()"><i class="fas fa-times"></i></button>';
    container.appendChild(div);
}


// -- Gallery Upload & Management --

function addGalleryImage() {
    var path = prompt('Enter image path:', 'assets/images/');
    if (!path || path.trim() === '') return;

    var galleryField = document.getElementById('field-gallery');
    var images = [];
    try { images = JSON.parse(galleryField.value) || []; } catch (e) { images = []; }

    images.push(path.trim());
    galleryField.value = JSON.stringify(images);
    renderGalleryThumbs(images);
}

function handleFileUpload(input, targetFieldId, isGallery) {
    var files = input.files;
    var fileCount = files.length;

    if (!fileCount) {
        showToast('No files selected', 'error');
        return;
    }

    var targetField = document.getElementById(targetFieldId);
    if (!targetField) {
        showToast('Target field ' + targetFieldId + ' not found', 'error');
        return;
    }

    var processed = 0;
    var processedImages = [];

    showToast('Processing ' + fileCount + ' image(s)...', 'info');

    Array.from(files).forEach(function (file) {
        compressImage(file, 800, 0.7).then(function (compressedBase64) {
            processed++;
            processedImages.push(compressedBase64);

            if (processed === fileCount) {
                if (isGallery) {
                    var existingImages = [];
                    try { existingImages = JSON.parse(targetField.value) || []; } catch (e) { existingImages = []; }

                    var newGallery = existingImages.concat(processedImages);
                    targetField.value = JSON.stringify(newGallery);
                    renderGalleryThumbs(newGallery);
                } else {
                    var val = processedImages[0];
                    targetField.value = val;
                    renderSingleImagePreview(targetFieldId, val);
                }

                input.value = '';
                showToast(fileCount + ' image(s) processed!', 'success');
            }
        }).catch(function () {
            processed++;
            showToast('Error compressing ' + file.name, 'error');
        });
    });
}

function compressImage(file, maxSize, quality) {
    maxSize = maxSize || 800;
    quality = quality || 0.7;
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = new Image();

            img.onload = function () {
                var canvas = document.createElement('canvas');
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                var compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = function () { reject(new Error('Image load failed')); };
            img.src = e.target.result;
        };

        reader.onerror = function () { reject(new Error('File read failed')); };
        reader.readAsDataURL(file);
    });
}

function removeGalleryImage(index) {
    var galleryField = document.getElementById('field-gallery');
    var images = [];
    try { images = JSON.parse(galleryField.value) || []; } catch (e) { images = []; }

    images.splice(index, 1);
    galleryField.value = JSON.stringify(images);
    renderGalleryThumbs(images);
}

function renderGalleryThumbs(images) {
    var container = document.getElementById('gallery-thumbs');
    if (!container) return;

    if (images.length === 0) {
        container.innerHTML = '<div class="gallery-empty">No images added yet</div>';
    } else {
        container.innerHTML = images.map(function (img, i) {
            return '<div class="gallery-thumb" draggable="true" data-index="' + i + '">' +
                '<img src="' + escapeHTML(img) + '" alt="Image ' + (i + 1) + '" onerror="this.src=\'../assets/images/logo/tridel.png\'">' +
                '<button type="button" class="thumb-delete" onclick="removeGalleryImage(' + i + ')"><i class="fas fa-times"></i></button>' +
                '<span class="thumb-order">' + (i + 1) + '</span></div>';
        }).join('');

        initGalleryDragDrop();
    }
}

function initGalleryDragDrop() {
    var thumbs = document.querySelectorAll('.gallery-thumb');
    var draggedEl = null;

    thumbs.forEach(function (thumb) {
        thumb.addEventListener('dragstart', function (e) {
            draggedEl = thumb;
            thumb.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        thumb.addEventListener('dragend', function () {
            thumb.classList.remove('dragging');
            document.querySelectorAll('.gallery-thumb').forEach(function (t) { t.classList.remove('drag-over'); });
            draggedEl = null;
        });

        thumb.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (draggedEl && thumb !== draggedEl) {
                thumb.classList.add('drag-over');
            }
        });

        thumb.addEventListener('dragleave', function () {
            thumb.classList.remove('drag-over');
        });

        thumb.addEventListener('drop', function (e) {
            e.preventDefault();
            thumb.classList.remove('drag-over');

            if (!draggedEl || thumb === draggedEl) return;

            var galleryField = document.getElementById('field-gallery');
            var images = [];
            try { images = JSON.parse(galleryField.value) || []; } catch (err) { images = []; }

            var fromIndex = parseInt(draggedEl.dataset.index);
            var toIndex = parseInt(thumb.dataset.index);

            var moved = images.splice(fromIndex, 1)[0];
            images.splice(toIndex, 0, moved);

            galleryField.value = JSON.stringify(images);
            renderGalleryThumbs(images);
        });
    });
}


// -- Home Page: Stats Rows --

function renderStatsRows() {
    var container = document.getElementById('content-stats-list');
    if (!container) return;
    var stats = window.INDEX_STATS || [];
    var html = '';
    stats.forEach(function (s, i) {
        html +=
            '<div class="form-group" style="display:flex; gap:10px; align-items:flex-end;" data-stat-row="' + i + '">' +
                '<div style="flex:1">' +
                    '<label>Value</label>' +
                    '<input type="number" class="form-control stat-target" value="' + (s.target || 0) + '">' +
                '</div>' +
                '<div style="width:80px;">' +
                    '<label>Suffix</label>' +
                    '<input type="text" class="form-control stat-suffix" value="' + escapeHTML(s.suffix || '') + '">' +
                '</div>' +
                '<div style="flex:1">' +
                    '<label>Label</label>' +
                    '<input type="text" class="form-control stat-label" value="' + escapeHTML(s.label || '') + '">' +
                '</div>' +
                '<button type="button" class="btn btn-danger btn-icon" onclick="removeStatRow(' + i + ')" title="Remove">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>' +
            '</div>';
    });
    container.innerHTML = html;
}

function addStatRow() {
    var stats = window.INDEX_STATS || [];
    stats.push({ target: 0, suffix: '', label: 'New Stat' });
    window.INDEX_STATS = stats;
    renderStatsRows();
}

function removeStatRow(index) {
    var stats = window.INDEX_STATS || [];
    stats.splice(index, 1);
    window.INDEX_STATS = stats;
    renderStatsRows();
}


// -- Home Page: What We Do Cards --

function renderWwdCards() {
    var container = document.getElementById('content-wwd-cards');
    if (!container) return;
    var wwd = window.INDEX_WHAT_WE_DO || {};
    var cards = wwd.cards || [];
    var html = '';
    cards.forEach(function (card, i) {
        html +=
            '<div style="background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:15px; margin-bottom:12px;" data-wwd-card="' + i + '">' +
                '<div class="form-group" style="display:flex; gap:10px; align-items:flex-end;">' +
                    '<div style="width:140px;">' +
                        '<label>Icon (FA class)</label>' +
                        '<input type="text" class="form-control wwd-icon" value="' + escapeHTML(card.icon || '') + '" placeholder="fa-microchip">' +
                    '</div>' +
                    '<div style="flex:1">' +
                        '<label>Title</label>' +
                        '<input type="text" class="form-control wwd-title" value="' + escapeHTML(card.title || '') + '">' +
                    '</div>' +
                    '<button type="button" class="btn btn-danger btn-icon" onclick="removeWwdCard(' + i + ')" title="Remove">' +
                        '<i class="fas fa-trash"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label>Description</label>' +
                    '<textarea class="form-control wwd-desc" rows="2">' + escapeHTML(card.desc || '') + '</textarea>' +
                '</div>' +
            '</div>';
    });
    container.innerHTML = html;
}

function addWwdCard() {
    var wwd = window.INDEX_WHAT_WE_DO || { title: '', subtitle: '', cards: [] };
    wwd.cards = wwd.cards || [];
    wwd.cards.push({ icon: 'fa-star', title: 'New Card', desc: '' });
    window.INDEX_WHAT_WE_DO = wwd;
    renderWwdCards();
}

function removeWwdCard(index) {
    var wwd = window.INDEX_WHAT_WE_DO || {};
    if (wwd.cards) {
        wwd.cards.splice(index, 1);
        window.INDEX_WHAT_WE_DO = wwd;
        renderWwdCards();
    }
}


// -- Home Page: Why Choose Reasons --

function renderWhyChooseReasons() {
    var container = document.getElementById('content-wc-reasons');
    if (!container) return;
    var wc = window.INDEX_WHY_CHOOSE || {};
    var reasons = wc.reasons || [];
    var html = '';
    reasons.forEach(function (r, i) {
        html +=
            '<div style="background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:15px; margin-bottom:12px;" data-wc-reason="' + i + '">' +
                '<div class="form-group" style="display:flex; gap:10px; align-items:flex-end;">' +
                    '<div style="width:140px;">' +
                        '<label>Icon (FA class)</label>' +
                        '<input type="text" class="form-control wc-icon" value="' + escapeHTML(r.icon || '') + '" placeholder="fa-handshake">' +
                    '</div>' +
                    '<div style="flex:1">' +
                        '<label>Title</label>' +
                        '<input type="text" class="form-control wc-title" value="' + escapeHTML(r.title || '') + '">' +
                    '</div>' +
                    '<button type="button" class="btn btn-danger btn-icon" onclick="removeWhyChooseReason(' + i + ')" title="Remove">' +
                        '<i class="fas fa-trash"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label>Description</label>' +
                    '<textarea class="form-control wc-desc" rows="2">' + escapeHTML(r.desc || '') + '</textarea>' +
                '</div>' +
            '</div>';
    });
    container.innerHTML = html;
}

function addWhyChooseReason() {
    var wc = window.INDEX_WHY_CHOOSE || { title: '', subtitle: '', reasons: [] };
    wc.reasons = wc.reasons || [];
    wc.reasons.push({ icon: 'fa-star', title: 'New Reason', desc: '' });
    window.INDEX_WHY_CHOOSE = wc;
    renderWhyChooseReasons();
}

function removeWhyChooseReason(index) {
    var wc = window.INDEX_WHY_CHOOSE || {};
    if (wc.reasons) {
        wc.reasons.splice(index, 1);
        window.INDEX_WHY_CHOOSE = wc;
        renderWhyChooseReasons();
    }
}


// -- Contact Page: Info Cards --

function renderContactInfoCards() {
    var container = document.getElementById('contact-info-cards-list');
    if (!container) return;
    var cards = window.CONTACT_INFO_CARDS || [];
    var html = '';
    cards.forEach(function (card, i) {
        html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">' +
            '<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">' +
                '<div style="flex:1"><label style="font-size:12px;">Icon (FA class)</label><input type="text" class="form-control" id="ci-icon-' + i + '" value="' + escapeHTML(card.icon || '') + '"></div>' +
                '<div style="flex:2"><label style="font-size:12px;">Title</label><input type="text" class="form-control" id="ci-title-' + i + '" value="' + escapeHTML(card.title || '') + '"></div>' +
                '<button type="button" class="btn btn-danger btn-sm" onclick="removeContactInfoCard(' + i + ')" style="margin-top:18px;"><i class="fas fa-trash"></i></button>' +
            '</div>' +
            '<div><label style="font-size:12px;">Detail (HTML allowed)</label><textarea class="form-control" id="ci-detail-' + i + '" rows="2">' + escapeHTML(card.detail || '') + '</textarea></div>' +
        '</div>';
    });
    container.innerHTML = html;
}

function addContactInfoCard() {
    if (!window.CONTACT_INFO_CARDS) window.CONTACT_INFO_CARDS = [];
    window.CONTACT_INFO_CARDS.push({ icon: 'fa-info-circle', title: 'New Card', detail: '' });
    renderContactInfoCards();
}

function removeContactInfoCard(index) {
    if (!confirm('Remove this info card?')) return;
    window.CONTACT_INFO_CARDS.splice(index, 1);
    renderContactInfoCards();
}


// -- Contact Page: FAQ Rows --

function renderContactFaqRows() {
    var container = document.getElementById('contact-faq-list');
    if (!container) return;
    var faqs = window.CONTACT_FAQ_DATA || [];
    var html = '';
    faqs.forEach(function (faq, i) {
        html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">' +
            '<div style="display:flex;gap:10px;align-items:start;">' +
                '<div style="flex:1">' +
                    '<label style="font-size:12px;">Question</label><input type="text" class="form-control" id="faq-q-' + i + '" value="' + escapeHTML(faq.question || '') + '">' +
                    '<label style="font-size:12px;margin-top:8px;">Answer</label><textarea class="form-control" id="faq-a-' + i + '" rows="3">' + escapeHTML(faq.answer || '') + '</textarea>' +
                '</div>' +
                '<button type="button" class="btn btn-danger btn-sm" onclick="removeContactFaq(' + i + ')" style="margin-top:18px;"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    container.innerHTML = html;
}

function addContactFaq() {
    if (!window.CONTACT_FAQ_DATA) window.CONTACT_FAQ_DATA = [];
    window.CONTACT_FAQ_DATA.push({ question: '', answer: '' });
    renderContactFaqRows();
}

function removeContactFaq(index) {
    if (!confirm('Remove this FAQ?')) return;
    window.CONTACT_FAQ_DATA.splice(index, 1);
    renderContactFaqRows();
}


// -- Contact Page: Config Editor --

function formatConfigLabel(key) {
    // camelCase → Title Case with spaces
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (s) { return s.toUpperCase(); });
}

function renderContactConfigEditor() {
    var container = document.getElementById('contact-config-editor');
    if (!container) return;
    var config = window.CONTACT_PAGE_CONFIG || {};
    var html = '';
    var keys = Object.keys(config);

    keys.forEach(function (key) {
        // Skip offices — managed by Locations tab
        if (key === 'offices') return;

        var val = config[key];
        var label = formatConfigLabel(key);

        if (Array.isArray(val)) {
            // Array of strings → textarea, one per line
            html += '<div style="margin-bottom:16px;">' +
                '<label style="font-weight:600;font-size:13px;display:block;margin-bottom:4px;">' + escapeHTML(label) + '</label>' +
                '<textarea class="form-control" id="cfg-' + escapeHTML(key) + '" rows="4" ' +
                    'placeholder="One item per line" style="font-size:13px;">' + escapeHTML(val.join('\n')) + '</textarea>' +
                '<small style="color:var(--text-secondary);">One item per line</small>' +
            '</div>';
        } else if (typeof val === 'object' && val !== null) {
            // Object → bordered sub-card with fields for each sub-key
            html += '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:16px;">' +
                '<label style="font-weight:600;font-size:13px;display:block;margin-bottom:8px;">' + escapeHTML(label) + '</label>';
            var subKeys = Object.keys(val);
            subKeys.forEach(function (sk) {
                var sv = val[sk];
                var fieldId = 'cfg-' + key + '-' + sk;
                html += '<div style="margin-bottom:8px;">' +
                    '<label style="font-size:12px;color:var(--text-secondary);">' + escapeHTML(formatConfigLabel(sk)) + '</label>' +
                    '<input type="text" class="form-control" id="' + escapeHTML(fieldId) + '" value="' + escapeHTML(String(sv || '')) + '">' +
                '</div>';
            });
            html += '</div>';
        } else {
            // String / number → simple text input
            html += '<div style="margin-bottom:16px;">' +
                '<label style="font-weight:600;font-size:13px;display:block;margin-bottom:4px;">' + escapeHTML(label) + '</label>' +
                '<input type="text" class="form-control" id="cfg-' + escapeHTML(key) + '" value="' + escapeHTML(String(val || '')) + '">' +
            '</div>';
        }
    });

    if (!html) {
        html = '<p style="color:var(--text-secondary);font-size:13px;">No page configuration found.</p>';
    }
    container.innerHTML = html;
}


// -- Navigation / Mega Menu / Footer --

function loadNavigationToForm() {
    ensureMegaMenuConfig();
    renderNavLinksEditor();
    renderMegaMenuEditor();
    renderFooterEditor();
    renderPageSeoEditor();
}

function deepCloneData(value) {
    return JSON.parse(JSON.stringify(value));
}

function getDefaultMegaMenuConfig() {
    return {
        products: {
            columns: [
                { key: 'Buoys', title: 'Buoys', icon: 'fas fa-life-ring' },
                { key: 'Vessels', title: 'Vessels', icon: 'fas fa-ship' },
                { key: 'Equipment', title: 'Equipment', icon: 'fas fa-screwdriver-wrench' },
                { key: 'Software', title: 'Software', icon: 'fas fa-laptop-code' },
                { key: 'Integrated Solutions', title: 'Integrated Solutions', icon: 'fas fa-layer-group' }
            ],
            spotlight: {
                tag: 'Featured',
                title: 'Tridel Aquilon 8000',
                description: 'Our flagship carbon fiber USV for advanced autonomous hydrographic surveys.',
                link: '#/products/detail?id=aquilon-8000',
                buttonText: 'Learn More',
                image: 'assets/images/products/aquilon-8000/aquilon-8000-01.jpg'
            }
        },
        services: {
            columns: [
                { key: 'Environmental Monitoring', title: 'Environmental Monitoring', icon: 'fas fa-satellite-dish', excludeSubcategories: [] },
                { key: 'Environmental Surveying', title: 'Environmental Surveying', icon: 'fas fa-map-marked-alt', excludeSubcategories: ['Geoscience Studies'] }
            ],
            spotlight: {
                tag: 'Featured',
                title: 'Comprehensive Solutions',
                description: 'End-to-end expertise from feasibility to real-time monitoring.',
                link: '#/services',
                buttonText: 'Learn More',
                image: 'assets/images/services/port-monitoring.png'
            }
        }
    };
}

function normalizeMegaMenuConfig(config) {
    var defaults = getDefaultMegaMenuConfig();
    var merged = deepCloneData(defaults);

    ['products', 'services'].forEach(function (scope) {
        var source = config && config[scope] ? config[scope] : {};
        var defaultSection = defaults[scope];
        var defaultColumnsByKey = {};

        defaultSection.columns.forEach(function (column) {
            defaultColumnsByKey[column.key] = column;
        });

        if (Array.isArray(source.columns) && source.columns.length) {
            merged[scope].columns = source.columns.map(function (column, index) {
                var fallback = defaultColumnsByKey[column.key] || defaultSection.columns[index] || {};
                return Object.assign({}, fallback, column);
            });
        }

        if (source.spotlight && typeof source.spotlight === 'object') {
            merged[scope].spotlight = Object.assign({}, defaultSection.spotlight, source.spotlight);
        }
    });

    return merged;
}

function ensureMegaMenuConfig() {
    window.MEGA_MENU_CONFIG = normalizeMegaMenuConfig(window.MEGA_MENU_CONFIG);
    return window.MEGA_MENU_CONFIG;
}

function renderNavLinksEditor() {
    var container = document.getElementById('nav-links-list');
    if (!container) return;
    var links = window.NAV_LINKS || [];
    var html = '';
    links.forEach(function (link, i) {
        html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">' +
            '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">' +
                '<div style="flex:2"><label style="font-size:12px;">Label</label><input type="text" class="form-control" id="nav-label-' + i + '" value="' + escapeHTML(link.label || '') + '"></div>' +
                '<div style="flex:2"><label style="font-size:12px;">Href</label><input type="text" class="form-control" id="nav-href-' + i + '" value="' + escapeHTML(link.href || '') + '"></div>' +
                '<div style="flex:1"><label style="font-size:12px;">Icon</label><input type="text" class="form-control" id="nav-icon-' + i + '" value="' + escapeHTML(link.icon || '') + '"></div>' +
                '<div style="flex:1"><label style="font-size:12px;">Short Label</label><input type="text" class="form-control" id="nav-short-label-' + i + '" value="' + escapeHTML(link.shortLabel || '') + '"></div>' +
                '<button type="button" class="btn btn-danger btn-sm" onclick="removeNavLinkItem(' + i + ')" style="margin-top:18px;"><i class="fas fa-trash"></i></button>' +
            '</div>' +
            '<div style="display:flex;gap:18px;align-items:flex-end;flex-wrap:wrap;margin-top:12px;">' +
                '<div style="min-width:170px;"><label style="font-size:12px;">Mega Menu Class</label><input type="text" class="form-control" id="nav-mega-class-' + i + '" value="' + escapeHTML(link.megaMenuClass || '') + '" placeholder="mm-products"></div>' +
                '<div style="min-width:170px;"><label style="font-size:12px;">Custom CSS Class</label><input type="text" class="form-control" id="nav-custom-class-' + i + '" value="' + escapeHTML(link.customClass || '') + '" placeholder="e.g. nav-cta-hormuz"></div>' +
                '<label style="display:flex;align-items:center;gap:8px;margin:0 0 8px;"><input type="checkbox" id="nav-has-mega-' + i + '" ' + (link.hasMegaMenu ? 'checked' : '') + '> Has Mega Menu</label>' +
                '<label style="display:flex;align-items:center;gap:8px;margin:0 0 8px;"><input type="checkbox" id="nav-chevron-' + i + '" ' + (link.chevron ? 'checked' : '') + '> Show Chevron</label>' +
                '<label style="display:flex;align-items:center;gap:8px;margin:0 0 8px;"><input type="checkbox" id="nav-external-' + i + '" ' + (link.external ? 'checked' : '') + '> External Link</label>' +
            '</div>' +
        '</div>';
    });
    container.innerHTML = html;
}

function addNavLink() {
    if (!window.NAV_LINKS) window.NAV_LINKS = [];
    window.NAV_LINKS.push({ label: 'New Link', href: '#/', icon: 'fa-link', key: '/', hasMegaMenu: false, megaMenuClass: '', chevron: false });
    renderNavLinksEditor();
}

function removeNavLinkItem(index) {
    if (!confirm('Remove this nav link?')) return;
    window.NAV_LINKS.splice(index, 1);
    renderNavLinksEditor();
}

function renderMegaMenuEditor() {
    var container = document.getElementById('mega-menu-editor');
    if (!container) return;

    var config = ensureMegaMenuConfig();
    container.innerHTML = [
        renderMegaMenuScopeEditor('products', 'Products', config.products),
        renderMegaMenuScopeEditor('services', 'Services', config.services)
    ].join('');
}

function renderMegaMenuScopeEditor(scopeKey, label, config) {
    var html = '<div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:16px;background:var(--bg-secondary);">' +
        '<h4 style="margin:0 0 16px;font-size:16px;">' + escapeHTML(label) + ' Mega Menu</h4>' +
        '<div style="display:grid;gap:12px;">';

    (config.columns || []).forEach(function (column, index) {
        html += '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--card-bg);">' +
            '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Source Group: ' + escapeHTML(column.key || '') + '</div>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
                '<div style="flex:2;min-width:180px;"><label style="font-size:12px;">Column Title</label><input type="text" class="form-control" id="mega-' + scopeKey + '-col-title-' + index + '" value="' + escapeHTML(column.title || '') + '"></div>' +
                '<div style="flex:1;min-width:180px;"><label style="font-size:12px;">Icon Class</label><input type="text" class="form-control" id="mega-' + scopeKey + '-col-icon-' + index + '" value="' + escapeHTML(column.icon || '') + '" placeholder="fas fa-ship"></div>' +
            '</div>';

        if (Array.isArray(column.excludeSubcategories) && column.excludeSubcategories.length) {
            html += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;">Excluded subcategories: ' + escapeHTML(column.excludeSubcategories.join(', ')) + '</div>';
        }

        html += '</div>';
    });

    html += '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--card-bg);">' +
        '<h5 style="margin:0 0 12px;font-size:14px;">Spotlight Card</h5>' +
        '<div style="display:grid;gap:10px;">' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
                '<div style="flex:1;min-width:150px;"><label style="font-size:12px;">Tag</label><input type="text" class="form-control" id="mega-' + scopeKey + '-spotlight-tag" value="' + escapeHTML((config.spotlight || {}).tag || '') + '"></div>' +
                '<div style="flex:2;min-width:220px;"><label style="font-size:12px;">Title</label><input type="text" class="form-control" id="mega-' + scopeKey + '-spotlight-title" value="' + escapeHTML((config.spotlight || {}).title || '') + '"></div>' +
            '</div>' +
            '<div><label style="font-size:12px;">Description</label><textarea class="form-control" id="mega-' + scopeKey + '-spotlight-description" rows="3">' + escapeHTML((config.spotlight || {}).description || '') + '</textarea></div>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
                '<div style="flex:2;min-width:220px;"><label style="font-size:12px;">Link</label><input type="text" class="form-control" id="mega-' + scopeKey + '-spotlight-link" value="' + escapeHTML((config.spotlight || {}).link || '') + '"></div>' +
                '<div style="flex:1;min-width:150px;"><label style="font-size:12px;">Button Text</label><input type="text" class="form-control" id="mega-' + scopeKey + '-spotlight-button-text" value="' + escapeHTML((config.spotlight || {}).buttonText || '') + '"></div>' +
            '</div>' +
            '<div><label style="font-size:12px;">Image Path</label><input type="text" class="form-control" id="mega-' + scopeKey + '-spotlight-image" value="' + escapeHTML((config.spotlight || {}).image || '') + '"></div>' +
        '</div>' +
    '</div>' +
    '</div></div>';

    return html;
}

function renderFooterEditor() {
    var data = window.FOOTER_DATA || {};
    var el;
    el = document.getElementById('footer-tagline'); if (el) el.value = data.tagline || '';
    el = document.getElementById('footer-linkedin'); if (el) el.value = data.linkedIn || '';
    el = document.getElementById('footer-copyright'); if (el) el.value = data.copyright || '';

    // Quick links
    var qlContainer = document.getElementById('footer-quick-links-list');
    if (qlContainer) {
        var qlHtml = '';
        (data.quickLinks || []).forEach(function (link, i) {
            qlHtml += '<div style="display:flex;gap:10px;margin-bottom:8px;align-items:center;">' +
                '<input type="text" class="form-control" id="fql-label-' + i + '" value="' + escapeHTML(link.label || '') + '" placeholder="Label">' +
                '<input type="text" class="form-control" id="fql-href-' + i + '" value="' + escapeHTML(link.href || '') + '" placeholder="Href">' +
                '<button type="button" class="btn btn-danger btn-sm" onclick="removeFooterLink(\'quick\',' + i + ')"><i class="fas fa-trash"></i></button>' +
            '</div>';
        });
        qlContainer.innerHTML = qlHtml;
    }

    // Company links
    var clContainer = document.getElementById('footer-company-links-list');
    if (clContainer) {
        var clHtml = '';
        (data.companyLinks || []).forEach(function (link, i) {
            clHtml += '<div style="display:flex;gap:10px;margin-bottom:8px;align-items:center;">' +
                '<input type="text" class="form-control" id="fcl-label-' + i + '" value="' + escapeHTML(link.label || '') + '" placeholder="Label">' +
                '<input type="text" class="form-control" id="fcl-href-' + i + '" value="' + escapeHTML(link.href || '') + '" placeholder="Href">' +
                '<button type="button" class="btn btn-danger btn-sm" onclick="removeFooterLink(\'company\',' + i + ')"><i class="fas fa-trash"></i></button>' +
            '</div>';
        });
        clContainer.innerHTML = clHtml;
    }
}

function addFooterLink(group) {
    if (!window.FOOTER_DATA) window.FOOTER_DATA = {};
    var key = group === 'quick' ? 'quickLinks' : 'companyLinks';
    if (!window.FOOTER_DATA[key]) window.FOOTER_DATA[key] = [];
    window.FOOTER_DATA[key].push({ label: 'New Link', href: '#/' });
    renderFooterEditor();
}

function removeFooterLink(group, index) {
    var key = group === 'quick' ? 'quickLinks' : 'companyLinks';
    if (window.FOOTER_DATA && window.FOOTER_DATA[key]) {
        window.FOOTER_DATA[key].splice(index, 1);
        renderFooterEditor();
    }
}

function renderPageSeoEditor() {
    var container = document.getElementById('page-seo-list');
    if (!container) return;
    var meta = window.PAGE_META || {};
    var html = '';
    Object.keys(meta).forEach(function (route) {
        var entry = meta[route];
        var safeRoute = escapeHTML(route);
        var inputId = route.replace(/[^a-zA-Z0-9]/g, '_');
        html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">' +
            '<h4 style="margin:0 0 10px;font-size:14px;color:var(--accent);"><i class="fas fa-route"></i> ' + safeRoute + '</h4>' +
            '<div class="form-group"><label style="font-size:12px;">Title</label><input type="text" class="form-control" id="seo-title-' + inputId + '" value="' + escapeHTML(entry.title || '') + '"></div>' +
            '<div class="form-group"><label style="font-size:12px;">Description</label><textarea class="form-control" id="seo-desc-' + inputId + '" rows="2">' + escapeHTML(entry.description || '') + '</textarea></div>' +
        '</div>';
    });
    container.innerHTML = html;
}


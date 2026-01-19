
import os
import re

def replace_surveys(directory):
    # Pattern for Mega Menu
    # <span class="mega-category"><i class="fa-solid fa-map-location-dot"></i> Surveys</span>
    # Handles whitespace around "Surveys"
    menu_pattern = re.compile(
        r'(<span class="mega-category">\s*<i class="fa-solid fa-map-location-dot"></i>\s*)Surveys(\s*</span>)',
        re.IGNORECASE | re.DOTALL
    )

    # Pattern for Section Headers (services.html, success-stories.html)
    # <h2 class="section__title">Surveys</h2>
    # <h2 class="product-category__title">Surveys</h2>
    header_pattern = re.compile(
        r'(<h2 class="(?:section__title|product-category__title)">\s*)Surveys(\s*</h2>)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Pattern for Index Card (Survey & Monitoring Services) - Optional but good for consistency
    # Survey & Monitoring Services -> Environmental Surveying & Monitoring Services
    index_card_pattern = re.compile(
        r'(<h3 class="card__title">\s*)Survey & Monitoring Services(\s*</h3>)',
        re.IGNORECASE | re.DOTALL
    )

    count = 0
    files_modified = 0

    for root, dirs, files in os.walk(directory):
        for file in files:
            if not file.endswith(".html"):
                continue
            
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                
                # Apply Menu Replacement
                new_content, n = menu_pattern.subn(r'\1Environmental Surveying\2', new_content)
                if n > 0:
                    print(f"Replaced {n} menu items in {filepath}")
                
                # Apply Header Replacement
                new_content, m = header_pattern.subn(r'\1Environmental Surveying\2', new_content)
                if m > 0:
                    print(f"Replaced {m} headers in {filepath}")

                # Apply Index Card Replacement
                new_content, k = index_card_pattern.subn(r'\1Environmental Surveying & Monitoring Services\2', new_content)
                if k > 0:
                    print(f"Replaced {k} index card titles in {filepath}")
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += (n + m + k)
                    files_modified += 1
            
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

    print(f"\nTotal replacements: {count}")
    print(f"Total files modified: {files_modified}")

if __name__ == "__main__":
    target_dir = os.getcwd() # Run in current directory
    print(f"Scanning directory: {target_dir}")
    replace_surveys(target_dir)

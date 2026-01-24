$path = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main\services\geoengineering.html"
$content = Get-Content $path -Raw

# Replace bms.png in product-item__image
$content = $content -replace '(<img[^>]*class="product-item__image[^"]*"[^>]*src=")([^"]*bms.png)(")', '${1}../assets/images/services/bm2s.png${3}'

# Replace port-monitoring.png in product-item__image
$content = $content -replace '(<img[^>]*class="product-item__image[^"]*"[^>]*src=")([^"]*port-monitoring.png)(")', '${1}../assets/images/services/bm2s.png${3}'

# Replace met-ocean-study.png in product-item__image
$content = $content -replace '(<img[^>]*class="product-item__image[^"]*"[^>]*src=")([^"]*met-ocean-study.png)(")', '${1}../assets/images/services/bm2s.png${3}'

Set-Content $path $content
Write-Host "Updated geoengineering.html"

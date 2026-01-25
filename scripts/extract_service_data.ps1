# Script to extract data from Service HTML files
$servicesDir = Join-Path $PSScriptRoot "..\services"
$outputFile = Join-Path $PSScriptRoot "..\services_extraction.json"

$services = @()

$files = Get-ChildItem -Path $servicesDir -Filter "*.html"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Extract ID from filename (e.g. hydrography.html -> hydrography)
    $id = $file.BaseName
    
    # Extract Title using Regex
    $title = "Unknown"
    if ($content -match '<h1 class="detail-layout__title">\s*([\s\S]*?)\s*</h1>') {
        $title = $matches[1].Trim()
    }
    
    # Extract Description
    $description = ""
    if ($content -match '<p class="detail-layout__description">\s*([\s\S]*?)\s*</p>') {
        $description = $matches[1].Trim() -replace '\s+', ' '
    }
    
    # Extract Image
    $image = ""
    if ($content -match 'id="main-product-image"\s*src="([^"]+)"') {
        $image = $matches[1] -replace '\.\./', '' # Remove leading ../
    }
    elseif ($content -match 'src="([^"]+)"\s*alt="[^"]*"\s*class="product-image-style"') {
        $image = $matches[1] -replace '\.\./', ''
    }

    # Extract Features (Capabilities)
    $features = @()
    if ($content -match 'class="detail-layout__list">([\s\S]*?)</ul>') {
        $listBlock = $matches[1]
        $featureMatches = [regex]::Matches($listBlock, '<li>(.*?)</li>')
        foreach ($m in $featureMatches) {
            $cleanFeature = $m.Groups[1].Value -replace '<strong>|</strong>', ''
            $features += $cleanFeature.Trim()
        }
    }
    
    # Determine Category (Simple Heuristic or Manual Mapping later)
    # Based on existing menu:
    # "Environmental Monitoring": MetOcean, Atmospheric, Air Quality, Water Quality, Ground Water
    # "Environmental Surveying": Hydrography, UXO, GeoEngineering, Navigational, Topographic
    
    $category = "Environmental Surveying" # Default
    if ($title -match "Monitoring|Quality|Noise|Ground Water") {
        $category = "Environmental Monitoring"
    }
    
    $services += @{
        id          = $id
        name        = $title
        category    = $category
        description = $description
        image       = $image
        features    = $features
        link        = "service-detail.html?id=$id"
    }
}

$services | ConvertTo-Json -Depth 5 | Set-Content -Path $outputFile
Write-Host "Extracted $($services.Count) services to $outputFile"

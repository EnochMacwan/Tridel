$extractedFile = Join-Path $PSScriptRoot "..\product_extraction.json"
$existingFile = Join-Path $PSScriptRoot "..\assets\js\products-data.js"
$outputFile = Join-Path $PSScriptRoot "..\assets\js\products-data.js" # Overwrite

$extractedData = Get-Content -Path $extractedFile -Raw | ConvertFrom-Json

# Existing Data (Manually keying in important metadata from the file view)
$existingMetadata = @{
    "coastal-buoy"        = @{ category = "Buoys"; isNew = $false };
    "data-buoy"           = @{ category = "Buoys" };
    "nav-buoy"            = @{ category = "Buoys" };
    "wind-farm-buoy"      = @{ category = "Buoys" };
    "mooring-buoy"        = @{ category = "Buoys" };
    "deepwater-buoy"      = @{ category = "Buoys" };
    "drifter-buoy"        = @{ category = "Buoys" };
    "sub-floats"          = @{ category = "Buoys" };
    "aquilon-8000"        = @{ category = "Vessels"; isNew = $true };
    "aquilon-5600a"       = @{ category = "Vessels" }; # Note mapping id
    "aquilon-5600"        = @{ category = "Vessels" }; # Old ID mapping?
    "monohull-vessel"     = @{ category = "Vessels" };
    "monohull"            = @{ category = "Vessels" };
    "catamaran-vessel"    = @{ category = "Vessels" };
    "catamaran"           = @{ category = "Vessels" };
    "tew500"              = @{ category = "Equipment" };
    "tew1500"             = @{ category = "Equipment" };
    "tdl720"              = @{ category = "Equipment" };
    "mooring-frame"       = @{ category = "Equipment" };
    "tems"                = @{ category = "Software" };
    "especia"             = @{ category = "Software" };
    "tacs-software"       = @{ category = "Software" };
    "tacs"                = @{ category = "Software" };
    "drifter-track"       = @{ category = "Software" };
    "t-sms"               = @{ category = "Software" };
    "tsms"                = @{ category = "Software" };
    "attide"              = @{ category = "Software" };
    "geodb"               = @{ category = "Integrated Solutions" };
    "beach-ms"            = @{ category = "Integrated Solutions" };
    "port-ms"             = @{ category = "Integrated Solutions" };
    "ecfs"                = @{ category = "Integrated Solutions" };
    "aqms"                = @{ category = "Integrated Solutions" };
    "forecasting-systems" = @{ category = "Integrated Solutions" };
    "forecasting"         = @{ category = "Integrated Solutions" };
}

$finalList = @()

foreach ($item in $extractedData) {
    $id = $item.id
    
    # Defaults
    $category = "Uncategorized"
    $isNew = $false 
    
    # 1. Try exact match
    if ($existingMetadata.ContainsKey($id)) {
        $meta = $existingMetadata[$id]
        $category = $meta.category
        if ($meta.isNew) { $isNew = $true }
    }
    else {
        # 2. Heuristic Categorization
        $lowerTitle = $item.title.ToLower()
        $lowerId = $id.ToLower()
        
        if ($lowerTitle -match "buoy|float") { $category = "Buoys" }
        elseif ($lowerTitle -match "vessel|boat|aquilon") { $category = "Vessels" }
        elseif ($lowerTitle -match "winch|logger|frame|mount") { $category = "Equipment" }
        elseif ($lowerTitle -match "software|gis|tracking|platform|sytem|analysis") { 
            # Differentiate Integrated Solutions vs Software
            if ($lowerTitle -match "monitoring system") { $category = "Integrated Solutions" } 
            else { $category = "Software" }
        }
    }
    
    # Construct final object
    $finalObj = @{
        id              = $id
        name            = $item.title
        category        = $category
        description     = $item.longDescription # Using the long description as main summary
        longDescription = $item.longDescription # Redundant but explicit? Loader can use description.
        image           = if ($item.gallery.Count -gt 0) { $item.gallery[0] } else { "" }
        link            = "product-detail.html?id=$id" # Pointing to new template!
        features        = $item.features
        gallery         = $item.gallery
    }
    
    if ($isNew) { $finalObj["isNew"] = $true }
    
    $finalList += $finalObj
}

# Generate JS Content
$jsonString = $finalList | ConvertTo-Json -Depth 10
$jsContent = "const productsData = $jsonString;" + [Environment]::NewLine + 
"// Spotlight/Featured Product Configuration (Preserved)" + [Environment]::NewLine +
"const featuredProduct = {" + [Environment]::NewLine +
"    title: 'Next-Gen Autonomous Solutions'," + [Environment]::NewLine +
"    description: 'Discover how our hybrid USVs are redefining data acquisition.'," + [Environment]::NewLine +
"    link: 'products.html'," + [Environment]::NewLine +
"    buttonText: 'View All Products'," + [Environment]::NewLine +
"    image: 'assets/images/products/aquilon-8000/aquilon-8000-new.png'," + [Environment]::NewLine +
"    tag: 'Featured'" + [Environment]::NewLine +
"};"

Set-Content -Path $outputFile -Value $jsContent
Write-Host "Merged data written to $outputFile"

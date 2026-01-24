$servicesDir = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main\services"

$imageMap = @{
    "air-quality.html"           = "../assets/images/services/eddy-covariance-flux-system.png"
    "atmospheric-noise.html"     = "../assets/images/products/data-buoy/TDB3000 - PROFILLING BUOY/DataBuoy.png"
    "geoinformatics.html"        = "../assets/images/services/geodatabase-illustration.png"
    "geoscience.html"            = "../assets/images/services/met-ocean-study.png"
    "gravity-coring.html"        = "../assets/images/services/bm2s.png"
    "ground-water.html"          = "../assets/images/services/geodatabase-illustration.png"
    "hydrography.html"           = "../assets/images/services/port-monitoring.png"
    "marine-boreholes.html"      = "../assets/images/services/bm2s.png"
    "navigational-charting.html" = "../assets/images/services/electronic-maps.png"
    "uxo-survey.html"            = "../assets/images/services/electronic-maps.png"
    "vibro-coring.html"          = "../assets/images/services/bm2s.png"
    "water-quality.html"         = "../assets/images/products/coastal-buoy/TCB1000- WAVE BUOY/TCB.jpg"
    # geoengineering.html excluded for manual handling due to multiple images/structure
}

foreach ($fileName in $imageMap.Keys) {
    $filePath = Join-Path $servicesDir $fileName
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $newImage = $imageMap[$fileName]
        
        # Regex to find the main product image. 
        # Pattern looks for id="main-product-image" and replaces its src.
        
        $pattern = '(<img[^>]*id="main-product-image"[^>]*src=")([^"]+)("[^>]*>)'
        
        if ($content -match $pattern) {
            # Use backticks to escape $1 and $3 so they are passed to regex engine, 
            # while $newImage is interpolated by PowerShell.
            $content = $content -replace $pattern, "`$1$newImage`$3"
            Set-Content -Path $filePath -Value $content
            Write-Host "Updated $fileName with image $newImage"
        }
        else {
            $pattern2 = '(<img[^>]*src=")([^"]+)("[^>]*id="main-product-image"[^>]*>)'
            if ($content -match $pattern2) {
                $content = $content -replace $pattern2, "`$1$newImage`$3"
                Set-Content -Path $filePath -Value $content
                Write-Host "Updated $fileName with image $newImage (Alt Pattern)"
            }
            else {
                Write-Warning "Could not find main-product-image in $fileName"
            }
        }
    }
    else {
        Write-Warning "File not found: $fileName"
    }
}

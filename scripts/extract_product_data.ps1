$productsDir = Join-Path $PSScriptRoot "..\products"
$outputFile = Join-Path $PSScriptRoot "..\product_extraction.json"

$files = Get-ChildItem -Path $productsDir -Filter "*.html"
$products = @()

foreach ($file in $files) {
    Write-Host "Processing $($file.Name)..."
    $content = Get-Content -Path $file.FullName -Raw

    $id = $file.BaseName -replace "product-", ""
    
    # Extract Title
    $title = ""
    if ($content -match '<h1 class="detail-layout__title">\s*([\s\S]*?)\s*<\/h1>') {
        $title = $Matches[1].Trim()
    }

    # Extract Description
    $description = ""
    if ($content -match '<p class="detail-layout__description">\s*([\s\S]*?)\s*<\/p>') {
        $description = $Matches[1].Trim() -replace '\s+', ' '
    }

    # Extract Features
    $features = @()
    if ($content -match '<ul class="detail-layout__list">\s*([\s\S]*?)\s*<\/ul>') {
        $listContent = $Matches[1]
        $liMatches = [regex]::Matches($listContent, '<li>([\s\S]*?)<\/li>')
        foreach ($match in $liMatches) {
            $featureText = $match.Groups[1].Value.Trim() -replace '\s+', ' '
            $features += $featureText
        }
    }

    # Extract Gallery
    $gallery = @()
    if ($content -match '<div class="gallery-thumbs">\s*([\s\S]*?)\s*<\/div>') {
        $thumbsContent = $Matches[1]
        $imgMatches = [regex]::Matches($thumbsContent, '<img[^>]+src="([^"]+)"')
        foreach ($match in $imgMatches) {
            $src = $match.Groups[1].Value -replace '\.\./', ''
            $gallery += $src
        }
    }

    # Fallback to main image if no gallery
    if ($gallery.Count -eq 0) {
        if ($content -match 'id="main-product-image"[^>]+src="([^"]+)"') {
            $src = $Matches[1] -replace '\.\./', ''
            $gallery += $src
        }
    }

    $products += @{
        id              = $id
        file            = $file.Name
        title           = $title
        longDescription = $description
        features        = $features
        gallery         = $gallery
    }
}

$json = $products | ConvertTo-Json -Depth 5
Set-Content -Path $outputFile -Value $json
Write-Host "Extracted $($products.Count) products to $outputFile"

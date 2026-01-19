
$targetDir = Get-Location
$count = 0
$filesModified = 0

# Define patterns
# Note: PowerShell regex is slightly different but standard .NET regex
# Escaping double quotes with backtick ` or just use single quotes for the string

$menuPattern = '(<span class="mega-category">\s*<i class="fa-solid fa-map-location-dot"></i>\s*)Surveys(\s*</span>)'
$headerPattern = '(<h2 class="(?:section__title|product-category__title)">\s*)Surveys(\s*</h2>)'
$indexCardPattern = '(<h3 class="card__title">\s*)Survey & Monitoring Services(\s*</h3>)'

Get-ChildItem -Path $targetDir -Recurse -Filter *.html | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8

    $originalContent = $content
    $modified = $false
    
    # Apply Menu Replacement
    if ($content -match $menuPattern) {
        $content = $content -replace $menuPattern, '$1Environmental Surveying$2'
        $modified = $true
    }

    # Apply Header Replacement
    if ($content -match $headerPattern) {
        $content = $content -replace $headerPattern, '$1Environmental Surveying$2'
        $modified = $true
    }

    # Apply Index Card Replacement
    if ($content -match $indexCardPattern) {
        $content = $content -replace $indexCardPattern, '$1Environmental Surveying & Monitoring Services$2'
        $modified = $true
    }

    if ($modified) {
        $content | Set-Content -Path $filePath -Encoding UTF8 -NoNewline
        Write-Host "Modified: $filePath"
        $filesModified++
    }
}

Write-Host "`nTotal files modified: $filesModified"

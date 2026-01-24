$rootDir = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main"
$report = @()

# Function to resolve path
function Resolve-LinkPath ($currentFile, $link) {
    if ([string]::IsNullOrWhiteSpace($link) -or $link.StartsWith("#") -or $link.StartsWith("http") -or $link.StartsWith("mailto:")) {
        return $null
    }

    $currentDir = Split-Path $currentFile -Parent
    
    # Strip anchor and query
    if ($link -match "[#\?]") {
        $link = $link -split "[#\?]" | Select-Object -First 1
    }
    
    if ([string]::IsNullOrWhiteSpace($link)) { return $null }

    if ($link.StartsWith("/")) {
        # Assuming root relative to website root
        $resolvedPath = Join-Path $rootDir $link.TrimStart("/")
    }
    else {
        $resolvedPath = Join-Path $currentDir $link
    }
    
    return [System.IO.Path]::GetFullPath($resolvedPath)
}

Write-Host "Starting audit..."

Get-ChildItem -Path $rootDir -Filter *.html -Recurse | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw
    
    # 1. Check duplicate IDs
    $ids = [regex]::Matches($content, 'id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    $groupedIds = $ids | Group-Object
    foreach ($g in $groupedIds) {
        if ($g.Count -gt 1) {
            $report += [PSCustomObject]@{
                File    = $file.Name
                Type    = "Duplicate ID"
                Details = "ID '$($g.Name)' appears $($g.Count) times"
            }
        }
    }

    # 2. Check Links (href)
    $links = [regex]::Matches($content, 'href="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    foreach ($link in $links) {
        $path = Resolve-LinkPath -currentFile $file.FullName -link $link
        if ($path -and -not (Test-Path $path)) {
            $report += [PSCustomObject]@{
                File    = $file.Name
                Type    = "Broken Link"
                Details = "href='$link' not found"
            }
        }
    }

    # 3. Check Images (src)
    $imgs = [regex]::Matches($content, 'src="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    foreach ($img in $imgs) {
        $path = Resolve-LinkPath -currentFile $file.FullName -link $img
        if ($path -and -not (Test-Path $path)) {
            $report += [PSCustomObject]@{
                File    = $file.Name
                Type    = "Missing Image"
                Details = "src='$img' not found"
            }
        }
    }
    
    # 4. Check Data Images (data-img)
    $dataImgs = [regex]::Matches($content, 'data-img="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    foreach ($dimg in $dataImgs) {
        $path = Resolve-LinkPath -currentFile $file.FullName -link $dimg
        if ($path -and -not (Test-Path $path)) {
            $report += [PSCustomObject]@{
                File    = $file.Name
                Type    = "Missing Data Asset"
                Details = "data-img='$dimg' not found"
            }
        }
    }
}

$report | ForEach-Object {
    Write-Host "File: $($_.File) | Type: $($_.Type) | Details: $($_.Details)"
}
Write-Host "Audit Complete. Found $($report.Count) issues."

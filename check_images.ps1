
$root = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main"
$htmlFiles = Get-ChildItem -Path $root -Recurse -Filter *.html

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName
    $imgMatches = [regex]::Matches($content, 'src="(assets/images/[^"]+)"')
    
    foreach ($match in $imgMatches) {
        $relPath = $match.Groups[1].Value
        $fullPath = Join-Path $root ($relPath -replace "/", "\")
        
        if (-not (Test-Path $fullPath)) {
            Write-Host "BROKEN LINK in $($file.Name): $relPath"
            
            # Suggest alternatives in the same folder
            $parentDir = Split-Path $fullPath
            if (Test-Path $parentDir) {
                $alternatives = Get-ChildItem -Path $parentDir -File | Select-Object -ExpandProperty Name
                if ($alternatives) {
                    Write-Host "  -> Suggested: $($alternatives -join ', ')"
                }
                else {
                    Write-Host "  -> No images found in directory."
                }
            }
            else {
                Write-Host "  -> Directory does not exist."
            }
            Write-Host ""
        }
    }
}

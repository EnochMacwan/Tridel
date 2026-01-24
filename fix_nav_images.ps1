$goldenNavPath = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main\golden_nav.html"
$content = Get-Content $goldenNavPath -Raw

# Replace data-buoy-new.png with available image
$content = $content -replace "data-buoy-new.png", "TDB3000 - PROFILLING BUOY/DataBuoy.png"

# Replace Drifter Track.png with available image
$content = $content -replace "Drifter Track.png", "drifter-1.jpg"

Set-Content $goldenNavPath $content
Write-Host "Updated golden_nav.html with correct images."

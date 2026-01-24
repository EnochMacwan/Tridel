$goldenNavPath = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main\golden_nav.html"
$content = Get-Content $goldenNavPath -Raw

# Replace Mooring frame.png with mooring-frame.png (case/space sensitive)
# Using regex to handle "Mooring frame.png" with space
$content = $content -replace "Mooring frame.png", "mooring-frame.png"

Set-Content $goldenNavPath $content
Write-Host "Updated golden_nav.html to use correct 'mooring-frame.png' path."

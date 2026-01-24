$rootDir = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main"
# Ensure consistent path format (remove potential trailing slash for comparison)
$rootDir = $rootDir.TrimEnd('\')

$lenisCdn = '<script defer src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>'

Get-ChildItem -Path $rootDir -Filter *.html -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    
    if ($content -notmatch "lenis.min.js") {
        # Determine relative path depth
        $currentDir = $_.Directory.FullName.TrimEnd('\')
        
        $isRoot = ($currentDir -eq $rootDir)
        
        if ($isRoot) {
            $assetPath = "assets/js/smooth-scroll.js"
        }
        else {
            $assetPath = "../assets/js/smooth-scroll.js"
        }
        
        $localScript = "<script defer src=`"$assetPath`"></script>"
        
        # Combine injection
        $injection = "$lenisCdn`n    $localScript"
        
        # Inject before </head>
        if ($content -match "</head>") {
            $content = $content -replace "</head>", "$injection`n</head>"
            [System.IO.File]::WriteAllText($_.FullName, $content)
            Write-Host "Injected smooth scroll into $($_.Name)"
        }
        else {
            Write-Warning "No </head> tag found in $($_.Name)"
        }
    }
    else {
        Write-Host "Skipping $($_.Name) - already has Lenis"
    }
}

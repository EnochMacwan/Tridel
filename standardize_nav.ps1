$goldenNavPath = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main\golden_nav.html"
$rootDir = "c:\Users\AKALPURAKH\Downloads\OneDrive_2026-01-07\tridel website\Tridel-main\Tridel-main"
$goldenNavContent = [System.IO.File]::ReadAllText($goldenNavPath)

# Regex to find the existing <nav> block

# Function to adjust paths for subdirectory files
function Get-SubDirNav ($content) {
    # Prepend ../ to existing relative paths
    # 1. href="anything" -> href="../anything" (exclude http, #, mailto)
    $content = $content -replace 'href="(?!(http|#|mailto|\.\./))([^"]+)"', 'href="../$2"'
    
    # 2. src="anything" -> src="../anything" (exclude http)
    $content = $content -replace 'src="(?!(http|\.\./))([^"]+)"', 'src="../$2"'
    
    # 3. data-img="anything" -> data-img="../anything"
    $content = $content -replace 'data-img="(?!(http|\.\./))([^"]+)"', 'data-img="../$2"'
    
    return $content
}

# Function to set active state
function Set-ActiveState ($navContent, $fileName, $isRoot) {
    # First, remove any existing aria-current="page"
    $navContent = $navContent -replace ' aria-current="page"', ''
    
    $targetLink = ""
    
    if ($fileName -eq "index.html") { $targetLink = "index.html" }
    elseif ($fileName -eq "about.html") { $targetLink = "about.html" }
    elseif ($fileName -match "product") { $targetLink = "products.html" }
    elseif ($fileName -match "service" -or $fileName -match "hydrography" -or $fileName -match "uxo") { $targetLink = "services.html" }
    elseif ($fileName -eq "contact.html") { $targetLink = "contact.html" }
    elseif ($fileName -eq "careers.html") { $targetLink = "careers.html" }
    elseif ($fileName -eq "success-stories.html") { $targetLink = "success-stories.html" }
    
    if ($targetLink) {
        # Determine strict regex for the link
        # If we are in subfolder, the link in nav is "../products.html", etc.
        # If root, it is "products.html"
        
        $searchHref = $targetLink
        if (-not $isRoot -and $targetLink -ne "index.html") {
            # index.html relative link logic handled separately? No, function Get-SubDirNav makes it ../index.html
            if ($targetLink -eq "index.html") { $searchHref = "../index.html" }
            else { $searchHref = "../$targetLink" }
        }
        elseif (-not $isRoot) {
            $searchHref = "../$targetLink"
        }
        
        # Actually, simpler: just find the href and add the attribute
        # We need to be careful not to match partial strings.
        # But wait, Get-SubDirNav runs BEFORE this.
        
        # Let's try a robust replace
        # Find: href="$searchHref"
        # Replace: aria-current="page" href="$searchHref"
        
        # Escape for regex
        $searchHref = [regex]::Escape($searchHref)
        $navContent = $navContent -replace "href=""$searchHref""", "aria-current=""page"" href=""$searchHref"""
    }
    
    return $navContent
}

# Recursively process files
Get-ChildItem -Path $rootDir -Filter *.html -Recurse | ForEach-Object {
    $filePath = $_.FullName
    $fileName = $_.Name
    $dirName = $_.Directory.Name
    
    # Determine if root or subdir
    # Root is when Directory is "Tridel-main"
    $isRoot = ($_.Directory.FullName -eq $rootDir)
    
    $fileContent = [System.IO.File]::ReadAllText($filePath)
    
    # Prepare the new nav content
    if ($isRoot) {
        $newNav = $goldenNavContent
    }
    else {
        $newNav = Get-SubDirNav $goldenNavContent
    }
    
    # Set active state
    # $newNav = Set-ActiveState $newNav $fileName $isRoot # Skipping active state for now to reduce complexity risk in first pass, can add later if requested.
    # Actually, I'll allow the script to just strip aria-current from "Home" if it's not Home, but properly setting it everywhere might be flaky.
    # Let's AT LEAST remove aria-current="page" from Home if we are not at Home.
    if ($fileName -ne "index.html") {
        $newNav = $newNav -replace ' aria-current="page"', ''
    }
    
    # Perform replacement
    # Target everything from the first <header> up to the start of <main>
    # This aggressively removes any duplicate headers or nested mess before the main content.
    # We look for <header class="header"> ... (greedy match) ... up to <main
    # Target everything from <header class="header"> to just before the closing > of the first <main ... > tag?
    # No, let's just match UNTIL "<main" literal.
    # regex: (?s)<header class="header">.*?(?=<main)
    # The previous attempt might have failed due to greedy .* skipping too much or too little? 
    # Let's try matching the exact boundary.
    
    $regex = '(?s)<header[^>]*class="header"[^>]*>.*?(?=<main)'
    
    # We will read file, replace, write.
    if ($fileContent -match $regex) {
        # Construct the new header block
        
        $clean = "<header class=`"header`">`n$newNav`n</header>"
        
        $fileContent = $fileContent -replace $regex, $clean
        [System.IO.File]::WriteAllText($filePath, $fileContent)
        Write-Host "Fixed (Boundary Method) Navigation in: $fileName"
    }
    else {
        # Fallback: simple header replacement
        if ($fileContent -match '(?s)<header[^>]*class="header"[^>]*>.*?</header>') {
            $clean = "<header class=`"header`">`n$newNav`n</header>"
            $fileContent = $fileContent -replace '(?s)<header[^>]*class="header"[^>]*>.*?</header>', $clean
            [System.IO.File]::WriteAllText($filePath, $fileContent)
            Write-Host "Fixed Standard Navigation in: $fileName"
        }
        else {
            Write-Warning "No header found in $fileName"
        }
    }
}

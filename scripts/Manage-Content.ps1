<#
.SYNOPSIS
    Tridel Technologies Content Wizard
    Safely adds Products, Services, Success Stories, and Clients to the website.

.DESCRIPTION
    This script provides an interactive menu to add content to:
    - assets/js/products-data.js
    - assets/js/services-data.js
    - assets/js/success-stories-data.js
    - assets/js/clients-data.js
    
    It reads the existing file, finds the end of the data array, and correctly appends the new item.
#>

$Root = $PSScriptRoot
$AssetsDir = Join-Path $Root "assets/js"

function Show-Header {
    Clear-Host
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "   TRIDEL CONTENT WIZARD (Dynamic Mode)   " -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Add-Entry {
    param (
        [string]$FilePath,
        [string]$VarName, 
        [hashtable]$Fields
    )

    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        Pause
        return
    }

    $Content = Get-Content $FilePath -Raw
    
    # 1. Gather User Input
    $NewItem = @{}
    foreach ($Key in $Fields.Keys) {
        $Label = $Fields[$Key]
        $Input = Read-Host "Enter $Label"
        $NewItem[$Key] = $Input
    }

    # 2. Format as valid JS Object
    # We construct a string representation of the object
    $JsObject = "  {" + [Environment]::NewLine
    foreach ($Key in $NewItem.Keys) {
        $Val = $NewItem[$Key]
        # Escape quotes if necessary
        $Val = $Val -replace '"', '\"'
        $JsObject += "    $Key: `"$Val`"," + [Environment]::NewLine
    }
    # Remove trailing comma from last property (optional but good practice)
    $JsObject = $JsObject.TrimEnd(",`r`n") + [Environment]::NewLine
    $JsObject += "  }"

    # 3. Insert into File
    # We look for the last closing bracket of the array `];`
    
    # Remove the last `];` (ignoring whitespace)
    # Using regex to replace the last occurrence of `];` (with optional whitespace) with `, [NewObject]];`
    
    # Simple Append Strategy:
    # Find the last occurence of "];"
    $LastBracketIndex = $Content.LastIndexOf("];")
    
    if ($LastBracketIndex -ge 0) {
        $Pre = $Content.Substring(0, $LastBracketIndex).TrimEnd()
        
        # Check if array is empty (ends with [) or has items (ends with })
        if ($Pre.EndsWith("[")) {
            # First item
            $NewContent = $Pre + [Environment]::NewLine + $JsObject + [Environment]::NewLine + "];"
        }
        else {
            # Subsequent items, add comma
            # Check if previous line ended with comma, if not, add it? 
            # Safer to just assume we need a comma before the new object if it's not the first.
            $NewContent = $Pre + "," + [Environment]::NewLine + $JsObject + [Environment]::NewLine + "];"
        }
        
        Set-Content -Path $FilePath -Value $NewContent -Encoding UTF8
        Write-Host "Success! Added new item to $VarName." -ForegroundColor Green
    }
    else {
        Write-Error "Could not find the end of the array (];) in $FilePath. Is the file formatted correctly?"
    }
    
    Write-Host ""
    Pause
}

# --- MENUS ---

function Menu-Product {
    Show-Header
    Write-Host "ADDING NEW PRODUCT" -ForegroundColor Yellow
    
    $Fields = [ordered]@{
        name        = "Product Name (e.g., TDB-3000)"
        category    = "Category (Buoys/Vessels/Equipment/Software)"
        description = "Short Description"
        link        = "Link (e.g., products.html#tdb3000)"
        image       = "Image Path (e.g., assets/images/...)"
    }
    
    Add-Entry -FilePath (Join-Path $AssetsDir "products-data.js") -VarName "productsData" -Fields $Fields
}

function Menu-Service {
    Show-Header
    Write-Host "ADDING NEW SERVICE" -ForegroundColor Yellow
    
    $Fields = [ordered]@{
        title       = "Service Title (e.g., Deep Sea Mining)"
        subtitle    = "Subtitle"
        category    = "Category (Environmental Monitoring/Surveying/Geoscience)"
        description = "Description"
        link        = "link (e.g., services/hydrography.html)"
        image       = "Image Path (e.g., assets/images/...)"
    }
    
    Add-Entry -FilePath (Join-Path $AssetsDir "services-data.js") -VarName "servicesData" -Fields $Fields
}

function Menu-SuccessStory {
    Show-Header
    Write-Host "ADDING SUCCESS STORY" -ForegroundColor Yellow
    
    $Fields = [ordered]@{
        title       = "Project Title"
        category    = "Category"
        description = "Description of the success story"
        image       = "Image Path"
        id          = "Unique ID (no spaces, e.g., project-oman)"
    }
    
    Add-Entry -FilePath (Join-Path $AssetsDir "success-stories-data.js") -VarName "successStoriesData" -Fields $Fields
}

function Menu-Client {
    Show-Header
    Write-Host "ADDING CLIENT / PARTNER" -ForegroundColor Yellow
    
    $Fields = [ordered]@{
        name     = "Client Name"
        category = "Category (Government/Energy/Marine/Private)"
        logo     = "Logo Path (e.g., assets/images/clients/logo.png)"
    }
    
    Add-Entry -FilePath (Join-Path $AssetsDir "clients-data.js") -VarName "clientsData" -Fields $Fields
}

# --- MAIN LOOP ---

do {
    Show-Header
    Write-Host "1. Add New Product"
    Write-Host "2. Add New Service"
    Write-Host "3. Add Success Story"
    Write-Host "4. Add Client Logo"
    Write-Host "Q. Quit"
    Write-Host ""
    $Choice = Read-Host "Select an option"

    switch ($Choice) {
        "1" { Menu-Product }
        "2" { Menu-Service }
        "3" { Menu-SuccessStory }
        "4" { Menu-Client }
        "Q" { break }
        "q" { break }
    }
} while ($true)

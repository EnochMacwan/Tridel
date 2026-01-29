<#
.SYNOPSIS
    Tridel Content Manager (GUI)
    A Windows Forms application to manage website content easily.
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$Root = $PSScriptRoot
$AssetsDir = Join-Path $Root "assets/js"


# --- HELPER FUNCTIONS ---

function Get-RelativePath {
    param($FullPath)
    if ($FullPath.StartsWith($Root)) {
        $Rel = $FullPath.Substring($Root.Length).TrimStart("\")
        return $Rel -replace "\\", "/"
    }
    return $FullPath
}

function Slugify {
    param($Text)
    return $Text.ToLower().Replace(" ", "-").Replace("[^a-z0-9-]", "")
}

function Import-SmartImage {
    param($SourcePaths, $ContextName)
    
    $ImportedPaths = @()
    
    foreach ($SourcePath in $SourcePaths) {
        # 1. Check if already in project (Case Insensitive)
        if ($SourcePath.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
            $ImportedPaths += (Get-RelativePath $SourcePath)
            continue
        }
        
        # 2. Auto-Copy (No Prompt)
        try {
            $Ext = [System.IO.Path]::GetExtension($SourcePath)
            
            # Create a "smart name"
            $Base = if ($ContextName) { (Slugify $ContextName) } else { "uploaded-image" }
            $DateTag = Get-Date -Format "yyyyMMdd-HHmmssfff" 
            $NewName = "$Base-$DateTag$Ext"
            
            $DestDir = Join-Path $AssetsDir "../images/uploads"
            if (-not (Test-Path $DestDir)) { New-Item -ItemType Directory -Path $DestDir | Out-Null }
            
            $DestPath = Join-Path $DestDir $NewName
            Copy-Item -LiteralPath $SourcePath -Destination $DestPath -Force -ErrorAction Stop
            
            $ImportedPaths += "assets/images/uploads/$NewName"
            Start-Sleep -Milliseconds 50 
        }
        catch {
            [System.Windows.Forms.MessageBox]::Show("Error importing file: $SourcePath`n$_")
        }
    }
    
    return $ImportedPaths
}

function Select-Image {
    param($ContextName, [bool]$MultiSelect = $false)
    $Dialog = New-Object System.Windows.Forms.OpenFileDialog
    $Dialog.Filter = "Images|*.png;*.jpg;*.jpeg;*.gif;*.webp"
    $Dialog.Multiselect = $MultiSelect
    
    if ($Dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        return (Import-SmartImage $Dialog.FileNames $ContextName)
    }
    return $null
}

function Add-To-File {
    param($FilePath, $Obj)
    
    if (-not (Test-Path $FilePath)) {
        [System.Windows.Forms.MessageBox]::Show("Error: File not found: $FilePath", "Error", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
        return
    }

    $Content = Get-Content $FilePath -Raw
    
    # Construct JS Object String
    $JsStr = "  {" + [Environment]::NewLine
    foreach ($Key in $Obj.Keys) {
        $Val = $Obj[$Key]
        $Val = $Val -replace '"', '\"' # Escape quotes
        
        if ($Val -eq $true -or $Val -eq $false) {
            $JsStr += "    ${Key}: $Val," + [Environment]::NewLine
        }
        else {
            $JsStr += "    ${Key}: `"$Val`"," + [Environment]::NewLine
        }
    }
    $JsStr = $JsStr.TrimEnd(",`r`n") + [Environment]::NewLine
    $JsStr += "  }"

    # Append Logic
    $LastBracketIndex = $Content.LastIndexOf("];")
    if ($LastBracketIndex -ge 0) {
        $Pre = $Content.Substring(0, $LastBracketIndex).TrimEnd()
        if (-not $Pre.Trim().EndsWith("[")) { $Pre += "," }
        
        $NewContent = $Pre + [Environment]::NewLine + $JsStr + [Environment]::NewLine + "];"
        Set-Content -Path $FilePath -Value $NewContent -Encoding UTF8
        [System.Windows.Forms.MessageBox]::Show("Item added successfully!", "Success", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    }
    else {
        [System.Windows.Forms.MessageBox]::Show("Error: Could not find end of array '];' in file.", "Error", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
    }
}

# --- GUI SETUP ---

$Form = New-Object System.Windows.Forms.Form
$Form.Text = "Tridel Content Manager (Pro Edition)"
$Form.Size = New-Object System.Drawing.Size(900, 750) # Made wider for tabs
$Form.StartPosition = "CenterScreen"
$Form.BackColor = [System.Drawing.Color]::White

$Sidebar = New-Object System.Windows.Forms.Panel
$Sidebar.Dock = "Left"
$Sidebar.Width = 250
$Sidebar.Padding = New-Object System.Windows.Forms.Padding(10)
$Sidebar.BackColor = [System.Drawing.Color]::FromArgb(242, 242, 247) # Apple Light Gray

$TabControl = New-Object System.Windows.Forms.TabControl
$TabControl.Dock = "Fill"
$TabControl.Appearance = [System.Windows.Forms.TabAppearance]::FlatButtons
$TabControl.ItemSize = New-Object System.Drawing.Size(0, 1)
$TabControl.SizeMode = [System.Windows.Forms.TabSizeMode]::Fixed

$Form.Controls.Add($Sidebar)
$Form.Controls.Add($TabControl)
# Fix Docking Order: Control at top of Z-order docks FIRST? No, LAST.
# We want Sidebar to dock (Left). Then TabControl to dock (Fill Remaining).
# So Sidebar must be processed first.
# Docking priority goes Back -> Front?
# Actually, just SendToBack() the fill control works reliably in WinForms designer.
# Let's try sending TabControl to Back.
$TabControl.BringToFront() 
# Wait, if BringToFront makes it Top (Index 0). Top docks LAST.
# Only Remaining space is filled. So Sidebar (Back) docks first (Left). TabControl (Front) docks Last (Fill Remaining).
# YES. BringToFront() is correct.

# === TAB 1: PRODUCTS ===
$TabProducts = New-Object System.Windows.Forms.TabPage
$TabProducts.Text = "Add Product"
$TabProducts.Padding = New-Object System.Windows.Forms.Padding(20)
$TabControl.Controls.Add($TabProducts)

# Controls for Product
$Y = 20
function Add-Label-Text {
    param($Parent, $LabelTxt, $RefVarName)
    
    $Lbl = New-Object System.Windows.Forms.Label
    $Lbl.Text = $LabelTxt
    $Lbl.Location = New-Object System.Drawing.Point(20, $script:Y)
    $Lbl.AutoSize = $true
    $Parent.Controls.Add($Lbl)
    
    $script:Y += 25
    
    $Txt = New-Object System.Windows.Forms.TextBox
    $Txt.Location = New-Object System.Drawing.Point(20, $script:Y)
    $Txt.Width = 500
    $Parent.Controls.Add($Txt)
    
    $script:Y += 40
    return $Txt
}

$TxtProdName = Add-Label-Text $TabProducts "Product Name"
$TxtProdCat = Add-Label-Text $TabProducts "Category (Buoys / Vessels / Equipment / Software)"
$TxtProdDesc = Add-Label-Text $TabProducts "Description"

# Image Picker
$LblProdImg = New-Object System.Windows.Forms.Label
$LblProdImg.Text = "Image Path"
$LblProdImg.Location = New-Object System.Drawing.Point(20, $Y)
$TabProducts.Controls.Add($LblProdImg)
$Y += 25

$TxtProdImg = New-Object System.Windows.Forms.TextBox
$TxtProdImg.Location = New-Object System.Drawing.Point(20, $Y)
$TxtProdImg.Width = 400
$TabProducts.Controls.Add($TxtProdImg)

$BtnProdBrowse = New-Object System.Windows.Forms.Button
$BtnProdBrowse.Text = "Browse..."
$BtnProdBrowse.Location = New-Object System.Drawing.Point(430, ([int]$Y - 2))
$BtnProdBrowse.Add_Click({
        $Paths = Select-Image $TxtProdName.Text $true
        if ($Paths) { $TxtProdImg.Text = $Paths[0] }
    })
$TabProducts.Controls.Add($BtnProdBrowse)
$Y += 40

$TxtProdLink = Add-Label-Text $TabProducts "Link (e.g. products.html#id)"

$ChkProdNew = New-Object System.Windows.Forms.CheckBox
$ChkProdNew.Text = "Mark as NEW?"
$ChkProdNew.Location = New-Object System.Drawing.Point(20, $Y)
$TabProducts.Controls.Add($ChkProdNew)
$Y += 40

$BtnSaveProd = New-Object System.Windows.Forms.Button
$BtnSaveProd.Text = "SAVE PRODUCT"
$BtnSaveProd.BackColor = [System.Drawing.Color]::LightBlue
$BtnSaveProd.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveProd.Size = New-Object System.Drawing.Size(200, 40)
$BtnSaveProd.Add_Click({
        $Data = [ordered]@{
            name        = $TxtProdName.Text
            category    = $TxtProdCat.Text
            description = $TxtProdDesc.Text
            link        = $TxtProdLink.Text
            image       = $TxtProdImg.Text
            isNew       = $ChkProdNew.Checked
        }
        Add-To-File (Join-Path $AssetsDir "products-data.js") $Data
    
        # Reset
        $TxtProdName.Text = ""
        $TxtProdDesc.Text = ""
    })
$TabProducts.Controls.Add($BtnSaveProd)


# === TAB 2: SERVICES ===
$TabServices = New-Object System.Windows.Forms.TabPage
$TabServices.Text = "Add Service"
$TabControl.Controls.Add($TabServices)
$Y = 20

$TxtSvcTitle = Add-Label-Text $TabServices "Service Title"
$TxtSvcSub = Add-Label-Text $TabServices "Subtitle"
$TxtSvcCat = Add-Label-Text $TabServices "Category (Env Monitoring / Env Surveying / Geoscience)"
$TxtSvcDesc = Add-Label-Text $TabServices "Description"
$LblSvcImg = New-Object System.Windows.Forms.Label
$LblSvcImg.Text = "Image Path"
$LblSvcImg.Location = New-Object System.Drawing.Point(20, $Y)
$LblSvcImg.AutoSize = $true
$TabServices.Controls.Add($LblSvcImg)
$Y += 25

$TxtSvcImg = New-Object System.Windows.Forms.TextBox
$TxtSvcImg.Location = New-Object System.Drawing.Point(20, $Y)
$TxtSvcImg.Width = 400
$TabServices.Controls.Add($TxtSvcImg)

$BtnSvcBrowse = New-Object System.Windows.Forms.Button
$BtnSvcBrowse.Text = "Browse..."
$BtnSvcBrowse.Location = New-Object System.Drawing.Point(430, ([int]$Y - 2))
$BtnSvcBrowse.Add_Click({
        $Paths = Select-Image $TxtSvcTitle.Text $true
        if ($Paths) { $TxtSvcImg.Text = $Paths[0] }
    })
$TabServices.Controls.Add($BtnSvcBrowse)
$Y += 40
$TxtSvcLink = Add-Label-Text $TabServices "Link"

$BtnSaveSvc = New-Object System.Windows.Forms.Button
$BtnSaveSvc.Text = "SAVE SERVICE"
$BtnSaveSvc.BackColor = [System.Drawing.Color]::LightGreen
$BtnSaveSvc.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveSvc.Size = New-Object System.Drawing.Size(200, 40)
$BtnSaveSvc.Add_Click({
        $Data = [ordered]@{
            title       = $TxtSvcTitle.Text
            subtitle    = $TxtSvcSub.Text
            category    = $TxtSvcCat.Text
            description = $TxtSvcDesc.Text
            link        = $TxtSvcLink.Text
            image       = $TxtSvcImg.Text
        }
        Add-To-File (Join-Path $AssetsDir "services-data.js") $Data
        $TxtSvcTitle.Text = ""
    })
$TabServices.Controls.Add($BtnSaveSvc)


# === TAB 3: CLIENTS ===
$TabClients = New-Object System.Windows.Forms.TabPage
$TabClients.Text = "Add Client"
$TabControl.Controls.Add($TabClients)
$Y = 20

$TxtCliName = Add-Label-Text $TabClients "Client Name"
$TxtCliCat = Add-Label-Text $TabClients "Category (Government/Energy/Marine/Research/Private)"

# Simple Image path for client
$LblCliImg = New-Object System.Windows.Forms.Label
$LblCliImg.Text = "Logo Path"
$LblCliImg.Location = New-Object System.Drawing.Point(20, $Y)
$TabClients.Controls.Add($LblCliImg)
$Y += 25

$TxtCliImg = New-Object System.Windows.Forms.TextBox
$TxtCliImg.Location = New-Object System.Drawing.Point(20, $Y)
$TxtCliImg.Width = 400
$TabClients.Controls.Add($TxtCliImg)

$BtnCliBrowse = New-Object System.Windows.Forms.Button
$BtnCliBrowse.Text = "Browse..."
$BtnCliBrowse.Location = New-Object System.Drawing.Point(430, ([int]$Y - 2))
$BtnCliBrowse.Add_Click({
        $Paths = Select-Image $TxtCliName.Text $true
        if ($Paths) { $TxtCliImg.Text = $Paths[0] }
    })
$TabClients.Controls.Add($BtnCliBrowse)
$Y += 40

$BtnSaveCli = New-Object System.Windows.Forms.Button
$BtnSaveCli.Text = "SAVE CLIENT"
$BtnSaveCli.BackColor = [System.Drawing.Color]::LightCoral
$BtnSaveCli.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveCli.Size = New-Object System.Drawing.Size(200, 40)
$BtnSaveCli.Add_Click({
        $Data = [ordered]@{
            name     = $TxtCliName.Text
            logo     = $TxtCliImg.Text
            category = $TxtCliCat.Text
        }
        Add-To-File (Join-Path $AssetsDir "clients-data.js") $Data
        $TxtCliName.Text = ""
    })
$TabClients.Controls.Add($BtnSaveCli)


# === TAB 4: STORIES ===
$TabStories = New-Object System.Windows.Forms.TabPage
$TabStories.Text = "Add Story"
$TabControl.Controls.Add($TabStories)
$Y = 20

$TxtStryTitle = Add-Label-Text $TabStories "Project Title"
$TxtStryCat = Add-Label-Text $TabStories "Category"
$TxtStryDesc = Add-Label-Text $TabStories "Description"
$LblStryImg = New-Object System.Windows.Forms.Label
$LblStryImg.Text = "Image Path"
$LblStryImg.Location = New-Object System.Drawing.Point(20, $Y)
$LblStryImg.AutoSize = $true
$TabStories.Controls.Add($LblStryImg)
$Y += 25

$TxtStryImg = New-Object System.Windows.Forms.TextBox
$TxtStryImg.Location = New-Object System.Drawing.Point(20, $Y)
$TxtStryImg.Width = 400
$TabStories.Controls.Add($TxtStryImg)

$BtnStryBrowse = New-Object System.Windows.Forms.Button
$BtnStryBrowse.Text = "Browse..."
$BtnStryBrowse.Location = New-Object System.Drawing.Point(430, ([int]$Y - 2))
$BtnStryBrowse.Add_Click({
        $Paths = Select-Image $TxtStryTitle.Text $true
        if ($Paths) { $TxtStryImg.Text = $Paths[0] }
    })
$TabStories.Controls.Add($BtnStryBrowse)
$Y += 40
$TxtStryId = Add-Label-Text $TabStories "ID (Unique, no spaces)"

$BtnSaveStry = New-Object System.Windows.Forms.Button
$BtnSaveStry.Text = "SAVE STORY"
$BtnSaveStry.BackColor = [System.Drawing.Color]::LightGreen
$BtnSaveStry.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveStry.Size = New-Object System.Drawing.Size(200, 40)
$BtnSaveStry.Add_Click({
        if (-not $TxtStryTitle.Text -or -not $TxtStryId.Text) {
            [System.Windows.Forms.MessageBox]::Show("Error: Project Title and ID are required.")
            return
        }

        $Data = [ordered]@{
            id          = $TxtStryId.Text
            title       = $TxtStryTitle.Text
            category    = $TxtStryCat.Text
            image       = $TxtStryImg.Text
            description = $TxtStryDesc.Text
        }
        Add-To-File (Join-Path $AssetsDir "success-stories-data.js") $Data
        
        # Reset
        $TxtStryId.Text = ""
        $TxtStryTitle.Text = ""
        $TxtStryDesc.Text = ""
    })
$TabStories.Controls.Add($BtnSaveStry)


# === TAB 5: REMOVE ITEMS ===
$TabRemove = New-Object System.Windows.Forms.TabPage
$TabRemove.Text = "Remove Item"
$TabControl.Controls.Add($TabRemove)
$Y = 20

$LblRemType = New-Object System.Windows.Forms.Label
$LblRemType.Text = "Select Content Type to Remove From:"
$LblRemType.Location = New-Object System.Drawing.Point(20, $Y)
$LblRemType.AutoSize = $true
$TabRemove.Controls.Add($LblRemType)
$Y += 25

$CmbRemType = New-Object System.Windows.Forms.ComboBox
$CmbRemType.Location = New-Object System.Drawing.Point(20, $Y)
$CmbRemType.Width = 300
$CmbRemType.Items.Add("Products")
$CmbRemType.Items.Add("Services")
$CmbRemType.Items.Add("Clients")
$CmbRemType.Items.Add("Stories")
$CmbRemType.DropDownStyle = "DropDownList"
$TabRemove.Controls.Add($CmbRemType)
$Y += 40

$LblRemItem = New-Object System.Windows.Forms.Label
$LblRemItem.Text = "Select Item to Delete:"
$LblRemItem.Location = New-Object System.Drawing.Point(20, $Y)
$LblRemItem.AutoSize = $true
$TabRemove.Controls.Add($LblRemItem)
$Y += 25

$LstRemItems = New-Object System.Windows.Forms.ListBox
$LstRemItems.Location = New-Object System.Drawing.Point(20, $Y)
$LstRemItems.Width = 500
$LstRemItems.Height = 300
$TabRemove.Controls.Add($LstRemItems)
$Y += 310

$BtnDelete = New-Object System.Windows.Forms.Button
$BtnDelete.Text = "DELETE SELECTED ITEM"
$BtnDelete.BackColor = [System.Drawing.Color]::Salmon
$BtnDelete.ForeColor = [System.Drawing.Color]::White
$BtnDelete.Location = New-Object System.Drawing.Point(20, $Y)
$BtnDelete.Size = New-Object System.Drawing.Size(200, 40)
$TabRemove.Controls.Add($BtnDelete)

# --- REMOVE LOGIC ---

function Get-JS-Items {
    param($Type)
    $File = ""
    $Key = ""
    $UseComposite = $false
    
    switch ($Type) {
        "Products" { $File = "products-data.js"; $Key = "name" }
        "Services" { $File = "services-data.js"; $Key = "name" }
        "Clients" { $File = "clients-data.js"; $Key = "name" }
        "Stories" { $File = "success-stories-data.js"; $Key = "title"; $UseComposite = $true }
    }
    
    $Path = Join-Path $AssetsDir $File
    if (-not (Test-Path $Path)) { return @() }
    
    $Raw = Get-Content $Path -Raw
    
    if ($UseComposite) {
        # Parsing distinct logic for Stories to show "ID | Title"
        # Since regex is complex for multi-line JSON, let's try a simpler approach or capture both
        # We need to find blocks and extract id and title
        
        # Split by objects approximately
        $Items = @()
        $RegexMatches = [regex]::Matches($Raw, "\{([^\}]+)\}")
        foreach ($m in $RegexMatches) {
            $Block = $m.Groups[1].Value
            
            # Extract ID
            $IdMatch = [regex]::Match($Block, "['`"]?id['`"]?\s*:\s*(['`"])(.*?)\1")
            $TitleMatch = [regex]::Match($Block, "['`"]?title['`"]?\s*:\s*(['`"])(.*?)\1")
            
            if ($IdMatch.Success -and $TitleMatch.Success) {
                $Id = $IdMatch.Groups[2].Value
                $Title = $TitleMatch.Groups[2].Value
               
                # Only add if not empty
                if ($Id -ne "" -or $Title -ne "") {
                    $Items += "$Id | $Title"
                }
            }
        }
        return $Items
    }
    else {
        # Regex to find names/titles
        # Matches: name: "Something" or "name": 'Something'
        $Pattern = "['`"]?$Key['`"]?\s*:\s*(['`"])(.*?)\1"
        $RegexMatches = [regex]::Matches($Raw, $Pattern)
        
        $Names = @()
        foreach ($m in $RegexMatches) {
            $Names += $m.Groups[2].Value
        }
        return $Names
    }
}

function Remove-JS-Item {
    param($Type, $Name)
    $File = ""
    $Key = ""
    
    # Handle Composite Name for Stories
    if ($Type -eq "Stories" -and $Name -match "^(.*?) \| (.*)$") {
        # If it's "ID | Title", we search by ID ideally because it's unique
        # Check standard
        $RealName = $matches[1] # The ID part
        $File = "success-stories-data.js"
        $Key = "id" 
    }
    else {
        $RealName = $Name
        switch ($Type) {
            "Products" { $File = "products-data.js"; $Key = "name" }
            "Services" { $File = "services-data.js"; $Key = "name" }
            "Clients" { $File = "clients-data.js"; $Key = "name" }
            "Stories" { $File = "success-stories-data.js"; $Key = "title" } # Fallback
        }
    }
    
    $Path = Join-Path $AssetsDir $File
    if (-not (Test-Path $Path)) { return $false }
    
    $Raw = Get-Content $Path -Raw
    
    # 1. Find matched line index
    $EscName = [regex]::Escape($RealName)
    # Match key: "Name" or key: 'Name'
    $Pattern = "['`"]?$Key['`"]?\s*:\s*(['`"])$EscName\1"
    $Match = [regex]::Match($Raw, $Pattern)
    
    if (-not $Match.Success) {
        [System.Windows.Forms.MessageBox]::Show("Debug: Item regex match failed for '$RealName'. Pattern: $Pattern")
        return $false 
    }
    
    $HitIndex = $Match.Index
    
    # 2. Walk Backwards to find '{'
    $StartIndex = -1
    $Balance = 0
    for ($i = $HitIndex; $i -ge 0; $i--) {
        $char = $Raw[$i]
        if ($char -eq '}') { $Balance++ }
        if ($char -eq '{') {
            if ($Balance -eq 0) { $StartIndex = $i; break }
            $Balance--
        }
    }
    
    if ($StartIndex -eq -1) { 
        [System.Windows.Forms.MessageBox]::Show("Debug: Could not find start brace '{' for item.")
        return $false 
    }
    
    # 3. Walk Forwards to find '}'
    $EndIndex = -1
    $Balance = 1
    for ($i = $StartIndex + 1; $i -lt $Raw.Length; $i++) {
        $char = $Raw[$i]
        if ($char -eq '{') { $Balance++ }
        if ($char -eq '}') {
            $Balance--
            if ($Balance -eq 0) { $EndIndex = $i; break }
        }
    }
    
    if ($EndIndex -eq -1) { 
        [System.Windows.Forms.MessageBox]::Show("Debug: Could not find end brace '}' for item.")
        return $false 
    }

    # 4. Check for trailing comma
    $RemoveEnd = $EndIndex
    $j = $EndIndex + 1
    while ($j -lt $Raw.Length -and [char]::IsWhiteSpace($Raw[$j])) { $j++ }
    if ($j -lt $Raw.Length -and $Raw[$j] -eq ',') { $RemoveEnd = $j }
    
    # 5. Remove
    $NewRaw = $Raw.Remove($StartIndex, ($RemoveEnd - $StartIndex + 1))
    Set-Content $Path -Value $NewRaw -Encoding UTF8
    return $true
}

# Events
$CmbRemType.Add_SelectedIndexChanged({
        $LstRemItems.Items.Clear()
        $Items = Get-JS-Items $CmbRemType.SelectedItem
        foreach ($i in $Items) {
            $LstRemItems.Items.Add($i)
        }
    })

$BtnDelete.Add_Click({
        if ($LstRemItems.SelectedItem) {
            $Confirmed = [System.Windows.Forms.MessageBox]::Show("Are you sure you want to delete '" + $LstRemItems.SelectedItem + "'?", "Confirm Delete", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Warning)
    
            if ($Confirmed -eq [System.Windows.Forms.DialogResult]::Yes) {
                $Result = Remove-JS-Item $CmbRemType.SelectedItem $LstRemItems.SelectedItem
                if ($Result) {
                    [System.Windows.Forms.MessageBox]::Show("Item deleted successfully.")
                    # Refresh
                    $LstRemItems.Items.Clear()
                    $Items = Get-JS-Items $CmbRemType.SelectedItem
                    foreach ($i in $Items) { $LstRemItems.Items.Add($i) }
                }
                else {
                    [System.Windows.Forms.MessageBox]::Show("Failed to delete item. It might not exist or file structure is unexpected.")
                }
            }
        }
        else {
            [System.Windows.Forms.MessageBox]::Show("Please select an item to delete first.")
        }
    })


# === TAB 6: MOVE / EDIT CATEGORY ===
$TabMove = New-Object System.Windows.Forms.TabPage
$TabMove.Text = "Move / Edit"
$TabControl.Controls.Add($TabMove)
$Y = 20

$LblMovType = New-Object System.Windows.Forms.Label
$LblMovType.Text = "Select Content Type:"
$LblMovType.Location = New-Object System.Drawing.Point(20, $Y)
$LblMovType.AutoSize = $true
$TabMove.Controls.Add($LblMovType)
$Y += 25

$CmbMovType = New-Object System.Windows.Forms.ComboBox
$CmbMovType.Location = New-Object System.Drawing.Point(20, $Y)
$CmbMovType.Width = 300
$CmbMovType.Items.Add("Products")
$CmbMovType.Items.Add("Services")
$CmbMovType.Items.Add("Clients")
$CmbMovType.Items.Add("Stories")
$CmbMovType.DropDownStyle = "DropDownList"
$TabMove.Controls.Add($CmbMovType)
$Y += 40

$LblMovItem = New-Object System.Windows.Forms.Label
$LblMovItem.Text = "Select Item to Move:"
$LblMovItem.Location = New-Object System.Drawing.Point(20, $Y)
$LblMovItem.AutoSize = $true
$TabMove.Controls.Add($LblMovItem)
$Y += 25

$LstMovItems = New-Object System.Windows.Forms.ListBox
$LstMovItems.Location = New-Object System.Drawing.Point(20, $Y)
$LstMovItems.Width = 500
$LstMovItems.Height = 200
$TabMove.Controls.Add($LstMovItems)
$Y += 210

$LblMovNewCat = New-Object System.Windows.Forms.Label
$LblMovNewCat.Text = "Select New Category:"
$LblMovNewCat.Location = New-Object System.Drawing.Point(20, $Y)
$LblMovNewCat.AutoSize = $true
$TabMove.Controls.Add($LblMovNewCat)
$Y += 25

$CmbMovNewCat = New-Object System.Windows.Forms.ComboBox
$CmbMovNewCat.Location = New-Object System.Drawing.Point(20, $Y)
$CmbMovNewCat.Width = 300
# Product Categories
$CmbMovNewCat.Items.Add("Buoys")
$CmbMovNewCat.Items.Add("Vessels")
$CmbMovNewCat.Items.Add("Equipment")
$CmbMovNewCat.Items.Add("Software")
$CmbMovNewCat.Items.Add("Integrated Solutions")
# Service Categories
$CmbMovNewCat.Items.Add("Environmental Monitoring")
$CmbMovNewCat.Items.Add("Environmental Surveying")
$CmbMovNewCat.Items.Add("Geoscience Studies")
$TabMove.Controls.Add($CmbMovNewCat)
$Y += 40

$BtnMove = New-Object System.Windows.Forms.Button
$BtnMove.Text = "UPDATE CATEGORY"
$BtnMove.BackColor = [System.Drawing.Color]::LightSkyBlue
$BtnMove.Location = New-Object System.Drawing.Point(20, $Y)
$BtnMove.Size = New-Object System.Drawing.Size(200, 40)
$TabMove.Controls.Add($BtnMove)
$Y += 60

# --- SEPARATOR ---
$LblSep = New-Object System.Windows.Forms.Label
$LblSep.Text = "--------------------------------------------------------"
$LblSep.Location = New-Object System.Drawing.Point(20, $Y)
$LblSep.Width = 500
$TabMove.Controls.Add($LblSep)
$Y += 20

# --- UPDATE IMAGE SECTION ---
$LblUpdImg = New-Object System.Windows.Forms.Label
$LblUpdImg.Text = "Update Cover Photo:"
$LblUpdImg.Font = New-Object System.Drawing.Font($Form.Font, [System.Drawing.FontStyle]::Bold)
$LblUpdImg.Location = New-Object System.Drawing.Point(20, $Y)
$LblUpdImg.AutoSize = $true
$TabMove.Controls.Add($LblUpdImg)
$Y += 25

$TxtUpdImg = New-Object System.Windows.Forms.TextBox
$TxtUpdImg.Location = New-Object System.Drawing.Point(20, $Y)
$TxtUpdImg.Width = 400
$TabMove.Controls.Add($TxtUpdImg)

$BtnUpdBrowse = New-Object System.Windows.Forms.Button
$BtnUpdBrowse.Text = "Browse..."
$BtnUpdBrowse.Location = New-Object System.Drawing.Point(430, ([int]$Y - 2))
$BtnUpdBrowse.Add_Click({
        $Paths = Select-Image $LstMovItems.SelectedItem
        if ($Paths) { $TxtUpdImg.Text = $Paths[0] }
    })
$TabMove.Controls.Add($BtnUpdBrowse)
$Y += 40

$BtnSaveImg = New-Object System.Windows.Forms.Button
$BtnSaveImg.Text = "UPDATE IMAGE"
$BtnSaveImg.BackColor = [System.Drawing.Color]::PaleGreen
$BtnSaveImg.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveImg.Size = New-Object System.Drawing.Size(200, 40)
$TabMove.Controls.Add($BtnSaveImg)

# --- MOVE LOGIC ---
function Update-JS-Category {
    param($Type, $Name, $NewCat)
    $File = ""
    $Key = ""
    
    switch ($Type) {
        "Products" { $File = "products-data.js"; $Key = "name" }
        "Services" { $File = "services-data.js"; $Key = "title" }
    }
    
    $Path = Join-Path $AssetsDir $File
    if (-not (Test-Path $Path)) { return $false }
    
    $Raw = Get-Content $Path -Raw
    
    # 1. Find matched line index
    $EscName = [regex]::Escape($Name)
    $Pattern = "['`"]?$Key['`"]?\s*:\s*(['`"])$EscName\1"
    $Match = [regex]::Match($Raw, $Pattern)
    
    if (-not $Match.Success) {
        [System.Windows.Forms.MessageBox]::Show("Debug: Match failed for Update Category.")
        return $false 
    }
    
    $HitIndex = $Match.Index
    
    # 2. Walk Backwards
    $StartIndex = -1
    $Balance = 0
    for ($i = $HitIndex; $i -ge 0; $i--) {
        $char = $Raw[$i]
        if ($char -eq '}') { $Balance++ }
        if ($char -eq '{') {
            if ($Balance -eq 0) { $StartIndex = $i; break }
            $Balance--
        }
    }
    if ($StartIndex -eq -1) { return $false }
    
    # 3. Walk Forwards
    $EndIndex = -1
    $Balance = 1
    for ($i = $StartIndex + 1; $i -lt $Raw.Length; $i++) {
        $char = $Raw[$i]
        if ($char -eq '{') { $Balance++ }
        if ($char -eq '}') {
            $Balance--
            if ($Balance -eq 0) { $EndIndex = $i; break }
        }
    }
    if ($EndIndex -eq -1) { return $false }
    
    # 4. Extract Block
    $Block = $Raw.Substring($StartIndex, ($EndIndex - $StartIndex + 1))
    
    # 5. Regex Replace Category
    # Handles category: "Val" or 'Val'
    $NewBlock = $Block -replace "['`"]?category['`"]?\s*:\s*(['`"]).*?\1", "category: `"$NewCat`""
    
    $NewRaw = $Raw.Remove($StartIndex, ($EndIndex - $StartIndex + 1)).Insert($StartIndex, $NewBlock)
    Set-Content $Path -Value $NewRaw -Encoding UTF8
    return $true
}

function Update-JS-Image {
    param($Type, $Name, $NewImg)
    $File = ""
    $Key = ""
    $ImgKey = "image"
    
    switch ($Type) {
        "Products" { $File = "products-data.js"; $Key = "name" }
        "Services" { $File = "services-data.js"; $Key = "title" }
        "Clients" { $File = "clients-data.js"; $Key = "name"; $ImgKey = "logo" }
        "Stories" { $File = "success-stories-data.js"; $Key = "title" }
    }
    
    $Path = Join-Path $AssetsDir $File
    if (-not (Test-Path $Path)) { return $false }
    
    $Raw = Get-Content $Path -Raw
    
    # 1. Match item
    $EscName = [regex]::Escape($Name)
    $Pattern = "['`"]?$Key['`"]?\s*:\s*(['`"])$EscName\1"
    $Match = [regex]::Match($Raw, $Pattern)
    
    if (-not $Match.Success) {
        [System.Windows.Forms.MessageBox]::Show("Debug: Match failed for Update Image.")
        return $false 
    }
    $HitIndex = $Match.Index
    
    # 2. Walk Backwards
    $StartIndex = -1
    $Balance = 0
    for ($i = $HitIndex; $i -ge 0; $i--) {
        $char = $Raw[$i]
        if ($char -eq '}') { $Balance++ }
        if ($char -eq '{') {
            if ($Balance -eq 0) { $StartIndex = $i; break }
            $Balance--
        }
    }
    if ($StartIndex -eq -1) { return $false }
    
    # 3. Walk Forwards
    $EndIndex = -1
    $Balance = 1
    for ($i = $StartIndex + 1; $i -lt $Raw.Length; $i++) {
        $char = $Raw[$i]
        if ($char -eq '{') { $Balance++ }
        if ($char -eq '}') {
            $Balance--
            if ($Balance -eq 0) { $EndIndex = $i; break }
        }
    }
    if ($EndIndex -eq -1) { return $false }
    
    # 4. Extract Block
    $Block = $Raw.Substring($StartIndex, ($EndIndex - $StartIndex + 1))
    
    # 5. Regex Replace Image
    $NewBlock = $Block -replace "['`"]?$ImgKey['`"]?\s*:\s*(['`"]).*?\1", "${ImgKey}: `"$NewImg`""
    
    $NewRaw = $Raw.Remove($StartIndex, ($EndIndex - $StartIndex + 1)).Insert($StartIndex, $NewBlock)
    Set-Content $Path -Value $NewRaw -Encoding UTF8
    return $true
}


$CmbMovType.Add_SelectedIndexChanged({
        $LstMovItems.Items.Clear()
        $Items = Get-JS-Items $CmbMovType.SelectedItem
        foreach ($i in $Items) {
            $LstMovItems.Items.Add($i)
        }
    
        # Update category options based on type
        $CmbMovNewCat.Items.Clear()
    
        # Only show categories if supported
        $EnableCat = $false
        if ($CmbMovType.SelectedItem -eq "Products") {
            $CmbMovNewCat.Items.Add("Buoys")
            $CmbMovNewCat.Items.Add("Vessels")
            $CmbMovNewCat.Items.Add("Equipment")
            $CmbMovNewCat.Items.Add("Software")
            $CmbMovNewCat.Items.Add("Integrated Solutions")
            $EnableCat = $true
        }
        elseif ($CmbMovType.SelectedItem -eq "Services") {
            $CmbMovNewCat.Items.Add("Environmental Monitoring")
            $CmbMovNewCat.Items.Add("Environmental Surveying")
            $CmbMovNewCat.Items.Add("Geoscience Studies")
            $EnableCat = $true
        }
    
        $CmbMovNewCat.Enabled = $EnableCat
        $BtnMove.Enabled = $EnableCat
    })

$BtnMove.Add_Click({
        if ($LstMovItems.SelectedItem -and $CmbMovNewCat.SelectedItem) {
            $Result = Update-JS-Category $CmbMovType.SelectedItem $LstMovItems.SelectedItem $CmbMovNewCat.SelectedItem
            if ($Result) {
                [System.Windows.Forms.MessageBox]::Show("Category updated successfully!")
            }
            else {
                [System.Windows.Forms.MessageBox]::Show("Failed to update category. Item found but structure may vary.")
            }
        }
        else {
            [System.Windows.Forms.MessageBox]::Show("Please select an item and a new category.")
        }
    })

$BtnSaveImg.Add_Click({
        if ($LstMovItems.SelectedItem -and $TxtUpdImg.Text) {
            $Result = Update-JS-Image $CmbMovType.SelectedItem $LstMovItems.SelectedItem $TxtUpdImg.Text
            if ($Result) {
                [System.Windows.Forms.MessageBox]::Show("Image updated successfully!")
                $TxtUpdImg.Text = ""
            }
            else {
                [System.Windows.Forms.MessageBox]::Show("Failed to update image.")
            }
        }
        else {
            [System.Windows.Forms.MessageBox]::Show("Please select an item and choose an image.")
        }
    })    


# Show the form
$Form.Add_Load({
        $CmbRemType.SelectedIndex = 0
        $CmbMovType.SelectedIndex = 0
    })


# === TAB 7: PUBLISH (GIT) ===
$TabPublish = New-Object System.Windows.Forms.TabPage
$TabPublish.Text = "Publish"
$TabControl.Controls.Add($TabPublish)
$Y = 20

$LblGitHead = New-Object System.Windows.Forms.Label
$LblGitHead.Text = "Website Publication Center"
$LblGitHead.Font = New-Object System.Drawing.Font($Form.Font.FontFamily, 14, [System.Drawing.FontStyle]::Bold)
$LblGitHead.Location = New-Object System.Drawing.Point(20, $Y)
$LblGitHead.AutoSize = $true
$TabPublish.Controls.Add($LblGitHead)
$Y += 40

$TxtGitLog = New-Object System.Windows.Forms.RichTextBox
$TxtGitLog.Location = New-Object System.Drawing.Point(20, $Y)
$TxtGitLog.Size = New-Object System.Drawing.Size(840, 400) # Wider
$TxtGitLog.ReadOnly = $true
$TxtGitLog.BackColor = [System.Drawing.Color]::Black
$TxtGitLog.ForeColor = [System.Drawing.Color]::LimeGreen
$TabPublish.Controls.Add($TxtGitLog)
$Y += 410

function Write-GitLog {
    param($Msg)
    $TxtGitLog.AppendText("[$((Get-Date).ToString('HH:mm:ss'))] $Msg`n")
    $TxtGitLog.ScrollToCaret()
}

$BtnGitStatus = New-Object System.Windows.Forms.Button
$BtnGitStatus.Text = "CHECK CHANGES"
$BtnGitStatus.Location = New-Object System.Drawing.Point(20, $Y)
$BtnGitStatus.Size = New-Object System.Drawing.Size(200, 50)
$BtnGitStatus.BackColor = [System.Drawing.Color]::LightGray
$BtnGitStatus.Add_Click({
        Write-GitLog "Checking status..."
        $Out = git status 2>&1 | Out-String
        Write-GitLog $Out
    })
$TabPublish.Controls.Add($BtnGitStatus)

$BtnGitPull = New-Object System.Windows.Forms.Button
$BtnGitPull.Text = "⬇ PULL UPDATES"
$BtnGitPull.Location = New-Object System.Drawing.Point(240, $Y)
$BtnGitPull.Size = New-Object System.Drawing.Size(200, 50)
$BtnGitPull.BackColor = [System.Drawing.Color]::LightBlue
$BtnGitPull.Add_Click({
        Write-GitLog "Checking for remote updates..."
        $Out = git pull 2>&1 | Out-String
        Write-GitLog $Out
    })
$TabPublish.Controls.Add($BtnGitPull)

$BtnGitPush = New-Object System.Windows.Forms.Button
$BtnGitPush.Text = "🚀 PUBLISH LIVE"
$BtnGitPush.Location = New-Object System.Drawing.Point(460, $Y)
$BtnGitPush.Size = New-Object System.Drawing.Size(300, 50)
$BtnGitPush.BackColor = [System.Drawing.Color]::Gold
$BtnGitPush.Font = New-Object System.Drawing.Font($Form.Font, [System.Drawing.FontStyle]::Bold)
$BtnGitPush.Add_Click({
        $Confirm = [System.Windows.Forms.MessageBox]::Show("This will push all changes to the LIVE website.`n`nAre you ready?", "Confirm Publish", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Exclamation)
        if ($Confirm -eq [System.Windows.Forms.DialogResult]::Yes) {
            Write-GitLog "Starting publication sequence..."
        
            Write-GitLog ">> git add ."
            $OutAdd = git add . 2>&1 | Out-String
            Write-GitLog $OutAdd
        
            Write-GitLog ">> git commit"
            $OutCom = git commit -m "Content Update via GUI $(Get-Date)" 2>&1 | Out-String
            Write-GitLog $OutCom
        
            Write-GitLog ">> git push"
            $OutPush = git push 2>&1 | Out-String
            Write-GitLog $OutPush
        
            Write-GitLog "Done! Changes should be live shortly."
            [System.Windows.Forms.MessageBox]::Show("Publication Complete!", "Success")
        }
    })
$TabPublish.Controls.Add($BtnGitPush)


# === TAB 8: DIAGNOSTICS ===
$TabHealth = New-Object System.Windows.Forms.TabPage
$TabHealth.Text = "Diagnostics"
$TabControl.Controls.Add($TabHealth)
$Y = 20

$BtnScan = New-Object System.Windows.Forms.Button
$BtnScan.Text = "SCAN FOR BROKEN CONTENT"
$BtnScan.Location = New-Object System.Drawing.Point(20, $Y)
$BtnScan.Size = New-Object System.Drawing.Size(300, 40)
$BtnScan.BackColor = [System.Drawing.Color]::LightPink
$TabHealth.Controls.Add($BtnScan)
$Y += 50

$TxtHealth = New-Object System.Windows.Forms.RichTextBox
$TxtHealth.Location = New-Object System.Drawing.Point(20, $Y)
$TxtHealth.Size = New-Object System.Drawing.Size(840, 500)
$TxtHealth.Font = New-Object System.Drawing.Font("Consolas", 10)
$TabHealth.Controls.Add($TxtHealth)

$BtnScan.Add_Click({
        $TxtHealth.Text = "Scanning Assets...`n---------------------`n"
        $Issues = 0
    
        # Check Images in Data Files
        $Files = @("products-data.js", "services-data.js", "clients-data.js", "success-stories-data.js")
        foreach ($F in $Files) {
            $Path = Join-Path $AssetsDir $F
            if (Test-Path $Path) {
                $Content = Get-Content $Path -Raw
                # Matches image: "path"
                $ImgMatches = [regex]::Matches($Content, "['`"]?(image|logo)['`"]?\s*:\s*(['`"])(.*?)\2")
                foreach ($m in $ImgMatches) {
                    $RelPath = $m.Groups[3].Value
                    if (-not [string]::IsNullOrWhiteSpace($RelPath)) {
                        # Convert JS path to Local Path
                        $LocalPath = Join-Path $Root ($RelPath -replace "/", "\")
                        if (-not (Test-Path $LocalPath)) {
                            $TxtHealth.AppendText("[MISSING IMAGE] In $F : $RelPath `n")
                            $TxtHealth.AppendText("   -> Needed at: $LocalPath `n`n")
                            $Issues++
                        }
                    }
                }
            }
        }
    
        if ($Issues -eq 0) {
            $TxtHealth.AppendText("No issues found! All linked assets appear to exist.`n")
        }
        else {
            $TxtHealth.AppendText("---------------------`nFound $Issues potential issues.")
        }
    })


# === TAB 9: SORT / REORDER ===
$TabSort = New-Object System.Windows.Forms.TabPage
$TabSort.Text = "Sort / Reorder"
$TabControl.Controls.Add($TabSort)
$Y = 20

$LblSortType = New-Object System.Windows.Forms.Label
$LblSortType.Text = "Select Content Type to Reorder:"
$LblSortType.Location = New-Object System.Drawing.Point(20, $Y)
$LblSortType.AutoSize = $true
$TabSort.Controls.Add($LblSortType)
$Y += 25

$CmbSortType = New-Object System.Windows.Forms.ComboBox
$CmbSortType.Location = New-Object System.Drawing.Point(20, $Y)
$CmbSortType.Width = 300
$CmbSortType.Items.Add("Products")
$CmbSortType.Items.Add("Services")
$CmbSortType.Items.Add("Clients")
$CmbSortType.Items.Add("Stories")
$CmbSortType.DropDownStyle = "DropDownList"
$TabSort.Controls.Add($CmbSortType)
$Y += 40

$LblSortInstr = New-Object System.Windows.Forms.Label
$LblSortInstr.Text = "Select an item and move it Up or Down."
$LblSortInstr.Location = New-Object System.Drawing.Point(20, $Y)
$LblSortInstr.AutoSize = $true
$TabSort.Controls.Add($LblSortInstr)
$Y += 25

$LstSortItems = New-Object System.Windows.Forms.ListBox
$LstSortItems.Location = New-Object System.Drawing.Point(20, $Y)
$LstSortItems.Width = 500
$LstSortItems.Height = 300
$TabSort.Controls.Add($LstSortItems)

$BtnUp = New-Object System.Windows.Forms.Button
$BtnUp.Text = "$([char]0x25B2) MOVE UP"
$BtnUp.Location = New-Object System.Drawing.Point(530, $Y)
$BtnUp.Size = New-Object System.Drawing.Size(120, 50)
$TabSort.Controls.Add($BtnUp)

$BtnDown = New-Object System.Windows.Forms.Button
$BtnDown.Text = "$([char]0x25BC) MOVE DOWN"
$YDown = $Y + 60
$BtnDown.Location = New-Object System.Drawing.Point(530, $YDown)
$BtnDown.Size = New-Object System.Drawing.Size(120, 50)
$TabSort.Controls.Add($BtnDown)

$Y += 310

$BtnSaveSort = New-Object System.Windows.Forms.Button
$BtnSaveSort.Text = "SAVE NEW ORDER"
$BtnSaveSort.BackColor = [System.Drawing.Color]::LightBlue
$BtnSaveSort.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveSort.Size = New-Object System.Drawing.Size(200, 40)
$TabSort.Controls.Add($BtnSaveSort)

# --- SORT LOGIC ---
$Global:CurrentBlocks = @()

function Get-JS-Blocks {
    param($Type)
    $File = ""
    switch ($Type) {
        "Products" { $File = "products-data.js" }
        "Services" { $File = "services-data.js" }
        "Clients" { $File = "clients-data.js" }
        "Stories" { $File = "success-stories-data.js" }
        "HomeCards" { $File = "home-data.js" }
    }
    
    $Path = Join-Path $AssetsDir $File
    if (-not (Test-Path $Path)) { return @() }
    
    $Raw = Get-Content $Path -Raw
    $Blocks = @()
    
    # Locate array brackets
    $StartArr = $Raw.IndexOf("[")
    $EndArr = $Raw.LastIndexOf("]")
    
    if ($StartArr -lt 0 -or $EndArr -lt 0) { return @() }
    
    # We scan for top-level objects { ... }
    $CurrentIdx = $StartArr + 1
    
    while ($CurrentIdx -lt $EndArr) {
        # Find next {
        $NextOpen = $Raw.IndexOf("{", $CurrentIdx)
        if ($NextOpen -lt 0 -or $NextOpen -gt $EndArr) { break }
        
        # Find balanced closing }
        $Balance = 1
        $CloseIdx = -1
        for ($i = $NextOpen + 1; $i -lt $Raw.Length; $i++) {
            if ($Raw[$i] -eq '{') { $Balance++ }
            elseif ($Raw[$i] -eq '}') { 
                $Balance--
                if ($Balance -eq 0) { $CloseIdx = $i; break }
            }
        }
        
        if ($CloseIdx -ne -1) {
            # Extract Block
            $BlockContent = $Raw.Substring($NextOpen, ($CloseIdx - $NextOpen + 1))
            
            # Extract Name for Display Label
            # Try Name, then Title, then ID
            $Display = "Unknown Item"
            $MatchName = [regex]::Match($BlockContent, "['`"]?name['`"]?\s*:\s*(['`"])(.*?)\1")
            $MatchTitle = [regex]::Match($BlockContent, "['`"]?title['`"]?\s*:\s*(['`"])(.*?)\1")
            $MatchId = [regex]::Match($BlockContent, "['`"]?id['`"]?\s*:\s*(['`"])(.*?)\1")
            
            if ($MatchName.Success) { $Display = $MatchName.Groups[2].Value }
            elseif ($MatchTitle.Success) { $Display = $MatchTitle.Groups[2].Value }
            elseif ($MatchId.Success) { $Display = $MatchId.Groups[2].Value }
            
            # Store object with hidden block
            $Obj = New-Object PSObject -Property @{
                Display = $Display
                Block   = $BlockContent
            }
            $Blocks += $Obj
            
            $CurrentIdx = $CloseIdx + 1
        }
        else {
            break # Broken structure
        }
    }
    return $Blocks
}

function Save-JS-Order {
    param($Type)
    $File = ""
    switch ($Type) {
        "Products" { $File = "products-data.js" }
        "Services" { $File = "services-data.js" }
        "Clients" { $File = "clients-data.js" }
        "Stories" { $File = "success-stories-data.js" }
        "HomeCards" { $File = "home-data.js" }
    }
    $Path = Join-Path $AssetsDir $File
    
    # Reconstruct File
    # We need the original variable declaration part
    $Raw = Get-Content $Path -Raw
    $StartArr = $Raw.IndexOf("[")
    $EndArr = $Raw.LastIndexOf("]")
    
    $Prefix = $Raw.Substring(0, $StartArr + 1)
    $Suffix = $Raw.Substring($EndArr)
    
    # Join Blocks
    $NewInner = ""
    foreach ($Item in $LstSortItems.Items) {
        # Find corresponding block in Global
        foreach ($B in $Global:CurrentBlocks) {
            if ($B.Display -eq $Item) {
                $NewInner += "`n  " + $B.Block + ","
                break
            }
        }
    }
    # Remove last comma
    $NewInner = $NewInner.TrimEnd(",")
    
    $FinalContent = $Prefix + $NewInner + "`n" + $Suffix
    Set-Content $Path -Value $FinalContent -Encoding UTF8
}

$CmbSortType.Add_SelectedIndexChanged({
        $LstSortItems.Items.Clear()
        $Global:CurrentBlocks = Get-JS-Blocks $CmbSortType.SelectedItem
        foreach ($B in $Global:CurrentBlocks) {
            $LstSortItems.Items.Add($B.Display)
        }
    })

function Switch-Items {
    param($Idx1, $Idx2)
    if ($Idx1 -ge 0 -and $Idx1 -lt $LstSortItems.Items.Count -and $Idx2 -ge 0 -and $Idx2 -lt $LstSortItems.Items.Count) {
        $Item1 = $LstSortItems.Items[$Idx1]
        $LstSortItems.Items[$Idx1] = $LstSortItems.Items[$Idx2]
        $LstSortItems.Items[$Idx2] = $Item1
        $LstSortItems.SelectedIndex = $Idx2
    }
}

$BtnUp.Add_Click({
        $Idx = $LstSortItems.SelectedIndex
        if ($Idx -gt 0) { Switch-Items $Idx ($Idx - 1) }
    })

$BtnDown.Add_Click({
        $Idx = $LstSortItems.SelectedIndex
        if ($Idx -ne -1 -and $Idx -lt ($LstSortItems.Items.Count - 1)) { Switch-Items $Idx ($Idx + 1) }
    })

$BtnSaveSort.Add_Click({
        if ($LstSortItems.Items.Count -gt 0) {
            Save-JS-Order $CmbSortType.SelectedItem
            [System.Windows.Forms.MessageBox]::Show("Order saved successfully!")
        }
    })



# === TAB 10: BULK EDITOR ===
$TabBulk = New-Object System.Windows.Forms.TabPage
$TabBulk.Text = "Bulk Editor"
$TabControl.Controls.Add($TabBulk)
[int]$Y = 20

$LblBulkType = New-Object System.Windows.Forms.Label
$LblBulkType.Text = "Select Content Type to Bulk Edit:"
$LblBulkType.Location = New-Object System.Drawing.Point(20, $Y)
$LblBulkType.AutoSize = $true
$TabBulk.Controls.Add($LblBulkType)
$Y += 25

$CmbBulkType = New-Object System.Windows.Forms.ComboBox
$CmbBulkType.Location = New-Object System.Drawing.Point(20, $Y)
$CmbBulkType.Width = 300
[void]$CmbBulkType.Items.Add("Products")
[void]$CmbBulkType.Items.Add("Services")
[void]$CmbBulkType.Items.Add("Clients")
[void]$CmbBulkType.Items.Add("Stories")
$CmbBulkType.DropDownStyle = "DropDownList"
$TabBulk.Controls.Add($CmbBulkType)

$BtnLoadGrid = New-Object System.Windows.Forms.Button
$BtnLoadGrid.Text = "LOAD DATA"
$YLoad = $Y - 2
$BtnLoadGrid.Location = New-Object System.Drawing.Point(330, $YLoad)
$BtnLoadGrid.Size = New-Object System.Drawing.Size(120, 25)
$TabBulk.Controls.Add($BtnLoadGrid)
$Y += 40

# Add System.Data just in case
Add-Type -AssemblyName System.Data
Add-Type -AssemblyName System.Windows.Forms

$Grid = New-Object System.Windows.Forms.DataGridView
$Grid.Location = New-Object System.Drawing.Point(20, $Y)
$Grid.Size = New-Object System.Drawing.Size(840, 400)
$Grid.BackgroundColor = [System.Drawing.Color]::White
$Grid.GridColor = [System.Drawing.Color]::Black
$Grid.ForeColor = [System.Drawing.Color]::Black
$Grid.DefaultCellStyle.ForeColor = [System.Drawing.Color]::Black
$Grid.ColumnHeadersDefaultCellStyle.ForeColor = [System.Drawing.Color]::Black
$Grid.AutoSizeColumnsMode = [System.Windows.Forms.DataGridViewAutoSizeColumnsMode]::Fill
$Grid.AllowUserToAddRows = $false
$Grid.RowHeadersVisible = $false
$Grid.AutoGenerateColumns = $false # We will manually define columns

# Define Columns Manually
$ColId = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
$ColId.HeaderText = "ID (ReadOnly)"
$ColId.DataPropertyName = "ID"
$ColId.Name = "ID"
$ColId.ReadOnly = $true
$Grid.Columns.Add($ColId)

$ColName = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
$ColName.HeaderText = "Title / Name"
$ColName.DataPropertyName = "Name"
$ColName.Name = "Name"
$Grid.Columns.Add($ColName)

$ColCat = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
$ColCat.HeaderText = "Category"
$ColCat.DataPropertyName = "Category"
$ColCat.Name = "Category"
$Grid.Columns.Add($ColCat)

$ColImg = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
$ColImg.HeaderText = "Image Path"
$ColImg.DataPropertyName = "Image"
$ColImg.Name = "Image"
$Grid.Columns.Add($ColImg)

$ColDesc = New-Object System.Windows.Forms.DataGridViewTextBoxColumn
$ColDesc.HeaderText = "Description"
$ColDesc.DataPropertyName = "Description"
$ColDesc.Name = "Description"
$Grid.Columns.Add($ColDesc)


$TabBulk.Controls.Add($Grid)
$Y += 410

$BtnSaveBulk = New-Object System.Windows.Forms.Button
$BtnSaveBulk.Text = "SAVE ALL CHANGES"
$BtnSaveBulk.BackColor = [System.Drawing.Color]::LightGreen
$BtnSaveBulk.Font = New-Object System.Drawing.Font($Form.Font, [System.Drawing.FontStyle]::Bold)
$BtnSaveBulk.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveBulk.Size = New-Object System.Drawing.Size(840, 40)
$TabBulk.Controls.Add($BtnSaveBulk)

# --- BULK LOGIC ---

function Get-JS-Objects-Table {
    param($Type)
    $File = ""
    switch ($Type) {
        "Products" { $File = "products-data.js" }
        "Services" { $File = "services-data.js" }
        "Clients" { $File = "clients-data.js" }
        "Stories" { $File = "success-stories-data.js" }
    }
    
    $Path = Join-Path $AssetsDir $File
    if (-not (Test-Path $Path)) { return $null }
    

    $Blocks = Get-JS-Blocks $Type 
    if ($Blocks.Count -eq 0) {
        # Silent failure or log
    }
    
    $Table = New-Object System.Data.DataTable
    $Table.Columns.Add("ID") | Out-Null
    $Table.Columns.Add("Name") | Out-Null
    $Table.Columns.Add("Category") | Out-Null
    $Table.Columns.Add("Image") | Out-Null
    $Table.Columns.Add("Description") | Out-Null
    
    foreach ($B in $Blocks) {
        $Txt = $B.Block
        $Id = [regex]::Match($Txt, "['`"]?id['`"]?\s*:\s*(['`"])(.*?)\1").Groups[2].Value
        
        $Name = [regex]::Match($Txt, "['`"]?name['`"]?\s*:\s*(['`"])(.*?)\1").Groups[2].Value
        if (-not $Name) { $Name = [regex]::Match($Txt, "['`"]?title['`"]?\s*:\s*(['`"])(.*?)\1").Groups[2].Value }
        
        $Cat = [regex]::Match($Txt, "['`"]?category['`"]?\s*:\s*(['`"])(.*?)\1").Groups[2].Value
        
        $ImgMatch = [regex]::Match($Txt, "['`"]?(image|logo)['`"]?\s*:\s*(['`"])(.*?)\2")
        $Img = $ImgMatch.Groups[3].Value
        
        $Desc = [regex]::Match($Txt, "['`"]?description['`"]?\s*:\s*(['`"])(.*?)\1").Groups[2].Value
        
        $Row = $Table.NewRow()
        $Row["ID"] = $Id
        $Row["Name"] = $Name
        $Row["Category"] = $Cat
        $Row["Image"] = $Img
        $Row["Description"] = $Desc
        $Table.Rows.Add($Row)
    }
    
    return , $Table
}

function Update-JS-Field {
    param($Block, $KeyPattern, $NewValue)
    if (-not $NewValue) { return $Block }
    
    # Escape special chars (simple double quote escape)
    $SafeValue = $NewValue -replace '"', '\"'
    
    # Regex to find key: "value"
    $Pattern = "(?mi)(['`"]?\b(?:$KeyPattern)\b['`"]?\s*:\s*)(['`"])(.*?)\2"
    
    if ($Block -match $Pattern) {
        $Block = $Block -replace $Pattern, ('${1}"' + $SafeValue + '"')
    }
    return $Block
}

function Save-Grid-To-JS {
    param($Type)
    $File = ""
    switch ($Type) {
        "Products" { $File = "products-data.js" }
        "Services" { $File = "services-data.js" }
        "Clients" { $File = "clients-data.js" }
        "Stories" { $File = "success-stories-data.js" }
    }
    
    $Path = Join-Path $AssetsDir $File
    
    # 1. Load Original Blocks to Preserve Data
    $ExistingBlocks = Get-JS-Blocks $Type
    $BlockMap = @{}
    foreach ($B in $ExistingBlocks) {
        $Txt = $B.Block
        $MatchId = [regex]::Match($Txt, "['`"]?id['`"]?\s*:\s*(['`"])(.*?)\1")
        if ($MatchId.Success) {
            $Id = $MatchId.Groups[2].Value
            $BlockMap[$Id] = $Txt
        }
    }
    
    # 2. Iterate Grid and Update Blocks
    $NewBlocks = @()
    
    foreach ($Row in $Grid.Rows) {
        $Id = $Row.Cells["ID"].Value
        if (-not $Id) { continue }
        
        # Determine Keys based on Type
        $NameKey = "name"
        if ($Type -eq "Services" -or $Type -eq "Stories") { $NameKey = "title" }
        
        $ImgKey = "image"
        if ($Type -eq "Clients") { $ImgKey = "logo" }
        
        $ValName = $Row.Cells["Name"].Value
        $ValCat = $Row.Cells["Category"].Value
        $ValImg = $Row.Cells["Image"].Value
        $ValDesc = $Row.Cells["Description"].Value
        
        if ($BlockMap.ContainsKey($Id)) {
            $Block = $BlockMap[$Id]
            
            # Non-Destructive Update using Regex
            # We match 'name' or 'title' explicitly
            $Block = Update-JS-Field $Block "name|title" $ValName
            $Block = Update-JS-Field $Block "category" $ValCat
            $Block = Update-JS-Field $Block "image|logo" $ValImg
            
            # Special handling for description newlines
            if ($ValDesc) {
                $CleanDesc = $ValDesc -replace "`r`n", " " -replace "`n", " "
                $Block = Update-JS-Field $Block "description" $CleanDesc
            }
            
            $NewBlocks += $Block
        }
        else {
            # Fallback for New ID (Simple Construct)
            $ObjStr = "`n  {`n    id: `"$Id`",`n    ${NameKey}: `"$ValName`",`n    category: `"$ValCat`",`n    ${ImgKey}: `"$ValImg`",`n    description: `"$ValDesc`"`n  }"
            $NewBlocks += $ObjStr
        }
    }
    
    # 3. Write Back
    $Raw = Get-Content $Path -Raw
    $StartArr = $Raw.IndexOf("[")
    $Prefix = $Raw.Substring(0, $StartArr + 1)
    
    $NewInner = $NewBlocks -join ","
    $FinalContent = $Prefix + $NewInner + "`n];"
    Set-Content $Path -Value $FinalContent -Encoding UTF8
}

$BtnLoadGrid.Add_Click({
        if ($CmbBulkType.SelectedItem) {
            $RawResult = Get-JS-Objects-Table $CmbBulkType.SelectedItem
        
            # Handle Pipeline: We expect a single DataTable now, but handle array wrapper just in case
            $Table = $null
            if ($RawResult -is [System.Array]) {
                foreach ($Item in $RawResult) {
                    if ($Item -is [System.Data.DataTable]) {
                        $Table = $Item
                        break
                    }
                }
            }
            elseif ($RawResult -is [System.Data.DataTable]) {
                $Table = $RawResult
            }
        
            if ($Table) {
                $Grid.DataSource = $null 
                $Grid.Rows.Clear()
            
                foreach ($Row in $Table.Rows) {
                    if ($Row) {
                        [void]$Grid.Rows.Add([string]$Row["ID"], [string]$Row["Name"], [string]$Row["Category"], [string]$Row["Image"], [string]$Row["Description"])
                    }
                }
            
                [System.Windows.Forms.MessageBox]::Show("Loaded " + $Table.Rows.Count + " rows." )
            }
            else {
                [System.Windows.Forms.MessageBox]::Show("Failure. Returned Type: " + $RawResult.GetType().FullName)
            }
        }
        else {
            [System.Windows.Forms.MessageBox]::Show("Please select a content type first.")
        }
    })
    
$BtnSaveBulk.Add_Click({
        if ($Grid.Rows.Count -gt 0) {
            $Confirm = [System.Windows.Forms.MessageBox]::Show("This will OVERWRITE the file with the data in the grid.`nMake sure your data looks correct.`n`nContinue?", "Bulk Save", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Warning)
            if ($Confirm -eq [System.Windows.Forms.DialogResult]::Yes) {
                Save-Grid-To-JS $CmbBulkType.SelectedItem
                [System.Windows.Forms.MessageBox]::Show("Saved successfully!")
            }
        }
    })

# === TAB 11: LINKEDIN NEWS ===
$TabNews = New-Object System.Windows.Forms.TabPage
$TabNews.Text = "LinkedIn News"
$TabControl.Controls.Add($TabNews)
[int]$Y = 20

$LblNews = New-Object System.Windows.Forms.Label
$LblNews.Text = "Manage LinkedIn News Feed (URNs):"
$LblNews.Location = New-Object System.Drawing.Point(20, $Y)
$LblNews.AutoSize = $true
$TabNews.Controls.Add($LblNews)
$Y += 25

$LstNews = New-Object System.Windows.Forms.ListBox
$LstNews.Location = New-Object System.Drawing.Point(20, $Y)
$LstNews.Width = 600
$LstNews.Height = 350
$TabNews.Controls.Add($LstNews)

$BtnNewsUp = New-Object System.Windows.Forms.Button
$BtnNewsUp.Text = [char]0x25B2 # Up
$BtnNewsUp.Location = New-Object System.Drawing.Point(630, $Y)
$BtnNewsUp.Size = New-Object System.Drawing.Size(100, 40)
$TabNews.Controls.Add($BtnNewsUp)

$BtnNewsDown = New-Object System.Windows.Forms.Button
$BtnNewsDown.Text = [char]0x25BC # Down
$BtnNewsDown.Location = New-Object System.Drawing.Point(630, ($Y + 50))
$BtnNewsDown.Size = New-Object System.Drawing.Size(100, 40)
$TabNews.Controls.Add($BtnNewsDown)

$BtnRemoveNews = New-Object System.Windows.Forms.Button
$BtnRemoveNews.Text = "REMOVE SELECT"
$BtnRemoveNews.Location = New-Object System.Drawing.Point(630, ($Y + 110))
$BtnRemoveNews.Size = New-Object System.Drawing.Size(100, 40)
$BtnRemoveNews.BackColor = [System.Drawing.Color]::Salmon
$TabNews.Controls.Add($BtnRemoveNews)

$Y += 360

$LblAddNews = New-Object System.Windows.Forms.Label
$LblAddNews.Text = "Add New URN (e.g. urn:li:share:123...):"
$LblAddNews.Location = New-Object System.Drawing.Point(20, $Y)
$LblAddNews.AutoSize = $true
$TabNews.Controls.Add($LblAddNews)
$Y += 25

$TxtNewsUrn = New-Object System.Windows.Forms.TextBox
$TxtNewsUrn.Location = New-Object System.Drawing.Point(20, $Y)
$TxtNewsUrn.Width = 500
$TabNews.Controls.Add($TxtNewsUrn)

$BtnAddNews = New-Object System.Windows.Forms.Button
$BtnAddNews.Text = "ADD"
$BtnAddNews.Location = New-Object System.Drawing.Point(530, ($Y - 1))
$BtnAddNews.Size = New-Object System.Drawing.Size(90, 23)
$TabNews.Controls.Add($BtnAddNews)

$Y += 40

$BtnSaveNews = New-Object System.Windows.Forms.Button
$BtnSaveNews.Text = "SAVE NEWS LIST"
$BtnSaveNews.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveNews.Size = New-Object System.Drawing.Size(600, 40)
$BtnSaveNews.BackColor = [System.Drawing.Color]::LightGreen
$TabNews.Controls.Add($BtnSaveNews)

# --- NEWS LOGIC ---
function Get-News-Items {
    $Path = Join-Path $AssetsDir "news-data.js"
    if (-not (Test-Path $Path)) { return @() }
    
    $Raw = Get-Content $Path -Raw
    # Extract strings inside the array
    # Looks for: "urn:..."
    $RegexMatches = [regex]::Matches($Raw, "['`"](urn:li:[a-zA-Z0-9:]+)['`"]")
    $Items = @()
    foreach ($m in $RegexMatches) {
        $Items += $m.Groups[1].Value
    }
    return $Items
}

function Save-News-ToFile {
    $Path = Join-Path $AssetsDir "news-data.js"
    
    $JsStr = "// LinkedIn News Feed Data`n"
    $JsStr += "// Auto-generated by Content Manager GUI`n"
    $JsStr += "const linkedInPosts = [`n"
    
    foreach ($Item in $LstNews.Items) {
        $JsStr += "    `"$Item`",`n"
    }
    
    # Remove last comma if exists (manual approach)
    $JsStr = $JsStr.TrimEnd("`n")
    $JsStr = $JsStr.TrimEnd(",")
    $JsStr += "`n];`n"
    
    Set-Content $Path -Value $JsStr -Encoding UTF8
}

function Update-NewsList {
    $LstNews.Items.Clear()
    $Items = Get-News-Items
    foreach ($i in $Items) { $LstNews.Items.Add($i) }
}

# Events
$TabNews.Add_Enter({ Update-NewsList })

$BtnAddNews.Add_Click({
        if ($TxtNewsUrn.Text -match "^urn:li:") {
            $LstNews.Items.Insert(0, $TxtNewsUrn.Text) # Add to top
            $TxtNewsUrn.Text = ""
        }
        else {
            [System.Windows.Forms.MessageBox]::Show("Invalid URN format. Must start with 'urn:li:'")
        }
    })

$BtnRemoveNews.Add_Click({
        if ($LstNews.SelectedItem) {
            $LstNews.Items.Remove($LstNews.SelectedItem)
        }
    })

$BtnNewsUp.Add_Click({
        $Idx = $LstNews.SelectedIndex
        if ($Idx -gt 0) {
            $Item = $LstNews.SelectedItem
            $LstNews.Items.RemoveAt($Idx)
            $LstNews.Items.Insert($Idx - 1, $Item)
            $LstNews.SelectedIndex = $Idx - 1
        }
    })

$BtnNewsDown.Add_Click({
        $Idx = $LstNews.SelectedIndex
        if ($Idx -ne -1 -and $Idx -lt ($LstNews.Items.Count - 1)) {
            $Item = $LstNews.SelectedItem
            $LstNews.Items.RemoveAt($Idx)
            $LstNews.Items.Insert($Idx + 1, $Item)
            $LstNews.SelectedIndex = $Idx + 1
        }
    })

$BtnSaveNews.Add_Click({
        Save-News-ToFile
        [System.Windows.Forms.MessageBox]::Show("News list saved successfully!")
    })


# === TAB 12: DETAIL EDITOR (ADVANCED) ===
$TabDetail = New-Object System.Windows.Forms.TabPage
$TabDetail.Text = "Detail Editor"
$TabControl.Controls.Add($TabDetail)
[int]$Y = 20

# -- SELECTION --
$LblDetType = New-Object System.Windows.Forms.Label
$LblDetType.Text = "Context:"
$LblDetType.Location = New-Object System.Drawing.Point(20, $Y)
$LblDetType.AutoSize = $true
$TabDetail.Controls.Add($LblDetType)

$CmbDetType = New-Object System.Windows.Forms.ComboBox
$CmbDetType.Location = New-Object System.Drawing.Point(80, ($Y - 3))
$CmbDetType.Width = 200
$CmbDetType.Items.Add("Products")
$CmbDetType.Items.Add("Services")
$CmbDetType.DropDownStyle = "DropDownList"
$TabDetail.Controls.Add($CmbDetType)

$CmbDetItem = New-Object System.Windows.Forms.ComboBox
$CmbDetItem.Location = New-Object System.Drawing.Point(300, ($Y - 3))
$CmbDetItem.Width = 560
$CmbDetItem.DropDownStyle = "DropDownList"
$TabDetail.Controls.Add($CmbDetItem)
$Y += 40

# -- LONG DESCRIPTION --
$LblDetDesc = New-Object System.Windows.Forms.Label
$LblDetDesc.Text = "Long Description (HTML Allowed):"
$LblDetDesc.Location = New-Object System.Drawing.Point(20, $Y)
$LblDetDesc.AutoSize = $true
$TabDetail.Controls.Add($LblDetDesc)
$Y += 20

$TxtDetDesc = New-Object System.Windows.Forms.TextBox
$TxtDetDesc.Location = New-Object System.Drawing.Point(20, $Y)
$TxtDetDesc.Size = New-Object System.Drawing.Size(840, 100)
$TxtDetDesc.Multiline = $true
$TxtDetDesc.ScrollBars = "Vertical"
$TabDetail.Controls.Add($TxtDetDesc)
$Y += 110

# -- FEATURES --
$LblDetFeat = New-Object System.Windows.Forms.Label
$LblDetFeat.Text = "Features List (Strings):"
$LblDetFeat.Location = New-Object System.Drawing.Point(20, $Y)
$LblDetFeat.AutoSize = $true
$TabDetail.Controls.Add($LblDetFeat)
$Y += 20

$LstDetFeat = New-Object System.Windows.Forms.ListBox
$LstDetFeat.Location = New-Object System.Drawing.Point(20, $Y)
$LstDetFeat.Size = New-Object System.Drawing.Size(300, 150)
$TabDetail.Controls.Add($LstDetFeat)

$TxtDetFeatIn = New-Object System.Windows.Forms.TextBox
$TxtDetFeatIn.Location = New-Object System.Drawing.Point(20, ($Y + 155))
$TxtDetFeatIn.Width = 220
$TabDetail.Controls.Add($TxtDetFeatIn)

$BtnDetFeatAdd = New-Object System.Windows.Forms.Button
$BtnDetFeatAdd.Text = "ADD"
$BtnDetFeatAdd.Location = New-Object System.Drawing.Point(245, ($Y + 154))
$BtnDetFeatAdd.Size = New-Object System.Drawing.Size(75, 23)
$TabDetail.Controls.Add($BtnDetFeatAdd)

$BtnDetFeatUp = New-Object System.Windows.Forms.Button
$BtnDetFeatUp.Text = [char]0x25B2 # Up Arrow
$BtnDetFeatUp.Location = New-Object System.Drawing.Point(325, $Y)
$BtnDetFeatUp.Size = New-Object System.Drawing.Size(30, 30)
$TabDetail.Controls.Add($BtnDetFeatUp)

$BtnDetFeatDown = New-Object System.Windows.Forms.Button
$BtnDetFeatDown.Text = [char]0x25BC # Down Arrow
$BtnDetFeatDown.Location = New-Object System.Drawing.Point(325, ($Y + 35))
$BtnDetFeatDown.Size = New-Object System.Drawing.Size(30, 30)
$TabDetail.Controls.Add($BtnDetFeatDown)

$BtnDetFeatRem = New-Object System.Windows.Forms.Button
$BtnDetFeatRem.Text = "X"
$BtnDetFeatRem.Location = New-Object System.Drawing.Point(325, ($Y + 70))
$BtnDetFeatRem.Size = New-Object System.Drawing.Size(30, 30)
$BtnDetFeatRem.BackColor = [System.Drawing.Color]::Salmon
$TabDetail.Controls.Add($BtnDetFeatRem)


# -- GALLERY (Products Only) --
$LblDetGal = New-Object System.Windows.Forms.Label
$LblDetGal.Text = "Gallery Images (Products Only):"
$LblDetGal.Location = New-Object System.Drawing.Point(400, ($Y - 20))
$LblDetGal.AutoSize = $true
$TabDetail.Controls.Add($LblDetGal)

$LstDetGal = New-Object System.Windows.Forms.ListBox
$LstDetGal.Location = New-Object System.Drawing.Point(400, $Y)
$LstDetGal.Size = New-Object System.Drawing.Size(400, 150)
$TabDetail.Controls.Add($LstDetGal)

$BtnDetGalAdd = New-Object System.Windows.Forms.Button
$BtnDetGalAdd.Text = "ADD IMAGES (MULTI)"
$BtnDetGalAdd.Location = New-Object System.Drawing.Point(400, ($Y + 155))
$BtnDetGalAdd.Size = New-Object System.Drawing.Size(400, 30)
$TabDetail.Controls.Add($BtnDetGalAdd)

$BtnDetGalUp = New-Object System.Windows.Forms.Button
$BtnDetGalUp.Text = [char]0x25B2 # Up Arrow
$BtnDetGalUp.Location = New-Object System.Drawing.Point(805, $Y)
$BtnDetGalUp.Size = New-Object System.Drawing.Size(30, 30)
$TabDetail.Controls.Add($BtnDetGalUp)

$BtnDetGalDown = New-Object System.Windows.Forms.Button
$BtnDetGalDown.Text = [char]0x25BC # Down Arrow
$BtnDetGalDown.Location = New-Object System.Drawing.Point(805, ($Y + 35))
$BtnDetGalDown.Size = New-Object System.Drawing.Size(30, 30)
$TabDetail.Controls.Add($BtnDetGalDown)

$BtnDetGalRem = New-Object System.Windows.Forms.Button
$BtnDetGalRem.Text = "X"
$BtnDetGalRem.Location = New-Object System.Drawing.Point(805, ($Y + 70))
$BtnDetGalRem.Size = New-Object System.Drawing.Size(30, 30)
$BtnDetGalRem.BackColor = [System.Drawing.Color]::Salmon
$TabDetail.Controls.Add($BtnDetGalRem)

$Y += 210

# -- HIGHLIGHTS --
$LblDetHi = New-Object System.Windows.Forms.Label
$LblDetHi.Text = "Highlights List (Strings):"
$LblDetHi.Location = New-Object System.Drawing.Point(20, $Y)
$LblDetHi.AutoSize = $true
$TabDetail.Controls.Add($LblDetHi)
$Y += 20

$LstDetHi = New-Object System.Windows.Forms.ListBox
$LstDetHi.Location = New-Object System.Drawing.Point(20, $Y)
$LstDetHi.Size = New-Object System.Drawing.Size(300, 150)
$TabDetail.Controls.Add($LstDetHi)

$TxtDetHiIn = New-Object System.Windows.Forms.TextBox
$TxtDetHiIn.Location = New-Object System.Drawing.Point(20, ($Y + 155))
$TxtDetHiIn.Width = 220
$TabDetail.Controls.Add($TxtDetHiIn)

$BtnDetHiAdd = New-Object System.Windows.Forms.Button
$BtnDetHiAdd.Text = "ADD"
$BtnDetHiAdd.Location = New-Object System.Drawing.Point(245, ($Y + 154))
$BtnDetHiAdd.Size = New-Object System.Drawing.Size(75, 23)
$TabDetail.Controls.Add($BtnDetHiAdd)

$BtnDetHiUp = New-Object System.Windows.Forms.Button
$BtnDetHiUp.Text = [char]0x25B2
$BtnDetHiUp.Location = New-Object System.Drawing.Point(325, $Y)
$BtnDetHiUp.Size = New-Object System.Drawing.Size(30, 30)
$TabDetail.Controls.Add($BtnDetHiUp)

$BtnDetHiDown = New-Object System.Windows.Forms.Button
$BtnDetHiDown.Text = [char]0x25BC 
$BtnDetHiDown.Location = New-Object System.Drawing.Point(325, ($Y + 35))
$BtnDetHiDown.Size = New-Object System.Drawing.Size(30, 30)
$TabDetail.Controls.Add($BtnDetHiDown)

$BtnDetHiRem = New-Object System.Windows.Forms.Button
$BtnDetHiRem.Text = "X"
$BtnDetHiRem.Location = New-Object System.Drawing.Point(325, ($Y + 70))
$BtnDetHiRem.Size = New-Object System.Drawing.Size(30, 30)
$BtnDetHiRem.BackColor = [System.Drawing.Color]::Salmon
$TabDetail.Controls.Add($BtnDetHiRem)

$Y += 210

$BtnSaveDetail = New-Object System.Windows.Forms.Button
$BtnSaveDetail.Text = "$([System.Char]::ConvertFromUtf32(0x1F4BE)) UPDATE DETAILS"
$BtnSaveDetail.Location = New-Object System.Drawing.Point(20, $Y)
$BtnSaveDetail.Size = New-Object System.Drawing.Size(840, 40)
$BtnSaveDetail.BackColor = [System.Drawing.Color]::LightGreen
$TabDetail.Controls.Add($BtnSaveDetail)

# --- DETAIL LOGIC ---
$Global:DetailMap = @{}

function Initialize-DetailItems {
    $CmbDetItem.Items.Clear()
    $Global:DetailMap = @{}
    
    $Type = $CmbDetType.SelectedItem
    if (-not $Type) { return }
    
    $Items = Get-JS-Blocks $Type 
    foreach ($B in $Items) {
        $CmbDetItem.Items.Add($B.Display)
        # Store block but also extract ID for saving later
        $Txt = $B.Block
        $q = [char]39 # Single Quote
        $Q = [char]34 # Double Quote
        
        $MatchId = [regex]::Match($Txt, "[$q$Q]?id[$q$Q]?\s*:\s*([$q$Q])(.*?)\1")
        if ($MatchId.Success) {
            $Id = $MatchId.Groups[2].Value
            $Global:DetailMap[$B.Display] = @{ ID = $Id; Block = $Txt }
        }
    }
}

function Read-DetailBlock {
    $Key = $CmbDetItem.SelectedItem
    if (-not $Key) { return }
    
    $Data = $Global:DetailMap[$Key]
    $Txt = $Data.Block
    
    $q = [char]39 # Single Quote
    $Q = [char]34 # Double Quote
    
    # Extract Description
    $DescMatch = [regex]::Match($Txt, "[$q$Q]?longDescription[$q$Q]?\s*:\s*([$q$Q])([\s\S]*?)\1")
    if (-not $DescMatch.Success) {
        $DescMatch = [regex]::Match($Txt, "[$q$Q]?description[$q$Q]?\s*:\s*([$q$Q])([\s\S]*?)\1")
    }
    $TxtDetDesc.Text = if ($DescMatch.Success) { $DescMatch.Groups[2].Value } else { "" }
    
    # Extract Features (Array of strings)
    $LstDetFeat.Items.Clear()
    $FeatMatch = [regex]::Match($Txt, "[$q$Q]?features[$q$Q]?\s*:\s*\[([\s\S]*?)\]")
    if ($FeatMatch.Success) {
        $Inner = $FeatMatch.Groups[1].Value
        $Strs = [regex]::Matches($Inner, "([$q$Q])(.*?)\1") 
        foreach ($m in $Strs) { 
            # Unescape JSON string for display (e.g. \u003c -> <)
            $RawVal = $m.Groups[2].Value
            try { $Val = ConvertFrom-Json """$RawVal""" } catch { $Val = $RawVal }
            $LstDetFeat.Items.Add($Val) 
        }
    }
    
    # Extract Gallery (Array of strings)
    $LstDetGal.Items.Clear()
    $GalMatch = [regex]::Match($Txt, "[$q$Q]?gallery[$q$Q]?\s*:\s*\[([\s\S]*?)\]")
    if ($GalMatch.Success) {
        $Inner = $GalMatch.Groups[1].Value
        $Strs = [regex]::Matches($Inner, "([$q$Q])(.*?)\1")
        foreach ($m in $Strs) { 
            $RawVal = $m.Groups[2].Value
            $LstDetGal.Items.Add($RawVal) # Gallery paths usually safe, but consistent
        }
    }
    
    # Extract Highlights
    $LstDetHi.Items.Clear()
    $HiMatch = [regex]::Match($Txt, "[$q$Q]?highlights[$q$Q]?\s*:\s*\[([\s\S]*?)\]")
    if ($HiMatch.Success) {
        $Inner = $HiMatch.Groups[1].Value
        $Strs = [regex]::Matches($Inner, "([$q$Q])(.*?)\1") 
        foreach ($m in $Strs) { 
            $RawVal = $m.Groups[2].Value
            try { $Val = ConvertFrom-Json """$RawVal""" } catch { $Val = $RawVal }
            $LstDetHi.Items.Add($Val) 
        }
    }
}

function Save-DetailBlock {
    $Key = $CmbDetItem.SelectedItem
    if (-not $Key) { return }
    
    $Type = $CmbDetType.SelectedItem
    $Data = $Global:DetailMap[$Key]
    $Id = $Data.ID
    
    # 1. Load File
    $File = if ($Type -eq "Products") { "products-data.js" } else { "services-data.js" }
    $Path = Join-Path $AssetsDir $File
    $Raw = Get-Content $Path -Raw
    
    $q = [char]39 # Single Quote
    $Q = [char]34 # Double Quote
    
    # 2. Find Block
    # Fix: Unescape unicode sequences if present (e.g. \u0026amp;)
    $Id = [System.Text.RegularExpressions.Regex]::Unescape($Id)
    
    $EscId = [regex]::Escape($Id)
    $BlockMatch = [regex]::Match($Raw, "\{\s*[$q$Q]?id[$q$Q]?\s*:\s*[$q$Q]$EscId[$q$Q][\s\S]*?\}")
    
    if (-not $BlockMatch.Success) { 
        [System.Windows.Forms.MessageBox]::Show("Error: Could not find block in file to save.")
        return 
    }
    
    $OldBlock = $BlockMatch.Value
    $NewBlock = $OldBlock
    
    # 3. Update Description (Long)
    # If exists, replace. If not, insert? simpler to use our Update-JS-Field helper but it only does simple replace
    # We might need to inject if missing.
    $SafeDesc = $TxtDetDesc.Text -replace '"', '\"' -replace "`r`n", " " -replace "`n", " "
    
    if ($NewBlock -match "longDescription") {
        $NewBlock = Update-JS-Field $NewBlock "longDescription" $SafeDesc
    }
    elseif ($NewBlock -match "description") {
        # If no longDesc, update regular desc? Or inject? Let's just update desc for now or strict map.
        # For Detail Editor, we want "longDescription".
        # Injecting is complex with Regex.
        # Fallback: Just update description for now as they are often same in this schema
        $NewBlock = Update-JS-Field $NewBlock "description" $SafeDesc
    }
    
    # 4. Update Features Array
    $FeatStr = "features: [" + [Environment]::NewLine
    foreach ($Item in $LstDetFeat.Items) {
        # Safe JSON escape
        $JsonItem = $Item | ConvertTo-Json -Compress
        $FeatStr += "      $JsonItem," + [Environment]::NewLine
    }
    $FeatStr = $FeatStr.TrimEnd(",`r`n") + [Environment]::NewLine + "    ]"
    
    if ($NewBlock -match "features\s*:\s*\[[\s\S]*?\]") {
        $NewBlock = $NewBlock -replace "features\s*:\s*\[[\s\S]*?\]", $FeatStr
    }
    
    # 5. Update Gallery Array
    $GalStr = "gallery: [" + [Environment]::NewLine
    foreach ($Item in $LstDetGal.Items) {
        $JsonItem = $Item | ConvertTo-Json -Compress
        $GalStr += "      $JsonItem," + [Environment]::NewLine
    }
    $GalStr = $GalStr.TrimEnd(",`r`n") + [Environment]::NewLine + "    ]"
    
    if ($NewBlock -match "gallery\s*:\s*\[[\s\S]*?\]") {
        $NewBlock = $NewBlock -replace "gallery\s*:\s*\[[\s\S]*?\]", $GalStr
    }
    
    # 6. Update Highlights Array
    $HiStr = "highlights: [" + [Environment]::NewLine
    foreach ($Item in $LstDetHi.Items) {
        $JsonItem = $Item | ConvertTo-Json -Compress
        $HiStr += "      $JsonItem," + [Environment]::NewLine
    }
    $HiStr = $HiStr.TrimEnd(",`r`n") + [Environment]::NewLine + "    ]"
    
    if ($NewBlock -match "highlights\s*:\s*\[[\s\S]*?\]") {
        $NewBlock = $NewBlock -replace "highlights\s*:\s*\[[\s\S]*?\]", $HiStr
    }
    elseif ($LstDetHi.Items.Count -gt 0) {
        # Inject if missing
        if ($NewBlock -match "features\s*:\s*\[[\s\S]*?\]") {
            $NewBlock = $NewBlock -replace "(features\s*:\s*\[[\s\S]*?\])", "`$1,`n    $HiStr"
        }
        else {
            $NewBlock = $NewBlock -replace "\s*\}\s*$", ",`n    $HiStr`n  }"
        }
    }
    
    # 6. Save to File
    $NewRaw = $Raw.Replace($OldBlock, $NewBlock)
    Set-Content $Path -Value $NewRaw -Encoding UTF8
    
    # Update Memory Cache so we don't reload stale data
    $Global:DetailMap[$Key] = @{ ID = $Id; Block = $NewBlock }
    
    [System.Windows.Forms.MessageBox]::Show("Details Updated!")
}

# Events
# Events
$CmbDetType.Add_SelectedIndexChanged({ Initialize-DetailItems })
$CmbDetItem.Add_SelectedIndexChanged({ Read-DetailBlock })

# Features List Buttons
$BtnDetFeatAdd.Add_Click({ 
        if ($TxtDetFeatIn.Text) { 
            $LstDetFeat.Items.Add($TxtDetFeatIn.Text)
            $TxtDetFeatIn.Text = "" 
        } 
    })
$BtnDetFeatRem.Add_Click({ if ($LstDetFeat.SelectedItem) { $LstDetFeat.Items.Remove($LstDetFeat.SelectedItem) } })
$BtnDetFeatUp.Add_Click({ 
        $Idx = $LstDetFeat.SelectedIndex
        if ($Idx -gt 0) {
            $Val = $LstDetFeat.SelectedItem
            $LstDetFeat.Items.RemoveAt($Idx)
            $LstDetFeat.Items.Insert($Idx - 1, $Val)
            $LstDetFeat.SelectedIndex = $Idx - 1
        }
    })
$BtnDetFeatDown.Add_Click({
        $Idx = $LstDetFeat.SelectedIndex
        if ($Idx -ne -1 -and $Idx -lt ($LstDetFeat.Items.Count - 1)) {
            $Val = $LstDetFeat.SelectedItem
            $LstDetFeat.Items.RemoveAt($Idx)
            $LstDetFeat.Items.Insert($Idx + 1, $Val)
            $LstDetFeat.SelectedIndex = $Idx + 1
        }
    })

# Gallery Buttons
$BtnDetGalAdd.Add_Click({
        $Context = $null
        if ($CmbDetItem.SelectedItem) { $Context = $CmbDetItem.SelectedItem.ToString() }
        # Pass $true for MultiSelect
        $Paths = Select-Image $Context $true 
        if ($Paths) {
            foreach ($p in $Paths) { $LstDetGal.Items.Add($p) }
        }
    })
$BtnDetGalRem.Add_Click({ if ($LstDetGal.SelectedItem) { $LstDetGal.Items.Remove($LstDetGal.SelectedItem) } })
$BtnDetGalUp.Add_Click({ 
        $Idx = $LstDetGal.SelectedIndex
        if ($Idx -gt 0) {
            $Val = $LstDetGal.SelectedItem
            $LstDetGal.Items.RemoveAt($Idx)
            $LstDetGal.Items.Insert($Idx - 1, $Val)
            $LstDetGal.SelectedIndex = $Idx - 1
        }
    })



$BtnDetGalDown.Add_Click({
        $Idx = $LstDetGal.SelectedIndex
        if ($Idx -ne -1 -and $Idx -lt ($LstDetGal.Items.Count - 1)) {
            $Val = $LstDetGal.SelectedItem
            $LstDetGal.Items.RemoveAt($Idx)
            $LstDetGal.Items.Insert($Idx + 1, $Val)
            $LstDetGal.SelectedIndex = $Idx + 1
        }
    })


# Highlights Buttons
$BtnDetHiAdd.Add_Click({ 
        if ($TxtDetHiIn.Text) { 
            $LstDetHi.Items.Add($TxtDetHiIn.Text)
            $TxtDetHiIn.Text = "" 
        } 
    })
$BtnDetHiRem.Add_Click({ if ($LstDetHi.SelectedItem) { $LstDetHi.Items.Remove($LstDetHi.SelectedItem) } })
$BtnDetHiUp.Add_Click({ 
        $Idx = $LstDetHi.SelectedIndex
        if ($Idx -gt 0) {
            $Val = $LstDetHi.SelectedItem
            $LstDetHi.Items.RemoveAt($Idx)
            $LstDetHi.Items.Insert($Idx - 1, $Val)
            $LstDetHi.SelectedIndex = $Idx - 1
        }
    })
$BtnDetHiDown.Add_Click({
        $Idx = $LstDetHi.SelectedIndex
        if ($Idx -ne -1 -and $Idx -lt ($LstDetHi.Items.Count - 1)) {
            $Val = $LstDetHi.SelectedItem
            $LstDetHi.Items.RemoveAt($Idx)
            $LstDetHi.Items.Insert($Idx + 1, $Val)
            $LstDetHi.SelectedIndex = $Idx + 1
        }
    })

$BtnSaveDetail.Add_Click({ Save-DetailBlock })


# === TAB 13: HOME CARDS ===
$TabHome = New-Object System.Windows.Forms.TabPage
$TabHome.Text = "Home Cards"
$TabControl.Controls.Add($TabHome)
$Y = 20

# List
$LstHomeCards = New-Object System.Windows.Forms.ListBox
$LstHomeCards.Location = New-Object System.Drawing.Point(20, $Y)
$LstHomeCards.Size = New-Object System.Drawing.Size(300, 300)
$TabHome.Controls.Add($LstHomeCards)

# Inputs
$YInputs = 20
$LblHomeTitle = New-Object System.Windows.Forms.Label; $LblHomeTitle.Text = "Title"; $LblHomeTitle.Location = [System.Drawing.Point]::new(340, $YInputs); $TabHome.Controls.Add($LblHomeTitle)
$TxtHomeTitle = New-Object System.Windows.Forms.TextBox; $TxtHomeTitle.Location = [System.Drawing.Point]::new(340, $YInputs + 20); $TxtHomeTitle.Width = 300; $TabHome.Controls.Add($TxtHomeTitle)

$YInputs += 50
$LblHomeExc = New-Object System.Windows.Forms.Label; $LblHomeExc.Text = "Excerpt"; $LblHomeExc.Location = [System.Drawing.Point]::new(340, $YInputs); $TabHome.Controls.Add($LblHomeExc)
$TxtHomeExc = New-Object System.Windows.Forms.TextBox; $TxtHomeExc.Location = [System.Drawing.Point]::new(340, $YInputs + 20); $TxtHomeExc.Width = 300; $TxtHomeExc.Height = 60; $TxtHomeExc.Multiline = $true; $TabHome.Controls.Add($TxtHomeExc)

$YInputs += 90
$LblHomeLink = New-Object System.Windows.Forms.Label; $LblHomeLink.Text = "Link (e.g. products.html)"; $LblHomeLink.Location = [System.Drawing.Point]::new(340, $YInputs); $TabHome.Controls.Add($LblHomeLink)
$TxtHomeLink = New-Object System.Windows.Forms.TextBox; $TxtHomeLink.Location = [System.Drawing.Point]::new(340, $YInputs + 20); $TxtHomeLink.Width = 300; $TabHome.Controls.Add($TxtHomeLink)

$YInputs += 50
$LblHomeBtn = New-Object System.Windows.Forms.Label; $LblHomeBtn.Text = "Button Text"; $LblHomeBtn.Location = [System.Drawing.Point]::new(340, $YInputs); $TabHome.Controls.Add($LblHomeBtn)
$TxtHomeBtn = New-Object System.Windows.Forms.TextBox; $TxtHomeBtn.Location = [System.Drawing.Point]::new(340, $YInputs + 20); $TxtHomeBtn.Width = 300; $TabHome.Controls.Add($TxtHomeBtn)

$YInputs += 50
$LblHomeImg = New-Object System.Windows.Forms.Label; $LblHomeImg.Text = "Image Path"; $LblHomeImg.Location = [System.Drawing.Point]::new(340, $YInputs); $TabHome.Controls.Add($LblHomeImg)
$TxtHomeImg = New-Object System.Windows.Forms.TextBox; $TxtHomeImg.Location = [System.Drawing.Point]::new(340, $YInputs + 20); $TxtHomeImg.Width = 220; $TabHome.Controls.Add($TxtHomeImg)
$BtnHomeBrowse = New-Object System.Windows.Forms.Button; $BtnHomeBrowse.Text = "Browse"; $BtnHomeBrowse.Location = [System.Drawing.Point]::new(570, $YInputs + 19); $TabHome.Controls.Add($BtnHomeBrowse)
$BtnHomeBrowse.Add_Click({ $Path = Select-Image "HomeCard" $false; if ($Path) { $TxtHomeImg.Text = $Path } })

# Buttons
$YInputs += 60
$BtnHomeAdd = New-Object System.Windows.Forms.Button; $BtnHomeAdd.Text = "ADD NEW CARD"; $BtnHomeAdd.Location = [System.Drawing.Point]::new(340, $YInputs); $BtnHomeAdd.Width = 140; $BtnHomeAdd.BackColor = [System.Drawing.Color]::LightSkyBlue; $TabHome.Controls.Add($BtnHomeAdd)
$BtnHomeSave = New-Object System.Windows.Forms.Button; $BtnHomeSave.Text = "SAVE CHANGES"; $BtnHomeSave.Location = [System.Drawing.Point]::new(500, $YInputs); $BtnHomeSave.Width = 140; $BtnHomeSave.BackColor = [System.Drawing.Color]::LightGreen; $TabHome.Controls.Add($BtnHomeSave)

$BtnHomeRem = New-Object System.Windows.Forms.Button; $BtnHomeRem.Text = "REMOVE SELECTED"; $BtnHomeRem.Location = [System.Drawing.Point]::new(20, 330); $BtnHomeRem.Width = 300; $BtnHomeRem.BackColor = [System.Drawing.Color]::Salmon; $TabHome.Controls.Add($BtnHomeRem)

# Logic
$Global:HomeCards = @()

function Load-HomeCards {
    $LstHomeCards.Items.Clear()
    $Blocks = Get-JS-Blocks "HomeCards"
    $Global:HomeCards = @()
    foreach ($B in $Blocks) {
        $Obj = New-Object PSObject -Property @{
            Display = $B.Display
            Block   = $B.Block
        }
        $Global:HomeCards += $Obj
        $LstHomeCards.Items.Add($B.Display)
    }
}

$TabHome.Add_Enter({ Load-HomeCards })

$LstHomeCards.Add_SelectedIndexChanged({
        $Idx = $LstHomeCards.SelectedIndex
        if ($Idx -ge 0 -and $Idx -lt $Global:HomeCards.Count) {
            $B = $Global:HomeCards[$Idx]
            $Txt = $B.Block
        
            $q = [char]39; $Q = [char]34
            $TxtHomeTitle.Text = [regex]::Match($Txt, "title\s*:\s*([$q$Q])(.*?)\1").Groups[2].Value
            $TxtHomeExc.Text = [regex]::Match($Txt, "excerpt\s*:\s*([$q$Q])(.*?)\1").Groups[2].Value
            $TxtHomeLink.Text = [regex]::Match($Txt, "link\s*:\s*([$q$Q])(.*?)\1").Groups[2].Value
            $TxtHomeBtn.Text = [regex]::Match($Txt, "linkText\s*:\s*([$q$Q])(.*?)\1").Groups[2].Value
            $TxtHomeImg.Text = [regex]::Match($Txt, "image\s*:\s*([$q$Q])(.*?)\1").Groups[2].Value
        }
    })

$BtnHomeAdd.Add_Click({
        $Title = $TxtHomeTitle.Text
        if (-not $Title) { [System.Windows.Forms.MessageBox]::Show("Title required"); return }
    
        $NewObj = New-Object PSObject -Property @{
            Display = $Title
            Block   = "{ title: ""$Title"", excerpt: ""$($TxtHomeExc.Text)"", link: ""$($TxtHomeLink.Text)"", linkText: ""$($TxtHomeBtn.Text)"", image: ""$($TxtHomeImg.Text)"" }"
        }
        $Global:HomeCards += $NewObj
        $LstHomeCards.Items.Add($Title)
        [System.Windows.Forms.MessageBox]::Show("Added! Click SAVE to persist.")
    })

$BtnHomeRem.Add_Click({
        $Idx = $LstHomeCards.SelectedIndex
        if ($Idx -ge 0) {
            $LstHomeCards.Items.RemoveAt($Idx)
            # Array remove is tricky in PS fixed size arrays, rebuild
            $NewArr = @()
            for ($i = 0; $i -lt $Global:HomeCards.Count; $i++) { if ($i -ne $Idx) { $NewArr += $Global:HomeCards[$i] } }
            $Global:HomeCards = $NewArr
        }
    })

$BtnHomeSave.Add_Click({
        # We construct the file manually for HomeCards
        $Path = Join-Path $AssetsDir "home-data.js"
        $Content = "const homeCardsData = [" + [Environment]::NewLine
        foreach ($Card in $Global:HomeCards) {
            $Content += "  " + $Card.Block + "," + [Environment]::NewLine
        }
        $Content = $Content.TrimEnd(",`r`n") + [Environment]::NewLine + "];"
        Set-Content $Path -Value $Content -Encoding UTF8
        [System.Windows.Forms.MessageBox]::Show("Saved!")
        Load-HomeCards # Refresh
    })

$BtnHomeUpd = New-Object System.Windows.Forms.Button; $BtnHomeUpd.Text = "UPDATE SELECTED"; $BtnHomeUpd.Location = [System.Drawing.Point]::new(340, $YInputs + 40); $BtnHomeUpd.Width = 300; $TabHome.Controls.Add($BtnHomeUpd)
$BtnHomeUpd.Add_Click({
        $Idx = $LstHomeCards.SelectedIndex
        if ($Idx -ge 0) {
            $Title = $TxtHomeTitle.Text
            $NewBlock = "{ title: ""$Title"", excerpt: ""$($TxtHomeExc.Text)"", link: ""$($TxtHomeLink.Text)"", linkText: ""$($TxtHomeBtn.Text)"", image: ""$($TxtHomeImg.Text)"" }"
        
            $Global:HomeCards[$Idx] = New-Object PSObject -Property @{ Display = $Title; Block = $NewBlock }
            # Refresh List Label
            $LstHomeCards.Items[$Idx] = $Title
            [System.Windows.Forms.MessageBox]::Show("Item Updated! Click SAVE to persist.")
        }
    })



# Ensure visibility
$Form.Size = New-Object System.Drawing.Size(950, 700)
$Form.StartPosition = "CenterScreen"

# === APPLE-INSPIRED THEME ENGINE ===
function Enable-AppleTheme {
    $Colors = @{
        Bg      = [System.Drawing.Color]::White
        Sidebar = [System.Drawing.Color]::FromArgb(242, 242, 247)
        Text    = [System.Drawing.Color]::FromArgb(29, 29, 31)
        Accent  = [System.Drawing.Color]::FromArgb(0, 122, 255) # Apple Blue
        InputBg = [System.Drawing.Color]::FromArgb(255, 255, 255)
        Border  = [System.Drawing.Color]::FromArgb(229, 229, 234)
        Danger  = [System.Drawing.Color]::FromArgb(255, 59, 48)
        Success = [System.Drawing.Color]::FromArgb(52, 199, 89)
    }

    $Form.BackColor = $Colors.Bg
    $Form.ForeColor = $Colors.Text
    $Sidebar.BackColor = $Colors.Sidebar
    
    # Fonts
    $MainFont = New-Object System.Drawing.Font("Segoe UI", 9)
    $HeaderFont = New-Object System.Drawing.Font("Segoe UI Semibold", 10)

    # Icons Map (Unicode approximations)
    $Icons = @{
        "Add Product"    = [string][char]::ConvertFromUtf32(0x2610)
        "Add Service"    = [string][char]::ConvertFromUtf32(0x2699)
        "Add Client"     = [string][char]::ConvertFromUtf32(0x1F464)
        "Add Story"      = [string][char]::ConvertFromUtf32(0x1F4D6)
        "Remove Item"    = [string][char]::ConvertFromUtf32(0x1F5D1)
        "Move / Edit"    = [string][char]::ConvertFromUtf32(0x270E)
        "Publish"        = [string][char]::ConvertFromUtf32(0x1F30D)
        "Diagnostics"    = [string][char]::ConvertFromUtf32(0x26A1)
        "Sort / Reorder" = [string][char]::ConvertFromUtf32(0x21C5)
        "Bulk Editor"    = [string][char]::ConvertFromUtf32(0x25A4)
        "LinkedIn News"  = [string][char]::ConvertFromUtf32(0x1F4F0)
        "Detail Editor"  = [string][char]::ConvertFromUtf32(0x1F4DD)
        "Home Cards"     = [string][char]::ConvertFromUtf32(0x1F3E0)
    }
    
    # 1. Populate Sidebar
    $Sidebar.Controls.Clear()
    
    # Iterate in Reverse for Dock=Top
    $Count = $TabControl.TabPages.Count
    for ($i = $Count - 1; $i -ge 0; $i--) {
        $Page = $TabControl.TabPages[$i]
        
        $Btn = New-Object System.Windows.Forms.Button
        $Txt = $Page.Text
        if ($Icons.ContainsKey($Txt)) { $Btn.Text = "  " + $Icons[$Txt] + "  " + $Txt }
        else { $Btn.Text = "  " + $Txt }
        
        $Btn.Height = 45
        $Btn.Dock = "Top"
        $Btn.FlatStyle = "Flat"
        $Btn.FlatAppearance.BorderSize = 0
        $Btn.TextAlign = "MiddleLeft"
        $Btn.Padding = New-Object System.Windows.Forms.Padding(15, 0, 0, 0)
        $Btn.Font = $MainFont
        $Btn.Cursor = [System.Windows.Forms.Cursors]::Hand
        $Btn.Tag = $Page
        
        $Btn.Add_Click({
                $Sender = $this
                $TabControl.SelectedTab = $Sender.Tag
            
                # Reset Styles
                foreach ($C in $Sidebar.Controls) {
                    if ($C -is [System.Windows.Forms.Button]) {
                        $C.BackColor = [System.Drawing.Color]::Transparent
                        $C.ForeColor = [System.Drawing.Color]::FromArgb(29, 29, 31)
                        $C.Font = New-Object System.Drawing.Font("Segoe UI", 9)
                    }
                }
                # Active Style
                $Sender.BackColor = [System.Drawing.Color]::FromArgb(220, 220, 225)
                $Sender.ForeColor = [System.Drawing.Color]::FromArgb(0, 122, 255)
                $Sender.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 9)
            })
        
        $Sidebar.Controls.Add($Btn)
    }
    
    # 2. Recursive Styling
    $StyleBlock = {
        param($Ctrl)
        if ($Ctrl -is [System.Windows.Forms.TabPage]) {
            $Ctrl.BackColor = $Colors.Bg
            $Ctrl.ForeColor = $Colors.Text
        }
        elseif ($Ctrl -is [System.Windows.Forms.TextBox] -or $Ctrl -is [System.Windows.Forms.ListBox]) {
            $Ctrl.BorderStyle = "FixedSingle"
            $Ctrl.BackColor = $Colors.InputBg
            $Ctrl.ForeColor = $Colors.Text
        }
        elseif ($Ctrl -is [System.Windows.Forms.Button]) {
            if ($Ctrl.Parent -eq $Sidebar) { return }

            $Ctrl.FlatStyle = "Flat"
            $Ctrl.FlatAppearance.BorderSize = 0
            $Ctrl.Font = $HeaderFont
            $Ctrl.Cursor = [System.Windows.Forms.Cursors]::Hand
             
            if ($Ctrl.Text -match "(SAVE|PUBLISH|ADD|UPDATE)") {
                $Ctrl.BackColor = $Colors.Success
                $Ctrl.ForeColor = [System.Drawing.Color]::White
            }
            elseif ($Ctrl.Text -match "(DELETE|REMOVE|X)") {
                $Ctrl.BackColor = $Colors.Danger
                $Ctrl.ForeColor = [System.Drawing.Color]::White
            }
            else {
                $Ctrl.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
                $Ctrl.ForeColor = $Colors.Accent
            }
        }
        if ($Ctrl.Controls) { foreach ($Child in $Ctrl.Controls) { & $StyleBlock $Child } }
    }
    
    foreach ($C in $Form.Controls) { & $StyleBlock $C }
    
    # Activate First Tab
    if ($Sidebar.Controls.Count -gt 0) {
        $LastAdded = $Sidebar.Controls[0] # Because Dock=Top, index 0 is the LAST added (Topmost)? No wait.
        # Controls collection usually has index 0 as topmost in Z-order.
        # Logic: Add A (Top). Add B (Top). Collection: [B, A].
        # So Index 0 is Tab 1.
        $Sidebar.Controls[0].PerformClick() 
    }
}

# Apply Theme
Enable-AppleTheme

[void]$Form.ShowDialog()

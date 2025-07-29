$recipesPath = "d:\work\angular\food_calc\foodcalc\public\assets\recipes"
$outputPath = "d:\work\angular\food_calc\foodcalc\src\assets\recipes\tier7.json"

# Get all Tier 7 recipe files (levels 60-69)
$recipeFiles = Get-ChildItem "$recipesPath\*.json" | Where-Object {$_.Name -match "^(6[0-9]) -"} | Sort-Object Name

$recipes = @()

foreach ($file in $recipeFiles) {
    $content = Get-Content $file.FullName | ConvertFrom-Json
    
    # Add the new fields required
    $content | Add-Member -NotePropertyName "yield" -NotePropertyValue 2 -Force
    $content | Add-Member -NotePropertyName "class" -NotePropertyValue "Provisioner" -Force  
    $content | Add-Member -NotePropertyName "fuelName" -NotePropertyValue "Rosewood Kindling" -Force
    
    $recipes += $content
}

# Create the consolidated tier structure
$tierData = @{
    tier = 7
    fuelName = "Rosewood Kindling"
    harvests = @(
        "Squash",
        "Xegonberry", 
        "Sweet Chai Tea Leaf",
        "Soaring Coffee Bean",
        "Ravasect Meat",
        "Aviak Meat",
        "Flying Fish",
        "Azurite",
        "Hanging Root",
        "Rosewood Lumber"
    )
    recipes = $recipes
}

# Convert to JSON and save
$tierData | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host "Created consolidated tier7.json with $($recipes.Count) recipes"

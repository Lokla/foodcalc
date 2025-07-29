# New Recipe Structure Documentation

## Overview
The recipe system has been reorganized to separate tier metadata from class-specific recipes, enabling better support for multiple crafting classes.

## Directory Structure
```
public/assets/recipes/
├── tier1.json - tier7.json      # Tier metadata (fuel names, harvests)
├── provisioner/                 # Class-specific recipe folder
│   ├── manifest.json           # Provisioner class manifest
│   ├── tier1.json - tier7.json # Provisioner recipes by tier
├── archive/                    # Original individual recipe files
└── recipes.json               # Legacy manifest (updated)
```

## File Types

### Tier Metadata Files (`tier[1-7].json`)
Contains tier-specific information used by all classes:
```json
{
  "tier": 7,
  "fuelName": "Rosewood Kindling",
  "harvests": ["Squash", "Xegonberry", ...]
}
```

### Class Recipe Files (`provisioner/tier[1-7].json`)
Contains recipes specific to a crafting class:
```json
{
  "tier": 7,
  "recipes": [
    {
      "name": "Recipe Name",
      "level": 60,
      "duration": 48,
      "stats": "None",
      "type": "Food",
      "ingredients": [["Ingredient", 1]],
      "fuel": 1,
      "yield": 2,
      "class": "Provisioner",
      "fuelName": "Rosewood Kindling"
    }
  ]
}
```

## Data Loading Process
1. Application loads recipes from `provisioner/tier[1-7].json` files
2. Tier metadata (fuel names, harvests) can be loaded separately from main tier files
3. Empty recipe arrays for tiers 1-6 (no dummy data)
4. Real recipe data only in tier 7

## Benefits
- **Separation of Concerns**: Tier metadata separated from class recipes
- **Multi-Class Support**: Easy to add other classes (Sage, Carpenter, etc.)
- **Clean Organization**: No mixing of metadata and recipes
- **Scalable**: Simple to add new tiers or classes
- **Maintainable**: Clear file structure and responsibilities

## Future Expansion
To add a new crafting class:
1. Create folder: `assets/recipes/[className]/`
2. Add manifest.json with class info
3. Add tier[1-7].json files with class-specific recipes
4. Update data service to load new class recipes

## Current Status
- ✅ Tier 7: 40 real Provisioner recipes
- ✅ Tiers 1-6: Empty recipe structure (ready for data)
- ✅ All tier metadata: Complete fuel and harvest information
- ✅ Application: Updated to load from new structure

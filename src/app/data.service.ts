import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Recipe {
    name: string;
    level: number;
    duration: number;
    stats: any;
    type: 'Food' | 'Drink';
    ingredients: [string, number][];
    fuel: number;
    yield?: number; // Number of products produced (defaults to 2 if not specified)
}

export interface FuelCost {
  tier: number;
  name: string;
  cost: number;
}

export interface DefaultIngredient {
  name: string;
  cost: number;
}

export interface RawMaterial {
  name: string;
  value: number;
}

export interface TierOption {
  value: number;
  label: string;
}

export interface TierData {
  tier: number;
  rawMaterials: RawMaterial[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  // Raw materials data for each tier
  private tierData = signal<TierData[]>([
    {
      tier: 7,
      rawMaterials: [
        { name: 'Squash', value: 0 },
        { name: 'Xegonberry', value: 0 },
        { name: 'Sweet Chai Tea Leaf', value: 0 },
        { name: 'Soaring Coffee Bean', value: 0 },
        { name: 'Ravasect Meat', value: 0 },
        { name: 'Aviak Meat', value: 0 },
        { name: 'Flying Fish', value: 0 },
        { name: 'Azurite', value: 0 },
        { name: 'Hanging Root', value: 0 },
        { name: 'Rosewood Lumber', value: 0 }
      ]
    },
    {
      tier: 6,
      rawMaterials: [
        { name: 'Artichoke', value: 0 },
        { name: 'Caiman Meat', value: 0 },
        { name: 'Prickly Pear', value: 0 },
        { name: 'Sabertooth Meat', value: 0 },
        { name: 'Conger Eel', value: 0 },
        { name: 'Tigershrimp', value: 0 },
        { name: 'Darjeeling Tea Leaf', value: 0 },
        { name: 'Maj\'dul Coffee Bean', value: 0 },
        { name: 'Succulent Root', value: 0 },
        { name: 'Soluble Loam', value: 0 }
      ]
    },
    {
      tier: 5,
      rawMaterials: [
        { name: 'Browncap Mushroom', value: 0 },
        { name: 'Owlbear Meat', value: 0 },
        { name: 'White Peach', value: 0 },
        { name: 'Wyrm Meat', value: 0 },
        { name: 'Cauldron Blowfish', value: 0 },
        { name: 'Nerius Trout', value: 0 },
        { name: 'Lavastorm Robusta Bean', value: 0 },
        { name: 'Pu-erh Tea Leaf', value: 0 },
        { name: 'Ashen Root', value: 0 },
        { name: 'Bonded Loam', value: 0 }
      ]
    },
    {
      tier: 4,
      rawMaterials: [
        { name: 'Bear Meat', value: 0 },
        { name: 'Cucumber', value: 0 },
        { name: 'Griffon Meat', value: 0 },
        { name: 'Wild Apple', value: 0 },
        { name: 'Murkwater Carp', value: 0 },
        { name: 'Shark Fin', value: 0 },
        { name: 'Everfrost Ice Bean', value: 0 },
        { name: 'Green Tea Leaf', value: 0 },
        { name: 'Tussah Root', value: 0 },
        { name: 'Supple Loam', value: 0 }
      ]
    },
    {
      tier: 3,
      rawMaterials: [
        { name: 'Lion Meat', value: 0 },
        { name: 'Oolong Tea Leaf', value: 0 },
        { name: 'Pig Meat', value: 0 },
        { name: 'Steppes Mountain Bean', value: 0 },
        { name: 'Thicket Crayfish', value: 0 },
        { name: 'Seafury Mackerel', value: 0 },
        { name: 'Fayberry', value: 0 },
        { name: 'Sweet Onion', value: 0 },
        { name: 'Belladonna Root', value: 0 },
        { name: 'Pliant Loam', value: 0 }
      ]
    },
    {
      tier: 2,
      rawMaterials: [
        { name: 'Crab Meat', value: 0 },
        { name: 'Freewater Grouper', value: 0 },
        { name: 'Raw Carrot', value: 0 },
        { name: 'Murdunk Orange', value: 0 },
        { name: 'Black Tea Leaf', value: 0 },
        { name: 'Elephant Meat', value: 0 },
        { name: 'Vulrich Meat', value: 0 },
        { name: 'Tuber Strand', value: 0 },
        { name: 'Antonican Coffee Bean', value: 0 },
        { name: 'Salty Loam', value: 0 }
      ]
    },
    {
      tier: 1,
      rawMaterials: [
        { name: 'Frog Leg', value: 0 },
        { name: 'Jumjum', value: 0 },
        { name: 'Black Coffee Bean', value: 0 },
        { name: 'Sunfish', value: 0 },
        { name: 'Deer Meat', value: 0 },
        { name: 'Baubbleshire Cabbage', value: 0 },
        { name: 'Raw White Tea Leaf', value: 0 }
      ]
    }
  ]);

  // Tier options data
  private tierOptions = signal<TierOption[]>([
    { value: 7, label: 'Tier 7 (KoS)' },
    { value: 6, label: 'Tier 6 (DoF)' },
    { value: 5, label: 'Tier 5' },
    { value: 4, label: 'Tier 4' },
    { value: 3, label: 'Tier 3' },
    { value: 2, label: 'Tier 2' },
    { value: 1, label: 'Tier 1' }
  ]);

  // Default ingredients with fixed costs
  private defaultIngredients = signal<DefaultIngredient[]>([
    { name: 'Fluid', cost: 0.09 },
    { name: 'Dough', cost: 0.27 }
  ]);

  // Fuel costs by tier
  private fuelCosts = signal<FuelCost[]>([
    { tier: 1, name: 'Walnut Kindling', cost: 0.02 },
    { tier: 2, name: 'Mulberry Kindling', cost: 0.05 },
    { tier: 3, name: 'Cherry Kindling', cost: 0.22 },
    { tier: 4, name: 'Hickory Kindling', cost: 0.83 },
    { tier: 5, name: 'Mesquite Kindling', cost: 3.31 },
    { tier: 6, name: 'Charcoal Kindling', cost: 13.25 },
    { tier: 7, name: 'Rosewood Kindling', cost: 18.65 }
  ]);

  // Recipe data - loaded dynamically from JSON files
  private allRecipes = signal<Recipe[]>([]);
  private recipesLoaded = signal<boolean>(false);

  // Recipe files list - loaded dynamically from manifest
  private recipeFiles: string[] = [];

  // Selected tier
  private selectedTier = signal<string>('7');

  constructor(private http: HttpClient) {
    // Load saved data from localStorage first
    this.loadFromLocalStorage();
    // Then load recipes
    this.loadRecipes();
  }

  // Load recipes dynamically from JSON files
  private async loadRecipes() {
    this.recipesLoaded.set(false);
    try {
      // First, load the recipe manifest to get the list of available recipe files
      const manifest = await firstValueFrom(
        this.http.get<{recipes: string[]}>('assets/recipes/recipes.json')
      );
      this.recipeFiles = manifest.recipes;
      
      const recipes: Recipe[] = [];
      
      for (const filename of this.recipeFiles) {
        try {
          const recipe = await firstValueFrom(
            this.http.get<Recipe>(`assets/recipes/${encodeURIComponent(filename)}`)
          );
          recipes.push(recipe);
        } catch (error) {
          console.warn(`Failed to load recipe file: ${filename}`, error);
        }
      }
      
      // Update the recipes signal with loaded data
      this.allRecipes.set(recipes);
      this.recipesLoaded.set(true);
      console.log(`Loaded ${recipes.length} recipes from ${this.recipeFiles.length} JSON files`);
    } catch (error) {
      console.error('Failed to load recipes:', error);
      // Fallback to empty array if loading fails
      this.allRecipes.set([]);
      this.recipesLoaded.set(false);
    }
  }

  // Add a new recipe file to the list and reload
  addRecipeFile(filename: string) {
    if (!this.recipeFiles.includes(filename)) {
      this.recipeFiles.push(filename);
      // Note: This will add to the current session only
      // To persist, you'd need to update the recipes.json manifest file
      this.loadRecipes(); // Reload all recipes
    }
  }

  // Reload recipes from files (useful for refreshing data)
  reloadRecipes() {
    this.loadRecipes();
  }

  // Get the list of recipe files being loaded
  getRecipeFiles() {
    return [...this.recipeFiles];
  }

  // Get the number of available recipe files
  getRecipeFileCount() {
    return this.recipeFiles.length;
  }

  // Get raw materials for the currently selected tier
  getRawMaterials() {
    const currentTier = parseInt(this.selectedTier());
    const tierData = this.tierData().find(tier => tier.tier === currentTier);
    return tierData ? tierData.rawMaterials : [];
  }

  // Get all tier data
  getAllTierData() {
    return this.tierData.asReadonly();
  }

  // Get raw materials for a specific tier
  getRawMaterialsForTier(tierNumber: number): RawMaterial[] {
    const tierData = this.tierData().find(tier => tier.tier === tierNumber);
    return tierData ? tierData.rawMaterials : [];
  }

  // Update a specific raw material price for the current tier
  updateRawMaterialPrice(name: string, value: number) {
    const currentTier = parseInt(this.selectedTier());
    this.tierData.update(tiers => 
      tiers.map(tier => 
        tier.tier === currentTier 
          ? {
              ...tier,
              rawMaterials: tier.rawMaterials.map(material => 
                material.name === name ? { ...material, value } : material
              )
            }
          : tier
      )
    );
    // Auto-save to localStorage after updating
    this.saveToLocalStorage();
  }

  // Update a specific raw material price for a specific tier
  updateRawMaterialPriceForTier(tierNumber: number, name: string, value: number) {
    this.tierData.update(tiers => 
      tiers.map(tier => 
        tier.tier === tierNumber 
          ? {
              ...tier,
              rawMaterials: tier.rawMaterials.map(material => 
                material.name === name ? { ...material, value } : material
              )
            }
          : tier
      )
    );
    // Auto-save to localStorage after updating
    this.saveToLocalStorage();
  }

  // Update all raw material prices for the current tier
  updateAllRawMaterials(materials: RawMaterial[]) {
    const currentTier = parseInt(this.selectedTier());
    this.tierData.update(tiers =>
      tiers.map(tier =>
        tier.tier === currentTier
          ? { ...tier, rawMaterials: [...materials] }
          : tier
      )
    );
    // Auto-save to localStorage after updating
    this.saveToLocalStorage();
  }

  // Reset all raw material prices for the current tier to 0
  resetRawMaterialPrices() {
    const currentTier = parseInt(this.selectedTier());
    this.tierData.update(tiers =>
      tiers.map(tier =>
        tier.tier === currentTier
          ? {
              ...tier,
              rawMaterials: tier.rawMaterials.map(material => ({ ...material, value: 0 }))
            }
          : tier
      )
    );
  }

  // Reset all raw material prices for all tiers
  resetAllTiersPrices() {
    this.tierData.update(tiers =>
      tiers.map(tier => ({
        ...tier,
        rawMaterials: tier.rawMaterials.map(material => ({ ...material, value: 0 }))
      }))
    );
  }

  // Getters for tier options
  getTierOptions() {
    return this.tierOptions.asReadonly();
  }

  // Selected tier management
  getSelectedTier() {
    return this.selectedTier.asReadonly();
  }

  setSelectedTier(tier: string) {
    this.selectedTier.set(tier);
    // Auto-save to localStorage after updating tier selection
    this.saveToLocalStorage();
  }

  // Recipe management methods
  getAllRecipes() {
    return this.allRecipes.asReadonly();
  }

  getRecipesLoaded() {
    return this.recipesLoaded();
  }

  getRecipesByLevel(level: number) {
    return this.allRecipes().filter(recipe => recipe.level === level);
  }

  getRecipesByType(type: 'Food' | 'Drink') {
    return this.allRecipes().filter(recipe => recipe.type === type);
  }

  getRecipeByName(name: string) {
    return this.allRecipes().find(recipe => recipe.name === name);
  }

  // Helper function to determine tier from recipe level
  getTierFromLevel(level: number): number {
    if (level <= 9) return 1;
    if (level <= 19) return 2;
    if (level <= 29) return 3;
    if (level <= 39) return 4;
    if (level <= 49) return 5;
    if (level <= 59) return 6;
    return 7; // 60-69
  }

  // Get recipes for a specific tier
  getRecipesByTier(tier: number) {
    return this.allRecipes().filter(recipe => 
      this.getTierFromLevel(recipe.level) === tier
    );
  }

  // Get recipes for the currently selected tier
  getRecipesForCurrentTier() {
    const currentTier = parseInt(this.selectedTier());
    return this.getRecipesByTier(currentTier);
  }

  // Get fuel cost for a specific tier
  getFuelCostForTier(tier: number): number {
    const fuelInfo = this.fuelCosts().find(fuel => fuel.tier === tier);
    return fuelInfo ? fuelInfo.cost : 0;
  }

  // Get default ingredient cost
  getDefaultIngredientCost(ingredientName: string): number {
    const defaultIngredient = this.defaultIngredients().find(
      ingredient => ingredient.name === ingredientName
    );
    return defaultIngredient ? defaultIngredient.cost : 0;
  }

  // Calculate recipe cost based on current raw material prices
  calculateRecipeCost(recipe: Recipe): number {
    let totalCost = 0;
    const currentMaterials = this.getRawMaterials();
    const recipeTier = this.getTierFromLevel(recipe.level);
    
    recipe.ingredients.forEach(([ingredientName, quantity]) => {
      // Check if it's a default ingredient with fixed cost
      const defaultCost = this.getDefaultIngredientCost(ingredientName);
      if (defaultCost > 0) {
        totalCost += defaultCost * quantity;
      } else {
        // Look for the ingredient in current raw materials
        const rawMaterial = currentMaterials.find(
          (material: RawMaterial) => material.name === ingredientName
        );
        if (rawMaterial) {
          totalCost += rawMaterial.value * quantity;
        }
      }
    });
    
    // Add fuel cost if applicable
    if (recipe.fuel > 0) {
      const fuelCost = this.getFuelCostForTier(recipeTier);
      totalCost += fuelCost * recipe.fuel;
    }
    
    return totalCost;
  }

  // Calculate cost per unit (accounting for yield)
  calculateCostPerUnit(recipe: Recipe): number {
    const totalCost = this.calculateRecipeCost(recipe);
    const recipeYield = recipe.yield || 2; // Default to 2 if not specified
    return totalCost / recipeYield;
  }

  // Calculate cost per minute (total cost divided by duration in minutes)
  calculateCostPerMinute(recipe: Recipe): number {
    const totalCost = this.calculateRecipeCost(recipe);
    const durationInMinutes = recipe.duration; // Duration is already in minutes
    return totalCost / durationInMinutes;
  }

  // Calculate cost per unit per minute
  calculateCostPerUnitPerMinute(recipe: Recipe): number {
    const costPerUnit = this.calculateCostPerUnit(recipe);
    const durationInMinutes = recipe.duration; // Duration is already in minutes
    return costPerUnit / durationInMinutes;
  }

  // Get comprehensive recipe cost analysis
  getRecipeCostAnalysis(recipe: Recipe) {
    const totalCost = this.calculateRecipeCost(recipe);
    const costPerUnit = this.calculateCostPerUnit(recipe);
    const costPerMinute = this.calculateCostPerMinute(recipe);
    const costPerUnitPerMinute = this.calculateCostPerUnitPerMinute(recipe);
    const durationInMinutes = recipe.duration; // Duration is already in minutes
    const recipeYield = recipe.yield || 2;

    return {
      totalCost,
      costPerUnit,
      costPerMinute,
      costPerUnitPerMinute,
      durationInMinutes,
      yield: recipeYield,
      recipe
    };
  }

  // Get recipes that can be made with current tier raw materials
  getAvailableRecipesForCurrentTier() {
    const currentMaterials = this.getRawMaterials();
    const availableIngredients = currentMaterials.map((material: RawMaterial) => material.name);
    
    // Add default ingredients that are always available
    const defaultIngredientNames = this.defaultIngredients().map(ingredient => ingredient.name);
    const allAvailableIngredients = [...availableIngredients, ...defaultIngredientNames];
    
    // Only show recipes for the current tier
    const currentTierRecipes = this.getRecipesForCurrentTier();
    
    return currentTierRecipes.filter(recipe => 
      recipe.ingredients.every(([ingredientName]) => 
        allAvailableIngredients.includes(ingredientName)
      )
    );
  }

  // Calculate total cost of all raw materials for current tier
  getTotalRawMaterialsCost() {
    const materials = this.getRawMaterials();
    return materials.reduce((total: number, material: RawMaterial) => total + material.value, 0);
  }

  // Calculate total cost for a specific tier
  getTotalRawMaterialsCostForTier(tierNumber: number) {
    const materials = this.getRawMaterialsForTier(tierNumber);
    return materials.reduce((total: number, material: RawMaterial) => total + material.value, 0);
  }

  // Get raw materials with non-zero prices for current tier
  getRawMaterialsWithPrices() {
    const materials = this.getRawMaterials();
    return materials.filter((material: RawMaterial) => material.value > 0);
  }

  // Get raw material by name for current tier
  getRawMaterialByName(name: string): RawMaterial | undefined {
    const materials = this.getRawMaterials();
    return materials.find((material: RawMaterial) => material.name === name);
  }

  // Export data for saving/backup
  exportData() {
    return {
      tierData: this.tierData(),
      selectedTier: this.selectedTier(),
      timestamp: new Date().toISOString()
    };
  }

  // Import data from backup/saved state
  importData(data: { tierData?: TierData[], selectedTier?: string, rawMaterials?: RawMaterial[] }) {
    // Support for old format (backward compatibility)
    if (data.rawMaterials && !data.tierData) {
      const currentTier = parseInt(this.selectedTier());
      this.updateAllRawMaterials(data.rawMaterials);
    }
    
    // New format with tier data
    if (data.tierData) {
      this.tierData.set([...data.tierData]);
    }
    
    if (data.selectedTier) {
      this.setSelectedTier(data.selectedTier);
    }
  }

  // Local storage persistence methods
  saveToLocalStorage() {
    const data = this.exportData();
    localStorage.setItem('foodcalc-data', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('foodcalc-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.importData(data);
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
  }

  clearLocalStorage() {
    localStorage.removeItem('foodcalc-data');
  }

  // Reference items methods
  getReferenceItemCost(itemName: string, tier: number): number {
    const storageKey = `referenceItems_tier${tier}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data[itemName] || 0;
      } catch (error) {
        return 0;
      }
    }
    
    return 0;
  }

  // Calculate broker cost per minute for a specific stat/type combination
  getBrokerCostPerMinute(stats: string, type: 'Food' | 'Drink', tier: number): number {
    const recipes = this.getAllRecipes()();
    
    // Find reference item for this stat/type combination in this tier
    const tierRecipes = recipes.filter(recipe => 
      this.getTierFromLevel(recipe.level) === tier && 
      recipe.stats === stats && 
      recipe.type === type
    );

    if (tierRecipes.length === 0) return 0;

    // Get the highest level recipe (reference item)
    const referenceRecipe = tierRecipes.reduce((highest, current) => 
      current.level > highest.level ? current : highest
    );

    const brokerCost = this.getReferenceItemCost(referenceRecipe.name, tier);
    
    if (brokerCost === 0 || referenceRecipe.duration === 0) return 0;
    
    return brokerCost / referenceRecipe.duration;
  }

  // Calculate broker price for a recipe based on its duration and stat/type
  calculateBrokerPrice(recipe: Recipe): number {
    const tier = this.getTierFromLevel(recipe.level);
    const costPerMinute = this.getBrokerCostPerMinute(recipe.stats, recipe.type, tier);
    
    if (costPerMinute === 0) return 0;
    
    return costPerMinute * recipe.duration;
  }

  // Calculate recommended broker price (higher of production cost or broker price)
  calculateRecommendedBrokerPrice(recipe: Recipe): number {
    const productionCost = this.calculateCostPerUnit(recipe);
    const brokerPrice = this.calculateBrokerPrice(recipe);
    
    return Math.max(productionCost, brokerPrice);
  }
}

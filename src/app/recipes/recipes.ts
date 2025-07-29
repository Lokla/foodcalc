import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Recipe } from '../data.service';
import { CurrencyDisplayComponent } from '../currency-display/currency-display';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyDisplayComponent],
  templateUrl: './recipes.html',
  styleUrls: ['./recipes.css']
})
export class RecipesComponent {
  
  // Filter and sort controls
  selectedType = signal<'Food' | 'Drink' | null>(null);
  selectedStats = signal<string>('');
  showOnlyAvailable = signal<boolean>(false);
  hideNoStatItems = signal<boolean>(false);
  sortBy = signal<'name' | 'level' | 'revenue'>('name');
  copyFeedback = signal<string>(''); // For showing copy feedback
  
  constructor(private dataService: DataService) {}
  
  // Check if recipes are loaded
  get isLoading() {
    return !this.dataService.getRecipesLoaded();
  }
  
  // Computed property for filtered and sorted recipes
  filteredRecipes = computed(() => {
    // Always get recipes for the current tier
    let recipes = this.dataService.getRecipesForCurrentTier();
    
    // Filter by type if selected
    if (this.selectedType()) {
      recipes = recipes.filter(recipe => recipe.type === this.selectedType());
    }

    // Filter by stats if selected
    if (this.selectedStats()) {
      recipes = recipes.filter(recipe => 
        recipe.stats && recipe.stats.toLowerCase().includes(this.selectedStats().toLowerCase())
      );
    }
    
    // Hide items with no stats if checkbox is checked
    if (this.hideNoStatItems()) {
      recipes = recipes.filter(recipe => 
        recipe.stats && recipe.stats.trim() !== '' && recipe.stats !== 'None'
      );
    }
    
    // Filter by availability (can be made with current tier materials)
    if (this.showOnlyAvailable()) {
      const availableRecipes = this.dataService.getAvailableRecipesForCurrentTier();
      recipes = recipes.filter(recipe => 
        availableRecipes.some(available => available.name === recipe.name)
      );
    }

    // Sort recipes based on selected sort option
    const sortBy = this.sortBy();
    recipes.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.level - a.level; // Highest level first
        case 'revenue':
          const revenueA = this.getRecommendedRevenue(a);
          const revenueB = this.getRecommendedRevenue(b);
          return revenueB - revenueA; // Highest revenue first
        default:
          return 0;
      }
    });
    
    return recipes;
  });
  
  // Get unique levels for filter dropdown
  getUniqueLevels() {
    const allRecipes = this.dataService.getAllRecipes()();
    const levels = [...new Set(allRecipes.map(recipe => recipe.level))];
    return levels.sort((a, b) => b - a); // Sort descending
  }

  // Get unique stats for filter dropdown
  getUniqueStats() {
    const currentTierRecipes = this.dataService.getRecipesForCurrentTier();
    const stats = [...new Set(currentTierRecipes.map(recipe => recipe.stats).filter(stat => stat))];
    return stats.sort();
  }

  // Get available tiers for filter dropdown
  getAvailableTiers() {
    return [1, 2, 3, 4, 5, 6, 7];
  }

  // Get tier from recipe level
  getTierFromLevel(level: number): number {
    return this.dataService.getTierFromLevel(level);
  }

  // Get current tier from data service
  getCurrentTier(): number {
    return parseInt(this.dataService.getSelectedTier()());
  }
  
  // Calculate recipe cost per unit (accounting for yield)
  getRecipeCost(recipe: Recipe): number {
    return this.dataService.calculateCostPerUnit(recipe);
  }

  // Calculate cost per minute
  getRecipeCostPerMinute(recipe: Recipe): number {
    return this.dataService.calculateCostPerMinute(recipe);
  }

  // Get comprehensive cost analysis
  getRecipeCostAnalysis(recipe: Recipe) {
    return this.dataService.getRecipeCostAnalysis(recipe);
  }
  
  // Check if recipe can be made with current tier
  canMakeRecipe(recipe: Recipe): boolean {
    const availableRecipes = this.dataService.getAvailableRecipesForCurrentTier();
    return availableRecipes.some(available => available.name === recipe.name);
  }

  // Get ingredient cost breakdown for display
  getIngredientCost(ingredientName: string, quantity: number): number {
    // Check default ingredients first
    const defaultCost = this.dataService.getDefaultIngredientCost(ingredientName);
    if (defaultCost > 0) {
      return defaultCost * quantity;
    }
    
    // Check current raw materials
    const materials = this.dataService.getRawMaterials();
    const material = materials.find(m => m.name === ingredientName);
    return material ? material.value * quantity : 0;
  }

  // Get fuel cost for recipe
  getFuelCost(recipe: Recipe): number {
    if (recipe.fuel <= 0) return 0;
    const tier = this.getTierFromLevel(recipe.level);
    return this.dataService.getFuelCostForTier(tier) * recipe.fuel;
  }
  
  // Copy recipe cost to clipboard
  async copyRecipeCost(recipe: Recipe) {
    const costInSilver = this.getRecipeCost(recipe);
    const costInCopper = Math.round(costInSilver * 100); // Convert silver to copper
    try {
      await navigator.clipboard.writeText(costInCopper.toString());
      this.showCopyFeedback(`Copied production cost: ${costInCopper} copper`);
      console.log(`Copied production cost for ${recipe.name}: ${costInCopper} copper`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  // Copy broker price to clipboard
  async copyBrokerPrice(recipe: Recipe) {
    const priceInSilver = this.getBrokerPrice(recipe);
    const priceInCopper = Math.round(priceInSilver * 100); // Convert silver to copper
    try {
      await navigator.clipboard.writeText(priceInCopper.toString());
      this.showCopyFeedback(`Copied broker price: ${priceInCopper} copper`);
      console.log(`Copied broker price for ${recipe.name}: ${priceInCopper} copper`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  // Copy recommended price to clipboard
  async copyRecommendedPrice(recipe: Recipe) {
    const priceInSilver = this.getRecommendedBrokerPrice(recipe);
    const priceInCopper = Math.round(priceInSilver * 100); // Convert silver to copper
    try {
      await navigator.clipboard.writeText(priceInCopper.toString());
      this.showCopyFeedback(`Copied recommended price: ${priceInCopper} copper`);
      console.log(`Copied recommended price for ${recipe.name}: ${priceInCopper} copper`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }
  
  // Reset filters
  resetFilters() {
    this.selectedType.set(null);
    this.selectedStats.set('');
    this.sortBy.set('name');
    this.showOnlyAvailable.set(false);
    this.hideNoStatItems.set(false);
  }
  
  // Format duration from minutes to hours and minutes
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }

  // Get broker price for recipe
  getBrokerPrice(recipe: Recipe): number {
    return this.dataService.calculateBrokerPrice(recipe);
  }

  // Get recommended broker price for recipe
  getRecommendedBrokerPrice(recipe: Recipe): number {
    return this.dataService.calculateRecommendedBrokerPrice(recipe);
  }

  // Get broker revenue (broker price - production cost)
  getBrokerRevenue(recipe: Recipe): number {
    return this.getBrokerPrice(recipe) - this.getRecipeCost(recipe);
  }

  // Get recommended revenue (recommended price - production cost)
  getRecommendedRevenue(recipe: Recipe): number {
    return this.getRecommendedBrokerPrice(recipe) - this.getRecipeCost(recipe);
  }

  // Get absolute broker revenue for display
  getAbsBrokerRevenue(recipe: Recipe): number {
    return Math.abs(this.getBrokerRevenue(recipe));
  }

  // Get absolute recommended revenue for display
  getAbsRecommendedRevenue(recipe: Recipe): number {
    return Math.abs(this.getRecommendedRevenue(recipe));
  }

  // Show copy feedback to user
  private showCopyFeedback(message: string) {
    this.copyFeedback.set(message);
    setTimeout(() => {
      this.copyFeedback.set('');
    }, 2000); // Clear feedback after 2 seconds
  }
}

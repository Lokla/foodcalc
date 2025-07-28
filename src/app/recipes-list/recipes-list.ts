import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Recipe } from '../data.service';
import { CurrencyDisplayComponent } from '../currency-display/currency-display';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyDisplayComponent],
  templateUrl: './recipes-list.html',
  styleUrls: ['./recipes-list.css']
})
export class RecipesListComponent {
  
  // Filter controls
  selectedType = signal<string>('');
  selectedStats = signal<string>('');
  hideNoStats = signal<boolean>(false);
  showOnlyAvailable = signal<boolean>(false);
  sortByOption = signal<'level' | 'name' | 'revenue' | 'costPerMinute'>('level');
  copySuccessField = signal<string>(''); // Tracks which field shows copy success
  
  constructor(private dataService: DataService) {}
  
  // Get available stats for filter dropdown
  availableStats = computed(() => {
    const allRecipes = this.dataService.getRecipesForCurrentTier();
    const statsSet = new Set<string>();
    
    allRecipes.forEach(recipe => {
      if (recipe.stats) {
        statsSet.add(recipe.stats);
      }
    });
    
    return Array.from(statsSet).sort();
  });
  
  // Get filtered and sorted recipes
  filteredRecipes = computed(() => {
    let recipes = this.dataService.getRecipesForCurrentTier();
    
    const typeFilter = this.selectedType();
    const statsFilter = this.selectedStats();
    const hideNoStatsFilter = this.hideNoStats();
    const showOnlyAvailableFilter = this.showOnlyAvailable();
    const sortBy = this.sortByOption();
    
    // Apply filters
    if (typeFilter) {
      recipes = recipes.filter(recipe => recipe.type === typeFilter);
    }
    
    if (statsFilter) {
      recipes = recipes.filter(recipe => recipe.stats === statsFilter);
    }
    
    if (hideNoStatsFilter) {
      recipes = recipes.filter(recipe => 
        recipe.stats && recipe.stats.trim() !== '' && recipe.stats !== 'None'
      );
    }
    
    if (showOnlyAvailableFilter) {
      const availableRecipes = this.dataService.getAvailableRecipesForCurrentTier();
      recipes = recipes.filter(recipe => 
        availableRecipes.some(available => available.name === recipe.name)
      );
    }
    
    // Apply sorting
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
        case 'costPerMinute':
          const costPerMinA = this.dataService.calculateCostPerMinute(a);
          const costPerMinB = this.dataService.calculateCostPerMinute(b);
          return costPerMinA - costPerMinB; // Lowest cost per minute first
        default:
          return 0;
      }
    });
    
    return recipes;
  });

  // Keep sortedRecipes for backward compatibility (just returns filteredRecipes now)
  sortedRecipes = computed(() => {
    return this.filteredRecipes();
  });

  // Get current tier
  getCurrentTier(): number {
    return parseInt(this.dataService.getSelectedTier()());
  }
  
  // Calculate cost per item
  getCostPerItem(recipe: Recipe): number {
    return this.dataService.calculateCostPerUnit(recipe);
  }
  
  // Calculate fuel cost per item
  getFuelCostPerItem(recipe: Recipe): number {
    if (recipe.fuel <= 0) return 0;
    const tier = this.dataService.getTierFromLevel(recipe.level);
    const fuelCostPerFuel = this.dataService.getFuelCostForTier(tier);
    const totalFuelCost = fuelCostPerFuel * recipe.fuel;
    const recipeYield = recipe.yield || 2;
    return totalFuelCost / recipeYield;
  }
  
  // Calculate fuel cost per stack (20 items)
  getFuelCostPerStack(recipe: Recipe): number {
    return this.getFuelCostPerItem(recipe) * 20;
  }
  
  // Calculate cost per stack (20 items)
  getCostPerStack(recipe: Recipe): number {
    return this.getCostPerItem(recipe) * 20;
  }
  
  // Calculate cost per minute
  getCostPerMinute(recipe: Recipe): number {
    return this.dataService.calculateCostPerMinute(recipe);
  }
  
  // Apply filters (triggered by ngModelChange)
  applyFilters() {
    // This method is called automatically when filter values change
    // The computed signals will automatically update the filtered results
  }
  
  // Clear all filters
  clearFilters() {
    this.selectedType.set('');
    this.selectedStats.set('');
    this.hideNoStats.set(false);
    this.showOnlyAvailable.set(false);
    this.sortByOption.set('level');
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

  // Get recipe cost per unit (accounting for yield)
  getRecipeCost(recipe: Recipe): number {
    return this.dataService.calculateCostPerUnit(recipe);
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

  // Copy recipe name to clipboard
  async copyRecipeName(recipe: Recipe) {
    try {
      await navigator.clipboard.writeText(recipe.name);
      this.showCopySuccess(`name-${recipe.name}`);
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
      this.showCopySuccess(`broker-${recipe.name}`);
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
      this.showCopySuccess(`recommended-${recipe.name}`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  // Show copy success feedback on specific field
  private showCopySuccess(fieldId: string) {
    this.copySuccessField.set(fieldId);
    setTimeout(() => this.copySuccessField.set(''), 1500); // Clear after 1.5 seconds
  }

  // Check if a specific field should show copy success
  isCopySuccess(fieldType: string, recipe: Recipe): boolean {
    return this.copySuccessField() === `${fieldType}-${recipe.name}`;
  }
}

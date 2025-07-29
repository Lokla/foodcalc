import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { CurrencyDisplayComponent } from '../currency-display/currency-display';

export interface ReferenceItem {
  name: string;
  level: number;
  stats: string;
  type: 'Food' | 'Drink';
  tier: number;
  cost: number;
}

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyDisplayComponent],
  templateUrl: './references.html',
  styleUrl: './references.css'
})
export class ReferencesComponent {
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  selectedTier = this.dataService.getSelectedTier();
  copiedItem = signal<string | null>(null);

  // Check if recipes are loaded
  get isLoading() {
    return !this.dataService.getRecipesLoaded();
  }

  // Computed property for reference items that updates when recipes are loaded
  referenceItems = computed(() => {
    if (!this.dataService.getRecipesLoaded()) {
      return [];
    }

    const currentTier = parseInt(this.selectedTier());
    const recipes = this.dataService.getAllRecipes()();
    
    // Filter recipes for current tier
    const tierRecipes = recipes.filter(recipe => 
      this.dataService.getTierFromLevel(recipe.level) === currentTier
    );

    // Group by stats and type combination
    const groups = new Map<string, any[]>();
    
    tierRecipes.forEach(recipe => {
      if (recipe.stats) {
        const key = `${recipe.stats}_${recipe.type}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(recipe);
      }
    });

    // Find highest level recipe for each group
    const references: ReferenceItem[] = [];
    
    groups.forEach((groupRecipes, key) => {
      const highestLevelRecipe = groupRecipes.reduce((highest, current) => 
        current.level > highest.level ? current : highest
      );
      
      references.push({
        name: highestLevelRecipe.name,
        level: highestLevelRecipe.level,
        stats: highestLevelRecipe.stats,
        type: highestLevelRecipe.type,
        tier: currentTier,
        cost: 0
      });
    });

    // Sort by stats, then by type
    references.sort((a, b) => {
      if (a.stats !== b.stats) {
        return a.stats.localeCompare(b.stats);
      }
      return a.type.localeCompare(b.type);
    });

    return references;
  });

  constructor() {
    // Effect to build form when reference items change
    effect(() => {
      const items = this.referenceItems();
      if (items.length > 0) {
        this.buildForm();
        this.loadFromLocalStorage();
      }
    });
  }

  private buildForm() {
    const formControls: any = {};
    
    this.referenceItems().forEach(item => {
      const controlName = this.getControlName(item);
      formControls[controlName] = [0];
    });

    this.form = this.fb.group(formControls);

    // Auto-save on changes
    this.form.valueChanges.subscribe(() => {
      this.saveToLocalStorage();
    });
  }

  getControlName(item: ReferenceItem): string {
    return `${item.stats}_${item.type}_${item.level}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private saveToLocalStorage() {
    const formData: any = {};
    this.referenceItems().forEach(item => {
      const controlName = this.getControlName(item);
      const value = this.form.get(controlName)?.value || 0;
      formData[item.name] = value;
    });

    const storageKey = `referenceItems_tier${this.selectedTier()}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }

  private loadFromLocalStorage() {
    const storageKey = `referenceItems_tier${this.selectedTier()}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.referenceItems().forEach(item => {
          const controlName = this.getControlName(item);
          const savedValue = data[item.name] || 0;
          this.form.get(controlName)?.setValue(savedValue);
          item.cost = savedValue;
        });
      } catch (error) {
        console.warn('Failed to load reference items from localStorage:', error);
      }
    }
  }

  onSubmit() {
    // Update reference item costs
    this.referenceItems().forEach(item => {
      const controlName = this.getControlName(item);
      item.cost = this.form.get(controlName)?.value || 0;
    });

    this.saveToLocalStorage();
    
    // Optional: Show success message
    console.log('Reference items saved successfully');
  }

  // Calculate broker cost per minute for a reference item
  getBrokerCostPerMinute(item: ReferenceItem): number {
    const controlName = this.getControlName(item);
    const brokerCost = this.form.get(controlName)?.value || 0;
    
    if (brokerCost === 0) return 0;
    
    // Find the recipe for this reference item to get its duration
    const recipes = this.dataService.getAllRecipes()();
    const recipe = recipes.find(r => r.name === item.name);
    
    if (!recipe || recipe.duration === 0) return 0;
    
    return brokerCost / recipe.duration;
  }

  // Copy item name to clipboard
  async copyToClipboard(itemName: string) {
    try {
      await navigator.clipboard.writeText(itemName);
      this.copiedItem.set(itemName);
      
      // Clear the copied indicator after 2 seconds
      setTimeout(() => {
        this.copiedItem.set(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }
}

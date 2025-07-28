import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from "./header/header";
import { RawsForm } from "./raws-form/raws-form";
import { RecipesComponent } from "./recipes/recipes";
import { RecipesListComponent } from "./recipes-list/recipes-list";
import { DataService } from "./data.service";
import { ReferencesComponent } from "./references/references";

@Component({
  selector: 'app-root',
  imports: [Header, CommonModule, RawsForm, RecipesComponent, RecipesListComponent, ReferencesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'foodcalc';
  
  // Tab management with persistence
  activeTab = signal<'rawMaterials' | 'references' | 'recipes' | 'recipesList'>('recipesList');

  constructor(private dataService: DataService) {
    // Load the last active tab from localStorage
    this.loadActiveTab();
  }
  
  // Get tier options from the service
  get selectOptions() {
    return this.dataService.getTierOptions()();
  }
  
  // Get selected value from the service
  get selectedValue() {
    return this.dataService.getSelectedTier()();
  }
  
  // Method to handle selection change
  protected onSelectionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.dataService.setSelectedTier(target.value);
    console.log('Selected tier:', target.value);
  }
  
  // Tab navigation methods
  setActiveTab(tab: 'rawMaterials' | 'recipes' | 'recipesList' | 'references') {
    this.activeTab.set(tab);
    // Save the active tab to localStorage
    this.saveActiveTab(tab);
  }

  // Save active tab to localStorage
  private saveActiveTab(tab: string) {
    try {
      localStorage.setItem('foodcalc-active-tab', tab);
    } catch (error) {
      console.warn('Failed to save active tab to localStorage:', error);
    }
  }

  // Load active tab from localStorage
  private loadActiveTab() {
    try {
      const savedTab = localStorage.getItem('foodcalc-active-tab');
      if (savedTab && this.isValidTab(savedTab)) {
        this.activeTab.set(savedTab as 'rawMaterials' | 'recipes' | 'recipesList' | 'references');
      }
    } catch (error) {
      console.warn('Failed to load active tab from localStorage:', error);
      // Keep default tab if loading fails
    }
  }

  // Validate if the saved tab is a valid tab name
  private isValidTab(tab: string): boolean {
    return ['rawMaterials', 'recipes', 'recipesList', 'references'].includes(tab);
  }
}

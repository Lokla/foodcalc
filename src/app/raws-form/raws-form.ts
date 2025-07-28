import { Component, signal, effect, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-raws-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './raws-form.html',
  styleUrl: './raws-form.css'
})
export class RawsForm implements OnInit {
  form!: FormGroup;
  copiedItem = signal<string | null>(null);

  constructor(private fb: FormBuilder, private dataService: DataService) {
    // Watch for tier changes and recreate the form
    effect(() => {
      const currentTier = this.dataService.getSelectedTier()();
      this.form = this.createForm();
    });
  }

  ngOnInit() {
    // Load saved data from localStorage on component initialization
    this.dataService.loadFromLocalStorage();
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    const formControls: { [key: string]: any } = {};
    const rawMaterials = this.dataService.getRawMaterials();
    
    rawMaterials.forEach(raw => {
      // Create a form control for each raw item
      // Use the raw name as key, removing spaces and special characters
      const controlName = this.getControlName(raw.name);
      formControls[controlName] = [raw.value, [Validators.required, Validators.min(0)]];
    });

    return this.fb.group(formControls);
  }

  private getControlName(name: string): string {
    // Convert name to a valid form control name
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  getRaws() {
    return this.dataService.getRawMaterials();
  }

  getControlNameForRaw(rawName: string): string {
    return this.getControlName(rawName);
  }

  async copyToClipboard(rawName: string) {
    try {
      await navigator.clipboard.writeText(rawName);
      console.log(`Copied "${rawName}" to clipboard`);
      
      // Show visual confirmation
      this.copiedItem.set(rawName);
      
      // Hide the confirmation after 2 seconds
      setTimeout(() => {
        this.copiedItem.set(null);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback method for older browsers
      this.fallbackCopyToClipboard(rawName);
    }
  }

  private fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      console.log(`Copied "${text}" to clipboard (fallback method)`);
      
      // Show visual confirmation for fallback method too
      this.copiedItem.set(text);
      setTimeout(() => {
        this.copiedItem.set(null);
      }, 500);
      
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }

  onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.value;
      console.log('Form submitted with values:', formValues);
      
      // Update the raw materials in the data service
      const rawMaterials = this.dataService.getRawMaterials();
      rawMaterials.forEach(raw => {
        const controlName = this.getControlName(raw.name);
        const newValue = formValues[controlName] || 0;
        this.dataService.updateRawMaterialPrice(raw.name, newValue);
      });
      
      // Save to localStorage for persistence
      this.dataService.saveToLocalStorage();
      
      console.log('Updated raw materials for tier:', this.dataService.getSelectedTier()());
    }
  }
}

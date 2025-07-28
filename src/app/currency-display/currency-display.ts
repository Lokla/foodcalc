import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyParts } from '../eq2-currency.pipe';

@Component({
  selector: 'app-currency-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="currency-display" [class]="cssClass">
      @if (currencyParts.platinum > 0) {
        <span class="platinum">{{ currencyParts.platinum }}p</span>
      } @else {
        <span class="platinum-placeholder"></span>
      }
      @if (currencyParts.gold > 0 || currencyParts.platinum > 0) {
        <span class="gold">{{ currencyParts.gold }}g</span>
      } @else {
        <span class="gold-placeholder"></span>
      }
      @if (currencyParts.silver > 0 || currencyParts.gold > 0 || currencyParts.platinum > 0) {
        <span class="silver">{{ currencyParts.silver }}s</span>
      } @else {
        <span class="silver-placeholder"></span>
      }
      <span class="copper">{{ currencyParts.copper }}c</span>
    </span>
  `,
  styles: [`
    .currency-display {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 0.85em;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }
    
    .currency-display span {
      text-align: right;
      margin-left: 2px;
    }
    
    .platinum, .gold, .silver, .copper {
      display: inline-block;
      min-width: 20px;
    }
    
    .platinum-placeholder, .gold-placeholder, .silver-placeholder {
      display: inline-block;
      min-width: 20px;
    }
    
    .platinum {
      color: white;
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
    }
    
    .gold {
      color: #FFD700;
      text-shadow: 0 0 2px rgba(255, 215, 0, 0.5);
    }
    
    .silver {
      color: #C0C0C0;
      text-shadow: 0 0 2px rgba(192, 192, 192, 0.5);
    }
    
    .copper {
      color: #CD853F;
      text-shadow: 0 0 2px rgba(205, 133, 63, 0.5);
    }
  `]
})
export class CurrencyDisplayComponent {
  @Input() value: number = 0; // Input in silver
  @Input() copperAmount: number = 0; // Direct copper input (for calculated values that are already in copper)
  @Input() cssClass: string = ''; // CSS class to apply to the currency display
  
  get currencyParts(): CurrencyParts {
    // If copperAmount is provided, use it directly as copper
    // Otherwise, convert value from silver to copper
    const copperValue = this.copperAmount > 0 ? this.copperAmount : this.value;
    return this.convertToCurrency(copperValue);
  }

  private convertToCurrency(value: number): CurrencyParts {
    if (!value || value < 0) {
      return { platinum: 0, gold: 0, silver: 0, copper: 0 };
    }
    
    let totalCopper: number;
    
    // If using copperAmount input, treat as direct copper value
    if (this.copperAmount > 0) {
      totalCopper = Math.round(this.copperAmount);
    } else {
      // Otherwise, convert from silver to copper (value is in silver)
      totalCopper = Math.round(value * 100); // 1 silver = 100 copper
    }
    
    const platinum = Math.floor(totalCopper / 1000000); // 1 plat = 100g = 10000s = 1000000c
    totalCopper %= 1000000;
    
    const gold = Math.floor(totalCopper / 10000); // 1g = 100s = 10000c
    totalCopper %= 10000;
    
    const silver = Math.floor(totalCopper / 100); // 1s = 100c
    const copper = totalCopper % 100;
    
    return { platinum, gold, silver, copper };
  }
}

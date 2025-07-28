import { Pipe, PipeTransform } from '@angular/core';

export interface CurrencyParts {
  platinum: number;
  gold: number;
  silver: number;
  copper: number;
}

@Pipe({
  name: 'eq2Currency',
  standalone: true
})
export class Eq2CurrencyPipe implements PipeTransform {
  
  transform(value: number): CurrencyParts {
    if (!value || value < 0) {
      return { platinum: 0, gold: 0, silver: 0, copper: 0 };
    }
    
    // Convert to copper (smallest unit)
    let totalCopper = Math.round(value * 100); // value is in silver
    
    const platinum = Math.floor(totalCopper / 1000000); // 1 plat = 100g = 10000s = 1000000c
    totalCopper %= 1000000;
    
    const gold = Math.floor(totalCopper / 10000); // 1g = 100s = 10000c
    totalCopper %= 10000;
    
    const silver = Math.floor(totalCopper / 100); // 1s = 100c
    const copper = totalCopper % 100;
    
    return { platinum, gold, silver, copper };
  }
}

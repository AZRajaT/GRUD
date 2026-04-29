import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environments/environment';

@Pipe({
  name: 'asset',
  standalone: true
})
export class AssetPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return 'assets/images/placeholder.png';
    
    // If it's already a full URL, return it
    if (value.startsWith('http')) {
      return value;
    }
    
    // Prepend imageBaseUrl if it's a relative path
    const baseUrl = environment.imageBaseUrl || '';
    
    // Ensure we don't have double slashes if base URL ends with / and value starts with /
    const normalizedValue = value.startsWith('/') ? value.substring(1) : value;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    return `${normalizedBaseUrl}${normalizedValue}`;
  }
}

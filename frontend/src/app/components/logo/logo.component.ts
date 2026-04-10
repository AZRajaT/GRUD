import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Reusable Logo Component for AROW Mart
 * Usage:
 *   <app-logo></app-logo> - Default size (40px)
 *   <app-logo size="small"></app-logo> - Small size (32px)
 *   <app-logo size="large"></app-logo> - Large size (60px)
 *   <app-logo [customHeight]="50"></app-logo> - Custom height
 *   <app-logo [clickable]="false"></app-logo> - Static logo (no navigation)
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (clickable) {
      <a 
        routerLink="/" 
        class="logo-link"
        [class]="'logo-size-' + size"
        [style.--logo-height.px]="getHeight()"
        aria-label="AROW Mart Home">
        <img 
          src="assets/images/NammaBasket logo.png" 
          alt="AROW Mart Logo"
          class="logo-img"
          (error)="onImageError($event)">
      </a>
    } @else {
      <div 
        class="logo-container"
        [class]="'logo-size-' + size"
        [style.--logo-height.px]="getHeight()">
        <img 
          src="assets/images/NammaBasket logo.png" 
          alt="AROW Mart Logo"
          class="logo-img"
          (error)="onImageError($event)">
      </div>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      line-height: 0;
    }
    
    .logo-link,
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: var(--logo-height, 40px);
      text-decoration: none;
      transition: opacity 0.2s ease;
      line-height: 0;
    }
    
    .logo-link:hover {
      opacity: 0.85;
    }
    
    .logo-img {
      width: auto;
      height: 100%;
      max-height: var(--logo-height, 40px);
      object-fit: contain;
      display: block;
    }
    
    /* Size variants */
    .logo-size-small {
      --logo-height: 32px;
    }
    
    .logo-size-medium {
      --logo-height: 40px;
    }
    
    .logo-size-large {
      --logo-height: 60px;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .logo-size-large {
        --logo-height: 45px;
      }
      
      .logo-size-medium {
        --logo-height: 36px;
      }
    }
  `]
})
export class LogoComponent {
  /** Predefined size: 'small' (32px), 'medium' (40px), 'large' (60px) */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  /** Custom height in pixels (overrides size if provided) */
  @Input() customHeight?: number;
  
  /** Whether the logo is clickable and navigates to home */
  @Input() clickable: boolean = true;
  
  /** Whether to show text fallback when image fails to load */
  @Input() showFallback: boolean = true;

  private sizeMap = {
    small: 32,
    medium: 40,
    large: 60
  };

  getHeight(): number {
    return this.customHeight ?? this.sizeMap[this.size];
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (this.showFallback) {
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent) {
        const fallback = document.createElement('span');
        fallback.textContent = '🛒 AROW Mart';
        fallback.style.fontSize = `${this.getHeight() * 0.5}px`;
        fallback.style.fontWeight = '600';
        fallback.style.color = '#FF8A3D';
        fallback.style.whiteSpace = 'nowrap';
        fallback.style.lineHeight = '1';
        parent.appendChild(fallback);
      }
    }
  }
}

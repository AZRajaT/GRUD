import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-card">
      <!-- Product Image -->
      <div class="product-image">
        <img *ngIf="product.imageUrl && !imageError" [src]="product.imageUrl" [alt]="product.name" class="product-img" (error)="onImageError()">
        <div *ngIf="!product.imageUrl || imageError" class="no-image">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h6 class="product-name">{{ product.name }}</h6>
        <p class="product-unit">{{ product.unit || '1 unit' }}</p>
        <p class="product-price">₹{{ product.price }}</p>
      </div>

      <!-- Add to Cart Button -->
      <button
        (click)="addToCart()"
        class="add-to-cart-btn">
        Add to Cart
      </button>
    </div>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .product-image {
      background: #F8F9FA;
      height: clamp(120px, 35vw, 160px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(0.75rem, 3vw, 1rem);
      overflow: hidden;
    }

    .product-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }

    .no-image {
      color: #9CA3AF;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-icon {
      font-size: 3rem;
    }

    .product-info {
      padding: 1rem;
      flex-grow: 1;
    }

    .product-name {
      font-size: clamp(0.8rem, 2.5vw, 0.95rem);
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 0.25rem 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-unit {
      font-size: clamp(0.7rem, 2vw, 0.8rem);
      color: #6B7280;
      margin: 0 0 0.5rem 0;
    }

    .product-price {
      font-size: clamp(0.9rem, 3vw, 1.1rem);
      font-weight: 700;
      color: rgb(255, 138, 61);
      margin: 0;
    }

    .add-to-cart-btn {
      width: 100%;
      background: rgb(255, 138, 61);
      color: white;
      border: none;
      padding: clamp(0.625rem, 3vw, 0.875rem) clamp(0.75rem, 3vw, 1rem);
      font-weight: 600;
      font-size: clamp(0.8rem, 2.5vw, 0.95rem);
      border-radius: 0 0 12px 12px;
      transition: all 0.2s ease;
      cursor: pointer;
      min-height: 44px;
      touch-action: manipulation;
      box-shadow: 0 2px 6px rgba(255, 138, 61, 0.3);
    }

    .add-to-cart-btn:hover {
      background: rgb(255, 138, 61);
      box-shadow: 0 4px 10px rgba(255, 138, 61, 0.45);
      filter: brightness(1.05);
    }

    .add-to-cart-btn:active {
      transform: scale(0.96);
    }

    /* Mobile Optimizations */
    @media (max-width: 576px) {
      .product-card {
        border-radius: 10px;
      }
      
      .product-info {
        padding: 0.75rem;
      }
    }

    @media (min-width: 768px) {
      .product-image {
        height: 160px;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  imageError = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  onImageError(): void {
    this.imageError = true;
  }

  addToCart(): void {
    this.cartService.addToCart(this.product, 1);
    this.toastService.show(`${this.product.name} added to cart!`);
  }
}

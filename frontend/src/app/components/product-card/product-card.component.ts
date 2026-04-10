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
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
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
      font-size: 0.9rem;
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 0.25rem 0;
      line-height: 1.3;
    }

    .product-unit {
      font-size: 0.75rem;
      color: #6B7280;
      margin: 0 0 0.5rem 0;
    }

    .product-price {
      font-size: 1rem;
      font-weight: 700;
      color: #FF6B35;
      margin: 0;
    }

    .add-to-cart-btn {
      width: 100%;
      background: #FF6B35;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      font-weight: 600;
      border-radius: 0 0 12px 12px;
      transition: background 0.2s ease;
      cursor: pointer;
    }

    .add-to-cart-btn:hover {
      background: #E55A2B;
    }

    .add-to-cart-btn:active {
      transform: scale(0.98);
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

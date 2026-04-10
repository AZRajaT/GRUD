import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-floating-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a
      routerLink="/cart"
      class="floating-cart-btn"
      [class.pulse]="cartCount() > 0"
      [attr.aria-label]="'Cart with ' + cartCount() + ' items'">
      <div class="cart-icon-wrapper">
        <i class="bi bi-cart3 fs-4"></i>
        @if (cartCount() > 0) {
          <span class="cart-badge">{{ cartCount() }}</span>
        }
      </div>
      @if (cartCount() > 0) {
        <div class="cart-total">
          <span class="cart-amount">₹{{ cartTotal() }}</span>
        </div>
      }
    </a>
  `,
  styles: [`
    .floating-cart-btn {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #FF8A3D;
      color: white;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(255, 138, 61, 0.3);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      font-weight: 500;
    }

    .floating-cart-btn:hover {
      background: #E66A20;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 138, 61, 0.4);
    }

    .floating-cart-btn.pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 4px 15px rgba(255, 138, 61, 0.3);
      }
      50% {
        box-shadow: 0 4px 25px rgba(255, 138, 61, 0.5);
      }
    }

    .cart-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cart-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #111827;
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      min-width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .cart-total {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .cart-amount {
      font-weight: 700;
      font-size: 0.95rem;
    }

    @media (max-width: 576px) {
      .floating-cart-btn {
        bottom: 1rem;
        right: 1rem;
        padding: 0.6rem 0.9rem;
      }

      .cart-amount {
        font-size: 0.85rem;
      }
    }
  `]
})
export class FloatingCartComponent {
  constructor(private cartService: CartService) {}

  cartCount = this.cartService.cartCount;
  cartTotal = this.cartService.cartTotal;
}

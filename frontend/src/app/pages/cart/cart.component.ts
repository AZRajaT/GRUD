import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    LucideAngularModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;
  imageErrors: { [key: string]: boolean } = {};

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  updateQuantity(productId: string | undefined, change: number): void {
    if (!productId) return;
    const currentQty = this.cartService.getItemQuantity(productId);
    const newQty = currentQty + change;
    
    if (newQty > 0) {
      this.cartService.updateQuantity(productId, newQty);
    }
  }

  removeItem(productId: string | undefined): void {
    if (!productId) return;
    this.cartService.removeFromCart(productId);
    this.toastService.show('Item removed from cart');
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.toastService.show('Cart cleared');
  }

  getWhatsAppMessage(): string {
    const items = this.cartItems()
      .map(item => `${item.product.name} x ${item.quantity} = ₹${item.product.price * item.quantity}`)
      .join('\n');
    
    const message = `🛒 *New Order from AROW Mart*

📋 *Order Items:*
${items}

💰 *Total: ₹${this.cartTotal()}*

👤 *Customer Details:*
Please provide your:
• Name:
• Phone:
• Delivery Address:
• Apartment/Flat:

Thank you for choosing AROW Mart! 🛍️`;
    
    return encodeURIComponent(message);
  }

  onImageError(productId: string | undefined): void {
    if (productId) {
      this.imageErrors[productId] = true;
    }
  }
}

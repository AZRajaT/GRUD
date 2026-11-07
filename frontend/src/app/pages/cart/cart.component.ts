import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { OrderService } from '../../services/order.service';
import { AssetPipe } from '../../pipes/asset.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    AssetPipe
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;
  imageErrors: { [key: string]: boolean } = {};

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.validateCart();
  }

  private validateCart(): void {
    const items = this.cartItems();
    if (items.length === 0) return;

    // Prune items with missing product ID immediately
    const corruptItems = items.filter(i => !i.product || !i.product._id);
    if (corruptItems.length > 0) {
      corruptItems.forEach(c => this.cartService.removeFromCart(c.product?._id));
    }

    const payload = items
      .filter(i => i.product && i.product._id)
      .map(i => ({ productId: i.product._id!, quantity: i.quantity }));

    if (payload.length === 0) return;

    this.orderService.validateCart(payload).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.removedItemIds && res.data.removedItemIds.length > 0) {
          this.cartService.removeMultiple(res.data.removedItemIds);
          this.toastService.show('Some items in your cart were no longer available and were removed.', 'info');
        }
      },
      error: (err) => {
        console.warn('Could not validate cart items:', err);
      }
    });
  }

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



  onImageError(productId: string | undefined): void {
    if (productId) {
      this.imageErrors[productId] = true;
    }
  }
}

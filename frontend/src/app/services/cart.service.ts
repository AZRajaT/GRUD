import { Injectable, signal, effect } from '@angular/core';
import { Product, CartItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'freshcart_cart';
  
  cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  cartCount = signal<number>(0);
  cartTotal = signal<number>(0);

  constructor() {
    effect(() => {
      const items = this.cartItems();
      this.saveCartToStorage(items);
      this.updateCartMetrics(items);
    });
    
    // Initialize metrics
    this.updateCartMetrics(this.cartItems());
  }

  private loadCartFromStorage(): CartItem[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.CART_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  private saveCartToStorage(items: CartItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    }
  }

  private updateCartMetrics(items: CartItem[]): void {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    this.cartCount.set(count);
    this.cartTotal.set(total);
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find(item => item.product._id === product._id);

    if (existingItem) {
      const updatedItems = currentItems.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      this.cartItems.set(updatedItems);
    } else {
      this.cartItems.set([...currentItems, { product, quantity }]);
    }
  }

  updateQuantity(productId: string | undefined, quantity: number): void {
    if (!productId) return;
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    );
    this.cartItems.set(updatedItems);
  }

  removeFromCart(productId: string | undefined): void {
    if (!productId) return;
    const currentItems = this.cartItems();
    this.cartItems.set(currentItems.filter(item => item.product._id !== productId));
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  isInCart(productId: string | undefined): boolean {
    if (!productId) return false;
    return this.cartItems().some(item => item.product._id === productId);
  }

  getItemQuantity(productId: string | undefined): number {
    if (!productId) return 0;
    const item = this.cartItems().find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  }
}

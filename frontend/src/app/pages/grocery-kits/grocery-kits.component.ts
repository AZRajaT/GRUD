import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroceryKitService } from '../../services/grocery-kit.service';
import { CartService } from '../../services/cart.service';
import { GroceryKit, KitItem } from '../../models';
import { AssetPipe } from '../../pipes/asset.pipe';

@Component({
  selector: 'app-grocery-kits',
  standalone: true,
  imports: [CommonModule, RouterModule, AssetPipe],
  templateUrl: './grocery-kits.component.html',
  styleUrl: './grocery-kits.component.scss'
})
export class GroceryKitsComponent implements OnInit {
  kits = signal<GroceryKit[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  expandedKitId = signal<string | null>(null);
  addingToCart = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  constructor(
    private groceryKitService: GroceryKitService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadKits();
  }

  loadKits(page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.groceryKitService.getAllKits(page, 9).subscribe({
      next: (response) => {
        this.kits.set(response.data.kits);
        this.currentPage.set(response.data.pagination.currentPage);
        this.totalPages.set(response.data.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load grocery kits. Please try again.');
        this.loading.set(false);
        console.error('Error loading kits:', err);
      }
    });
  }

  toggleKitDetails(kitId: string): void {
    this.expandedKitId.set(this.expandedKitId() === kitId ? null : kitId);
  }

  addKitToCart(kit: GroceryKit): void {
    this.addingToCart.set(kit._id || '');

    // Add each item from the kit to cart
    kit.items.forEach((item: KitItem) => {
      this.cartService.addToCart(item.product, item.quantity);
    });

    // Simulate delay for better UX
    setTimeout(() => {
      this.addingToCart.set(null);
    }, 800);
  }

  calculateSavings(kit: GroceryKit): number {
    if (kit.originalPrice && kit.originalPrice > kit.price) {
      return kit.originalPrice - kit.price;
    }
    return 0;
  }

  calculateTotalItems(kit: GroceryKit): number {
    return kit.items.reduce((sum: number, item: KitItem) => sum + item.quantity, 0);
  }

  calculateKitTotalValue(kit: GroceryKit): number {
    return kit.items.reduce((sum: number, item: KitItem) => sum + (item.product.price * item.quantity), 0);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.loadKits(page);
    }
  }

  getImageUrl(kit: GroceryKit): string {
    return kit.imageUrl || '/assets/images/kit-placeholder.jpg';
  }

  trackByKitId(index: number, kit: GroceryKit): string {
    return kit._id || index.toString();
  }
}

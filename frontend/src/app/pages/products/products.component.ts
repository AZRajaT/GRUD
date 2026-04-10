import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  searchQuery = signal('');
  selectedCategory = 'all';
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;
  imageErrors: { [key: string]: boolean } = {};

  categories: { id: string; name: string }[] = [];

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(query) ||
                          product.description?.toLowerCase().includes(query);
      const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  });

  getQuantity(productId: string | undefined): number {
    if (!productId) return 0;
    return this.cartService.getItemQuantity(productId);
  }

  addToCart(product: Product): void {
    if (!product._id) {
      this.toastService.show('Cannot add product: missing ID');
      return;
    }
    this.cartService.addToCart(product, 1);
    this.toastService.show(`${product.name} added to cart!`);
  }

  updateQuantity(product: Product, change: number): void {
    if (!product._id) return;
    const currentQty = this.getQuantity(product._id);
    const newQty = currentQty + change;
    
    if (newQty > 0) {
      this.cartService.updateQuantity(product._id, newQty);
    } else {
      this.cartService.removeFromCart(product._id);
    }
  }

  setSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.loadProducts();
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Products';
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    const category = this.selectedCategory === 'all' ? undefined : this.selectedCategory;
    const search = this.searchQuery() || undefined;
    
    console.log('[DEBUG] Loading products with:', { category, search, selectedCategory: this.selectedCategory });
    
    this.productService.getProducts(1, 100, search, category).subscribe({
      next: (response) => {
        console.log('[DEBUG] API Response:', response);
        if (response.success) {
          console.log('[DEBUG] Products count:', response.data.products.length);
          console.log('[DEBUG] Products:', response.data.products);
          this.products = response.data.products.filter(p => p.isActive !== false);
          console.log('[DEBUG] Filtered products:', this.products.length);
        } else {
          this.error = 'Failed to load products';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[DEBUG] Error loading products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data.categories.length > 0) {
          // Normalize and deduplicate categories by lowercase ID
          const categoryMap = new Map<string, string>();
          
          response.data.categories
            .filter(cat => cat && cat.trim())
            .forEach(cat => {
              const id = cat.toLowerCase().replace(/\s+/g, '-');
              // Keep the first occurrence or prefer title case version
              if (!categoryMap.has(id)) {
                // Convert to proper title case: "RICE" -> "Rice"
                const name = cat.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                categoryMap.set(id, name);
              }
            });
          
          const apiCategories = Array.from(categoryMap.entries()).map(([id, name]) => ({
            id,
            name
          }));
          
          this.categories = [{ id: 'all', name: 'All Products' }, ...apiCategories];
        } else {
          this.setDefaultCategories();
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.setDefaultCategories();
      }
    });
  }

  private setDefaultCategories(): void {
    this.categories = [
      { id: 'all', name: 'All Products' },
      { id: 'kits', name: 'Grocery Kits' },
      { id: 'rice', name: 'Rice & Grains' },
      { id: 'dal', name: 'Dal & Pulses' },
      { id: 'masala', name: 'Masala & Spices' },
      { id: 'oil', name: 'Oils & Ghee' },
      { id: 'essentials', name: 'Daily Essentials' },
    ];
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.loadProducts();
    });
  }

  onImageError(productId: string): void {
    this.imageErrors[productId] = true;
  }
}

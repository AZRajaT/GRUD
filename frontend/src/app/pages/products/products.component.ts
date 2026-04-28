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
  selectedCategory = signal('all');
  products = signal<Product[]>([]);
  isLoading = false;
  error: string | null = null;
  imageErrors: { [key: string]: boolean } = {};

  categories = signal<{ id: string; name: string }[]>([]);

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const currentCategory = this.selectedCategory();
    
    return this.products().filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(query) ||
                          product.description?.toLowerCase().includes(query);
      const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
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
    const category = this.categories().find(c => c.id === categoryId);
    return category ? category.name : 'Products';
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    const currentCategory = this.selectedCategory();
    const category = currentCategory === 'all' ? undefined : currentCategory;
    const search = this.searchQuery() || undefined;
    
    console.log('[DEBUG] Loading products with:', { category, search, selectedCategory: currentCategory });
    
    this.productService.getProducts(1, 100, search, category).subscribe({
      next: (response) => {
        console.log('[DEBUG] API Response:', response);
        if (response.success) {
          console.log('[DEBUG] Products count:', response.data.products.length);
          this.products.set(response.data.products.filter(p => p.isActive !== false));
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
          // Keep original category names as IDs for backend compatibility
          const apiCategories = response.data.categories
            .filter(cat => cat && cat.trim())
            .map(cat => ({
              id: cat, // Use original string
              name: cat.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) // Pretty name
            }));
          
          this.categories.set([{ id: 'all', name: 'All Products' }, ...apiCategories]);
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
    this.categories.set([
      { id: 'all', name: 'All Products' },
      { id: 'Kits', name: 'Grocery Kits' },
      { id: 'Rice', name: 'Rice & Grains' },
      { id: 'Dal', name: 'Dal & Pulses' },
      { id: 'Masala', name: 'Masala & Spices' },
      { id: 'Oil', name: 'Oils & Ghee' },
      { id: 'Essentials', name: 'Daily Essentials' },
    ]);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      this.loadProducts();
    });
  }

  onImageError(productId: string): void {
    this.imageErrors[productId] = true;
  }

}

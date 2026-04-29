import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { Product, ProductPagination } from '../../../models/product.model';
import { AssetPipe } from '../../../pipes/asset.pipe';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AssetPipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Product Inventory</h1>
          <p class="text-text-secondary mt-1">Manage and track your grocery items.</p>
        </div>
        <a routerLink="/admin/products/add" class="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200">
          <i class="bi bi-plus-lg"></i>
          <span>Add New Product</span>
        </a>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
          <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()" 
                 placeholder="Search by name or category..." 
                 class="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200">
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto">
          <select [(ngModel)]="categoryFilter" (change)="loadProducts()" 
                  class="flex-1 md:w-48 px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm font-semibold">
            <option value="all">All Categories</option>
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (product of products; track product._id) {
          <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden group hover:shadow-premium transition-all duration-300">
            <div class="relative h-48 bg-gray-50 overflow-hidden">
              <img [src]="(product.imageUrl || 'assets/images/placeholder.png') | asset" 
                   class="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                   [alt]="product.name">
              <div class="absolute top-3 right-3 flex flex-col gap-2">
                <span [class]="product.isActive ? 'bg-success/90 text-white' : 'bg-gray-400/90 text-white'" 
                      class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                  {{ product.isActive ? 'Active' : 'Inactive' }}
                </span>
                @if ((product.stock || 0) < 10) {
                  <span class="bg-red-500/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm animate-pulse">
                    Low Stock
                  </span>
                }
              </div>
            </div>
            
            <div class="p-5">
              <div class="flex items-start justify-between mb-1">
                <h3 class="font-bold text-text-primary line-clamp-1 group-hover:text-primary-600 transition-colors">{{ product.name }}</h3>
              </div>
              <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-3">{{ product.category }}</p>
              
              <div class="flex items-center justify-between mb-4">
                <span class="text-xl font-black text-text-primary">₹{{ product.price }}</span>
                <div class="flex flex-col items-end">
                  <span class="text-[10px] text-text-secondary uppercase font-bold tracking-tighter leading-none">In Stock</span>
                  <span class="text-sm font-black text-text-primary">{{ product.stock || 0 }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-4 border-t border-gray-50">
                <a [routerLink]="['/admin/products/edit', product._id]" 
                   class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-primary-50 hover:text-primary-600 transition-all duration-200">
                  <i class="bi bi-pencil-square"></i>
                  Edit
                </a>
                <button (click)="deleteProduct(product)" 
                   class="w-11 h-11 flex items-center justify-center bg-gray-50 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Empty State -->
      @if (products.length === 0 && !isLoading) {
        <div class="bg-white rounded-3xl p-20 text-center shadow-soft border border-gray-100">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
            <i class="bi bi-box-seam text-5xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-text-primary mb-2">No products found</h2>
          <p class="text-text-secondary mb-8">Start your inventory by adding your first grocery item.</p>
          <a routerLink="/admin/products/add" class="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white rounded-2xl font-bold shadow-soft hover:shadow-premium transition-all duration-200">
            <i class="bi bi-plus-lg text-lg"></i>
            Add Your First Product
          </a>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="bg-white rounded-2xl h-80 animate-pulse shadow-soft border border-gray-100">
              <div class="h-40 bg-gray-100 rounded-t-2xl"></div>
              <div class="p-5 space-y-3">
                <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                <div class="h-3 bg-gray-100 rounded w-1/4"></div>
                <div class="flex justify-between pt-4">
                  <div class="h-6 bg-gray-100 rounded w-1/3"></div>
                  <div class="h-6 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Pagination -->
      @if (pagination.totalPages > 1) {
        <div class="flex justify-center items-center gap-4 py-8">
          <button (click)="changePage(pagination.currentPage - 1)" 
                  [disabled]="pagination.currentPage === 1"
                  class="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-soft border border-gray-100 disabled:opacity-50 text-gray-600 hover:text-primary-600 transition-colors">
            <i class="bi bi-chevron-left"></i>
          </button>
          <div class="flex items-center gap-2">
            @for (p of [].constructor(pagination.totalPages); track i; let i = $index) {
              <button (click)="changePage(i + 1)"
                      [class]="pagination.currentPage === (i + 1) ? 'bg-brand-orange text-white shadow-glow' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'"
                      class="w-12 h-12 rounded-xl font-bold transition-all duration-200">
                {{ i + 1 }}
              </button>
            }
          </div>
          <button (click)="changePage(pagination.currentPage + 1)" 
                  [disabled]="pagination.currentPage === pagination.totalPages"
                  class="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-soft border border-gray-100 disabled:opacity-50 text-gray-600 hover:text-primary-600 transition-colors">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  pagination: ProductPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  };
  searchTerm = '';
  categoryFilter = 'all';
  isLoading = false;

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data.categories;
      }
    });
  }

  loadProducts(page: number = 1): void {
    this.isLoading = true;
    const category = this.categoryFilter === 'all' ? undefined : this.categoryFilter;
    
    this.productService.getProducts(page, 12, this.searchTerm || undefined, category).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.products = response.data.products;
          this.pagination = response.data.pagination;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.show('Failed to load products', 'error');
      }
    });
  }

  onSearch(): void {
    this.loadProducts(1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.loadProducts(page);
    }
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    this.productService.deleteProduct(product._id!).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.show('Product deleted successfully', 'success');
          this.loadProducts(this.pagination.currentPage);
        }
      },
      error: (error) => {
        this.toastService.show('Failed to delete product', 'error');
      }
    });
  }
}

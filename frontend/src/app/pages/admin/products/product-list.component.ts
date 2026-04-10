import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { Product, ProductPagination } from '../../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="products-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <a routerLink="/admin/products/add" class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Product
        </a>
      </div>

      <!-- Search & Stats -->
      <div class="search-section">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (keyup.enter)="onSearch()"
            placeholder="Search products by name..."
          />
          <button (click)="onSearch()" class="btn-search">Search</button>
        </div>
        <div class="stats-pills">
          <span class="pill">Total: {{ pagination.totalItems }}</span>
          <span class="pill active">Active: {{ activeCount }}</span>
          <span class="pill low" *ngIf="lowStockCount > 0">Low Stock: {{ lowStockCount }}</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid" *ngIf="products.length > 0">
        <div class="product-card" *ngFor="let product of products">
          <div class="product-image">
            <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name">
            <div *ngIf="!product.imageUrl" class="placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <span class="status-badge" [class.active]="product.isActive" [class.inactive]="!product.isActive">
              {{ product.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="category">{{ product.category || 'Uncategorized' }}</p>
            <p class="description" *ngIf="product.description">{{ product.description }}</p>
            <div class="product-meta">
              <span class="price">₹{{ product.price }}</span>
              <span class="quantity" [class.low]="product.quantity < 10">
                Stock: {{ product.quantity }}
              </span>
            </div>
          </div>
          <div class="product-actions">
            <a [routerLink]="['/admin/products/edit', product._id]" class="btn-edit" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </a>
            <button (click)="deleteProduct(product)" class="btn-delete" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="products.length === 0 && !isLoading">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
        <h3>No products found</h3>
        <p>Get started by adding your first product</p>
        <a routerLink="/admin/products/add" class="btn-primary">Add Product</a>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="pagination.totalPages > 1">
        <button
          (click)="changePage(pagination.currentPage - 1)"
          [disabled]="pagination.currentPage === 1"
          class="btn-page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Previous
        </button>
        <div class="page-numbers">
          <button
            *ngFor="let page of getPageNumbers()"
            (click)="changePage(page)"
            [class.active]="page === pagination.currentPage"
            class="page-number"
          >
            {{ page }}
          </button>
        </div>
        <button
          (click)="changePage(pagination.currentPage + 1)"
          [disabled]="pagination.currentPage === pagination.totalPages"
          class="btn-page"
        >
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
    }

    .page-header p {
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(2, 87, 155, 0.3);
    }

    /* Search Section */
    .search-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 8px 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      flex: 1;
      max-width: 500px;
    }

    .search-box svg {
      color: #9ca3af;
    }

    .search-box input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      padding: 8px 0;
    }

    .search-box input::placeholder {
      color: #9ca3af;
    }

    .btn-search {
      padding: 8px 20px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-search:hover {
      background: #e5e7eb;
    }

    .stats-pills {
      display: flex;
      gap: 8px;
    }

    .pill {
      padding: 8px 16px;
      background: white;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .pill.active {
      background: #d1fae5;
      color: #065f46;
    }

    .pill.low {
      background: #fef3c7;
      color: #92400e;
    }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .product-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      position: relative;
      height: 180px;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 12px;
    }

    .product-image .placeholder {
      color: #9ca3af;
    }

    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.inactive {
      background: #f3f4f6;
      color: #6b7280;
    }

    .product-info {
      padding: 20px;
    }

    .product-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 8px 0;
    }

    .product-info .category {
      font-size: 13px;
      color: #02579b;
      font-weight: 500;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-info .description {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 16px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-meta .price {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .product-meta .quantity {
      font-size: 13px;
      color: #6b7280;
      padding: 6px 12px;
      background: #f3f4f6;
      border-radius: 20px;
    }

    .product-meta .quantity.low {
      background: #fef3c7;
      color: #92400e;
    }

    .product-actions {
      display: flex;
      gap: 8px;
      padding: 0 20px 20px;
    }

    .btn-edit, .btn-delete {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-edit {
      background: #eff6ff;
      color: #02579b;
    }

    .btn-edit:hover {
      background: #dbeafe;
    }

    .btn-delete {
      background: #fef2f2;
      color: #dc2626;
    }

    .btn-delete:hover {
      background: #fee2e2;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    .empty-state svg {
      color: #d1d5db;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      color: #6b7280;
      margin: 0 0 24px 0;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }

    .btn-page {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
    }

    .btn-page:hover:not(:disabled) {
      background: #f3f4f6;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 8px;
    }

    .page-number {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
    }

    .page-number:hover {
      background: #f3f4f6;
    }

    .page-number.active {
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      color: white;
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: 1fr;
      }

      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        max-width: none;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  pagination: ProductPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  };
  searchTerm = '';
  isLoading = false;
  activeCount = 0;
  lowStockCount = 0;

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.isLoading = true;
    this.productService.getProducts(page, 10, this.searchTerm || undefined).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.products = response.data.products;
          this.pagination = response.data.pagination;
          this.activeCount = this.products.filter(p => p.isActive).length;
          this.lowStockCount = this.products.filter(p => (p.quantity || 0) < 10).length;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.show('Failed to load products', 'error');
        console.error(error);
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
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
        console.error(error);
      }
    });
  }
}

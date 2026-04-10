import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { User } from '../../../models/auth.model';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, <strong>{{ user?.username }}</strong></p>
        </div>
        <div class="current-date">{{ currentDate }}</div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ totalProducts }}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ activeProducts }}</h3>
            <p>Active Products</p>
          </div>
        </div>

        <div class="stat-card orange">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ lowStockProducts }}</h3>
            <p>Low Stock</p>
          </div>
        </div>

        <div class="stat-card purple">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-info">
            <h3>₹{{ totalValue | number }}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <a routerLink="/admin/products/add" class="action-btn primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Product
          </a>
          <a routerLink="/admin/products" class="action-btn secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            View Products
          </a>
        </div>
      </div>

      <!-- Recent Products -->
      <div class="recent-products">
        <div class="section-header">
          <h2>Recent Products</h2>
          <a routerLink="/admin/products" class="view-all">View All</a>
        </div>

        <div class="table-responsive" *ngIf="recentProducts.length > 0">
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of recentProducts">
                <td>
                  <div class="product-name">{{ product.name }}</div>
                </td>
                <td>
                  <span class="badge badge-light">{{ product.category }}</span>
                </td>
                <td>₹{{ product.price }}</td>
                <td>
                  <span [class.low-stock]="product.quantity < 10">
                    {{ product.quantity }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-success]="product.isActive" [class.badge-secondary]="!product.isActive">
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="recentProducts.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <p>No products found</p>
          <a routerLink="/admin/products/add" class="btn-add">Add your first product</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
    }

    .dashboard-header p {
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    .current-date {
      color: #6b7280;
      font-size: 14px;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 576px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border-left: 4px solid;
    }

    .stat-card.blue {
      border-left-color: #02579b;
    }

    .stat-card.blue .stat-icon {
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
    }

    .stat-card.green {
      border-left-color: #10b981;
    }

    .stat-card.green .stat-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-card.orange {
      border-left-color: #f59e0b;
    }

    .stat-card.orange .stat-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .stat-card.purple {
      border-left-color: #8b5cf6;
    }

    .stat-card.purple .stat-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    }

    .stat-info h3 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
    }

    .stat-info p {
      color: #6b7280;
      font-size: 14px;
      margin: 4px 0 0 0;
    }

    /* Quick Actions */
    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .quick-actions h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      color: white;
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(2, 87, 155, 0.3);
    }

    .action-btn.secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .action-btn.secondary:hover {
      background: #e5e7eb;
    }

    /* Recent Products */
    .recent-products {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }

    .view-all {
      color: #02579b;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .table {
      width: 100%;
      margin: 0;
    }

    .table th {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .table td {
      padding: 16px;
      vertical-align: middle;
      border-bottom: 1px solid #f3f4f6;
    }

    .product-name {
      font-weight: 500;
      color: #1a1a2e;
    }

    .low-stock {
      color: #dc2626;
      font-weight: 600;
    }

    .badge {
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 20px;
      display: inline-block;
    }

    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-secondary {
      background: #f3f4f6;
      color: #4b5563;
    }

    .badge-light {
      background: #f3f4f6;
      color: #374151;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #9ca3af;
    }

    .empty-state svg {
      margin-bottom: 16px;
    }

    .btn-add {
      display: inline-block;
      margin-top: 16px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(2, 87, 155, 0.3);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  user: User | null = null;
  products: Product[] = [];
  recentProducts: Product[] = [];
  totalProducts = 0;
  activeProducts = 0;
  lowStockProducts = 0;
  totalValue = 0;
  isLoading = false;
  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  constructor(
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.productService.getProducts(1, 100).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.products = response.data.products;
          this.recentProducts = this.products.slice(0, 5);
          this.totalProducts = response.data.pagination.totalItems;
          this.activeProducts = this.products.filter(p => p.isActive).length;
          this.lowStockProducts = this.products.filter(p => (p.quantity || 0) < 10).length;
          this.totalValue = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to load dashboard data:', error);
      }
    });
  }
}

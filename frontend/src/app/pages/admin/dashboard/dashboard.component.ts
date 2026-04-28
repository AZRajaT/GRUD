import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, DashboardStats } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Dashboard Overview</h1>
          <p class="text-text-secondary mt-1">Monitor your store's performance and orders.</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft border border-gray-100">
          <i class="bi bi-calendar3 text-brand-orange"></i>
          <span class="text-sm font-medium text-text-primary">{{ currentDate }}</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Orders -->
        <div class="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-premium transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <i class="bi bi-bag-check-fill text-2xl"></i>
            </div>
            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">Orders</span>
          </div>
          <h3 class="text-3xl font-bold text-text-primary">{{ stats?.totalOrders || 0 }}</h3>
          <p class="text-sm text-text-secondary mt-1">Total Lifetime Orders</p>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-premium transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
              <i class="bi bi-currency-rupee text-2xl"></i>
            </div>
            <span class="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded-md">Revenue</span>
          </div>
          <h3 class="text-3xl font-bold text-text-primary">₹{{ (stats?.totalRevenue || 0) | number }}</h3>
          <p class="text-sm text-text-secondary mt-1">Net Sales Volume</p>
        </div>

        <!-- Active Products -->
        <div class="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-premium transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
              <i class="bi bi-box-seam-fill text-2xl"></i>
            </div>
            <span class="text-[10px] font-bold text-brand-orange uppercase tracking-wider bg-orange-50 px-2 py-1 rounded-md">Products</span>
          </div>
          <h3 class="text-3xl font-bold text-text-primary">{{ stats?.activeProducts || 0 }}</h3>
          <p class="text-sm text-text-secondary mt-1">Available for Sale</p>
        </div>

        <!-- Low Stock -->
        <div class="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-premium transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <i class="bi bi-exclamation-triangle-fill text-2xl"></i>
            </div>
            <span class="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md">Alerts</span>
          </div>
          <h3 class="text-3xl font-bold text-text-primary" [class.text-red-600]="(stats?.lowStockCount || 0) > 0">
            {{ stats?.lowStockCount || 0 }}
          </h3>
          <p class="text-sm text-text-secondary mt-1">Items with Low Stock</p>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
            <h2 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <i class="bi bi-lightning-charge-fill text-brand-orange"></i>
              Quick Actions
            </h2>
            <div class="grid grid-cols-1 gap-3">
              <a routerLink="/admin/products/add" class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 group border border-transparent hover:border-primary-100">
                <i class="bi bi-plus-circle-fill text-lg text-primary-500"></i>
                <span class="font-semibold">Add New Product</span>
              </a>
              <a routerLink="/admin/orders" class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 group border border-transparent hover:border-primary-100">
                <i class="bi bi-truck text-lg text-primary-500"></i>
                <span class="font-semibold">Manage Deliveries</span>
              </a>
              <a routerLink="/admin/categories" class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 group border border-transparent hover:border-primary-100">
                <i class="bi bi-tag-fill text-lg text-primary-500"></i>
                <span class="font-semibold">Add Categories</span>
              </a>
            </div>
          </div>

          <div class="bg-gradient-to-br from-brand-orange to-brand-yellow p-6 rounded-2xl text-white shadow-glow">
            <h3 class="text-lg font-bold mb-2">Need Help?</h3>
            <p class="text-white/80 text-sm mb-4">Contact our support team for any technical issues with the dashboard.</p>
            <a href="mailto:support@arowmart.com" class="inline-block px-4 py-2 bg-white text-brand-orange rounded-lg font-bold text-sm">Contact Support</a>
          </div>
        </div>

        <!-- Recent Products/Orders -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
                <i class="bi bi-clock-history text-brand-orange"></i>
                Recent Inventory
              </h2>
              <a routerLink="/admin/products" class="text-sm font-bold text-brand-orange hover:underline uppercase tracking-wider">View All</a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-50/50">
                  <tr>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr *ngFor="let product of recentProducts" class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                          <img [src]="product.imageUrl || 'assets/images/placeholder.png'" class="w-full h-full object-cover" [alt]="product.name">
                        </div>
                        <span class="font-semibold text-text-primary">{{ product.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-tight">{{ product.category }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-bold text-text-primary">₹{{ product.price }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="(product.stock || 0) < 10 ? 'text-red-500 font-bold' : 'text-text-secondary'">
                        {{ product.stock || 0 }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span [class]="product.isActive ? 'text-success bg-success/10' : 'text-gray-400 bg-gray-100'" 
                            class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {{ product.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="recentProducts.length === 0" class="p-12 text-center">
              <i class="bi bi-inbox text-4xl text-gray-200 block mb-3"></i>
              <p class="text-text-secondary font-medium">No products found in your inventory.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentProducts: Product[] = [];
  isLoading = false;
  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  constructor(
    private adminService: AdminService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load Stats
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => console.error('Stats load error:', error)
    });

    // Load Recent Products
    this.productService.getProducts(1, 5).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.recentProducts = response.data.products;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Products load error:', error);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Order Management</h1>
          <p class="text-text-secondary mt-1">Manage and track customer orders.</p>
        </div>
        <div class="flex items-center gap-2">
          <select [(ngModel)]="statusFilter" (change)="loadOrders()" 
                  class="px-4 py-2 bg-white rounded-xl shadow-soft border border-gray-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button (click)="loadOrders()" class="p-2 bg-white rounded-xl shadow-soft border border-gray-100 text-primary-600 hover:bg-primary-50 transition-colors">
            <i class="bi bi-arrow-clockwise text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (order of orders; track order._id) {
                <tr class="hover:bg-gray-50/50 transition-colors group">
                  <td class="px-6 py-4">
                    <span class="font-mono text-xs text-primary-600 font-bold uppercase tracking-tight">
                      #{{ order._id.slice(-6) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-text-primary">{{ order.customerName }}</span>
                      <span class="text-xs text-text-secondary">{{ order.phone }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="font-bold text-text-primary text-lg">₹{{ order.totalAmount }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-text-secondary">
                    {{ order.createdAt | date:'MMM d, h:mm a' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-3">
                      <button (click)="viewDetails(order)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Details">
                        <i class="bi bi-eye-fill"></i>
                      </button>
                      <select [ngModel]="order.status" (ngModelChange)="updateStatus(order._id, $event)"
                              class="text-[10px] font-bold uppercase px-2 py-1 rounded-lg border-gray-200 focus:ring-primary-500 focus:border-primary-500 cursor-pointer bg-gray-50">
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (orders.length === 0 && !isLoading) {
          <div class="p-20 text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <i class="bi bi-inbox text-3xl"></i>
            </div>
            <h3 class="text-lg font-bold text-text-primary">No orders found</h3>
            <p class="text-text-secondary">When customers place orders, they will appear here.</p>
          </div>
        }

        @if (isLoading) {
          <div class="p-20 text-center">
            <div class="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-text-secondary font-medium">Loading orders...</p>
          </div>
        }
      </div>

      <!-- Order Details Modal -->
      @if (selectedOrder) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="selectedOrder = null"></div>
          
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10 animate-scale-in">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-primary-50/30">
              <div>
                <h3 class="text-lg font-bold text-text-primary">Order Details</h3>
                <span class="text-xs font-mono text-primary-600 font-bold uppercase">#{{ selectedOrder._id }}</span>
              </div>
              <button (click)="selectedOrder = null" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <i class="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <!-- Modal Content -->
            <div class="flex-1 overflow-y-auto p-6 space-y-8">
              <!-- Customer & Status -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Customer Information</h4>
                  <div class="space-y-2">
                    <p class="flex items-center gap-3 text-text-primary">
                      <i class="bi bi-person text-gray-400"></i>
                      <span class="font-semibold">{{ selectedOrder.customerName }}</span>
                    </p>
                    <p class="flex items-center gap-3 text-text-primary">
                      <i class="bi bi-telephone text-gray-400"></i>
                      <span>{{ selectedOrder.phone }}</span>
                    </p>
                  </div>
                </div>
                <div class="space-y-4">
                  <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Order Status</h4>
                  <div>
                    <span [class]="getStatusClass(selectedOrder.status)" class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest inline-block">
                      {{ selectedOrder.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Address Section -->
              <div class="space-y-4">
                <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Delivery Address</h4>
                <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p class="text-text-primary leading-relaxed">
                    {{ selectedOrder.flatNumber }}, {{ selectedOrder.apartmentName }}<br>
                    {{ selectedOrder.address }}
                  </p>
                  @if (selectedOrder.deliveryLocation?.lat) {
                    <a [href]="'https://www.google.com/maps?q=' + selectedOrder.deliveryLocation.lat + ',' + selectedOrder.deliveryLocation.lng" 
                       target="_blank"
                       class="mt-3 inline-flex items-center gap-2 text-primary-600 font-bold text-xs hover:underline">
                      <i class="bi bi-geo-alt-fill"></i>
                      View on Google Maps
                    </a>
                  }
                </div>
              </div>

              <!-- Items Section -->
              <div class="space-y-4">
                <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Order Items</h4>
                <div class="space-y-3">
                  @for (item of selectedOrder.items; track item._id) {
                    <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-50 shadow-sm">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                           @if (item.product?.imageUrl) {
                             <img [src]="item.product.imageUrl" class="w-full h-full object-contain" [alt]="item.name">
                           } @else {
                             <i class="bi bi-box text-gray-300"></i>
                           }
                        </div>
                        <div>
                          <p class="font-bold text-text-primary text-sm">{{ item.name }}</p>
                          <p class="text-xs text-text-secondary">₹{{ item.price }} × {{ item.quantity }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="font-bold text-text-primary">₹{{ item.price * item.quantity }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span class="text-text-secondary font-medium">Total Amount</span>
              <span class="text-2xl font-black text-primary-600">₹{{ selectedOrder.totalAmount }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-scale-in {
      animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;
  statusFilter = '';
  selectedOrder: any = null;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.adminService.getOrders(1, 100, this.statusFilter).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.orders = response.data.orders;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Orders load error:', error);
        this.toastService.show('Failed to load orders', 'error');
      }
    });
  }

  viewDetails(order: any): void {
    this.selectedOrder = order;
  }

  updateStatus(orderId: string, status: string): void {
    this.adminService.updateOrderStatus(orderId, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.show(`Order status updated to ${status}`, 'success');
          // Update status in local list
          const order = this.orders.find(o => o._id === orderId);
          if (order) order.status = status;
          if (this.selectedOrder && this.selectedOrder._id === orderId) {
            this.selectedOrder.status = status;
          }
        }
      },
      error: (error) => {
        console.error('Update status error:', error);
        this.toastService.show('Failed to update order status', 'error');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  }
}

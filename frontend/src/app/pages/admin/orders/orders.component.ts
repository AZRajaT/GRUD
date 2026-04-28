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
        </div>
      </div>

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
                  <td class="px-6 py-4 font-mono text-xs text-primary-600 font-bold uppercase tracking-tight">
                    #{{ order._id.slice(-6) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-semibold text-text-primary">{{ order.customerName }}</span>
                      <span class="text-xs text-text-secondary">{{ order.phone }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-bold text-text-primary">
                    ₹{{ order.totalAmount }}
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-text-secondary">
                    {{ order.createdAt | date:'short' }}
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <div class="flex items-center justify-end gap-2">
                      <select [ngModel]="order.status" (ngModelChange)="updateStatus(order._id, $event)"
                              class="text-[10px] font-bold uppercase px-2 py-1 rounded border-gray-200 focus:ring-0 focus:border-primary-500 cursor-pointer">
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
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;
  statusFilter = '';

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
      }
    });
  }

  updateStatus(orderId: string, status: string): void {
    this.adminService.updateOrderStatus(orderId, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.show(`Order status updated to ${status}`, 'success');
          this.loadOrders();
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
      case 'Pending': return 'bg-yellow-50 text-yellow-600';
      case 'Processing': return 'bg-blue-50 text-blue-600';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-600';
      case 'Delivered': return 'bg-green-50 text-green-600';
      case 'Cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  }
}

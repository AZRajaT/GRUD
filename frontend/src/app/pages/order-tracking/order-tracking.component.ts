import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  phone = '';
  orderId = '';
  trackingId = '';
  orders: any[] = [];
  selectedOrder: any = null;
  isLoading = false;
  error = '';
  successMessage = '';
  searchMode: 'phone' | 'orderId' | 'trackingId' = 'phone';

  // Status flow for the timeline (normal successful flow)
  orderStatuses = [
    { name: 'Pending', icon: 'bi-hourglass-start' },
    { name: 'Confirmed', icon: 'bi-check-circle' },
    { name: 'Processing', icon: 'bi-arrow-repeat' },
    { name: 'Packed', icon: 'bi-box' },
    { name: 'Shipped', icon: 'bi-send' },
    { name: 'Out for Delivery', icon: 'bi-truck' },
    { name: 'Delivered', icon: 'bi-check2-circle' }
  ];

  get displayStatuses() {
    if (!this.selectedOrder) return this.orderStatuses;
    if (this.selectedOrder.currentStatus === 'Cancelled') {
      const historyStatuses = this.selectedOrder.trackingHistory?.map((h: any) => h.status) || [];
      const reachedStatuses = this.orderStatuses.filter(s => historyStatuses.includes(s.name));
      return [...reachedStatuses, { name: 'Cancelled', icon: 'bi-x-circle' }];
    }
    return this.orderStatuses;
  }

  cancelModalOpen = false;
  cancelReason = '';
  cancellingOrderId = '';

  private refreshInterval: any = null;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['phone']) {
        this.phone = params['phone'];
        this.searchMode = 'phone';
        this.searchOrders();
      } else if (params['orderId']) {
        this.orderId = params['orderId'];
        this.searchMode = 'orderId';
        this.searchOrders();
      } else if (params['trackingId']) {
        this.trackingId = params['trackingId'];
        this.searchMode = 'trackingId';
        this.searchOrders();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearRefresh();
  }

  searchOrders(): void {
    this.error = '';
    this.successMessage = '';

    if (this.searchMode === 'phone') {
      if (!this.phone || !/^\d{10}$/.test(this.phone)) {
        this.error = 'Please enter a valid 10-digit mobile number';
        return;
      }
      this.isLoading = true;
      this.orderService.trackByPhone(this.phone, this.orderId).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.orders = response.data.orders;
            if (this.orders.length > 0) {
              this.selectedOrder = this.orders[0];
              this.setupAutoRefresh();
            } else {
              this.error = 'No orders found for this mobile number';
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Unable to fetch orders';
        }
      });
    } else if (this.searchMode === 'orderId') {
      this.isLoading = true;
      this.orderService.getTrackingByOrderId(this.orderId).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.orders = [response.data.order];
            this.selectedOrder = this.orders[0];
            this.setupAutoRefresh();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Order not found';
        }
      });
    } else if (this.searchMode === 'trackingId') {
      this.isLoading = true;
      this.orderService.getTrackingByTrackingId(this.trackingId).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.orders = [response.data.order];
            this.selectedOrder = this.orders[0];
            this.setupAutoRefresh();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Order not found';
        }
      });
    }
  }

  setupAutoRefresh(): void {
    this.clearRefresh();
    this.refreshInterval = setInterval(() => this.refreshOrder(), 30000);
  }

  refreshOrder(): void {
    if (!this.selectedOrder) return;
    this.orderService.getTrackingByOrderId(this.selectedOrder._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedOrder = response.data.order;
          const orderIndex = this.orders.findIndex(o => o._id === response.data.order._id);
          if (orderIndex >= 0) {
            this.orders[orderIndex] = response.data.order;
          }
        }
      },
      error: () => {}
    });
  }

  clearRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  selectOrder(order: any): void {
    this.selectedOrder = order;
  }

  getStatusIndex(status: string): number {
    return this.displayStatuses.findIndex(s => s.name === status);
  }

  isStatusCompleted(statusName: string): boolean {
    if (!this.selectedOrder) return false;
    
    // For cancelled orders, all displayed statuses are considered 'completed' in terms of timeline progression,
    // but the 'Cancelled' status itself will be styled differently in HTML.
    if (this.selectedOrder.currentStatus === 'Cancelled') {
      return true;
    }

    const currentIndex = this.getStatusIndex(this.selectedOrder.currentStatus);
    const statusIndex = this.getStatusIndex(statusName);
    
    if (currentIndex === -1 || statusIndex === -1) return false;
    return statusIndex <= currentIndex;
  }

  isStatusActive(statusName: string): boolean {
    return this.selectedOrder && this.selectedOrder.currentStatus === statusName;
  }

  isNextStatusCancelled(index: number): boolean {
    const nextStatus = this.displayStatuses[index + 1];
    return nextStatus ? nextStatus.name === 'Cancelled' : false;
  }

  getStatusTimestamp(statusName: string): Date | null {
    if (!this.selectedOrder) return null;
    const history = this.selectedOrder.trackingHistory?.find((h: any) => h.status === statusName);
    return history ? new Date(history.timestamp) : null;
  }

  openCancelModal(orderId: string): void {
    this.cancellingOrderId = orderId;
    this.cancelReason = '';
    this.cancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.cancelModalOpen = false;
    this.cancellingOrderId = '';
    this.cancelReason = '';
  }

  submitCancelOrder(): void {
    if (!this.cancelReason.trim()) {
      this.toastService.show('Please provide a cancellation reason', 'error');
      return;
    }

    this.orderService.cancelOrder(this.cancellingOrderId, this.cancelReason).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.show('Order cancelled successfully', 'success');
          this.closeCancelModal();
          this.refreshOrder();
        }
      },
      error: (error) => {
        this.toastService.show(error.error?.message || 'Failed to cancel order', 'error');
      }
    });
  }

  canCancelOrder(order: any): boolean {
    const cancellableStatuses = ['Pending', 'Confirmed', 'Processing'];
    return cancellableStatuses.includes(order.currentStatus);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface OrderRequest {
  customerName: string;
  phone: string;
  address: string;
  apartmentName?: string;
  flatNumber?: string;
  items: OrderItem[];
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  placeOrder(orderData: OrderRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }

  // Validate cart items against database
  validateCart(items: OrderItem[]): Observable<{ success: boolean; data: { validItems: any[]; removedItemIds: string[] } }> {
    return this.http.post<{ success: boolean; data: { validItems: any[]; removedItemIds: string[] } }>(`${this.apiUrl}/validate-cart`, { items });
  }

  // Track order by phone number
  trackByPhone(phone: string, orderId?: string): Observable<any> {
    let params = new HttpParams().set('phone', phone);
    if (orderId) {
      params = params.set('orderId', orderId);
    }
    return this.http.get<any>(`${this.apiUrl}/track/phone`, { params });
  }

  // Get tracking details by order ID
  getTrackingByOrderId(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/track/order/${orderId}`);
  }

  // Get tracking details by tracking ID
  getTrackingByTrackingId(trackingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/track/${trackingId}`);
  }

  // Cancel order
  cancelOrder(orderId: string, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/cancel`, { reason });
  }

  // Upload delivery proof
  uploadDeliveryProof(orderId: string, imageUrl: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/proof`, { imageUrl });
  }
}


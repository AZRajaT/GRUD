import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}

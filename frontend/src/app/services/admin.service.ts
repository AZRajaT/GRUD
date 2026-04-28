import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  lowStockCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/admin/stats`);
  }

  getOrders(page: number = 1, limit: number = 10, status?: string): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.apiUrl}/orders`, { params });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }
}

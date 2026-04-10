import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GroceryKit, KitsResponse, KitResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GroceryKitService {
  private apiUrl = `${environment.apiUrl}/kits`;

  constructor(private http: HttpClient) {}

  getAllKits(page: number = 1, limit: number = 10, search?: string, popular?: boolean): Observable<KitsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (popular) {
      params = params.set('popular', 'true');
    }

    return this.http.get<KitsResponse>(this.apiUrl, { params });
  }

  getKitById(id: string): Observable<KitResponse> {
    return this.http.get<KitResponse>(`${this.apiUrl}/${id}`);
  }

  getPopularKits(): Observable<{ success: boolean; data: { kits: GroceryKit[] } }> {
    return this.http.get<{ success: boolean; data: { kits: GroceryKit[] } }>(`${this.apiUrl}/popular`);
  }

  createKit(kit: Partial<GroceryKit>): Observable<KitResponse> {
    return this.http.post<KitResponse>(this.apiUrl, kit);
  }

  updateKit(id: string, kit: Partial<GroceryKit>): Observable<KitResponse> {
    return this.http.put<KitResponse>(`${this.apiUrl}/${id}`, kit);
  }

  deleteKit(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}

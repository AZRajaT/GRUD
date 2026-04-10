import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroceryKitService } from '../../../services/grocery-kit.service';
import { ToastService } from '../../../services/toast.service';
import { GroceryKit } from '../../../models';

@Component({
  selector: 'app-kit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="kits-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Grocery Kits</h1>
          <p>Manage your grocery kit combos</p>
        </div>
        <a routerLink="/admin/kits/add" class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Kit
        </a>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading kits...</p>
      </div>

      <!-- Kits Grid -->
      <div class="kits-grid" *ngIf="!isLoading && kits.length > 0">
        <div class="kit-card" *ngFor="let kit of kits">
          <div class="kit-image">
            <img *ngIf="kit.imageUrl" [src]="kit.imageUrl" [alt]="kit.name">
            <div *ngIf="!kit.imageUrl" class="placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <span class="popular-badge" *ngIf="kit.popular">Popular</span>
            <span class="status-badge" [class.active]="kit.isActive" [class.inactive]="!kit.isActive">
              {{ kit.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="kit-info">
            <h3>{{ kit.name }}</h3>
            <p class="description">{{ kit.description || 'No description' }}</p>
            <p class="items-count">{{ kit.items.length || 0 }} items</p>
            <div class="kit-meta">
              <span class="price">₹{{ kit.price }}</span>
              <span class="original-price" *ngIf="kit.originalPrice">₹{{ kit.originalPrice }}</span>
            </div>
          </div>
          <div class="kit-actions">
            <a [routerLink]="['/admin/kits/edit', kit._id]" class="btn-edit" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </a>
            <button (click)="deleteKit(kit)" class="btn-delete" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && kits.length === 0">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
        <h3>No Grocery Kits Yet</h3>
        <p>Create your first grocery kit to get started</p>
        <a routerLink="/admin/kits/add" class="btn-primary">Add First Kit</a>
      </div>
    </div>
  `,
  styles: [`
    .kits-container {
      max-width: 1400px;
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
      color: #1f2937;
      margin: 0 0 4px 0;
    }

    .page-header p {
      color: #6b7280;
      margin: 0;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #02579b 0%, #013a5c 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(2, 87, 155, 0.3);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      color: #6b7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #02579b;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .kits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .kit-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb;
    }

    .kit-image {
      position: relative;
      height: 180px;
      background: #f9fafb;
    }

    .kit-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .kit-image .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
    }

    .popular-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, #ff6a00 0%, #ff8a3d 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.active {
      background: #10b981;
      color: white;
    }

    .status-badge.inactive {
      background: #ef4444;
      color: white;
    }

    .kit-info {
      padding: 16px;
    }

    .kit-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .kit-info .description {
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .kit-info .items-count {
      color: #02579b;
      font-size: 13px;
      font-weight: 500;
      margin: 0 0 12px 0;
    }

    .kit-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .kit-meta .price {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }

    .kit-meta .original-price {
      font-size: 14px;
      color: #9ca3af;
      text-decoration: line-through;
    }

    .kit-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-edit, .btn-delete {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-edit {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-edit:hover {
      background: #e5e7eb;
    }

    .btn-delete {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-delete:hover {
      background: #fecaca;
    }

    .empty-state {
      text-align: center;
      padding: 60px 0;
      color: #6b7280;
    }

    .empty-state svg {
      color: #d1d5db;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 20px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      margin: 0 0 24px 0;
    }
  `]
})
export class KitListComponent implements OnInit {
  kits: GroceryKit[] = [];
  isLoading = true;

  constructor(
    private groceryKitService: GroceryKitService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadKits();
  }

  loadKits(): void {
    this.isLoading = true;
    this.groceryKitService.getAllKits(1, 50).subscribe({
      next: (response) => {
        this.kits = response.data.kits;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading kits:', err);
        this.toastService.show('Failed to load kits');
        this.isLoading = false;
      }
    });
  }

  deleteKit(kit: GroceryKit): void {
    if (confirm(`Are you sure you want to delete "${kit.name}"?`)) {
      this.groceryKitService.deleteKit(kit._id!).subscribe({
        next: () => {
          this.toastService.show('Kit deleted successfully');
          this.loadKits();
        },
        error: (err) => {
          console.error('Error deleting kit:', err);
          this.toastService.show('Failed to delete kit');
        }
      });
    }
  }
}

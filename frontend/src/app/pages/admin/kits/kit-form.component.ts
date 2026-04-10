import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroceryKitService } from '../../../services/grocery-kit.service';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { GroceryKit, Product } from '../../../models';

interface KitFormItem {
  product: string | undefined;
  quantity: number;
}

@Component({
  selector: 'app-kit-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="kit-form-container">
      <!-- Header -->
      <div class="page-header">
        <a routerLink="/admin/kits" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          Back to Kits
        </a>
        <h1>{{ isEditMode ? 'Edit Kit' : 'Create New Kit' }}</h1>
        <p>{{ isEditMode ? 'Update your grocery kit details' : 'Create a new combo of products' }}</p>
      </div>

      <!-- Form -->
      <form (ngSubmit)="onSubmit()" class="kit-form">
        <div class="form-section">
          <h3>Kit Details</h3>
          
          <div class="form-group">
            <label>Kit Name *</label>
            <input
              type="text"
              [(ngModel)]="kit.name"
              name="name"
              required
              placeholder="e.g., ₹999 Starter Kit"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                [(ngModel)]="kit.price"
                name="price"
                required
                min="0"
                placeholder="e.g., 999"
              />
            </div>

            <div class="form-group">
              <label>Original Price (₹) <small>For discount display</small></label>
              <input
                type="number"
                [(ngModel)]="kit.originalPrice"
                name="originalPrice"
                min="0"
                placeholder="e.g., 1200"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              [(ngModel)]="kit.description"
              name="description"
              rows="3"
              placeholder="Describe what's included in this kit..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Image URL</label>
            <input
              type="text"
              [(ngModel)]="kit.imageUrl"
              name="imageUrl"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="kit.popular" name="popular" />
                <span>Mark as Popular</span>
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="kit.isActive" name="isActive" />
                <span>Active (visible to customers)</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h3>Kit Items</h3>
            <button type="button" (click)="addItem()" class="btn-add-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Product
            </button>
          </div>

          <div class="kit-items" *ngIf="kitItems.length > 0">
            <div class="kit-item" *ngFor="let item of kitItems; let i = index">
              <div class="item-select">
                <select [(ngModel)]="item.product" name="product{{i}}" required>
                  <option value="">Select Product</option>
                  <option *ngFor="let product of products" [ngValue]="product._id">
                    {{ product.name }} - ₹{{ product.price }}
                  </option>
                </select>
              </div>
              <div class="item-quantity">
                <input
                  type="number"
                  [(ngModel)]="item.quantity"
                  name="quantity{{i}}"
                  min="1"
                  placeholder="Qty"
                />
              </div>
              <button type="button" (click)="removeItem(i)" class="btn-remove-item" title="Remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="no-items" *ngIf="kitItems.length === 0">
            <p>No items added yet. Click "Add Product" to include products in this kit.</p>
          </div>

          <div class="kit-summary" *ngIf="kitItems.length > 0">
            <div class="summary-row">
              <span>Total Items:</span>
              <strong>{{ kitItems.length }}</strong>
            </div>
            <div class="summary-row">
              <span>Calculated Value:</span>
              <strong>₹{{ calculateTotalValue() }}</strong>
            </div>
            <div class="summary-row" *ngIf="kit.price && kit.price > 0 && calculateTotalValue() > kit.price">
              <span>Savings:</span>
              <strong class="savings">₹{{ calculateTotalValue() - (kit.price || 0) }} ({{ ((calculateTotalValue() - (kit.price || 0)) / calculateTotalValue() * 100).toFixed(0) }}% off)</strong>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" routerLink="/admin/kits" class="btn-cancel">Cancel</button>
          <button type="submit" [disabled]="isSubmitting" class="btn-save">
            <span *ngIf="isSubmitting">Saving...</span>
            <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update Kit' : 'Create Kit' }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .kit-form-container {
      max-width: 800px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 16px;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #02579b;
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

    .kit-form {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-header h3 {
      margin: 0;
      padding: 0;
      border: none;
    }

    .btn-add-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-add-item:hover {
      background: #059669;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    .form-group label small {
      color: #9ca3af;
      font-weight: 400;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #02579b;
      box-shadow: 0 0 0 3px rgba(2, 87, 155, 0.1);
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
    }

    .kit-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .kit-item {
      display: grid;
      grid-template-columns: 1fr 80px 36px;
      gap: 12px;
      align-items: center;
    }

    .item-select select {
      width: 100%;
    }

    .item-quantity input {
      width: 100%;
      text-align: center;
    }

    .btn-remove-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-remove-item:hover {
      background: #fecaca;
    }

    .no-items {
      text-align: center;
      padding: 24px;
      background: #f9fafb;
      border-radius: 8px;
      color: #6b7280;
    }

    .kit-summary {
      margin-top: 16px;
      padding: 16px;
      background: #f0f9ff;
      border-radius: 8px;
      border: 1px solid #bae6fd;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    .summary-row strong.savings {
      color: #10b981;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-cancel {
      padding: 12px 24px;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-save {
      padding: 12px 32px;
      background: linear-gradient(135deg, #02579b 0%, #013a5c 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(2, 87, 155, 0.3);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .kit-item {
        grid-template-columns: 1fr 60px 36px;
      }
    }
  `]
})
export class KitFormComponent implements OnInit {
  kit: Partial<GroceryKit> = {
    name: '',
    price: 0,
    originalPrice: 0,
    description: '',
    imageUrl: '',
    isActive: true,
    popular: false,
    items: []
  };
  kitItems: KitFormItem[] = [];
  products: Product[] = [];
  isEditMode = false;
  isSubmitting = false;
  kitId: string | null = null;

  constructor(
    private groceryKitService: GroceryKitService,
    private productService: ProductService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.kitId = this.route.snapshot.paramMap.get('id');
    if (this.kitId) {
      this.isEditMode = true;
      this.loadKit();
    }
  }

  loadProducts(): void {
    this.productService.getProducts(1, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data.products.filter(p => p.isActive !== false);
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }

  loadKit(): void {
    this.groceryKitService.getKitById(this.kitId!).subscribe({
      next: (response) => {
        if (response.success) {
          const kit = response.data.kit;
          this.kit = {
            name: kit.name,
            price: kit.price,
            originalPrice: kit.originalPrice,
            description: kit.description,
            imageUrl: kit.imageUrl,
            isActive: kit.isActive,
            popular: kit.popular
          };
          this.kitItems = kit.items.map(item => ({
            product: typeof item.product === 'string' ? item.product : item.product._id,
            quantity: item.quantity
          }));
        }
      },
      error: (err) => {
        console.error('Error loading kit:', err);
        this.toastService.show('Failed to load kit details');
      }
    });
  }

  addItem(): void {
    this.kitItems.push({ product: '', quantity: 1 });
  }

  removeItem(index: number): void {
    this.kitItems.splice(index, 1);
  }

  calculateTotalValue(): number {
    return this.kitItems.reduce((sum, item) => {
      const product = this.products.find(p => p._id === item.product);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  onSubmit(): void {
    if (!this.kit.name || !this.kit.price || this.kitItems.length === 0) {
      this.toastService.show('Please fill in all required fields and add at least one item');
      return;
    }

    this.isSubmitting = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kitData: any = {
      ...this.kit,
      items: this.kitItems.filter(item => item.product).map(item => ({
        product: item.product,
        quantity: item.quantity
      }))
    };

    if (this.isEditMode) {
      this.groceryKitService.updateKit(this.kitId!, kitData).subscribe({
        next: () => {
          this.toastService.show('Kit updated successfully');
          this.router.navigate(['/admin/kits']);
        },
        error: (err) => {
          console.error('Error updating kit:', err);
          this.toastService.show('Failed to update kit');
          this.isSubmitting = false;
        }
      });
    } else {
      this.groceryKitService.createKit(kitData).subscribe({
        next: () => {
          this.toastService.show('Kit created successfully');
          this.router.navigate(['/admin/kits']);
        },
        error: (err) => {
          console.error('Error creating kit:', err);
          this.toastService.show('Failed to create kit');
          this.isSubmitting = false;
        }
      });
    }
  }
}

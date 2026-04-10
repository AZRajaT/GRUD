import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <a routerLink="/admin/products" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </a>
          <div>
            <h1>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h1>
            <p>{{ isEditMode ? 'Update product details' : 'Create a new product for your inventory' }}</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <form (ngSubmit)="onSubmit()">
          <!-- Image Preview -->
          <div class="image-section">
            <div class="image-preview" *ngIf="product.imageUrl; else placeholder">
              <img [src]="product.imageUrl" alt="Product preview">
            </div>
            <ng-template #placeholder>
              <div class="image-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>No image</span>
              </div>
            </ng-template>
          </div>

          <!-- Form Grid -->
          <div class="form-grid">
            <!-- Product Name -->
            <div class="form-group full-width">
              <label for="name">
                Product Name
                <span class="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="product.name"
                required
                maxlength="100"
                placeholder="Enter product name"
              />
            </div>

            <!-- Category -->
            <div class="form-group">
              <label for="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                [(ngModel)]="product.category"
                placeholder="e.g., Rice, Pulses, Spices"
              />
            </div>

            <!-- Image URL -->
            <div class="form-group">
              <label for="imageUrl">Image URL</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                [(ngModel)]="product.imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <!-- Price -->
            <div class="form-group">
              <label for="price">
                Price (₹)
                <span class="required">*</span>
              </label>
              <div class="input-with-icon">
                <span class="icon">₹</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  [(ngModel)]="product.price"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <!-- Quantity -->
            <div class="form-group">
              <label for="quantity">Quantity in Stock</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                [(ngModel)]="product.quantity"
                min="0"
                placeholder="0"
              />
            </div>

            <!-- Description -->
            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="product.description"
                rows="3"
                maxlength="500"
                placeholder="Enter product description..."
              ></textarea>
              <span class="char-count">{{ product.description?.length || 0 }}/500</span>
            </div>

            <!-- Active Status -->
            <div class="form-group full-width">
              <label class="toggle-label">
                <div class="toggle-switch">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    [(ngModel)]="product.isActive"
                  />
                  <span class="slider"></span>
                </div>
                <div class="toggle-text">
                  <span class="toggle-title">Product is Active</span>
                  <span class="toggle-desc">{{ product.isActive ? 'Product will be visible to customers' : 'Product will be hidden from customers' }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <a routerLink="/admin/products" class="btn-secondary">
              Cancel
            </a>
            <button
              type="submit"
              [disabled]="isLoading || !product.name || product.price === undefined"
              class="btn-primary"
            >
              <svg *ngIf="isLoading" class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
              </svg>
              <span>{{ isLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .product-form-container {
      max-width: 800px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-back {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: white;
      border-radius: 12px;
      color: #374151;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
    }

    .btn-back:hover {
      background: #f3f4f6;
      transform: translateX(-2px);
    }

    .page-header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
    }

    .page-header p {
      color: #6b7280;
      margin: 4px 0 0 0;
      font-size: 14px;
    }

    /* Form Card */
    .form-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    /* Image Section */
    .image-section {
      margin-bottom: 24px;
    }

    .image-preview {
      width: 100%;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }

    .image-placeholder {
      width: 100%;
      height: 200px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #9ca3af;
    }

    .image-placeholder span {
      font-size: 14px;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .required {
      color: #dc2626;
      margin-left: 4px;
    }

    input, textarea {
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.2s ease;
      background: white;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #02579b;
      box-shadow: 0 0 0 3px rgba(2, 87, 155, 0.1);
    }

    input::placeholder, textarea::placeholder {
      color: #9ca3af;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .input-with-icon {
      position: relative;
    }

    .input-with-icon .icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      font-weight: 600;
    }

    .input-with-icon input {
      padding-left: 36px;
    }

    .char-count {
      font-size: 12px;
      color: #9ca3af;
      text-align: right;
    }

    /* Toggle Switch */
    .toggle-label {
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
    }

    .toggle-switch {
      position: relative;
      width: 52px;
      height: 28px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e5e7eb;
      transition: .3s;
      border-radius: 28px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    input:checked + .slider {
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    .toggle-text {
      display: flex;
      flex-direction: column;
    }

    .toggle-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .toggle-desc {
      font-size: 13px;
      color: #6b7280;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: #f3f4f6;
      color: #374151;
      text-decoration: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 32px;
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(2, 87, 155, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .form-card {
        padding: 20px;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-secondary, .btn-primary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit {
  product: Product = {
    name: '',
    price: 0,
    quantity: 0,
    description: '',
    category: '',
    imageUrl: '',
    isActive: true
  };
  isEditMode = false;
  isLoading = false;

  constructor(
    private productService: ProductService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEditMode = true;
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.product = response.data.product;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.show('Failed to load product', 'error');
        console.error(error);
        this.router.navigate(['/admin/products']);
      }
    });
  }

  onSubmit(): void {
    if (!this.product.name || this.product.price === undefined) {
      this.toastService.show('Please fill in required fields', 'error');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.product._id) {
      this.productService.updateProduct(this.product._id, this.product).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastService.show('Product updated successfully', 'success');
            this.router.navigate(['/admin/products']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.show('Failed to update product', 'error');
          console.error(error);
        }
      });
    } else {
      this.productService.createProduct(this.product).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastService.show('Product created successfully', 'success');
            this.router.navigate(['/admin/products']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.show('Failed to create product', 'error');
          console.error(error);
        }
      });
    }
  }
}

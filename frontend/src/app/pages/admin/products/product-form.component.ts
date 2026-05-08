import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { Product } from '../../../models/product.model';
import { AssetPipe } from '../../../pipes/asset.pipe';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AssetPipe],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/admin/products" class="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-soft border border-gray-100 text-gray-500 hover:text-primary-600 hover:-translate-x-1 transition-all duration-200">
          <i class="bi bi-arrow-left text-xl"></i>
        </a>
        <div>
          <h1 class="text-2xl font-black text-text-primary">{{ isEditMode ? 'Edit Product' : 'Add New Item' }}</h1>
          <p class="text-text-secondary text-sm font-medium">{{ isEditMode ? 'Modify existing product details' : 'List a new product in your grocery catalog' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Image Preview Card -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 sticky top-24">
            <h3 class="font-bold text-text-primary mb-4">Product Image</h3>
            <div class="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
              @if (product.imageUrl) {
                <img [src]="product.imageUrl | asset" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300">
              } @else {
                <i class="bi bi-image text-4xl text-gray-300 mb-2"></i>
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">No Preview Available</span>
              }
            </div>
            <div class="mt-6 space-y-4">
              <div>
                <label class="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Image URL</label>
                <input type="text" name="imageUrl" [(ngModel)]="product.imageUrl" placeholder="https://... or /assets/images/file.png or assets/images/file.png" 
                       class="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm">
                <p class="text-[11px] text-gray-400 mt-1">Use a full URL or a root-relative/asset path like /assets/images/file.png or assets/images/file.png.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Details -->
        <div class="lg:col-span-2">
          <form (ngSubmit)="onSubmit()" class="bg-white p-8 rounded-3xl shadow-soft border border-gray-100 space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Name -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Product Name *</label>
                <input type="text" [(ngModel)]="product.name" name="name" required
                       placeholder="e.g., Organic Basmati Rice" 
                       class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 font-semibold">
              </div>

              <!-- Category -->
              <div>
                <label class="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Category *</label>
                <input type="text" [(ngModel)]="product.category" name="category" required
                       placeholder="e.g., Grains" 
                       class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 font-semibold text-sm">
              </div>

              <!-- Price -->
              <div>
                <label class="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Price (₹) *</label>
                <div class="relative">
                  <span class="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-text-primary">₹</span>
                  <input type="number" [(ngModel)]="product.price" name="price" required
                         placeholder="0.00" 
                         class="w-full pl-10 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 font-black">
                </div>
              </div>

              <!-- Stock -->
              <div>
                <label class="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Inventory Stock *</label>
                <input type="number" [(ngModel)]="product.stock" name="stock" required
                       placeholder="0" 
                       class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 font-black">
              </div>

              <!-- Active Toggle -->
              <div class="flex items-center gap-4 px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent">
                <div class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200"
                     [class.bg-success]="product.isActive" [class.bg-gray-300]="!product.isActive"
                     (click)="product.isActive = !product.isActive">
                  <span [class.translate-x-6]="product.isActive" [class.translate-x-1]="!product.isActive"
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"></span>
                </div>
                <div>
                  <span class="block text-sm font-bold text-text-primary">Active Status</span>
                  <span class="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Visible to users</span>
                </div>
              </div>

              <!-- Description -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Description</label>
                <textarea [(ngModel)]="product.description" name="description" rows="4"
                          placeholder="Describe the product details, benefits, etc..." 
                          class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 font-medium text-sm"></textarea>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-4 pt-6 border-t border-gray-50">
              <button type="button" routerLink="/admin/products" 
                      class="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="isLoading"
                      class="flex-[2] py-4 bg-brand-orange text-white rounded-2xl font-bold shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
                @if (isLoading) {
                  <i class="bi bi-arrow-repeat animate-spin mr-2"></i>
                  Saving...
                } @else {
                  {{ isEditMode ? 'Update Product' : 'Create Product' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  product: Product = {
    name: '',
    price: 0,
    quantity: 0,
    stock: 0,
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
        }
      });
    }
  }
}

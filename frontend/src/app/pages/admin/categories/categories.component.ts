import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-text-primary">Categories</h1>
          <p class="text-text-secondary text-sm font-medium">Manage product categories and taxonomies.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Add Category Form -->
        <div class="md:col-span-1">
          <div class="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 sticky top-24">
            <h3 class="font-bold text-text-primary mb-4 text-lg">Add Category</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Category Name</label>
                <input type="text" [(ngModel)]="newCategory" (keyup.enter)="addCategory()" placeholder="e.g., Dairy" 
                       class="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 font-semibold text-sm">
              </div>
              <p class="text-[11px] text-text-secondary leading-relaxed">Categories help customers browse and filter products efficiently.</p>
              <button (click)="addCategory()" [disabled]="!newCategory.trim() || isSubmitting"
                      class="w-full py-3.5 bg-brand-orange text-white rounded-2xl font-bold shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
                @if (isSubmitting) {
                  <i class="bi bi-arrow-repeat animate-spin"></i>
                  <span>Creating...</span>
                } @else {
                  <i class="bi bi-plus-circle"></i>
                  <span>Create Category</span>
                }
              </button>
            </div>
          </div>
        </div>

        <!-- Category List -->
        <div class="md:col-span-2">
          <div class="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-text-primary">Existing Categories</h3>
                <p class="text-xs text-text-secondary mt-0.5">Click the delete button to remove a category</p>
              </div>
              <span class="text-xs font-bold text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                {{ categories.length }} total
              </span>
            </div>

            <!-- Loading State -->
            @if (isLoading) {
              <div class="p-12 text-center text-text-secondary">
                <i class="bi bi-arrow-repeat animate-spin text-3xl mb-2 block text-brand-orange"></i>
                <p class="text-xs font-bold">Loading categories...</p>
              </div>
            } @else {
              <div class="divide-y divide-gray-50">
                @for (cat of categories; track cat) {
                  <div class="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                        <i class="bi bi-tag-fill"></i>
                      </div>
                      <div>
                        <span class="font-bold text-text-primary capitalize">{{ cat }}</span>
                        <span class="block text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-0.5">Product Category</span>
                      </div>
                    </div>

                    <!-- Delete Button: Always visible and clear -->
                    <button (click)="openDeleteModal(cat)"
                            class="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm border border-red-100 hover:border-red-500 cursor-pointer"
                            title="Delete {{ cat }}">
                      <i class="bi bi-trash3-fill"></i>
                      <span>Delete</span>
                    </button>
                  </div>
                }

                @if (categories.length === 0) {
                  <div class="p-20 text-center text-text-secondary">
                    <i class="bi bi-tags text-4xl mb-3 block text-gray-200"></i>
                    <p class="font-medium text-sm">No categories found.</p>
                    <p class="text-xs text-text-secondary mt-1">Use the form on the left to add a new category.</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      @if (categoryToDelete) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 animate-scale-up">
            <div class="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <i class="bi bi-exclamation-triangle-fill"></i>
            </div>

            <div class="text-center space-y-2">
              <h3 class="text-xl font-black text-text-primary">Delete Category?</h3>
              <p class="text-sm text-text-secondary">
                Are you sure you want to delete <span class="font-bold text-text-primary">"{{ categoryToDelete }}"</span>?
              </p>
              <p class="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/60 text-left">
                <i class="bi bi-info-circle mr-1 font-bold"></i>
                Any products currently assigned to this category will have their category cleared so they won't be deleted.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
              <button (click)="closeDeleteModal()" [disabled]="isDeleting"
                      class="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-xl font-bold text-sm transition-all cursor-pointer">
                Cancel
              </button>
              <button (click)="confirmDelete()" [disabled]="isDeleting"
                      class="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
                @if (isDeleting) {
                  <i class="bi bi-arrow-repeat animate-spin"></i>
                  <span>Deleting...</span>
                } @else {
                  <i class="bi bi-trash3-fill"></i>
                  <span>Yes, Delete</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  categories: string[] = [];
  newCategory = '';
  isLoading = false;
  isSubmitting = false;
  isDeleting = false;
  categoryToDelete: string | null = null;

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.categories = res.data.categories;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading categories:', err);
        this.toastService.show('Failed to load categories', 'error');
      }
    });
  }

  addCategory(): void {
    const trimmed = this.newCategory.trim();
    if (!trimmed) return;

    this.isSubmitting = true;
    this.productService.createCategory(trimmed).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.show(`Category "${trimmed}" created successfully!`, 'success');
        this.newCategory = '';
        this.loadCategories();
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to create category';
        this.toastService.show(msg, 'error');
      }
    });
  }

  openDeleteModal(cat: string): void {
    this.categoryToDelete = cat;
  }

  closeDeleteModal(): void {
    if (!this.isDeleting) {
      this.categoryToDelete = null;
    }
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    const cat = this.categoryToDelete;
    this.isDeleting = true;

    this.productService.deleteCategory(cat).subscribe({
      next: (res) => {
        this.isDeleting = false;
        this.categoryToDelete = null;
        this.toastService.show(res.message || `Category "${cat}" deleted successfully!`, 'success');
        this.loadCategories();
      },
      error: (err) => {
        this.isDeleting = false;
        const msg = err.error?.message || `Failed to delete category "${cat}"`;
        this.toastService.show(msg, 'error');
      }
    });
  }
}

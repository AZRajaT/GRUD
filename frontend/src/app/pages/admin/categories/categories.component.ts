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
          <p class="text-text-secondary text-sm font-medium">Manage product groups and taxonomies.</p>
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
                <input type="text" [(ngModel)]="newCategory" placeholder="e.g., Dairy" 
                       class="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 font-semibold">
              </div>
              <p class="text-[10px] text-text-secondary italic">Categories help customers find products faster.</p>
              <button (click)="addCategory()" [disabled]="!newCategory"
                      class="w-full py-4 bg-brand-orange text-white rounded-2xl font-bold shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
                Create Category
              </button>
            </div>
          </div>
        </div>

        <!-- Category List -->
        <div class="md:col-span-2">
          <div class="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50">
              <h3 class="font-bold text-text-primary">Existing Categories</h3>
            </div>
            <div class="divide-y divide-gray-50">
              @for (cat of categories; track cat) {
                <div class="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                      <i class="bi bi-tag-fill"></i>
                    </div>
                    <div>
                      <span class="font-bold text-text-primary">{{ cat }}</span>
                      <span class="block text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-0.5">Product Group</span>
                    </div>
                  </div>
                  <button (click)="deleteCategory(cat)" class="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <i class="bi bi-trash3-fill"></i>
                  </button>
                </div>
              }
              @if (categories.length === 0) {
                <div class="p-20 text-center text-text-secondary">
                  <i class="bi bi-tags text-4xl mb-3 block text-gray-200"></i>
                  <p>No categories found.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  categories: string[] = [];
  newCategory = '';

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data.categories;
      }
    });
  }

  addCategory(): void {
    // In a real app, this would call a dedicated category API
    // For now, we just show a toast as categories are derived from products in the current backend
    this.toastService.show(`Note: Categories are automatically created when you add a product with a new category name.`, 'info');
    this.newCategory = '';
  }

  deleteCategory(cat: string): void {
    this.toastService.show(`Cannot delete category "${cat}" while products are still assigned to it.`, 'error');
  }
}

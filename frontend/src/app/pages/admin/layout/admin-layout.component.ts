import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <!-- Sidebar Desktop -->
      <aside class="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen flex-shrink-0">
        <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
      </aside>

      <!-- Sidebar Mobile Drawer -->
      <div class="lg:hidden">
        <div 
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
          [class.opacity-100]="isMobileMenuOpen"
          [class.pointer-events-auto]="isMobileMenuOpen"
          [class.opacity-0]="!isMobileMenuOpen"
          [class.pointer-events-none]="!isMobileMenuOpen"
          (click)="closeMobileMenu()">
        </div>
        
        <aside 
          class="fixed top-0 left-0 z-[70] h-screen w-72 bg-white shadow-2xl transition-transform duration-300 transform"
          [class.translate-x-0]="isMobileMenuOpen"
          [class.-translate-x-full]="!isMobileMenuOpen">
          <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
        </aside>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Navbar -->
        <header class="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <div class="flex items-center gap-4">
            <button (click)="toggleMobileMenu()" class="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <i class="bi bi-list text-2xl"></i>
            </button>
            <span class="font-bold text-brand-orange lg:hidden">Admin Panel</span>
            <div class="hidden lg:block">
               <h1 class="text-lg font-bold text-text-primary">Dashboard</h1>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden sm:flex flex-col items-end mr-2">
              <span class="text-sm font-semibold text-text-primary">{{ user?.username }}</span>
              <span class="text-[10px] text-success font-bold uppercase">{{ user?.role }}</span>
            </div>
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 border-2 border-white shadow-soft">
              <i class="bi bi-person-fill text-xl"></i>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Reusable Sidebar Content -->
    <ng-template #sidebarContent>
      <div class="flex flex-col h-full">
        <div class="p-6 border-b border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white shadow-soft">
            <i class="bi bi-cart-fill text-xl"></i>
          </div>
          <div>
            <h2 class="font-bold text-text-primary leading-none">Admin</h2>
            <span class="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Control Panel</span>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <a *ngFor="let item of menuItems" 
             [routerLink]="item.path" 
             (click)="closeMobileMenu()"
             routerLinkActive="bg-primary-50 text-primary-600 shadow-sm border-primary-200"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200 group border-2 border-transparent">
            <i [class]="'bi ' + item.icon + ' text-lg group-hover:scale-110 transition-transform'"></i>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        </nav>

        <div class="p-4 border-t border-gray-100">
          <button (click)="logout()" 
            class="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group">
            <i class="bi bi-box-arrow-left text-lg group-hover:translate-x-1 transition-transform"></i>
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminLayoutComponent {
  user = this.authService.getUser();
  isMobileMenuOpen = false;

  menuItems = [
    { label: 'Dashboard', icon: 'bi-grid-1x2-fill', path: '/admin/dashboard' },
    { label: 'Products', icon: 'bi-box-seam-fill', path: '/admin/products' },
    { label: 'Orders', icon: 'bi-bag-check-fill', path: '/admin/orders' },
    { label: 'Categories', icon: 'bi-tags-fill', path: '/admin/categories' },
    { label: 'Grocery Kits', icon: 'bi-basket-fill', path: '/admin/kits' },
    { label: 'Settings', icon: 'bi-gear-fill', path: '/admin/settings' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}

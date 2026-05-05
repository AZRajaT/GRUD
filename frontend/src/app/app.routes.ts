import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'kits',
    loadComponent: () => import('./pages/grocery-kits/grocery-kits.component').then(m => m.GroceryKitsComponent)
  },
  // Admin Routes
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.AuthGuard)],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/products/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/add',
        loadComponent: () => import('./pages/admin/products/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./pages/admin/products/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin/orders/orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin/categories/categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'kits',
        loadComponent: () => import('./pages/admin/kits/kit-list.component').then(m => m.KitListComponent)
      },
      {
        path: 'kits/add',
        loadComponent: () => import('./pages/admin/kits/kit-form.component').then(m => m.KitFormComponent)
      },
      {
        path: 'kits/edit/:id',
        loadComponent: () => import('./pages/admin/kits/kit-form.component').then(m => m.KitFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

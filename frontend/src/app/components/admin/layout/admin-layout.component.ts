import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <app-admin-sidebar></app-admin-sidebar>

      <!-- Main Content -->
      <main class="main-content">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      min-height: 100vh;
    }

    .content-wrapper {
      padding: 24px;
      max-width: 1400px;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class AdminLayoutComponent {}

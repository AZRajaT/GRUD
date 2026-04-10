import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { LoginRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-login-page">
      <div class="login-container">
        <div class="login-card">
          <!-- Logo/Header -->
          <div class="login-header">
            <div class="logo-icon">
              <i class="bi bi-shield-lock"></i>
            </div>
            <h1>Admin Login</h1>
            <p>Sign in to access the admin dashboard</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="username">
                <i class="bi bi-person"></i>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                [(ngModel)]="credentials.username"
                required
                placeholder="Enter your username"
                [disabled]="isLoading"
              />
            </div>

            <div class="form-group">
              <label for="password">
                <i class="bi bi-lock"></i>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="credentials.password"
                required
                placeholder="Enter your password"
                [disabled]="isLoading"
              />
            </div>

            <button
              type="submit"
              class="login-btn"
              [disabled]="isLoading || !credentials.username || !credentials.password"
            >
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!isLoading" class="bi bi-box-arrow-in-right me-2"></i>
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <a routerLink="/" class="back-link">
              <i class="bi bi-arrow-left"></i>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-container {
      width: 100%;
      max-width: 420px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 36px;
      color: white;
    }

    .login-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .login-header p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-group label i {
      color: #02579b;
    }

    .form-group input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 15px;
      transition: all 0.2s ease;
      background: #fafafa;
    }

    .form-group input:focus {
      outline: none;
      border-color: #02579b;
      background: white;
      box-shadow: 0 0 0 4px rgba(2, 87, 155, 0.1);
    }

    .form-group input::placeholder {
      color: #9ca3af;
    }

    .login-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #02579b 0%, #0288d1 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 8px;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(2, 87, 155, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .back-link {
      color: #6b7280;
      text-decoration: none;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #02579b;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 24px;
      }

      .logo-icon {
        width: 64px;
        height: 64px;
        font-size: 28px;
      }

      .login-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class AdminLoginComponent implements OnInit {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.toastService.show('Please enter both username and password', 'error');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastService.show('Login successful!', 'success');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.toastService.show(response.message || 'Login failed', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Invalid credentials';
        this.toastService.show(message, 'error');
      }
    });
  }
}

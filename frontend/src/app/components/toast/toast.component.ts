import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  toasts = this.toastService.toasts;

  constructor(private toastService: ToastService) {}

  iconMap: { [key: string]: string } = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  getIconColor(type: string): string {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  }

  getBorderColor(type: string): string {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'success': return 'alert-success border-start border-4 border-success';
      case 'error': return 'alert-danger border-start border-4 border-danger';
      default: return 'alert-info border-start border-4 border-info';
    }
  }

  closeToast(id: number): void {
    this.toastService.remove(id);
  }
}

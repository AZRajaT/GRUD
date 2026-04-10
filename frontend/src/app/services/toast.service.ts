import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private toastIdCounter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000): void {
    const id = ++this.toastIdCounter;
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.update(current => [...current, toast]);
    
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}

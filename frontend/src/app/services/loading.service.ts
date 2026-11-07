import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = signal<number>(0);
  private _isLoading = signal<boolean>(false);
  private _message = signal<string>('Please wait...');
  
  private startTime = 0;
  private readonly minDisplayTime = 250; // ms to avoid jerky micro-flickering
  private hideTimeout: any = null;
  private safetyTimer: any = null;

  // Readonly signals exposed to components
  readonly isLoading = this._isLoading.asReadonly();
  readonly message = this._message.asReadonly();

  show(message: string = 'Please wait...'): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.activeRequests() === 0) {
      this.startTime = Date.now();
      this._isLoading.set(true);
    }

    if (message) {
      this._message.set(message);
    }

    this.activeRequests.update(c => c + 1);
    this.startSafetyTimer();
  }

  hide(): void {
    this.activeRequests.update(c => Math.max(0, c - 1));

    if (this.activeRequests() === 0) {
      this.clearSafetyTimer();
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.minDisplayTime - elapsed);

      this.hideTimeout = setTimeout(() => {
        if (this.activeRequests() === 0) {
          this._isLoading.set(false);
          this._message.set('Please wait...');
        }
      }, remaining);
    }
  }

  reset(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.clearSafetyTimer();
    this.activeRequests.set(0);
    this._isLoading.set(false);
    this._message.set('Please wait...');
  }

  private startSafetyTimer(): void {
    this.clearSafetyTimer();
    // Safety fallback: auto-clear after 20 seconds to prevent frozen screen
    this.safetyTimer = setTimeout(() => {
      if (this.activeRequests() > 0) {
        console.warn('LoadingService: Auto-cleared stuck loading spinner after timeout.');
        this.reset();
      }
    }, 20000);
  }

  private clearSafetyTimer(): void {
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
  }
}

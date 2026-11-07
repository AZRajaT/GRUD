import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const LoadingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);
  
  // Don't show global loader for some requests if needed
  const skipLoader = 
    request.params.get('skipLoader') === 'true' || 
    request.headers.get('X-Skip-Loader') === 'true';
  
  if (!skipLoader) {
    let msg = 'Loading...';
    if (request.url.includes('/auth/login')) {
      msg = 'Signing in...';
    } else if (request.method === 'POST') {
      msg = 'Saving...';
    } else if (request.method === 'PUT' || request.method === 'PATCH') {
      msg = 'Updating...';
    } else if (request.method === 'DELETE') {
      msg = 'Deleting...';
    }
    loadingService.show(msg);
  }

  return next(request).pipe(
    finalize(() => {
      if (!skipLoader) {
        loadingService.hide();
      }
    })
  );
};

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
  const skipLoader = request.params.get('skipLoader') === 'true';
  
  if (!skipLoader) {
    loadingService.show();
  }

  return next(request).pipe(
    finalize(() => {
      if (!skipLoader) {
        loadingService.hide();
      }
    })
  );
};

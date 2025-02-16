import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.showLoading(); // ✅ Show spinner

  return next(req).pipe(
    finalize(() => {
      loadingService.hideLoading(); // ✅ Hide spinner when request completes
    })
  );
};

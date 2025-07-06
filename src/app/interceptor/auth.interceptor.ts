import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Add token to request if available
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Check if this is a refresh token request that failed
        if (req.url.includes('/refresh')) {
          console.error('Refresh token failed');
          authService.logout();
          return throwError(() => error);
        }

        // Check if we have a refresh token to try
        if (authService.hasValidTokens()) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getToken();
              if (newToken) {
                req = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next(req);
              } else {
                authService.logout();
                return throwError(() => error);
              }
            }),
            catchError((refreshError) => {
              console.error(
                'Token refresh failed in interceptor:',
                refreshError
              );
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // No valid tokens, logout
          authService.logout();
          return throwError(() => error);
        }
      }
      return throwError(() => error);
    })
  );
};

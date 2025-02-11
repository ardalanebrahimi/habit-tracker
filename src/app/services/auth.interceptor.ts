import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (
  req,
  next
): Observable<HttpEvent<any>> => {
  const token = localStorage.getItem('accessToken'); // 🔒 Get token
  const router = inject(Router); // 🔄 Inject Router for redirection

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('⚠️ Unauthorized! Logging out...');
        localStorage.removeItem('accessToken'); // ❌ Remove invalid token
        router.navigate(['/login']); // 🔄 Redirect to login page
      }
      return throwError(() => error); // 🚨 Re-throw the error
    })
  );
};

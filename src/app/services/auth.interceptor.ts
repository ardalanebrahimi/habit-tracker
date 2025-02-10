import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken'); // 🔒 Get token from local storage

  if (token) {
    // Clone request and add the Authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};

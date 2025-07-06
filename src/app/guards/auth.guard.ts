import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Check if user has valid tokens
    if (!this.authService.hasValidTokens()) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // If user has tokens but no access token, try to refresh
    if (!this.authService.getToken()) {
      return this.authService.refreshToken().pipe(
        switchMap(() => of(true)),
        catchError((error) => {
          console.error('Token refresh failed in guard:', error);
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    }

    return of(true);
  }
}

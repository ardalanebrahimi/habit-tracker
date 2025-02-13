import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/user`;
  private accessToken: string | null = null; // Store access token in memory
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(
        tap((res) => {
          this.saveTokens(res.accessToken, res.refreshToken);
        })
      );
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('refreshToken');
    this.isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token found');
    }

    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/refresh`,
        { refreshToken }
      )
      .pipe(
        tap((tokens) => {
          this.saveTokens(tokens.accessToken, tokens.refreshToken);
        })
      );
  }

  getToken(): string | null {
    return this.accessToken;
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    localStorage.setItem('refreshToken', refreshToken);
    this.isAuthenticated.next(true);
  }
}

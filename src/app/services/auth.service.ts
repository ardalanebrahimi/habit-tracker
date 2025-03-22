import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface User {
  id: string;
  userName: string;
  email: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userName: string;
}

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
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((res) => this.saveAuthResponse(res)));
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
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
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(tap((res) => this.saveAuthResponse(res)));
  }

  getToken(): string | null {
    return this.accessToken;
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  getCurrentUser(): { userName: string } | null {
    const userName = localStorage.getItem('userName');
    return userName ? { userName } : null;
  }

  private saveAuthResponse(response: AuthResponse) {
    this.accessToken = response.accessToken;
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('userName', response.userName);
    this.isAuthenticated.next(true);
  }
}

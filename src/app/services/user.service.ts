import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserTokenInfo {
  remainingTokens: number;
  maxTokens: number;
  resetDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;
  private tokenInfo = new BehaviorSubject<UserTokenInfo | null>(null);

  constructor(private http: HttpClient) {
    this.loadTokenInfo();
  }

  /**
   * Get current user's token information
   */
  getTokenInfo(): Observable<UserTokenInfo> {
    return this.http.get<UserTokenInfo>(`${this.apiUrl}/tokens`);
  }

  /**
   * Check if user has tokens available for AI features
   */
  hasTokensAvailable(): boolean {
    const current = this.tokenInfo.value;
    return current ? current.remainingTokens > 0 : false;
  }

  /**
   * Get current token info as observable
   */
  getTokenInfoObservable(): Observable<UserTokenInfo | null> {
    return this.tokenInfo.asObservable();
  }

  /**
   * Consume a token for AI usage
   */
  consumeToken(): Observable<UserTokenInfo> {
    return this.http.post<UserTokenInfo>(`${this.apiUrl}/consume-token`, {});
  }

  /**
   * Purchase more tokens (placeholder for future paywall)
   */
  purchaseTokens(amount: number): Observable<UserTokenInfo> {
    return this.http.post<UserTokenInfo>(`${this.apiUrl}/purchase-tokens`, {
      amount,
    });
  }

  /**
   * Load token info from backend
   */
  private loadTokenInfo(): void {
    this.getTokenInfo().subscribe({
      next: (tokenInfo) => {
        this.tokenInfo.next(tokenInfo);
      },
      error: (error) => {
        console.error('Failed to load token info:', error);
        // Set default tokens for development
        this.tokenInfo.next({
          remainingTokens: 5,
          maxTokens: 10,
          resetDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
        });
      },
    });
  }

  /**
   * Update token info after consumption
   */
  updateTokenInfo(tokenInfo: UserTokenInfo): void {
    this.tokenInfo.next(tokenInfo);
  }
}

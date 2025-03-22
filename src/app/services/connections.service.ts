import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsService {
  private apiUrl = `${environment.apiUrl}/connection`;

  constructor(private http: HttpClient) {}

  getConnections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`);
  }

  // ✅ Search Users by Username
  searchUsers(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?username=${username}`);
  }

  // ✅ Send Connection Request
  sendRequest(ConnectedUserId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { ConnectedUserId });
  }

  getIncomingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/incoming`);
  }

  getSentRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sent`);
  }

  acceptRequest(requestId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept/${requestId}`, {});
  }

  rejectRequest(requestId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reject/${requestId}`, {});
  }

  // Request friends to check a habit
  requestHabitCheck(habitId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-request`, {
      habitId,
      userIds,
    });
  }
}

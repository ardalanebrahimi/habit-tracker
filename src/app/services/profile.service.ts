import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile, ProfileAnalytics } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  /**
   * Get user profile by ID
   */
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Get detailed analytics for a user
   */
  getUserAnalytics(userId: string): Observable<ProfileAnalytics> {
    return this.http.get<ProfileAnalytics>(
      `${this.apiUrl}/${userId}/analytics`
    );
  }

  /**
   * Discover public profiles
   */
  discoverProfiles(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(
      `${this.apiUrl}/discover?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }
}

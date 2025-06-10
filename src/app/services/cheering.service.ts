import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Cheer,
  CheerRequest,
  CheerSummary,
  CheerFactory,
} from '../models/cheer.model';

@Injectable({
  providedIn: 'root',
})
export class CheeringService {
  private apiUrl = `${environment.apiUrl}/cheer`;

  constructor(private http: HttpClient) {}

  /**
   * Send a cheer to a friend for their habit completion
   */
  sendCheer(cheerRequest: CheerRequest): Observable<void> {
    return this.http
      .post<void>(this.apiUrl, cheerRequest)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get cheers received for a specific habit
   */
  getCheersForHabit(habitId: string): Observable<Cheer[]> {
    return this.http.get<any[]>(`${this.apiUrl}/habit/${habitId}`).pipe(
      map((cheers) =>
        cheers.map((cheer) => CheerFactory.createFromResponse(cheer))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Get all cheers received by the current user
   */
  getReceivedCheers(): Observable<Cheer[]> {
    return this.http.get<any[]>(`${this.apiUrl}/received`).pipe(
      map((cheers) =>
        cheers.map((cheer) => CheerFactory.createFromResponse(cheer))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Get all cheers sent by the current user
   */
  getSentCheers(): Observable<Cheer[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sent`).pipe(
      map((cheers) =>
        cheers.map((cheer) => CheerFactory.createFromResponse(cheer))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Get cheer summary for user's habits
   */
  getCheerSummary(): Observable<CheerSummary[]> {
    return this.http
      .get<CheerSummary[]>(`${this.apiUrl}/summary`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a cheer (only by sender)
   */
  deleteCheer(cheerId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${cheerId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if user can cheer for a specific habit (not their own, friends only)
   */
  canCheerForHabit(habitOwnerId: string, currentUserId: string): boolean {
    return habitOwnerId !== currentUserId;
  }

  /**
   * Get random cheer message
   */
  getRandomCheerMessage(): string {
    const messages = [
      'Great job!',
      'Keep it up!',
      "You're crushing it!",
      'Amazing progress!',
      'So proud of you!',
      "You've got this!",
      'Incredible work!',
      'Keep going strong!',
      "You're unstoppable!",
      'Fantastic effort!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get random cheer emoji
   */
  getRandomCheerEmoji(): string {
    const emojis = ['👏', '🎉', '💪', '🔥', '⭐', '🏆', '❤️', '💯', '🚀', '⚡'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('CheeringService error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your data.';
          break;
        case 401:
          errorMessage = 'You are not authorized to perform this action.';
          break;
        case 403:
          errorMessage = 'You do not have permission to cheer for this habit.';
          break;
        case 404:
          errorMessage = 'Habit or user not found.';
          break;
        case 429:
          errorMessage =
            'Too many requests. Please wait before sending another cheer.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  };
}

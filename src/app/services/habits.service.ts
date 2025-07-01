import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HabitWithProgressDTO,
  HabitLogDTO,
} from '../models/habit-with-progress-dto.model';
import { CreateHabitDTO } from '../models/create-habit-dto.model';
import { AiHabitSuggestionRequest } from '../models/ai-habit-suggestion.model';
import {
  OnboardingRequest,
  OnboardingSuggestion,
} from '../models/onboarding.model';

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private apiUrl = `${environment.apiUrl}/habits`;

  constructor(private http: HttpClient) {}

  /**
   * ✅ Fetch all habits for statistics & tracking
   */
  getAllHabits(): Observable<HabitWithProgressDTO[]> {
    return this.http.get<HabitWithProgressDTO[]>(`${this.apiUrl}/all`);
  }

  getHabitById(id: string): Observable<HabitWithProgressDTO> {
    return this.http.get<HabitWithProgressDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * ✅ Fetch today's habits only
   */
  getTodayHabits(): Observable<HabitWithProgressDTO[]> {
    return this.http.get<HabitWithProgressDTO[]>(`${this.apiUrl}/today`);
  }

  /**
   * ✅ Fetch Friends today's habits
   */
  getFriendsHabits(): Observable<HabitWithProgressDTO[]> {
    return this.http.get<HabitWithProgressDTO[]>(`${this.apiUrl}/friends`);
  }

  /**
   * ✅ Add a new habit
   */
  addHabit(habit: CreateHabitDTO): Observable<HabitWithProgressDTO> {
    return this.http.post<HabitWithProgressDTO>(this.apiUrl, habit);
  }

  /**
   * ✅ Delete a habit
   */
  deleteHabit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * ✅ Increase or decrease habit progress
   * @param id Habit ID
   * @param decrease Set to `true` to decrease, otherwise increases (+1)
   */
  updateHabitProgress(
    id?: string,
    decrease: boolean = false
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/complete`, { decrease });
  }

  archiveHabit(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/archive`, {});
  }

  getActiveHabits(): Observable<HabitWithProgressDTO[]> {
    return this.http.get<HabitWithProgressDTO[]>(`${this.apiUrl}/active`);
  }

  getArchivedHabits(): Observable<HabitWithProgressDTO[]> {
    return this.http.get<HabitWithProgressDTO[]>(`${this.apiUrl}/archived`);
  }

  updateHabit(
    id: string,
    habit: CreateHabitDTO
  ): Observable<HabitWithProgressDTO> {
    return this.http.put<HabitWithProgressDTO>(`${this.apiUrl}/${id}`, habit);
  }

  /**
   * Fetch public habits (excluding the user's and their friends' habits) with pagination
   */
  getPublicHabits(
    pageNumber: number,
    pageSize: number = 5
  ): Observable<HabitWithProgressDTO[]> {
    const url = `${this.apiUrl}/public?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<HabitWithProgressDTO[]>(url);
  }

  /**
   * Copy a public habit from another user
   * @param id The ID of the habit to copy
   */
  copyHabit(id: string): Observable<HabitWithProgressDTO> {
    return this.http.post<HabitWithProgressDTO>(
      `${this.apiUrl}/${id}/copy`,
      {}
    );
  }

  /**
   * Generate AI habit suggestion based on user prompt
   * @param prompt User's description of the habit they want to build
   */
  generateHabitSuggestion(prompt: string): Observable<CreateHabitDTO> {
    const request: AiHabitSuggestionRequest = { prompt };
    return this.http.post<CreateHabitDTO>(
      `${environment.apiUrl}/ai/habit-suggest`,
      request
    );
  }

  /**
   * Generate onboarding habit suggestions based on questionnaire answers
   * @param answers User's onboarding questionnaire answers
   */
  generateOnboardingSuggestions(
    answers: OnboardingRequest
  ): Observable<OnboardingSuggestion[]> {
    return this.http.post<OnboardingSuggestion[]>(
      `${environment.apiUrl}/ai/onboarding-suggestions`,
      answers
    );
  }

  /**
   * Get habit logs for a specific date range (default: last 84 days)
   * @param habitId The ID of the habit
   * @param startDate Start date for logs (optional)
   * @param endDate End date for logs (optional)
   */
  getHabitLogs(
    habitId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<HabitLogDTO[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<HabitLogDTO[]>(`${this.apiUrl}/${habitId}/logs`, {
      params,
    });
  }
}

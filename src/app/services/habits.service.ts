import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Habit } from '../models/habit.model';

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private apiUrl = `${environment.apiUrl}/habits`;

  constructor(private http: HttpClient) {}

  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.apiUrl);
  }

  getTodayHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}/today`);
  }

  addHabit(habit: Habit): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, habit);
  }

  updateHabit(habit: Habit): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${habit.id}`, habit);
  }

  deleteHabit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markHabitComplete(id?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/complete`, {});
  }
}

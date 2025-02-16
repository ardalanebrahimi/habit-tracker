import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HabitWithProgressDTO } from '../models/habit-with-progress-dto.model';

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

  /**
   * ✅ Fetch today's habits only
   */
  getTodayHabits(): Observable<HabitWithProgressDTO[]> {
    return this.http.get<HabitWithProgressDTO[]>(`${this.apiUrl}/today`);
  }

  /**
   * ✅ Add a new habit
   */
  addHabit(habit: HabitWithProgressDTO): Observable<HabitWithProgressDTO> {
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
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HabitWithProgressDTO } from '../models/habit-with-progress-dto.model';
import { CreateHabitDTO } from '../models/create-habit-dto.model';

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

  getHabitById(id: string): Observable<CreateHabitDTO> {
    return this.http.get<CreateHabitDTO>(`${this.apiUrl}/${id}`);
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
    habit: HabitWithProgressDTO
  ): Observable<HabitWithProgressDTO> {
    return this.http.put<HabitWithProgressDTO>(`${this.apiUrl}/${id}`, habit);
  }
}

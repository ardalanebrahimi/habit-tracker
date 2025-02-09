import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Habit } from '../features/habit.model';

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private STORAGE_KEY = 'habits';
  private habitsSubject = new BehaviorSubject<Habit[]>(
    this.getHabitsFromStorage()
  );
  habits$ = this.habitsSubject.asObservable(); // Observable for reactive updates

  // Fetch habits from localStorage
  private getHabitsFromStorage(): Habit[] {
    const habits = localStorage.getItem(this.STORAGE_KEY);
    return habits ? JSON.parse(habits) : [];
  }

  // Save habits to localStorage
  private saveHabitsToStorage(habits: Habit[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(habits));
  }

  // Get all habits
  getHabits(): Habit[] {
    return this.habitsSubject.getValue();
  }

  // Add a new habit
  addHabit(habit: Habit): void {
    const habits = [...this.getHabits(), habit];
    this.saveHabitsToStorage(habits);
    this.habitsSubject.next(habits); // Notify subscribers
  }

  // Update an existing habit
  updateHabit(updatedHabit: Habit): void {
    const habits = this.getHabits().map((habit) =>
      habit.id === updatedHabit.id ? updatedHabit : habit
    );
    this.saveHabitsToStorage(habits);
    this.habitsSubject.next(habits); // Notify subscribers
  }

  // Delete a habit
  deleteHabit(id: string): void {
    const habits = this.getHabits().filter((habit) => habit.id !== id);
    this.saveHabitsToStorage(habits);
    this.habitsSubject.next(habits); // Notify subscribers
  }

  // Calculate streak for a binary habit
  calculateStreak(habit: Habit): number {
    const today = new Date().toISOString().split('T')[0];
    const logs = habit.logs || [];
    if (!logs.some((log) => log.date === today)) {
      return habit.streak; // No progress today
    }
    // Calculate streak based on consecutive days
    return logs.reduce((streak, log, index, array) => {
      if (index === 0) return 1; // Start streak
      const currentDate = new Date(log.date);
      const prevDate = new Date(array[index - 1].date);
      prevDate.setDate(prevDate.getDate() + 1);
      return currentDate.toISOString() === prevDate.toISOString()
        ? streak + 1
        : streak;
    }, 0);
  }

  // Get habits due today based on frequency
  getTodayHabits(): Habit[] {
    const today = new Date();
    return this.getHabits().filter((habit) => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly') {
        return today.getDay() === 1; // Monday
      }
      if (habit.frequency === 'monthly') {
        return today.getDate() === 1; // First day of the month
      }
      return false;
    });
  }
}

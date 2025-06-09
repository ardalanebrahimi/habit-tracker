import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Milestone,
  MilestoneDefinition,
  MilestoneCheckResult,
  MILESTONE_DEFINITIONS,
} from '../models/milestone.model';
import { HabitWithProgressDTO } from '../models/habit-with-progress-dto.model';

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  private readonly STORAGE_KEY = 'habit-tracker-milestones';
  private milestonesSubject = new BehaviorSubject<Milestone[]>([]);

  constructor() {
    this.loadMilestones();
  }

  /**
   * Get all milestones
   */
  getMilestones(): Observable<Milestone[]> {
    return this.milestonesSubject.asObservable();
  }

  /**
   * Get milestones for a specific habit
   */
  getHabitMilestones(habitId: string): Observable<Milestone[]> {
    return this.getMilestones().pipe(
      map((milestones) => milestones.filter((m) => m.habitId === habitId))
    );
  }

  /**
   * Check if a habit has reached a new milestone
   */
  checkForNewMilestone(
    habit: HabitWithProgressDTO,
    previousStreak: number = 0
  ): MilestoneCheckResult {
    const currentStreak = habit.streak;

    // Find the highest milestone that the current streak has reached
    const achievedMilestone = MILESTONE_DEFINITIONS.filter(
      (def) => currentStreak >= def.streakValue
    ).sort((a, b) => b.streakValue - a.streakValue)[0];

    // Find the highest milestone that the previous streak had reached
    const previousMilestone = MILESTONE_DEFINITIONS.filter(
      (def) => previousStreak >= def.streakValue
    ).sort((a, b) => b.streakValue - a.streakValue)[0];

    // Check if we've reached a new milestone
    const isNewMilestone =
      achievedMilestone &&
      (!previousMilestone ||
        achievedMilestone.streakValue > previousMilestone.streakValue);

    return {
      isNewMilestone,
      milestone: isNewMilestone ? achievedMilestone : undefined,
    };
  }

  /**
   * Record a milestone achievement
   */
  recordMilestone(
    habit: HabitWithProgressDTO,
    milestone: MilestoneDefinition
  ): Observable<Milestone> {
    const newMilestone: Milestone = {
      id: this.generateId(),
      habitId: habit.id,
      streakValue: milestone.streakValue,
      milestoneName: milestone.name,
      achievedDate: new Date().toISOString(),
      frequency: habit.frequency,
      habitName: habit.name,
    };

    const currentMilestones = this.milestonesSubject.getValue();
    const updatedMilestones = [...currentMilestones, newMilestone];

    this.saveMilestones(updatedMilestones);
    this.milestonesSubject.next(updatedMilestones);

    return of(newMilestone);
  }

  /**
   * Get milestone definition for a specific streak value
   */
  getMilestoneDefinition(streakValue: number): MilestoneDefinition | null {
    return (
      MILESTONE_DEFINITIONS.find((def) => def.streakValue === streakValue) ||
      null
    );
  }

  /**
   * Get all available milestone definitions
   */
  getAllMilestoneDefinitions(): MilestoneDefinition[] {
    return MILESTONE_DEFINITIONS;
  }

  /**
   * Check if a streak value is a milestone
   */
  isMilestone(streakValue: number): boolean {
    return MILESTONE_DEFINITIONS.some((def) => def.streakValue === streakValue);
  }

  /**
   * Get the next milestone for a given streak
   */
  getNextMilestone(currentStreak: number): MilestoneDefinition | null {
    return (
      MILESTONE_DEFINITIONS.filter(
        (def) => def.streakValue > currentStreak
      ).sort((a, b) => a.streakValue - b.streakValue)[0] || null
    );
  }

  /**
   * Get milestone statistics
   */
  getMilestoneStats(): Observable<{
    totalMilestones: number;
    milestonesByHabit: { [habitId: string]: number };
    recentMilestones: Milestone[];
  }> {
    return this.getMilestones().pipe(
      map((milestones) => {
        const milestonesByHabit: { [habitId: string]: number } = {};

        milestones.forEach((milestone) => {
          milestonesByHabit[milestone.habitId] =
            (milestonesByHabit[milestone.habitId] || 0) + 1;
        });

        const recentMilestones = milestones
          .sort(
            (a, b) =>
              new Date(b.achievedDate).getTime() -
              new Date(a.achievedDate).getTime()
          )
          .slice(0, 5);

        return {
          totalMilestones: milestones.length,
          milestonesByHabit,
          recentMilestones,
        };
      })
    );
  }

  /**
   * Clear all milestones (for testing or reset purposes)
   */
  clearMilestones(): void {
    this.saveMilestones([]);
    this.milestonesSubject.next([]);
  }

  /**
   * Delete milestones for a specific habit (when habit is deleted)
   */
  deleteHabitMilestones(habitId: string): void {
    const currentMilestones = this.milestonesSubject.getValue();
    const updatedMilestones = currentMilestones.filter(
      (m) => m.habitId !== habitId
    );

    this.saveMilestones(updatedMilestones);
    this.milestonesSubject.next(updatedMilestones);
  }

  private loadMilestones(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const milestones = JSON.parse(stored) as Milestone[];
        this.milestonesSubject.next(milestones);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
      this.milestonesSubject.next([]);
    }
  }

  private saveMilestones(milestones: Milestone[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(milestones));
    } catch (error) {
      console.error('Error saving milestones:', error);
    }
  }

  private generateId(): string {
    return (
      'milestone-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    );
  }
}

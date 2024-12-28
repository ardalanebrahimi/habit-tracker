import { Routes } from '@angular/router';
import { TodayComponent } from './features/today/today.component';
import { AllHabitsComponent } from './features/all-habits/all-habits.component';
import { StatsComponent } from './features/stats/stats.component';
import { AddHabitComponent } from './features/add-habit/add-habit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  { path: 'today', component: TodayComponent },
  { path: 'habits', component: AllHabitsComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'add-habit', component: AddHabitComponent },
];

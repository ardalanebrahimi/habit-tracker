import { Routes } from '@angular/router';
import { TodayComponent } from './features/today/today.component';
import { AllHabitsComponent } from './features/all-habits/all-habits.component';
import { StatsComponent } from './features/stats/stats.component';
import { AddHabitComponent } from './features/add-habit/add-habit.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  { path: 'today', component: TodayComponent },
  { path: 'habits', component: AllHabitsComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'add-habit', component: AddHabitComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'login' }, // Default to login if route not foun
];

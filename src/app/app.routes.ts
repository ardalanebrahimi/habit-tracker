import { Routes } from '@angular/router';
import { TodayComponent } from './features/today/today.component';
import { AllHabitsComponent } from './features/all-habits/all-habits.component';
import { StatsComponent } from './features/stats/stats.component';
import { HabitFormComponent } from './features/habit-form/habit-form.component';
import { HabitDetailsComponent } from './features/habit-details/habit-details.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ArchivedHabitsComponent } from './features/archived-habits.component/archived-habits.component';
import { ConnectionsComponent } from './features/connections/connections.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { CheerTestComponent } from './features/cheer-test/cheer-test.component';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  { path: 'today', component: TodayComponent },
  { path: 'habits', component: AllHabitsComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'add-habit', component: HabitFormComponent },
  { path: 'edit-habit/:id', component: HabitFormComponent },
  { path: 'habit/:id', component: HabitDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'archived-habits', component: ArchivedHabitsComponent },
  { path: 'connections', component: ConnectionsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'cheer-test', component: CheerTestComponent },

  { path: '**', redirectTo: 'login' },
];

import { Routes } from '@angular/router';
import { TodayComponent } from './features/today/today.component';
import { AllHabitsComponent } from './features/all-habits/all-habits.component';
import { StatsComponent } from './features/stats/stats.component';
import { AddHabitComponent } from './features/add-habit/add-habit.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ArchivedHabitsComponent } from './features/archived-habits.component/archived-habits.component';
import { EditHabitComponent } from './features/edit-habit/edit-habit.component';
import { ConnectionsComponent } from './features/connections/connections/connections.component';
import { SearchUsersComponent } from './features/connections/search-users/search-users.component';
import { ConnectionRequestsComponent } from './features/connections/connection-requests/connection-requests.component';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  { path: 'today', component: TodayComponent },
  { path: 'habits', component: AllHabitsComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'add-habit', component: AddHabitComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'archived-habits', component: ArchivedHabitsComponent },
  { path: 'edit-habit/:id', component: EditHabitComponent },
  { path: 'connection-requests', component: ConnectionRequestsComponent },
  { path: 'connections', component: ConnectionsComponent },
  { path: 'search-users', component: SearchUsersComponent },

  { path: '**', redirectTo: 'login' },
];

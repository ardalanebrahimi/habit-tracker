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
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { MyProfileComponent } from './features/my-profile/my-profile.component';
import { ExploreComponent } from './features/explore/explore.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { SubscriptionManagementComponent } from './features/subscription-management/subscription-management.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  { path: 'today', component: TodayComponent, canActivate: [AuthGuard] },
  { path: 'explore', component: ExploreComponent, canActivate: [AuthGuard] },
  { path: 'habits', component: AllHabitsComponent, canActivate: [AuthGuard] },
  { path: 'stats', component: StatsComponent, canActivate: [AuthGuard] },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add-habit',
    component: HabitFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-habit/:id',
    component: HabitFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'habit/:id',
    component: HabitDetailsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'archived-habits',
    component: ArchivedHabitsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'connections',
    component: ConnectionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'subscription',
    component: SubscriptionManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'myprofile',
    component: MyProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: 'login' },
];

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
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  { path: 'today', component: TodayComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'habits', component: AllHabitsComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'add-habit', component: HabitFormComponent },
  { path: 'edit-habit/:id', component: HabitFormComponent },
  { path: 'habit/:id', component: HabitDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'archived-habits', component: ArchivedHabitsComponent },
  { path: 'connections', component: ConnectionsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'subscription', component: SubscriptionManagementComponent },
  { path: 'myprofile', component: MyProfileComponent },
  { path: 'profile/:id', component: UserProfileComponent },

  { path: '**', redirectTo: 'login' },
];

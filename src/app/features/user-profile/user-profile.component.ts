import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { ConnectionsService } from '../../services/connections.service';
import { UserProfile } from '../../models/user-profile.model';
import { HabitCardComponent } from '../habit-card/habit-card.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, HabitCardComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  activeTab: 'habits' | 'analytics' = 'habits';
  showAnalytics = false;

  constructor(
    private profileService: ProfileService,
    private connectionsService: ConnectionsService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.errorMessage = 'User ID not provided';
      this.isLoading = false;
      return;
    }

    this.loadUserProfile(userId);
  }
  private loadUserProfile(userId: string): void {
    this.isLoading = true;
    this.profileService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.showAnalytics = profile.isFriend || profile.isCurrentUser;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
        console.error('Error loading profile:', err);
      },
    });
  }

  sendConnectionRequest(): void {
    if (!this.profile) return;

    this.connectionsService.requestConnection(this.profile.id).subscribe({
      next: () => {
        // Reload profile to update connection status
        this.loadUserProfile(this.profile!.id);
      },
      error: (err) => {
        console.error('Error sending connection request:', err);
      },
    });
  }

  setActiveTab(tab: 'habits' | 'analytics'): void {
    this.activeTab = tab;
  }

  get allVisibleHabits() {
    if (!this.profile) return [];
    return [...this.profile.publicHabits, ...this.profile.friendHabits];
  }

  get hasVisibleHabits(): boolean {
    return this.allVisibleHabits.length > 0;
  }
}

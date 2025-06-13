import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile-discovery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-discovery.component.html',
  styleUrls: ['./profile-discovery.component.scss'],
})
export class ProfileDiscoveryComponent implements OnInit {
  profiles: UserProfile[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentPage = 1;
  pageSize = 10;
  hasMore = true;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.profileService
      .discoverProfiles(this.currentPage, this.pageSize)
      .subscribe({
        next: (newProfiles) => {
          if (newProfiles.length === 0) {
            this.hasMore = false;
          } else {
            this.profiles = [...this.profiles, ...newProfiles];
            this.currentPage++;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load profiles. Please try again.';
          this.isLoading = false;
          console.error('Error loading profiles:', err);
        },
      });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
      this.loadProfiles();
    }
  }

  getTruncatedHabits(profile: UserProfile): any[] {
    return profile.publicHabits.slice(0, 2); // Show only first 2 habits
  }

  getHabitCountText(profile: UserProfile): string {
    const count = profile.publicHabits.length;
    if (count === 0) return 'No public habits';
    if (count === 1) return '1 public habit';
    return `${count} public habits`;
  }
}

import { Component } from '@angular/core';
import { ConnectionsService } from '../../../services/connections.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ShareButtonComponent,
  ShareData,
} from '../share-button/share-button.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss'],
  imports: [CommonModule, FormsModule, ShareButtonComponent],
})
export class SearchUsersComponent {
  searchQuery: string = '';
  users: any[] = [];
  message: string = '';
  showInviteMessage: boolean = false;
  shareData: ShareData | null = null;
  currentUsername: string = '';

  constructor(
    private connectionsService: ConnectionsService,
    private authService: AuthService
  ) {
    this.currentUsername = this.authService.getCurrentUser()?.userName || '';
  }

  onSearchInput(): void {
    if (this.searchQuery.length >= 3) {
      this.searchUsers();
    }
  }

  searchUsers(): void {
    this.connectionsService.searchUsers(this.searchQuery).subscribe({
      next: (results) => {
        this.users = results;
        this.message = results.length ? '' : 'No users found.';
        this.showInviteMessage = results.length === 0;

        if (this.showInviteMessage) {
          this.shareData = {
            title: 'Join me on Habit Tracker!',
            text: `Hey! I'm using Habit Tracker to build better habits. Join me on the app and let's support each other!\n\nOnce you install the app, you can find me by searching for my username: ${this.currentUsername}`,
            url: 'https://play.google.com/store/apps/details?id=com.habittracker.app',
          };
        }
      },
      error: () => {
        this.message = 'Error searching users.';
      },
    });
  }

  sendRequest(userId: string) {
    this.connectionsService.sendRequest(userId).subscribe({
      next: () => {
        this.message = 'Connection request sent!';
      },
      error: () => {
        this.message = 'Error sending request.';
      },
    });
  }
}

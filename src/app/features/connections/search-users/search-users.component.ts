import { Component } from '@angular/core';
import { ConnectionsService } from '../../../services/connections.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class SearchUsersComponent {
  searchQuery: string = '';
  users: any[] = [];
  message: string = '';

  constructor(private connectionsService: ConnectionsService) {}

  search() {
    if (!this.searchQuery.trim()) {
      this.message = 'Please enter a username.';
      return;
    }

    this.connectionsService.searchUsers(this.searchQuery).subscribe({
      next: (results) => {
        this.users = results;
        this.message = results.length ? '' : 'No users found.';
      },
      error: () => {
        this.message = 'Error searching users. Try again.';
      },
    });
  }

  sendRequest(userId: string) {
    this.connectionsService.sendRequest(userId).subscribe({
      next: () => {
        this.message = 'Connection request sent!';
      },
      error: () => {
        this.message = 'Error sending request. Try again.';
      },
    });
  }

  onSearchInput(): void {
    if (this.searchQuery.length >= 3) {
      this.search();
    }
  }
}

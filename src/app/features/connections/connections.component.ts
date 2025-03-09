import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConnectionsListComponent } from './connections-list/connections-list.component';
import { ConnectionRequestsComponent } from './connection-requests/connection-requests.component';
import { SearchUsersComponent } from './search-users/search-users.component';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
  imports: [
    CommonModule,
    ConnectionsListComponent,
    ConnectionRequestsComponent,
    SearchUsersComponent,
  ],
})
export class ConnectionsComponent {
  activeTab: 'list' | 'requests' | 'search' = 'list'; // Default tab
}

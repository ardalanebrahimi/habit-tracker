import { Component, OnInit } from '@angular/core';
import { ConnectionsService } from '../../../services/connections.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connection-requests',
  templateUrl: './connection-requests.component.html',
  styleUrls: ['./connection-requests.component.scss'],
  imports: [CommonModule],
})
export class ConnectionRequestsComponent implements OnInit {
  incomingRequests: any[] = [];
  sentRequests: any[] = [];
  errorMessage: string | null = null;

  constructor(private connectionService: ConnectionsService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.connectionService.getIncomingRequests().subscribe({
      next: (requests) => (this.incomingRequests = requests),
      error: () => (this.errorMessage = 'Error loading incoming requests.'),
    });

    this.connectionService.getSentRequests().subscribe({
      next: (requests) => (this.sentRequests = requests),
      error: () => (this.errorMessage = 'Error loading sent requests.'),
    });
  }

  acceptRequest(id: string): void {
    this.connectionService.acceptRequest(id).subscribe(() => {
      this.incomingRequests = this.incomingRequests.filter((r) => r.id !== id);
    });
  }

  rejectRequest(id: string): void {
    this.connectionService.rejectRequest(id).subscribe(() => {
      this.incomingRequests = this.incomingRequests.filter((r) => r.id !== id);
    });
  }
}

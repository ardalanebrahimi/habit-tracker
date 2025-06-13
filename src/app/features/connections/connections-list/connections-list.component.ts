import { Component, OnInit } from '@angular/core';
import { ConnectionsService } from '../../../services/connections.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({  selector: 'app-connections-list',
  standalone: true,
  templateUrl: './connections-list.component.html',
  styleUrls: ['./connections-list.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class ConnectionsListComponent implements OnInit {
  connections: any[] = [];
  isLoading = true;

  constructor(private connectionsService: ConnectionsService) {}

  ngOnInit(): void {
    this.loadConnections();
  }

  loadConnections(): void {
    this.connectionsService.getConnections().subscribe({
      next: (data) => {
        this.connections = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}

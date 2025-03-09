import { Component, OnInit } from '@angular/core';
import { ConnectionsService } from '../../../services/connections.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
  imports: [CommonModule],
})
export class ConnectionsComponent implements OnInit {
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

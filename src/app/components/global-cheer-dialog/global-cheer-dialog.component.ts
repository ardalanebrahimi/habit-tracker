import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  CheerDialogService,
  CheerDialogState,
} from '../../services/cheer-dialog.service';
import { CheerDialogComponent } from '../cheer-dialog/cheer-dialog.component';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-global-cheer-dialog',
  standalone: true,
  imports: [CommonModule, CheerDialogComponent],
  template: `
    <app-cheer-dialog
      *ngIf="dialogState.isOpen && dialogState.habit"
      [habit]="dialogState.habit"
      [isVisible]="dialogState.isOpen"
      (dialogClosed)="onDialogClosed($event)"
    ></app-cheer-dialog>
  `,
  styles: [],
})
export class GlobalCheerDialogComponent implements OnInit, OnDestroy {
  dialogState: CheerDialogState = { isOpen: false, habit: null };
  private subscription?: Subscription;

  constructor(private cheerDialogService: CheerDialogService) {}

  ngOnInit(): void {
    this.subscription = this.cheerDialogService.dialogState$.subscribe(
      (state) => {
        this.dialogState = state;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onDialogClosed(result: { cheerSent?: boolean }): void {
    this.cheerDialogService.closeDialog(result);
  }
}

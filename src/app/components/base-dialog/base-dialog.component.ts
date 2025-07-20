import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ContentChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogConfig, DialogResult } from '../../services/dialog.service';

@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDialogComponent {
  @Input() isVisible = false;
  @Input() config: DialogConfig | null = null;
  @Input() showFooter = false;
  @Input() footerContent: any = null;
  @Output() dialogClosed = new EventEmitter<DialogResult>();

  onBackdropClick(): void {
    if (this.config?.closeOnBackdrop) {
      this.onClose();
    }
  }

  onClose(): void {
    this.dialogClosed.emit({ action: 'close' });
  }

  onCancel(): void {
    this.dialogClosed.emit({ action: 'cancel' });
  }

  onConfirm(data?: any): void {
    this.dialogClosed.emit({ action: 'confirm', data });
  }

  getDialogClasses(): string {
    const classes = ['dialog'];

    if (this.config?.size) {
      classes.push(`dialog-${this.config.size}`);
    }

    return classes.join(' ');
  }
}

import { Injectable, ComponentRef, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DialogConfig {
  id: string;
  title?: string;
  data?: any;
  backdrop?: boolean;
  closeOnBackdrop?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
  showCloseButton?: boolean;
}

export interface DialogState {
  isOpen: boolean;
  config: DialogConfig | null;
  componentType: Type<any> | null;
}

export interface DialogResult<T = any> {
  action: 'confirm' | 'cancel' | 'close' | string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogStateSubject = new BehaviorSubject<DialogState>({
    isOpen: false,
    config: null,
    componentType: null,
  });

  public dialogState$ = this.dialogStateSubject.asObservable();
  private resolvePromise: ((result: DialogResult) => void) | null = null;

  /**
   * Opens a dialog with the specified component and configuration
   * @param componentType The component type to render in the dialog
   * @param config Dialog configuration
   * @returns Promise that resolves when dialog is closed
   */
  openDialog<T = any>(
    componentType: Type<any>,
    config: Partial<DialogConfig> = {}
  ): Promise<DialogResult<T>> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;

      const dialogConfig: DialogConfig = {
        id: `dialog-${Date.now()}`,
        backdrop: true,
        closeOnBackdrop: true,
        size: 'medium',
        showCloseButton: true,
        ...config,
      };

      this.dialogStateSubject.next({
        isOpen: true,
        config: dialogConfig,
        componentType,
      });
    });
  }

  /**
   * Closes the currently open dialog
   */
  closeDialog<T = any>(result: DialogResult<T> = { action: 'close' }): void {
    this.dialogStateSubject.next({
      isOpen: false,
      config: null,
      componentType: null,
    });

    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
  }

  /**
   * Checks if a dialog is currently open
   */
  isDialogOpen(): boolean {
    return this.dialogStateSubject.value.isOpen;
  }

  /**
   * Gets the current dialog state
   */
  getCurrentState(): DialogState {
    return this.dialogStateSubject.value;
  }

  /**
   * Quick method to open confirmation dialog
   */
  confirm(
    title: string,
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ): Promise<DialogResult<boolean>> {
    // This would use a built-in confirmation component
    // For now, just returning a simple promise
    return Promise.resolve({ action: 'confirm', data: true });
  }
}

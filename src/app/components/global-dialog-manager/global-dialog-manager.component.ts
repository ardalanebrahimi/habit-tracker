import {
  Component,
  OnInit,
  OnDestroy,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
  Type,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  DialogService,
  DialogState,
  DialogResult,
} from '../../services/dialog.service';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';

@Component({
  selector: 'app-global-dialog-manager',
  standalone: true,
  imports: [CommonModule, BaseDialogComponent],
  templateUrl: './global-dialog-manager.component.html',
  styles: [],
})
export class GlobalDialogManagerComponent implements OnInit, OnDestroy {
  @ViewChild('dynamicContentContainer', { read: ViewContainerRef })
  dynamicContentContainer!: ViewContainerRef;

  dialogState: DialogState = {
    isOpen: false,
    config: null,
    componentType: null,
  };

  private subscription?: Subscription;
  private currentComponentRef?: ComponentRef<any>;

  constructor(
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.dialogService.dialogState$.subscribe((state) => {
      this.dialogState = state;

      if (state.isOpen && state.componentType) {
        // Use setTimeout to ensure ViewChild is ready
        setTimeout(() => this.createDynamicComponent(state.componentType!), 0);
      } else {
        this.clearDynamicComponent();
      }

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.clearDynamicComponent();
  }

  onDialogClosed(result: DialogResult): void {
    this.dialogService.closeDialog(result);
  }

  private createDynamicComponent(componentType: Type<any>): void {
    if (!this.dynamicContentContainer) {
      console.warn('Dynamic content container not ready');
      return;
    }

    // Clear any existing component
    this.clearDynamicComponent();

    try {
      // Create the new component
      this.currentComponentRef =
        this.dynamicContentContainer.createComponent(componentType);

      // Pass dialog data to the component if it accepts it
      if (this.dialogState.config?.data && this.currentComponentRef.instance) {
        // Check if component has data input
        if ('data' in this.currentComponentRef.instance) {
          this.currentComponentRef.instance.data = this.dialogState.config.data;
        }

        // Check if component has config input
        if ('config' in this.currentComponentRef.instance) {
          this.currentComponentRef.instance.config = this.dialogState.config;
        }

        // Listen for component events if it emits results
        if ('dialogResult' in this.currentComponentRef.instance) {
          this.currentComponentRef.instance.dialogResult.subscribe(
            (result: DialogResult) => {
              this.onDialogClosed(result);
            }
          );
        }
      }

      // Check if component provides footer content - removed since we're not using slot projection

      // Force change detection
      this.currentComponentRef.changeDetectorRef.detectChanges();

      console.log(
        'Dynamic component created successfully',
        this.currentComponentRef.instance
      );
    } catch (error) {
      console.error('Error creating dynamic component:', error);
    }

    this.cdr.detectChanges();
  }

  private clearDynamicComponent(): void {
    if (this.currentComponentRef) {
      this.currentComponentRef.destroy();
      this.currentComponentRef = undefined;
    }

    if (this.dynamicContentContainer) {
      this.dynamicContentContainer.clear();
    }
  }
}

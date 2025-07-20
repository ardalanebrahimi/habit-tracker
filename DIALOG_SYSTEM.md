# General Dialog System

This document explains the new general dialog system that replaces the specific cheer dialog implementation and provides a flexible foundation for all modal dialogs in the application.

## Architecture Overview

The dialog system consists of several components working together:

1. **DialogService** - Core service managing dialog state and lifecycle
2. **BaseDialogComponent** - Reusable dialog shell with common functionality
3. **GlobalDialogManagerComponent** - Single component managing all dialogs
4. **AppDialogService** - High-level service with pre-configured dialog methods
5. **Content Components** - Specific dialog content (CheerDialogContent, ShopDialogContent, etc.)

## Key Features

- ✅ **Reusable**: One system for all dialogs
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Promise-based**: Clean async/await API
- ✅ **Flexible**: Support for any content component
- ✅ **Accessible**: Built-in ARIA support
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Customizable**: Multiple sizes and configurations

## Quick Start

### 1. Basic Usage

```typescript
import { AppDialogService } from './services/app-dialog.service';

constructor(private appDialogService: AppDialogService) {}

// Open cheer dialog
async showCheer(habit: HabitWithProgressDTO) {
  const result = await this.appDialogService.openCheerDialog(habit);
  if (result.cheerSent) {
    console.log('Cheer sent!');
  }
}

// Open shop dialog
async showShop() {
  const result = await this.appDialogService.openShopDialog(items, userTokens);
  if (result.purchased) {
    console.log('Item purchased:', result.item);
  }
}

// Simple confirmation
async confirmAction() {
  const confirmed = await this.appDialogService.confirm(
    'Delete Item',
    'Are you sure you want to delete this item?'
  );
  if (confirmed) {
    // Proceed with deletion
  }
}
```

### 2. Global Setup

The `GlobalDialogManagerComponent` should be included once in your app:

```html
<!-- app.component.html -->
<app-global-dialog-manager></app-global-dialog-manager>
```

```typescript
// app.component.ts
import { GlobalDialogManagerComponent } from './components/global-dialog-manager/global-dialog-manager.component';

@Component({
  imports: [CommonModule, GlobalDialogManagerComponent],
  // ...
})
```

## Creating Custom Dialog Content

### 1. Create Content Component

```typescript
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { DialogConfig, DialogResult } from "../../services/dialog.service";

export interface MyDialogData {
  title: string;
  items: any[];
}

@Component({
  selector: "app-my-dialog-content",
  template: `
    <div class="my-dialog-content">
      <h3>{{ data?.title }}</h3>
      <!-- Your content here -->
    </div>

    <!-- Footer slot -->
    <div class="dialog-footer" slot="footer">
      <button (click)="onCancel()">Cancel</button>
      <button (click)="onConfirm()">Confirm</button>
    </div>
  `,
})
export class MyDialogContentComponent {
  @Input() data?: MyDialogData;
  @Input() config?: DialogConfig;
  @Output() dialogResult = new EventEmitter<DialogResult>();

  hasFooter = true; // Indicates this component provides footer content

  onCancel() {
    this.dialogResult.emit({ action: "cancel" });
  }

  onConfirm() {
    this.dialogResult.emit({
      action: "confirm",
      data: { success: true },
    });
  }
}
```

### 2. Use with DialogService

```typescript
import { DialogService } from './services/dialog.service';

async openMyDialog() {
  const result = await this.dialogService.openDialog(
    MyDialogContentComponent,
    {
      title: 'My Custom Dialog',
      data: { title: 'Hello', items: [] },
      size: 'large'
    }
  );

  console.log('Dialog result:', result);
}
```

## Available Dialog Sizes

- `small`: 320px max width
- `medium`: 420px max width (default)
- `large`: 600px max width
- `full`: 800px max width, 95% viewport height

## Dialog Configuration Options

```typescript
interface DialogConfig {
  id: string; // Auto-generated if not provided
  title?: string; // Dialog title
  data?: any; // Data passed to content component
  backdrop?: boolean; // Show backdrop (default: true)
  closeOnBackdrop?: boolean; // Close when clicking backdrop (default: true)
  size?: "small" | "medium" | "large" | "full"; // Dialog size (default: 'medium')
  showCloseButton?: boolean; // Show X button (default: true)
}
```

## Migration from CheerDialogService

### Before (Old System)

```typescript
import { CheerDialogService } from './services/cheer-dialog.service';

constructor(private cheerDialogService: CheerDialogService) {}

async openCheer(habit: HabitWithProgressDTO) {
  const result = await this.cheerDialogService.openCheerDialog(habit);
  // ...
}
```

### After (New System)

```typescript
import { AppDialogService } from './services/app-dialog.service';

constructor(private appDialogService: AppDialogService) {}

async openCheer(habit: HabitWithProgressDTO) {
  const result = await this.appDialogService.openCheerDialog(habit);
  // ...
}
```

## Best Practices

1. **Use AppDialogService for common dialogs** (cheer, shop, confirmations)
2. **Use DialogService directly for custom dialogs**
3. **Always handle dialog results** with try/catch
4. **Check if dialog is open** before performing conflicting actions
5. **Provide loading states** in dialog content when needed
6. **Use semantic HTML** and ARIA labels for accessibility

## File Structure

```
src/app/
├── services/
│   ├── dialog.service.ts              # Core dialog service
│   ├── app-dialog.service.ts          # High-level dialog methods
│   └── example-dialog-usage.service.ts # Usage examples
├── components/
│   ├── base-dialog/                   # Reusable dialog shell
│   ├── global-dialog-manager/         # Global dialog manager
│   ├── cheer-dialog-content/          # Cheer dialog content
│   └── shop-dialog-content/           # Shop dialog content
```

## Benefits Over Previous System

1. **Centralized**: All dialogs managed in one place
2. **Reusable**: Common dialog shell reduces duplication
3. **Maintainable**: Easier to add new dialog types
4. **Consistent**: Uniform styling and behavior
5. **Flexible**: Supports any content component
6. **Future-proof**: Easy to extend with new features

## Examples in the Codebase

- `ExampleDialogUsageService` - Shows various usage patterns
- `CheerDialogContentComponent` - Migrated cheer dialog
- `ShopDialogContentComponent` - New shop dialog example
- `CheerButtonComponent` - Updated to use new system

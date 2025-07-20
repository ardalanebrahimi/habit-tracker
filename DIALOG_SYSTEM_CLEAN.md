# Dialog System Architecture

## 📁 File Structure

```
src/app/
├── components/
│   ├── base-dialog/
│   │   ├── base-dialog.component.ts
│   │   └── base-dialog.component.scss
│   ├── cheer-dialog-content/
│   │   ├── cheer-dialog-content.component.ts
│   │   └── cheer-dialog-content.component.scss
│   └── global-dialog-manager/
│       └── global-dialog-manager.component.ts
├── services/
│   ├── dialog.service.ts
│   └── app-dialog.service.ts
└── features/
    └── notifications/
        ├── notifications.component.ts
        ├── notifications.component.html
        └── notifications.component.scss
```

## 🧩 Core Components

### 1. **DialogService**

Core service managing dialog lifecycle with Promise-based API.

### 2. **BaseDialogComponent**

Reusable dialog shell with:

- Backdrop with configurable click-to-close
- Header with title and close button
- Responsive sizing (small, medium, large, full)
- Accessibility features (ARIA, focus management)

### 3. **GlobalDialogManagerComponent**

Single component in app.component.html that:

- Listens to dialog state changes
- Dynamically creates content components
- Manages component lifecycle

### 4. **AppDialogService**

High-level service providing:

- `openCheerDialog(habit)` - Opens cheer dialog for habits
- `confirm(title, message)` - Simple confirmation dialogs
- `isDialogOpen()` - Check dialog state
- `closeDialog()` - Close current dialog

## 🎯 Usage Examples

### Cheer Dialog

```typescript
const result = await this.appDialogService.openCheerDialog(habit);
if (result.cheerSent) {
  // Handle success
}
```

### Confirmation Dialog

```typescript
const confirmed = await this.appDialogService.confirm("Delete Habit", "Are you sure?");
if (confirmed) {
  // Proceed with deletion
}
```

## ✅ Clean Up Completed

### Removed Components:

- ❌ `cheer-dialog/` (old implementation)
- ❌ `global-cheer-dialog/` (old implementation)
- ❌ `dialog-demo/` (demo component)
- ❌ `test-cheer-dialog/` (test component)
- ❌ `shop-dialog-content/` (demo component)
- ❌ `cheer-test/` (test feature)

### Removed Services:

- ❌ `cheer-dialog.service.ts` (old service)
- ❌ `example-cheer-usage.service.ts` (example service)
- ❌ `example-dialog-usage.service.ts` (example service)

### Properly Separated Files:

- ✅ `notifications.component.ts` (with separate .html and .scss)
- ✅ `base-dialog.component.ts` (with separate .scss)
- ✅ `cheer-dialog-content.component.ts` (with separate .scss)

## 🚀 Production Ready

The dialog system is now:

- ✅ Clean and minimal
- ✅ No duplicate code
- ✅ No test/demo components
- ✅ Properly separated concerns
- ✅ Type-safe and well-documented
- ✅ Ready for production use

## 🔄 Migration Path

Any existing code using the old `CheerDialogService` should be updated to use `AppDialogService`:

```typescript
// Old way ❌
this.cheerDialogService.openCheerDialog(habit);

// New way ✅
this.appDialogService.openCheerDialog(habit);
```

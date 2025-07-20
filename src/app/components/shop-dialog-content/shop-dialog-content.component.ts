import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogConfig, DialogResult } from '../../services/dialog.service';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'tokens' | 'usd';
  icon?: string;
  badge?: string;
  category?: string;
}

export interface ShopDialogData {
  items: ShopItem[];
  userTokens?: number;
  category?: string;
  title?: string;
}

@Component({
  selector: 'app-shop-dialog-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-dialog-content.component.html',
  styleUrls: ['./shop-dialog-content.component.scss'],
})
export class ShopDialogContentComponent implements OnInit {
  @Input() data?: ShopDialogData;
  @Input() config?: DialogConfig;
  @Output() dialogResult = new EventEmitter<DialogResult>();

  selectedItem?: ShopItem;
  hasFooter = true;

  ngOnInit(): void {
    // Component initialization
  }

  canAfford(item: ShopItem): boolean {
    if (item.currency === 'tokens' && this.data?.userTokens !== undefined) {
      return this.data.userTokens >= item.price;
    }
    // For USD purchases, we assume they can afford it (billing will handle validation)
    return true;
  }

  selectItem(item: ShopItem): void {
    if (this.canAfford(item)) {
      this.selectedItem = this.selectedItem?.id === item.id ? undefined : item;
    }
  }

  onCancel(): void {
    this.dialogResult.emit({ action: 'cancel' });
  }

  onPurchase(): void {
    if (this.selectedItem && this.canAfford(this.selectedItem)) {
      this.dialogResult.emit({
        action: 'confirm',
        data: {
          purchasedItem: this.selectedItem,
        },
      });
    }
  }
}

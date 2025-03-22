import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Share } from '@capacitor/share';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

@Component({
  selector: 'app-share-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="share-button" (click)="onClick()">Share Invite Link</button>
  `,
  styles: [
    `
      .share-button {
        background: #28a745;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        width: 100%;
        margin-top: 10px;

        &:hover {
          background: #218838;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareButtonComponent {
  @Input() share!: ShareData;

  async onClick() {
    try {
      await Share.share({
        title: this.share.title,
        text: this.share.text,
        url: this.share.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }
}

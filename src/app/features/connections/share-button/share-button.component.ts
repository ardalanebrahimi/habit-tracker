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
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.scss'],
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

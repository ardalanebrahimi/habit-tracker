import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = 0;
  public isLoading = new BehaviorSubject<boolean>(false); // Observable to track loading state

  showLoading(): void {
    this.activeRequests++;
    this.isLoading.next(true);
  }

  hideLoading(): void {
    this.activeRequests--;
    if (this.activeRequests === 0) {
      this.isLoading.next(false);
    }
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private navigationHistory: string[] = [];
  private lastBackPress = 0;
  private backPressThreshold = 500; // 500ms to prevent double back press

  constructor(private router: Router) {
    // Track navigation history
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      // Don't add the same URL consecutively
      if (
        this.navigationHistory[this.navigationHistory.length - 1] !== currentUrl
      ) {
        this.navigationHistory.push(currentUrl);
        // Keep only last 10 entries to prevent memory leaks
        if (this.navigationHistory.length > 10) {
          this.navigationHistory.shift();
        }
      }
    });
  }

  handleBackNavigation(): void {
    const now = Date.now();
    // Prevent rapid back button presses
    if (now - this.lastBackPress < this.backPressThreshold) {
      return;
    }
    this.lastBackPress = now;

    const currentUrl = this.router.url;

    // Define routes that should exit the app when back is pressed
    const exitRoutes = ['/today', '/login', '/register'];

    // Define routes with specific back navigation behavior
    const routeNavigationMap: { [key: string]: string } = {
      '/habits': '/today',
      '/explore': '/today',
      '/connections': '/today',
      '/notifications': '/today',
      '/myprofile': '/today',
      '/add-habit': '/today',
      '/stats': '/myprofile',
      '/archived-habits': '/myprofile',
    };

    // Handle specific route patterns
    if (currentUrl.startsWith('/habit/')) {
      this.router.navigate(['/habits']);
      return;
    }

    if (currentUrl.startsWith('/edit-habit/')) {
      this.router.navigate(['/habits']);
      return;
    }

    if (currentUrl.startsWith('/profile/')) {
      this.router.navigate(['/connections']);
      return;
    }

    // Check if current route should exit the app
    if (exitRoutes.includes(currentUrl)) {
      App.exitApp();
      return;
    }

    // Check if current route has a specific navigation target
    if (routeNavigationMap[currentUrl]) {
      this.router.navigate([routeNavigationMap[currentUrl]]);
      return;
    }

    // Try to use navigation history
    if (this.navigationHistory.length > 1) {
      // Remove current URL
      this.navigationHistory.pop();
      // Get previous URL
      const previousUrl = this.navigationHistory.pop();
      if (previousUrl && previousUrl !== currentUrl) {
        this.router.navigate([previousUrl]);
        return;
      }
    }

    // Default fallback - go to today
    this.router.navigate(['/today']);
  }

  // Method to manually add a route to history (useful for programmatic navigation)
  addToHistory(url: string): void {
    if (this.navigationHistory[this.navigationHistory.length - 1] !== url) {
      this.navigationHistory.push(url);
      if (this.navigationHistory.length > 10) {
        this.navigationHistory.shift();
      }
    }
  }

  // Method to clear navigation history (useful for login/logout)
  clearHistory(): void {
    this.navigationHistory = [];
  }
}

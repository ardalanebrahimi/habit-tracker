import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/interceptor/auth.interceptor';
import { LoadingInterceptor } from './app/interceptor/loading.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([AuthInterceptor, LoadingInterceptor])), // ✅ Correct way in Angular 19
    provideRouter(routes), // ✅ Correct way to provide routes
  ],
}).catch((err) => console.error(err));

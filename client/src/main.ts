import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS,provideHttpClient } from '@angular/common/http';
import { JwtInterceptor } from './app/_helpers/jwt.interceptor';
(window as any).process = {
  env: { 
    NODE_TLS_REJECT_UNAUTHORIZED: '0' 
  }
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
     {
       provide: HTTP_INTERCEPTORS,
       useClass: JwtInterceptor,
       multi: true
     },
        // other providers...
  ]
}).catch(err => console.error(err));

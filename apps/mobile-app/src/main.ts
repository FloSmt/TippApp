import {bootstrapApplication} from '@angular/platform-browser';
import {PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading,} from '@angular/router';
import {IonicRouteStrategy, provideIonicAngular,} from '@ionic/angular/standalone';
import {AppComponent, authHeaderInterceptor, errorHandlerInterceptor, routes} from '@tippapp/frontend/core';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {ENVIRONMENT} from '@tippapp/frontend/utils';
import {environment} from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideIonicAngular(),
    provideHttpClient(withInterceptors([authHeaderInterceptor, errorHandlerInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    {provide: ENVIRONMENT, useValue: environment},
  ],
});

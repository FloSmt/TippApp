import {Routes} from '@angular/router';
import {authGuard, publicAuthGuard} from "@tippapp/frontend/utils";

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@tippapp/frontend/shared-components').then(
        (m) => m.ThemeTestPageComponent
      ),
  },
  {
    path: 'auth',
    canActivate: [publicAuthGuard],
    loadChildren: () => import('@tippapp/frontend/auth').then((m) => m.routes)
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: "full"
  }
];

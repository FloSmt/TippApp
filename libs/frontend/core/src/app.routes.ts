import {Routes} from '@angular/router';
import {authGuard} from "@tippapp/utils";

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
    loadChildren: () => import('@tippapp/frontend/auth').then((m) => m.routes)
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: "full"
  }
];

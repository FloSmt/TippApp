import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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

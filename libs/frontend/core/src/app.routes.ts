import { Routes } from '@angular/router';
import { publicAuthGuard } from '@tippapp/frontend/utils';

export const routes: Routes = [
  {
    path: '',
    //canActivate: [authGuard],
    loadComponent: () =>
      import('@tippapp/frontend/tipgroup').then(
        (m) => m.TipgroupListPageComponent
      ),
  },
  {
    path: 'auth',
    canActivate: [publicAuthGuard],
    loadChildren: () => import('@tippapp/frontend/auth').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

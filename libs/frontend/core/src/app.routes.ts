import { Routes } from '@angular/router';
import { authGuard, publicAuthGuard } from '@tippapp/frontend/utils';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@tippapp/frontend/tipgroup').then((m) => m.TipgroupListPageComponent),
  },
  {
    path: 'auth',
    canActivate: [publicAuthGuard],
    loadChildren: () => import('@tippapp/frontend/auth').then((m) => m.routes),
  },
  {
    path: 'tipgroup/:tippgroupId',
    canActivate: [authGuard],
    loadChildren: () => import('@tippapp/frontend/tipgroup').then((m) => m.tabRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

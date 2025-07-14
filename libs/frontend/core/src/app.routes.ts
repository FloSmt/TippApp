import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@tippapp/frontend/shared-components').then((m) => m.ThemeTestPageComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@tippapp/frontend/auth').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@tippapp/frontend/auth').then((m) => m.RegisterPageComponent),
  },
];

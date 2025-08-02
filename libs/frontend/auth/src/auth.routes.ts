import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('../src/pages').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../src/pages').then((m) => m.LoginPageComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: "full"
  }
];

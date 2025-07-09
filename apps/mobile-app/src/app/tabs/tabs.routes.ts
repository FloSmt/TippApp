import { Routes } from '@angular/router';
import { TabsPageComponent } from './tabs-page.component';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPageComponent,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1-page.component').then(
            (m) => m.Tab1PageComponent
          ),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2-page.component').then(
            (m) => m.Tab2PageComponent
          ),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3-page.component').then(
            (m) => m.Tab3PageComponent
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];

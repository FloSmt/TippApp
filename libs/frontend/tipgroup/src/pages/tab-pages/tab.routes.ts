import { Routes } from '@angular/router';
import { TabPageComponent } from './tab.page.component';

export const tabRoutes: Routes = [
  {
    path: '',
    component: TabPageComponent,
    children: [
      {
        path: 'overview',
        children: [
          {
            path: '',
            loadComponent: () => import('./overview-page/overview.page.component').then((m) => m.OverviewPageComponent),
          },
          {
            path: '**',
            loadComponent: () => import('./overview-page/overview.page.component').then((m) => m.OverviewPageComponent),
          },
        ],
      },
      {
        path: 'tips',
        children: [
          {
            path: '',
            loadComponent: () => import('./tips-page/tips.page.component').then((m) => m.TipsPageComponent),
          },
          {
            path: '**',
            loadComponent: () => import('./tips-page/tips.page.component').then((m) => m.TipsPageComponent),
          },
        ],
      },
      {
        path: 'table',
        children: [
          {
            path: '',
            loadComponent: () => import('./table-page/table.page.component').then((m) => m.TablePageComponent),
          },
          {
            path: '**',
            loadComponent: () => import('./table-page/table.page.component').then((m) => m.TablePageComponent),
          },
        ],
      },

      {
        path: 'settings',
        children: [
          {
            path: '',
            loadComponent: () => import('./menu-page/menu.page.component').then((m) => m.MenuPageComponent),
          },
          {
            path: '**',
            loadComponent: () => import('./menu-page/menu.page.component').then((m) => m.MenuPageComponent),
          },
        ],
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
    ],
  },
];

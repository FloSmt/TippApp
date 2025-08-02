import {Routes} from '@angular/router';
import {authGuard} from "@tippapp/utils";
import {publicAuthGuard} from "../../shared/utils/src/auth/guards/public-auth.guard";

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

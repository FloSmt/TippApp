import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthStore} from "../store/auth.store";

export const publicAuthGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const authenticated = authStore.isAuthenticated();
  if (authenticated) {
    router.navigate(['/']);
    return false;

  } else {
    return true;
  }
};

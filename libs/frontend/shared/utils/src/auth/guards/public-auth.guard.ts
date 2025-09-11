import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthStore} from "../store/auth.store";
import {TokenStorageService} from "../token-storage.service";

export const publicAuthGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const tokenStorageService = inject(TokenStorageService);
  const router = inject(Router);

  const authenticated = authStore.isAuthenticated();
  if (authenticated) {
    router.navigate(['/']);
    return false;

  } else {

    return tokenStorageService.getRefreshToken().then((token) => {
      if (token) {
        router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    });
  }
};

import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {toObservable} from "@angular/core/rxjs-interop";
import {filter, map, takeUntil} from "rxjs";
import {AuthStore} from "../stores";

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    console.log('Login via AccessToken');
    return true;
  } else {
    console.log('Login via RefreshToken');
    authStore.refreshAccessToken();
    return toObservable(authStore.isLoading).pipe(
      filter((isLoading) => !isLoading),
      takeUntil(toObservable(authStore.isLoading).pipe(filter((isLoading) => !isLoading))),
      map(() => {
        const authenticated = authStore.isAuthenticated();
        if (authenticated) {
          return true;

        } else {
          router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  }
};

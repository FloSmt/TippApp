import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {toObservable} from "@angular/core/rxjs-interop";
import {filter, map, takeUntil} from "rxjs";
import {AuthStore} from "../../stores";

export const publicAuthGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  authStore.refreshAccessToken();
  return toObservable(authStore.isLoading).pipe(
    filter((isLoading) => !isLoading),
    takeUntil(toObservable(authStore.isLoading).pipe(filter((isLoading) => !isLoading))),
    map(() => {
      const authenticated = authStore.isAuthenticated();
      if (authenticated) {
        router.navigate(['/']);
        return false;

      } else {
        return true;
      }
    })
  );
};

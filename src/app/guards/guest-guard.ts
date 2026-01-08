import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, first, map } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const injector = inject(Injector);
  const router = inject(Router);

  return combineLatest([
    toObservable(authService.currentUser, { injector }),
    toObservable(authService.status, { injector }),
  ]).pipe(
    filter(([_, status]) => status === 'loaded'),
    map(([user]) => {
      if (user) {
        return router.createUrlTree(['/home']);
      }

      return true;
    }),
    first(),
  );
};

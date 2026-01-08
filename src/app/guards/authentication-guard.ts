import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, first, map, tap } from 'rxjs';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const injector = inject(Injector);

  return combineLatest([
    toObservable(authService.currentUser, { injector }),
    toObservable(authService.status, { injector }),
  ]).pipe(
    filter(([_, status]) => status === 'loaded'),
    map(([user]) => {
      if (user) {
        return true;
      }

      return createUrlTreeFromSnapshot(route, ['/'], { returnUrl: state.url });
    }),
    first(),
  );
};

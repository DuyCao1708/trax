import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.currentUser()) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['/'], { returnUrl: state.url });
};

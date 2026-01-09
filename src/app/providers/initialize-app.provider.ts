import { inject, makeEnvironmentProviders } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const appInitializerFn = () => {
  const authService = inject(AuthService);

  return authService.initializeAuth();
};

import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { InitializeAppService } from './services/initialize-app.service';

registerLocaleData(localeVi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIonicAngular({}),
    provideAppInitializer(async () => {
      await inject(InitializeAppService).initializeApp();
    }),
  ],
};

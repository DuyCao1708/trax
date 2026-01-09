import { Component, inject } from '@angular/core';
import { RefresherCustomEvent, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { PrivacyScreen } from '@capacitor/privacy-screen';
import { SyncService } from './services/sync.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  styles: [],
})
export class App {
  constructor() {
    addIcons(allIcons);
    PrivacyScreen.enable();
  }
}

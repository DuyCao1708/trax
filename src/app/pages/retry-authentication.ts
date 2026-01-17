import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { IonButton, IonHeader, IonContent, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'retry-authentication',
  imports: [IonButton, IonContent, IonIcon],
  template: `
    <ion-content>
      <div
        class="w-full h-full flex flex-col items-center justify-around bg-linear-to-t from-purple-600/15 to-transparent"
      >
        <ion-icon
          name="finger-print-outline"
          class="w-36 h-36"
          [style.--color]="'var(--ion-text-color)'"
        ></ion-icon>

        <div class="w-full px-8">
          <p class="text-4xl/12 font-medium text-wrap w-3/4">Protect your privacy</p>

          <p class="text-base/6">
            Please verify your biometrics to continue access or login to another account.
          </p>
        </div>

        <div class="w-full flex flex-col items-center gap-2 px-8">
          <ion-button expand="block" class="w-full" (click)="reinitAuth()"> Verify </ion-button>

          <ion-button expand="block" class="w-full" (click)="logout()">
            Login to another account
            <ion-icon slot="end" name="arrow-forward-outline"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
})
export class RetryAuthentication {
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  async reinitAuth() {
    await this._authService.initializeAuth();
    if (this._authService.currentUser()) {
      const returnUrl = this._route.snapshot.queryParamMap.get('redirectUrl') || '/home';

      await this._router.navigateByUrl(returnUrl);
    }
  }

  async logout() {
    await this._authService.logout();
  }
}

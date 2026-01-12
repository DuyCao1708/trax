import { Component, inject, Signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
  IonList,
  IonReorderGroup,
  IonItem,
  IonLabel,
  IonReorder,
  ReorderEndCustomEvent,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { WalletService } from '../services/wallet.service';
import { Wallet } from '../models/wallet';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'wallets-settings',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonBackButton,
    IonList,
    IonReorderGroup,
    IonItem,
    IonLabel,
    IonReorder,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    RouterLink,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>

        <ion-title>Wallets settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list lines="none">
        <ion-reorder-group [disabled]="false" (ionReorderEnd)="handleReorderEnd($any($event))">
          @for (wallet of wallets(); track wallet.id; let index = $index) {
            <ion-item
              class="not-last:border-b border-(--ion-text-color-step-800)"
              [routerLink]="['/wallet-form', wallet.id]"
            >
              <div class="w-6 h-6 rounded-sm mr-4" [class]="colors[index % colors.length]"></div>
              <ion-label> {{ wallet.name }} </ion-label>
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          }
        </ion-reorder-group>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/wallet-form">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class WalletsSettings {
  private _walletService = inject(WalletService);
  private _authService = inject(AuthService);

  wallets: Signal<Wallet[]> = this._walletService.wallets;

  get colors() {
    return this._walletService.walletColors;
  }

  handleReorderEnd(event: ReorderEndCustomEvent) {
    const user = this._authService.currentUser();

    if (!user) return;

    const currentWallets = [...this.wallets()];

    const movedItem = currentWallets.splice(event.detail.from, 1)[0];
    currentWallets.splice(event.detail.to, 0, movedItem);

    this._walletService.reorderWallets(currentWallets, user.uid);

    event.detail.complete();
  }
}

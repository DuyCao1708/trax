import { Component, inject, Signal } from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ModalController,
  IonButton,
} from '@ionic/angular/standalone';
import { WalletService } from '../services/wallet.service';
import { Wallet } from '../models/wallet';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'wallets-modal',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonList,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLabel,
    IonItem,
    IonButton,
    RouterLink,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>Wallet</ion-title>

        <ion-buttons slot="end">
          <ion-button routerLink="/wallets-settings" (click)="dismiss()">
            <ion-icon slot="icon-only" name="settings-sharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list lines="none">
        @for (wallet of wallets(); track wallet.id; let index = $index) {
          <ion-item
            class="not-last:border-b border-(--ion-text-color-step-800)"
            (click)="selectWallet(wallet)"
          >
            <div class="p-3 rounded-sm mr-4" [class]="colors[index % colors.length]"></div>
            <ion-label> {{ wallet.name }} </ion-label>
          </ion-item>
        }
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button
          (click)="dismiss()"
          routerLink="/wallet-form"
          [style.--border-radius]="'12px'"
          [style.--color]="'var(--color-white)'"
        >
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class WalletsModal {
  private _walletService = inject(WalletService);
  private _modalCtrl = inject(ModalController);

  wallets: Signal<Wallet[]> = this._walletService.wallets;

  get colors() {
    return this._walletService.walletColors.map((color) => `bg-${color}-500`);
  }

  async selectWallet(wallet: Wallet) {
    await this._modalCtrl.dismiss(wallet);
  }

  async dismiss() {
    await this._modalCtrl.dismiss();
  }
}

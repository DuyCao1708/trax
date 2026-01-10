import { Component, inject, Signal, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import { AuthService } from '../services/auth.service';
import { Wallet } from '../models/wallet';

@Component({
  selector: 'wallets',
  imports: [DecimalPipe, IonButton, IonIcon, RouterLink],
  template: `
    <div class="pb-4 px-4">
      <div class="flex justify-between items-center">
        <h6 class="mb-4 text-base">List of wallets</h6>

        <ion-button
          size="small"
          fill="outline"
          [style.--border-color]="'var(--ion-text-color-step-800)'"
          [style.--border-width]="'1px'"
          [style.--border-radius]="'8px'"
          routerLink="/wallets-settings"
          routerDirection="back"
        >
          <ion-icon slot="icon-only" ios="settings" md="settings-sharp"></ion-icon>
        </ion-button>
      </div>

      <div class="grid grid-cols-2 gap-1 mb-4">
        @for (wallet of wallets(); track wallet.id; let index = $index) {
          <div
            class="text-white text-sm font-medium rounded-sm px-2 py-1.5"
            [class]="
              isSelectedAll() || selected() === wallet.id
                ? colors[index % colors.length]
                : 'bg-gray-500'
            "
            (click)="isSelectedAll.set(false); selected.set(wallet.id)"
          >
            <p class="text-xs">{{ wallet.name }}</p>

            <p>{{ wallet.balance | number: '1.0-3' }}</p>
          </div>
        }

        <ion-button fill="outline" [routerLink]="['/wallet-form']" routerDirection="forward">
          <div class="flex items-center justify-between w-full">
            <span class="text-xs">Add wallet</span>
            <ion-icon name="add-circle" class="text-xl"></ion-icon>
          </div>
        </ion-button>
      </div>

      <div class="flex justify-center">
        <a class="text-xs underline font-medium" (click)="isSelectedAll.set(true)">Select all</a>
      </div>
    </div>
  `,
})
export class Wallets {
  private _walletService = inject(WalletService);
  private _authService = inject(AuthService);

  wallets: Signal<Wallet[]> = this._walletService.wallets;

  selected = signal<string>('1');

  isSelectedAll = signal<boolean>(false);

  get colors() {
    return this._walletService.walletColors;
  }

  async ngOnInit() {
    const user = this._authService.currentUser();

    if (!user) return;

    const wallets = await this._walletService.loadAll(user.uid);

    if (wallets.length) {
      this.selected.set(wallets[0].id);
    }
  }
}

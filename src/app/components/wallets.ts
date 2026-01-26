import { Component, effect, inject, output, Signal, signal, untracked } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import { Wallet } from '../models/wallet';
import { Preferences } from '@capacitor/preferences';
import { OPERATION_KEYS } from '../constants';

@Component({
  selector: 'wallets',
  imports: [DecimalPipe, IonButton, IonIcon, RouterLink],
  template: `
    <div class="flex justify-between items-center">
      <h6 class="mb-4 text-base">List of wallets</h6>

      <ion-button
        size="small"
        fill="outline"
        [style.--border-color]="'var(--ion-text-color-step-800)'"
        [style.--border-width]="'1px'"
        [style.--border-radius]="'8px'"
        routerLink="/wallets-settings"
      >
        <ion-icon slot="icon-only" ios="settings" md="settings-sharp"></ion-icon>
      </ion-button>
    </div>

    <div class="grid grid-cols-2 gap-1 mb-4">
      @for (wallet of wallets(); track wallet.id; let index = $index) {
        <div
          class="text-white text-sm font-medium rounded-sm px-2 py-1.5"
          [class]="
            selected().includes(wallet.id)
              ? backgroundColors[index % backgroundColors.length]
              : 'bg-gray-500'
          "
          (click)="selected.set([wallet.id])"
        >
          <div class="text-xs">{{ wallet.name }}</div>

          <div>{{ wallet.balance | number: '1.0-3' }}</div>
        </div>
      }

      <ion-button fill="outline" [routerLink]="['/wallet-form']">
        <div class="flex items-center justify-between w-full">
          <span class="text-xs">Add wallet</span>
          <ion-icon name="add-circle" class="text-xl"></ion-icon>
        </div>
      </ion-button>
    </div>

    <div class="flex justify-center">
      <a class="text-xs underline font-medium" (click)="selectAllWallets()">Select all</a>
    </div>
  `,
})
export class Wallets {
  private _walletService = inject(WalletService);

  walletsSelected = output<Wallet[]>();

  protected wallets: Signal<Wallet[]> = this._walletService.wallets;

  protected selected = signal<string[]>([]);

  get backgroundColors() {
    return this._walletService.walletColors.map((color) => `bg-${color}-500`);
  }

  constructor() {
    effect(() => {
      const wallets = this.wallets();

      if (wallets.length === 0) return;

      untracked(async () => {
        const current = this.selected();
        if (current.length === 0) {
          const { value } = await Preferences.get({ key: OPERATION_KEYS.SELECTED_WALLET });

          if (value) {
            this.selected.set(JSON.parse(value));
          } else {
            this.selected.set([wallets[0].id]);
          }
        }
      });
    });

    effect(() => {
      const selectedIds = this.selected();
      const wallets = this.wallets();

      if (selectedIds.length && wallets.length) {
        const selectedWallets = wallets.filter((wallet) => selectedIds.includes(wallet.id));

        this.walletsSelected.emit(selectedWallets);

        Preferences.set({
          key: OPERATION_KEYS.SELECTED_WALLET,
          value: JSON.stringify(selectedIds),
        });
      }
    });
  }

  selectAllWallets() {
    this.selected.set(this.wallets().map((wallet) => wallet.id));
  }
}

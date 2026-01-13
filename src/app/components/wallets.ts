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
            isSelectedAll() || selected() === wallet.id
              ? backgroundColors[index % backgroundColors.length]
              : 'bg-gray-500'
          "
          (click)="isSelectedAll.set(false); selected.set(wallet.id)"
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
      <a class="text-xs underline font-medium" (click)="isSelectedAll.set(true)">Select all</a>
    </div>
  `,
})
export class Wallets {
  private _walletService = inject(WalletService);

  walletSelected = output<string>();

  protected wallets: Signal<Wallet[]> = this._walletService.wallets;

  protected selected = signal<string>('');

  protected isSelectedAll = signal<boolean>(false);

  get backgroundColors() {
    return this._walletService.walletColors.map((color) => `bg-${color}-500`);
  }

  constructor() {
    effect(() => {
      const wallets = this.wallets();
      const currentSelected = untracked(() => this.selected());

      if (!currentSelected && wallets.length > 0) {
        this.selected.set(wallets[0].id);
      }
    });

    effect(() => {
      const selectedId = this.selected();

      if (selectedId !== '') {
        this.walletSelected.emit(selectedId);

        Preferences.set({
          key: OPERATION_KEYS.SELECTED_WALLET,
          value: selectedId,
        });
      }
    });
  }

  async ngOnInit() {
    const { value: selectedWalletId } = await Preferences.get({
      key: OPERATION_KEYS.SELECTED_WALLET,
    });

    if (selectedWalletId) {
      this.selected.set(selectedWalletId);
    }
  }
}

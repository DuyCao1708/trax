import { Component, signal } from '@angular/core';
import { Wallet } from '../models/wallet';
import { DecimalPipe } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'wallets',
  imports: [DecimalPipe, IonButton, IonIcon],
  template: `
    <div class="pb-4 px-4">
      <div class="flex justify-between items-center">
        <h6 class="mb-4 text-base">List of wallets</h6>

        <ion-button
          size="small"
          fill="outline"
          [style.--border-color]="'var(--color-gray-500)'"
          [style.--border-width]="'1px'"
          [style.--border-radius]="'8px'"
        >
          <ion-icon slot="icon-only" ios="settings" md="settings-sharp"></ion-icon>
        </ion-button>
      </div>

      <div class="grid grid-cols-2 gap-1 mb-4">
        @let bgColors =
          [
            'bg-teal-500',
            'bg-blue-500',
            'bg-amber-500',
            'bg-red-500',
            'bg-violet-500',
            'bg-pink-500',
            'bg-cyan-500',
            'bg-orange-500',
          ];
        @for (wallet of wallets(); track wallet.id; let index = $index) {
          <div
            class="text-white text-sm font-medium rounded-sm px-2 py-1.5"
            [class]="
              isSelectedAll() || selected() === wallet.id
                ? bgColors[index % bgColors.length]
                : 'bg-gray-500'
            "
            (click)="isSelectedAll.set(false); selected.set(wallet.id)"
          >
            <p class="text-xs">{{ wallet.name }}</p>

            <p>{{ wallet.balance | number: '1.0-3' }}</p>
          </div>
        }

        <ion-button fill="outline">
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
  wallets = signal<Wallet[]>([
    // {
    //   id: '1',
    //   name: 'Savings',
    //   balance: 95_000_000,
    // },
    // {
    //   id: '2',
    //   name: 'BIDV',
    //   balance: 95_000_000,
    // },
    // {
    //   id: '3',
    //   name: 'OCB',
    //   balance: 95_000_000,
    // },
    // {
    //   id: '4',
    //   name: 'MB',
    //   balance: 95_000_000,
    // },
    // {
    //   id: '5',
    //   name: 'VCP',
    //   balance: 95_000_000,
    // },
  ]);

  selected = signal<string>('1');

  isSelectedAll = signal<boolean>(false);
}

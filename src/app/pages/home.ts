import { Component, inject, signal } from '@angular/core';
import { Wallets } from '../components/wallets';
import { Header } from '../components/header';
import { IonContent, IonFab, IonFabButton, IonIcon, IonFabList } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { TransactionsOverview } from '../components/transactions-overview';
import { Wallet } from '../models/wallet';
import { ExpensesStructure } from '../components/expenses-structure';

@Component({
  selector: 'home',
  imports: [
    IonContent,
    Wallets,
    Header,
    IonFab,
    IonFabButton,
    IonIcon,
    RouterLink,
    IonFabList,
    TransactionsOverview,
    ExpensesStructure,
  ],
  template: `
    <header></header>

    <ion-content>
      <wallets
        class="block px-3 pb-4 border-b border-(--ion-text-color-step-800)"
        (walletsSelected)="selectedWallets.set($event)"
      ></wallets>

      <expenses-structure class="mt-2 mx-3" [fromWallets]="selectedWallets()"></expenses-structure>

      <transactions-overview
        class="mt-2 mx-3"
        [fromWallets]="selectedWallets()"
      ></transactions-overview>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button [style.--color]="'var(--color-white)'">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>

        <ion-fab-list side="top">
          @for (type of transactionTypes; track type.id) {
            <ion-fab-button
              [routerLink]="['/quick-transaction-form']"
              [queryParams]="{ type: type.id, walletId: selectedWallets()[0]?.id }"
              [attr.data-label]="type.name"
            >
              <ion-icon [name]="type.icon"></ion-icon>
            </ion-fab-button>
          }
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  `,
  styles: `
    ion-fab-button:not(:has(ion-fab-list.fab-list-active)) {
      --border-radius: 12px;
    }

    ion-fab-list ion-fab-button {
      position: relative;
      --color: var(--ion-color-dark);
    }

    ion-fab-list ion-fab-button:after {
      content: attr(data-label);
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateX(-100%) translateY(-50%);
      font-weight: 500;
    }
  `,
})
export class Home {
  private _transactionService = inject(TransactionService);

  protected readonly transactionTypes = this._transactionService.types;

  protected selectedWallets = signal<Wallet[]>([]);
}

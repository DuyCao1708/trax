import { Component, computed, inject } from '@angular/core';
import { IonList, IonItem } from '@ionic/angular/standalone';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'transactions-overview',
  imports: [IonList, IonItem],
  template: ` <h6 class="mt-3">Last transactions overview</h6>

    <ion-list>
      @for (item of transactions(); track $index) {
        <ion-item>
          {{ item.amount }}
        </ion-item>
      }
    </ion-list>`,
  host: {
    class:
      'block px-2 rounded-xl border border-(--ion-background-color-step-150) bg-(--ion-background-color-step-50)',
  },
})
export class TransactionsOverview {
  private _transactionService = inject(TransactionService);

  readonly transactions = computed(() => this._transactionService.transactions());
}

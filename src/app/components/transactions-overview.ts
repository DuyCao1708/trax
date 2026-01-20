import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import {
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonContent,
  IonThumbnail,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { TransactionService } from '../services/transaction.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TransactionType } from '../entities/transaction';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';
import { Wallet } from '../models/wallet';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { Transaction } from '../models/transaction';

@Component({
  selector: 'transactions-overview',
  imports: [
    IonList,
    IonItem,
    IonButton,
    IonIcon,
    IonLabel,
    DatePipe,
    DecimalPipe,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonThumbnail,
    IonSkeletonText,
  ],
  template: `
    <h6 class="mt-3 mx-4">Last transactions overview</h6>

    <div class="overflow-y-auto max-h-128 ion-content-scroll-host">
      <ion-list lines="full">
        @for (item of transactions(); track item.id) {
          <ion-item>
            <ion-button
              slot="start"
              shape="round"
              class="mr-4 w-9 h-9 my-2"
              [style.--background]="item.category?.color"
            >
              <ion-icon
                slot="icon-only"
                class="text-white text-xl"
                [name]="item.category?.icon"
              ></ion-icon>
            </ion-button>

            <ion-label>
              <span class="text-sm font-medium">{{ item.category?.name }}</span>

              <p class="text-sm">
                <span>{{ item.wallet?.name }}</span>

                @if (item.toWallet) {
                  <span> → {{ item.toWallet.name }}</span>
                }
              </p>
            </ion-label>

            <ion-label slot="end" class="text-end">
              <span
                class="text-sm font-medium"
                [class.text-red-500]="item.type === TransactionType.Expense"
                [class.text-emerald-500]="item.type === TransactionType.Income"
              >
                {{ item.type === TransactionType.Expense ? '-' : ''
                }}{{ item.amount | number: '1.0-3' }}
              </span>

              <p class="text-sm">{{ item.updatedAt | date: 'dd MMM' }}</p>
            </ion-label>
          </ion-item>
        } @empty {
          <ion-item>
            <ion-label class="w-full text-center text-sm! opacity-50"
              >No transactions available yet.</ion-label
            >
          </ion-item>
        }
      </ion-list>

      <ion-infinite-scroll [disabled]="false" (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content loadingSpinner="none" class="*:last:hidden!">
          <ion-list lines="none">
            <ion-item>
              <ion-thumbnail slot="start">
                <ion-skeleton-text [animated]="true"></ion-skeleton-text>
              </ion-thumbnail>
              <ion-label>
                <h3>
                  <ion-skeleton-text [animated]="true" style="width: 80%;"></ion-skeleton-text>
                </h3>
                <p>
                  <ion-skeleton-text [animated]="true" style="width: 60%;"></ion-skeleton-text>
                </p>
                <p>
                  <ion-skeleton-text [animated]="true" style="width: 30%;"></ion-skeleton-text>
                </p>
              </ion-label> </ion-item
          ></ion-list>
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </div>
  `,
  host: {
    class:
      'block rounded-xl border border-(--ion-background-color-step-150) bg-(--ion-background-color-step-50)',
  },
  styles: `
    ion-skeleton-text {
      --border-radius: 9999px;
    }

    .infinite-loading {
      display: none;
    }
  `,
})
export class TransactionsOverview {
  private _transactionService = inject(TransactionService);
  private _authService = inject(AuthService);

  fromWallets = input.required<Wallet[]>();

  TransactionType = TransactionType;

  protected transactions = signal<Transaction[]>([]);

  protected status = signal<LoadingStatus>('idle');

  constructor() {
    effect(() => {
      const ids = this.fromWallets().map((w) => w.id);
      if (ids.length > 0) {
        untracked(() => {
          this._transactionService.filters.update((f) => ({
            ...f,
            walletIds: ids,
            pageIndex: 0,
          }));
        });
      }
    });
  }

  async loadMore(event: any) {
    this._transactionService.filters.update((filters) => ({
      ...filters,
      pageIndex: (filters.pageIndex || 0) + 1,
    }));

    event.target.complete();
  }
}

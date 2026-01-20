import { Component, computed, effect, inject, input, signal } from '@angular/core';
import {
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonThumbnail,
  IonSkeletonText,
  IonListHeader,
  IonModal,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { TransactionLoadOptions, TransactionService } from '../services/transaction.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TransactionType } from '../entities/transaction';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';
import { Wallet } from '../models/wallet';
import { Transaction, TransactionMapper } from '../models/transaction';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { CategoryService } from '../services/category.service';
import { FormsModule } from '@angular/forms';

type ScrollEvent = {
  target: {
    complete: () => Promise<void>;
    disabled: boolean;
    position: 'top' | 'bottom';
    threshold: string;
  };
};

type Period = 'today' | 'week' | 'month' | 'year';

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
    IonListHeader,
    IonModal,
    IonSelect,
    IonSelectOption,
    FormsModule,
  ],
  template: `
    <ion-list-header class="my-2">
      <ion-label>
        <span class="text-base font-medium ">Last transactions overview</span>

        <p class="text-sm">
          {{ applyingOptions().period.label }}
        </p>
      </ion-label>
      <ion-button
        id="open-options-modal"
        shape="round"
        [style.--color]="'var(--ion-text-color-step-300)'"
      >
        <ion-icon slot="icon-only" name="ellipsis-vertical"></ion-icon>
      </ion-button>
    </ion-list-header>

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

      <ion-infinite-scroll [disabled]="!hasMore()" (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content loadingSpinner="none" class="*:last:hidden!">
          <ion-list lines="none">
            <ion-item [style.--border-radius]="'9999px'">
              <ion-thumbnail slot="start" [style.--border-radius]="'9999px'">
                <ion-skeleton-text [animated]="true"></ion-skeleton-text>
              </ion-thumbnail>
              <ion-label>
                <h3>
                  <ion-skeleton-text [animated]="true"></ion-skeleton-text>
                </h3>
                <p>
                  <ion-skeleton-text [animated]="true" style="width: 75%;"></ion-skeleton-text>
                </p>
                <p>
                  <ion-skeleton-text [animated]="true" style="width: 50%;"></ion-skeleton-text>
                </p>
              </ion-label> </ion-item
          ></ion-list>
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </div>

    <ion-modal
      trigger="open-options-modal"
      #optionsModal
      [style.--width]="'240px'"
      [style.--height]="'fit-content'"
      [style.--border-radius]="'8px'"
      [style.--backdrop-opacity]="'0.3'"
    >
      <ng-template>
        <ion-list lines="none">
          <ion-list-header class="text-lg mt-2" [style.--ion-safe-area-left]="'16px'">
            <ion-label>Overview options</ion-label>
          </ion-list-header>

          <div class="px-4 mb-2">
            <ion-select
              label="Select period"
              fill="solid"
              label-placement="floating"
              interface="popover"
              [(ngModel)]="processingOptions.period"
            >
              @for (period of periods; track period.value) {
                <ion-select-option [value]="period">{{ period.label }}</ion-select-option>
              }
            </ion-select>
          </div>

          <div class="px-4">
            <ion-select
              label="Categories"
              fill="solid"
              label-placement="floating"
              [multiple]="true"
              [(ngModel)]="processingOptions.categoryIds"
            >
              @for (cat of categories(); track cat.id) {
                <ion-select-option [value]="cat.id">{{ cat.name }}</ion-select-option>
              }
            </ion-select>
          </div>

          <ion-item class="mt-4">
            <div class="flex justify-end items-center gap-2 w-full">
              <ion-button fill="clear" (click)="optionsModal.dismiss()">Cancel</ion-button>
              <ion-button fill="clear" (click)="saveOptions(); optionsModal.dismiss()"
                >Confirm</ion-button
              >
            </div>
          </ion-item>
        </ion-list>
      </ng-template>
    </ion-modal>
  `,
  host: {
    class:
      'block overflow-hidden rounded-xl border border-(--ion-background-color-step-150) bg-(--ion-background-color-step-50)',
  },
})
export class TransactionsOverview {
  private _transactionService = inject(TransactionService);
  private _authService = inject(AuthService);

  fromWallets = input.required<Wallet[]>();
  TransactionType = TransactionType;
  protected periods = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This year', value: 'year' },
  ];

  protected transactions = signal<Transaction[]>([]);
  protected hasMore = signal(true);
  protected categories = inject(CategoryService).categories;

  protected processingOptions = {
    period: this.periods[2],
    categoryIds: [] as string[],
  };

  protected applyingOptions = signal({ ...this.processingOptions, pageIndex: 0 });

  private _queryOptions = computed<TransactionLoadOptions>(() => {
    const filters = this.applyingOptions();
    const range = this.getPeriodRange(filters.period.value);

    return {
      pageIndex: filters.pageIndex,
      pageSize: 10,
      walletIds: this.fromWallets().map((wallet) => wallet.id),
      categoryIds: filters.categoryIds,
      startAt: range?.startAt,
      endAt: range?.endAt,
    };
  });

  private _status: LoadingStatus = 'idle';

  constructor() {
    let previousOptionsToken = '';

    // effect(async () => {
    //   const wallets = this.fromWallets();

    //   if (!wallets.length) return;

    //   this._options.walletIds = this.fromWallets().map((wallet) => wallet.id);
    //   this._options.pageIndex = 0;

    //   const currentOptionsToken = JSON.stringify(this._options);

    //   if (currentOptionsToken == previousOptionsToken) return;

    //   previousOptionsToken = currentOptionsToken;

    //   const transactions = await this.getTransactions();

    //   this.transactions.set(transactions);
    // });
  }

  async getTransactions() {
    const user = this._authService.currentUser();

    if (!user) return this.transactions();

    if (this._status === 'loading') return this.transactions();

    const options = this._queryOptions();

    const transactions = await this._transactionService.load(user.uid, options);

    this.hasMore.set(transactions.length >= options.pageSize);

    this._status = 'loaded';

    return transactions.map(TransactionMapper.toModel);
  }

  async loadMore(event: ScrollEvent) {
    this.applyingOptions.set({
      ...this.applyingOptions(),
      pageIndex: this.applyingOptions().pageIndex++,
    });

    const transactions = await this.getTransactions();

    this.transactions.update((list) => [...list, ...transactions]);

    await event.target.complete();
  }

  async saveOptions() {
    this.applyingOptions.set({
      ...this.processingOptions,
      pageIndex: 0,
    });

    const transactions = await this.getTransactions();

    this.transactions.set(transactions);
  }

  private getPeriodRange(type: string) {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        return null;
    }

    return {
      startAt: start.getTime(),
      endAt: end.getTime(),
    };
  }
}

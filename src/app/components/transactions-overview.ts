import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
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
  IonDatetime,
  NavController,
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
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { CategoryService } from '../services/category.service';
import { FormsModule } from '@angular/forms';
import { from, range, Subscription } from 'rxjs';
import { Period } from '../models';

type ScrollEvent = {
  target: {
    complete: () => Promise<void>;
    disabled: boolean;
    position: 'top' | 'bottom';
    threshold: string;
  };
};

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
    IonDatetime,
  ],
  template: `
    <ion-list-header class="my-2">
      <ion-label>
        <span class="text-base font-medium ">Last transactions overview</span>

        <p class="text-sm">
          @if (applyingOptions().period.value === 'custom') {
            {{ applyingOptions().customRange!.startAt | date: 'dd MMM' }} -
            {{ applyingOptions().customRange!.endAt | date: 'dd MMM' }}
          } @else {
            {{ applyingOptions().period.label }}
          }
        </p>
      </ion-label>
      <ion-button
        shape="round"
        [style.--color]="'var(--ion-text-color-step-300)'"
        (click)="optionsModal.present()"
      >
        <ion-icon slot="icon-only" name="ellipsis-vertical"></ion-icon>
      </ion-button>
    </ion-list-header>

    <div class="overflow-y-auto max-h-128 ion-content-scroll-host">
      <ion-list lines="full">
        @for (item of transactions(); track item.id) {
          <ion-item (click)="openTransactionForm(item)">
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
              class="custom-input"
              label="Select period"
              fill="solid"
              label-placement="floating"
              interface="popover"
              [(ngModel)]="processingOptions.period"
              (ionChange)="handlePeriodChange($event)"
            >
              @for (period of periods; track period.value) {
                <ion-select-option [value]="period">{{ period.label }}</ion-select-option>
              }
            </ion-select>

            <ion-modal
              #datePickerModal
              [style.--width]="'fit-content'"
              [style.--height]="'fit-content'"
              [style.--border-radius]="'8px'"
              [style.--backdrop-opacity]="'0.3'"
            >
              <ng-template>
                <ion-datetime
                  class="pt-2"
                  presentation="date"
                  [multiple]="true"
                  (ionChange)="selectDateRange($event)"
                ></ion-datetime>
              </ng-template>
            </ion-modal>
          </div>

          <div class="px-4">
            <ion-select
              class="custom-input"
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
              <ion-button
                fill="clear"
                (click)="dismissOptionsModal(optionsModal, { saveOptions: false })"
                >Cancel</ion-button
              >
              <ion-button
                fill="clear"
                (click)="dismissOptionsModal(optionsModal, { saveOptions: true })"
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
  private _navCtrl = inject(NavController);
  private _datePickerModal = viewChild<IonModal>('datePickerModal');
  private _cdr = inject(ChangeDetectorRef);

  fromWallets = input.required<Wallet[]>();
  TransactionType = TransactionType;
  protected periods: Period[] = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This year', value: 'year' },
    { label: 'Custom', value: 'custom' },
  ];

  protected transactions = signal<Transaction[]>([]);
  protected hasMore = signal(true);
  protected categories = inject(CategoryService).categories;

  protected processingOptions: {
    period: Period;
    categoryIds: string[];
    previousPeriod?: Period;
    customRange?: { startAt: number; endAt: number };
  } = {
    period: this.periods[2],
    previousPeriod: this.periods[2],
    categoryIds: [],
  };

  protected applyingOptions = signal({ ...this.processingOptions });

  private _queryOptions = computed<TransactionLoadOptions>(() => {
    const filters = this.applyingOptions();
    const range =
      filters.period.value === 'custom'
        ? filters.customRange
        : this.getPeriodRange(filters.period.value);

    return {
      pageIndex: 0,
      pageSize: 10,
      walletIds: this.fromWallets().map((wallet) => wallet.id),
      categoryIds: filters.categoryIds,
      ...range,
    };
  });

  private _fetchSubscription?: Subscription;

  constructor() {
    this.setupLoadByWallets();
  }

  async loadMore(event: ScrollEvent) {
    this.fetchTransactions();
    await event.target.complete();
  }

  async handlePeriodChange(event: { detail: { value: Period } }) {
    const selected = event.detail.value;

    if (selected?.value === 'custom') {
      await this._datePickerModal()?.present();

      const result = await this._datePickerModal()?.onDidDismiss();
      const rangeData = result?.data;

      if (rangeData) {
        this.processingOptions.customRange = rangeData;
      } else if (this.processingOptions.previousPeriod) {
        this.processingOptions.period = this.processingOptions.previousPeriod;
        this._cdr.detectChanges();
      }
    } else {
      this.processingOptions.previousPeriod = selected;
    }
  }

  async openTransactionForm(transaction: Transaction) {
    await this._navCtrl.navigateForward('/transaction-form', {
      state: {
        initialData: {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          category_id: transaction.category?.id,
          wallet_id: transaction.wallet?.id,
          to_wallet_id: transaction.toWallet?.id,
          note: transaction.note,
          counter_party: transaction.counterParty,
        },
        isEditting: true,
      },
    });
  }

  selectDateRange(event: { detail: { value?: string[] | string | null | undefined } }) {
    const dates = event.detail.value;
    if (Array.isArray(dates) && dates.length >= 2) {
      const sorted = [...dates].sort();

      const range = {
        startAt: startOfDay(new Date(sorted[0])).getTime(),
        endAt: endOfDay(new Date(sorted[sorted.length - 1])).getTime(),
      };

      this._datePickerModal()?.dismiss(range);
    }
  }

  async dismissOptionsModal(modal: IonModal, { saveOptions }: { saveOptions: boolean }) {
    await modal.dismiss();

    if (saveOptions) {
      this.applyingOptions.set({
        period: this.processingOptions.period,
        customRange: this.processingOptions.customRange,
        categoryIds: [...this.processingOptions.categoryIds],
      });

      this.fetchTransactions({ reset: true });
    } else {
      this.processingOptions.categoryIds = this.applyingOptions().categoryIds;
      this.processingOptions.period = this.applyingOptions().period;
      this.processingOptions.previousPeriod = this.applyingOptions().period;
      this.processingOptions.customRange = undefined;
    }
  }

  //#region Private methods
  private fetchTransactions({ reset }: { reset: boolean } = { reset: false }) {
    if (reset === false && !this.hasMore()) return;

    const user = this._authService.currentUser();

    if (!user) throw Error('No user found while fetching transactions');

    const options = { ...this._queryOptions() };

    if (!options.walletIds?.length) throw Error('No wallets found while fetching transactions');

    if (reset) {
      options.pageIndex = 0;
    } else {
      options.pageIndex++;
    }

    this._fetchSubscription?.unsubscribe();
    this._fetchSubscription = from(this._transactionService.fetch(user.uid, options)).subscribe({
      next: (entities) => {
        const models = entities.map(TransactionMapper.toModel);

        if (reset) {
          this.transactions.set(models);
        } else {
          this.transactions.update((list) => [...list, ...models]);
        }

        this.hasMore.set(models.length >= options.pageSize);
      },
    });
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

  private setupLoadByWallets() {
    effect(async () => {
      const wallets = this.fromWallets();

      if (!wallets.length) return;

      this.fetchTransactions({ reset: true });
    });
  }
  //#endregion
}

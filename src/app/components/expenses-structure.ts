import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Wallet } from '../models/wallet';
import {
  IonListHeader,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonList,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonItem,
} from '@ionic/angular/standalone';
import { TransactionLoadOptions, TransactionService } from '../services/transaction.service';
import { AuthService } from '../services/auth.service';
import { Period } from '../models';
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
import { from, Subscription } from 'rxjs';
import { Transaction, TransactionMapper } from '../models/transaction';
import { DatePipe, DecimalPipe } from '@angular/common';
import { EChartsOption, EChartsType } from 'echarts';
import * as echarts from 'echarts';
import { TransactionType } from '../entities/transaction';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'expenses-structure',
  imports: [
    IonListHeader,
    IonLabel,
    IonButton,
    IonIcon,
    DatePipe,
    DecimalPipe,
    IonModal,
    IonList,
    IonSelect,
    FormsModule,
    IonSelectOption,
    IonDatetime,
    IonItem,
  ],
  template: `
    <ion-list-header class="my-2">
      <ion-label>
        <span class="text-base font-medium ">Expenses structures</span>

        <p class="text-sm">
          @if (applyingDataOptions().period.value === 'custom') {
            {{ applyingDataOptions().customRange!.startAt | date: 'dd MMM' }} -
            {{ applyingDataOptions().customRange!.endAt | date: 'dd MMM' }}
          } @else {
            {{ applyingDataOptions().period.label }}
          }
        </p>
      </ion-label>
      <ion-button
        (click)="optionsModal.present()"
        shape="round"
        [style.--color]="'var(--ion-text-color-step-300)'"
      >
        <ion-icon slot="icon-only" name="ellipsis-vertical"></ion-icon>
      </ion-button>
    </ion-list-header>

    <h4 class="mx-4 mt-0">
      {{ totalExpenses() | number: '1.0-3' }}
    </h4>

    <div class="relative h-96 w-full px-2 pb-2">
      <div #chart class="h-full w-full"></div>

      @if (!transactions().length) {
        <div class="absolute inset-0 grid place-content-center">
          <p class="text-center text-sm! opacity-50">No expenses available yet.</p>
        </div>
      }
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
              [(ngModel)]="processingDataOptions.period"
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
export class ExpensesStructure {
  private _transactionService = inject(TransactionService);
  private _authService = inject(AuthService);
  private _datePickerModal = viewChild<IonModal>('datePickerModal');
  private _cdr = inject(ChangeDetectorRef);
  private _chartElementRef = viewChild.required<ElementRef<HTMLDivElement>>('chart');

  fromWallets = input.required<Wallet[]>();
  protected periods: Period[] = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This year', value: 'year' },
    { label: 'Custom', value: 'custom' },
  ];

  protected transactions = signal<Transaction[]>([]);

  protected totalExpenses = computed(() =>
    this.transactions().reduce((total, transaction) => (total += transaction.amount), 0),
  );

  private _chart = signal<EChartsType | null>(null);
  private _chartOptions = computed<EChartsOption>(() => {
    const transactions = this.transactions();
    const bodyStyle = getComputedStyle(document.body);

    const categoryMap = transactions.reduce(
      (result, transaction) => {
        const colorVar = transaction.category!.color!;

        const color = this.oklchToRgb(
          bodyStyle.getPropertyValue(colorVar.replace(/^var\(|\)$/g, '')),
        );

        const categoryName = transaction.category!.name!;

        if (!result[categoryName]) {
          result[categoryName] = {
            name: categoryName,
            value: 0,
            itemStyle: { color },
          };
        }

        result[categoryName].value += transaction.amount;

        return result;
      },
      {} as Record<string, { name: string; value: number; itemStyle: any }>,
    );

    const chartData = Object.values(categoryMap).sort((a, b) => b.value - a.value);

    return {
      darkMode: true,
      tooltip: {
        trigger: 'item',
        confine: true,
      },
      legend: {
        bottom: '0',
        left: 'center',
        type: 'scroll',
        textStyle: { color: '#c3c5d8' },
        pageIconColor: '#c3c5d8',
        pageTextStyle: {
          color: '#c3c5d8',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          stillShowZeroSum: false,
          showEmptyCircle: false,
          data: chartData,
          label: {
            show: false,
          },
        },
      ],
    };
  });

  protected processingDataOptions: {
    period: Period;
    previousPeriod?: Period;
    customRange?: { startAt: number; endAt: number };
  } = {
    period: this.periods[2],
    previousPeriod: this.periods[2],
  };

  protected applyingDataOptions = signal({ ...this.processingDataOptions });

  private _queryOptions = computed<TransactionLoadOptions>(() => {
    const filters = this.applyingDataOptions();
    const range =
      filters.period.value === 'custom'
        ? filters.customRange
        : this.getPeriodRange(filters.period.value);

    return {
      pageIndex: 0,
      pageSize: 99999,
      type: TransactionType.Expense,
      walletIds: this.fromWallets().map((wallet) => wallet.id),
      ...range,
    };
  });

  private _fetchSubscription?: Subscription;

  private _resizeObserver?: ResizeObserver;

  constructor() {
    this.setupLoadByWallets();

    effect(() => {
      this._chart()?.setOption(this._chartOptions(), true);
    });
  }

  ngAfterViewInit() {
    this._chart.set(echarts.init(this._chartElementRef().nativeElement));

    this._resizeObserver = new ResizeObserver(() => {
      this._chart()?.resize();
    });

    this._resizeObserver.observe(this._chartElementRef().nativeElement);
  }

  async handlePeriodChange(event: { detail: { value: Period } }) {
    const selected = event.detail.value;

    if (selected?.value === 'custom') {
      await this._datePickerModal()?.present();

      const result = await this._datePickerModal()?.onDidDismiss();
      const rangeData = result?.data;

      if (rangeData) {
        this.processingDataOptions.customRange = rangeData;
      } else if (this.processingDataOptions.previousPeriod) {
        this.processingDataOptions.period = this.processingDataOptions.previousPeriod;
        this._cdr.detectChanges();
      }
    } else {
      this.processingDataOptions.previousPeriod = selected;
    }
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
      this.applyingDataOptions.set({
        period: this.processingDataOptions.period,
        customRange: this.processingDataOptions.customRange,
      });

      this.fetchTransactions();
    } else {
      this.processingDataOptions.period = this.applyingDataOptions().period;
      this.processingDataOptions.previousPeriod = this.applyingDataOptions().period;
      this.processingDataOptions.customRange = undefined;
    }
  }

  //#region Private methods
  private fetchTransactions() {
    const user = this._authService.currentUser();

    if (!user) throw Error('No user found while fetching transactions');

    const options = { ...this._queryOptions() };

    if (!options.walletIds?.length) throw Error('No wallets found while fetching transactions');

    this._fetchSubscription?.unsubscribe();
    this._fetchSubscription = from(this._transactionService.fetch(user.uid, options)).subscribe({
      next: (entities) => {
        const models = entities.map(TransactionMapper.toModel);

        this.transactions.set(models);
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

      this.fetchTransactions();
    });
  }

  private oklchToRgb(oklchStr: string): string {
    const matches = oklchStr.match(/([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/);
    if (!matches) return oklchStr;

    let l = parseFloat(matches[1]) / (oklchStr.includes('%') ? 100 : 1);
    let c = parseFloat(matches[2]);
    let h = parseFloat(matches[3]) * (Math.PI / 180);

    let a = c * Math.cos(h);
    let b = c * Math.sin(h);

    let l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    let m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    let s_ = l - 0.0894841775 * a - 1.291485548 * b;

    l_ = Math.pow(Math.max(0, l_), 3);
    m_ = Math.pow(Math.max(0, m_), 3);
    s_ = Math.pow(Math.max(0, s_), 3);

    let r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    let b_ = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

    const f = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

    return `rgb(${Math.round(f(r) * 255)}, ${Math.round(f(g) * 255)}, ${Math.round(f(b_) * 255)})`;
  }
  //#endregion

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._chart()?.dispose();
  }
}

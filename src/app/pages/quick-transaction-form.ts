import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonProgressBar,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  ModalController,
} from '@ionic/angular/standalone';
import { LoadingStatus } from '../models/loading-status';
import { TransactionType } from '../entities/transaction';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { NumPad } from '../components/num-pad';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from '../services/wallet.service';
import { WalletSelections } from '../components/wallet-selections';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'quick-transaction-form',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    IonProgressBar,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    ReactiveFormsModule,
    NumPad,
    DecimalPipe,
  ],
  template: `
    <ion-header class="border-b-0">
      <ion-toolbar [style.--ion-toolbar-background]="'var(--quick-transaction-form-color-primary)'">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home" icon="close-outline"></ion-back-button>
        </ion-buttons>

        <ion-buttons slot="end">
          <ion-button (click)="(null)">
            <ion-icon slot="icon-only" name="checkmark-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      @if (status() === 'loading') {
        <ion-progress-bar type="indeterminate"></ion-progress-bar>
      }
    </ion-header>

    <ion-content>
      <form [formGroup]="formGroup" class="flex flex-col h-full">
        <ion-segment
          formControlName="type"
          class="border-b border-(--quick-transaction-form-color-primary)"
          [style.--border-color]="'var(--quick-transaction-form-color-primary)'"
          [style.--background]="'var(--quick-transaction-form-color-secondary)'"
          [style.--ripple-color]="'transparent'"
        >
          @for (type of transactionTypes; track type.id) {
            <ion-segment-button
              [value]="type.id"
              [style.--color]="'var(--color-white)'"
              [style.--color-checked]="'var(--color-white)'"
              [style.--background-checked]="'var(--quick-transaction-form-color-primary)'"
            >
              <ion-label class="uppercase">{{ type.name }}</ion-label>
            </ion-segment-button>
          }
        </ion-segment>

        <div class="flex-1 flex flex-col bg-(--quick-transaction-form-color-secondary)">
          <section class="flex-1 grid grid-cols-[auto_1fr_auto] items-center px-4">
            <span class="text-[32px] font-black pe-4">
              {{ amountPrefix() }}
            </span>

            <span
              class="text-end font-light"
              [style.font-size]="
                'clamp(16px, calc((100vw - 150px) / ' +
                (displayAmount().length || 1) * 0.6 +
                '), 80px)'
              "
            >
              @if (displayAmount().endsWith('.')) {
                {{ displayAmount() | number: '1.0-0' }},
              } @else {
                {{ displayAmount() | number: '1.0-3' }}
              }
            </span>

            <span class="text-[32px] font-light ps-10">
              {{ walletData().currency || '' }}
            </span>
          </section>

          <section
            class="grid grid-cols-2 *:text-center *:*:first:opacity-75 *:*:first:text-sm *:*:first:-mb-3! *:*:last:font-medium"
          >
            <div (click)="openWalletSelectionModal()">
              <p>Wallet</p>
              <p>{{ walletData().name || '' }}</p>
            </div>

            <div>
              <p>Category</p>
              <p>TRANSPORTATION</p>
            </div>
          </section>
        </div>

        <num-pad (displayChange)="setDisplayAmount($event)"></num-pad>
      </form>
    </ion-content>
  `,
  host: {
    '[style.--quick-transaction-form-color-primary]': '"var(--color-" + walletColor() + "-500)"',
    '[style.--quick-transaction-form-color-secondary]': '"var(--color-" + walletColor() + "-400)"',
  },
})
export class QuickTransactionForm {
  private _transactionService = inject(TransactionService);
  private _walletService = inject(WalletService);
  private _modalCtrl = inject(ModalController);

  protected readonly transactionTypes = this._transactionService.types;

  protected status = signal<LoadingStatus>('idle');

  protected formGroup = new FormBuilder().nonNullable.group({
    type: TransactionType.Expense,
    amount: [0, [Validators.required, Validators.min(0)]],
    categoryId: '',
    walletId: '',
  });

  private _formGroupValue = toSignal(this.formGroup.valueChanges, {
    initialValue: this.formGroup.getRawValue(),
  });

  protected amountPrefix = computed(() => ['+', '-', ''][this._formGroupValue().type ?? 1]);

  protected displayAmount = signal<string>('0');

  private _walletIndex = computed(() =>
    this._walletService
      .wallets()
      .findIndex((wallet) => wallet.id === this._formGroupValue().walletId),
  );

  protected walletColor = computed(() => this._walletService.walletColors[this._walletIndex()]);

  protected walletData = linkedSignal(() => this._walletService.wallets()[this._walletIndex()]);

  constructor() {
    const { type, walletId } = inject(ActivatedRoute).snapshot.queryParams;

    this.formGroup.controls.type.setValue(Number(type) ?? TransactionType.Expense);
    this.formGroup.controls.walletId.setValue(walletId);
  }

  async openWalletSelectionModal() {
    const modal = await this._modalCtrl.create({
      component: WalletSelections,
    });

    await modal.present();

    const { data: selectedWalletId } = await modal.onWillDismiss();

    if (selectedWalletId) {
      this.formGroup.controls.walletId.setValue(selectedWalletId);
    }
  }

  setDisplayAmount(value: string) {
    this.displayAmount.set(parseFloat(value).toFixed(2));
  }
}

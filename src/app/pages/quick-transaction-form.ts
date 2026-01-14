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
  ToastController,
} from '@ionic/angular/standalone';
import { LoadingStatus } from '../models/loading-status';
import { TransactionType } from '../entities/transaction';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { NumPad } from '../components/num-pad';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from '../services/wallet.service';
import { WalletsModal } from '../components/wallets-modal';
import { DecimalPipe } from '@angular/common';
import { CategoriesModal } from '../components/categories-modal';
import { Wallet } from '../models/wallet';
import { Category } from '../models/category';
import { CategoryService } from '../services/category.service';

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
          <ion-back-button
            defaultHref="/home"
            icon="close-outline"
            [style.--color]="'var(--color-white)'"
          ></ion-back-button>
        </ion-buttons>

        <ion-buttons slot="end">
          <ion-button (click)="save()" [style.--color]="'var(--color-white)'">
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

        <div class="flex-1 flex flex-col bg-(--quick-transaction-form-color-secondary) text-white">
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
              {{ walletData()?.currency || '' }}
            </span>
          </section>

          <section
            class="grid grid-cols-2 *:text-center *:*:first:opacity-75 *:*:first:text-sm *:*:first:-mb-3! *:*:last:font-medium"
          >
            <div (click)="openWalletSelectionModal()">
              <p>Wallet</p>
              <p class="uppercase">{{ walletData()?.name || '' }}</p>
            </div>

            <div (click)="openCategorySelectionModal()">
              <p>Category</p>
              <p class="uppercase">{{ categoryData()?.name || '' }}</p>
            </div>
          </section>
        </div>

        <num-pad
          (displayChange)="setDisplayAmount($event)"
          (valueChange)="formGroup.controls.amount.setValue($event)"
        ></num-pad>
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
  private _categoryService = inject(CategoryService);
  private _modalCtrl = inject(ModalController);
  private _toastCtrl = inject(ToastController);

  protected readonly transactionTypes = this._transactionService.types;

  protected status = signal<LoadingStatus>('idle');

  protected formGroup = new FormBuilder().nonNullable.group({
    type: TransactionType.Expense,
    amount: [0, [Validators.min(0.01)]],
    categoryId: ['', [Validators.required]],
    walletId: ['', [Validators.required]],
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

  protected walletData = linkedSignal<Wallet | undefined>(
    () => this._walletService.wallets()[this._walletIndex()],
  );

  protected categoryData = linkedSignal<Category | undefined>(() => {
    const cat = this._categoryService
      .categories()
      .flatMap((cat) => [cat, ...(cat.subCategories || [])])
      .find((cat) => cat.id === this._formGroupValue().categoryId);

    return cat;
  });

  constructor() {
    const { type, walletId } = inject(ActivatedRoute).snapshot.queryParams;

    this.formGroup.controls.type.setValue(Number(type) ?? TransactionType.Expense);
    this.formGroup.controls.walletId.setValue(walletId);

    const lastUsedCategory = this._categoryService.frequentCategories()[0];

    if (lastUsedCategory) {
      this.formGroup.controls.categoryId.setValue(lastUsedCategory.id);
    }
  }

  async openWalletSelectionModal() {
    const modal = await this._modalCtrl.create({
      component: WalletsModal,
    });

    await modal.present();

    const { data: selectedWallet } = await modal.onWillDismiss();

    if (selectedWallet) {
      this.formGroup.controls.walletId.setValue(selectedWallet.id);
    }
  }

  async openCategorySelectionModal() {
    const modal = await this._modalCtrl.create({
      component: CategoriesModal,
    });

    await modal.present();

    const { data: selectedCategory } = await modal.onWillDismiss();

    if (selectedCategory) {
      this.formGroup.controls.categoryId.setValue(selectedCategory.id);
    }
  }

  setDisplayAmount(value: string) {
    const roundedValue = Math.max(parseFloat(value), 0).toFixed(2);
    this.displayAmount.set(roundedValue);
  }

  setAmount(value: number) {
    this.formGroup.controls.amount.setValue(Math.max(0, value));
  }

  save() {
    if (this.formGroup.invalid) return this.toastIfInvalid();

    console.log(this.formGroup.getRawValue());
  }

  private toastIfInvalid() {
    const errorMessages = [];

    const {
      amount: amountControl,
      categoryId: categoryControl,
      walletId: walletControl,
    } = this.formGroup.controls;

    if (amountControl.invalid) {
      errorMessages.push('Please fill out amount field');
    }

    if (categoryControl.invalid) {
      errorMessages.push('Please fill out category field');
    }

    if (walletControl.invalid) {
      errorMessages.push('Please fill out wallet field');
    }

    errorMessages.forEach((message) => this.showToast(message, 'danger'));

    return;
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this._toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }
}

import { Component, computed, inject, signal } from '@angular/core';
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
  NavController,
} from '@ionic/angular/standalone';
import { LoadingStatus } from '../models/loading-status';
import { TransactionType } from '../entities/transaction';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { NumPad } from '../components/num-pad';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from '../services/wallet.service';
import { WalletsModal } from '../components/wallets-modal';
import { DecimalPipe } from '@angular/common';
import { CategoriesModal } from '../components/categories-modal';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';

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
          <section class="flex-1 grid grid-cols-[auto_1fr_auto_20px] gap-4 items-center ps-4">
            <span class="text-[32px] font-black pe-4">
              {{ view().prefix }}
            </span>

            <span
              class="text-end font-light"
              [style.font-size]="
                'clamp(16px, calc((100vw - 200px) / ' +
                (displayAmount().length || 1) * 0.6 +
                '), 80px)'
              "
            >
              @if (displayAmount().endsWith('.')) {
                {{ displayAmount() | number: '1.0-0' }}.
              } @else {
                {{ displayAmount() | number: '1.0-3' }}
              }
            </span>

            <span class="text-[32px] font-light ps-4">
              {{ view().wallet?.currency || '' }}
            </span>

            <button
              class="h-20 bg-white rounded-l-full shadow"
              (click)="openTransactionDetailForm()"
            >
              <ion-icon name="chevron-back" class="text-neutral-600"></ion-icon>
            </button>
          </section>

          <section
            class="grid grid-cols-2 *:text-center *:*:first:opacity-75 *:*:first:text-sm *:*:first:-mb-3! *:*:last:font-medium"
          >
            <div (click)="openWalletSelectionModalFor('wallet_id')">
              <p>Wallet</p>
              <p class="uppercase">{{ view().wallet?.name || '' }}</p>
            </div>

            @if (view().isTransfer) {
              <div (click)="openWalletSelectionModalFor('to_wallet_id')">
                <p>To wallet</p>
                <p class="uppercase text-nowrap truncate">{{ view().toWallet?.name || '' }}</p>
              </div>
            } @else {
              <div (click)="openCategorySelectionModal()">
                <p>Category</p>
                <p class="uppercase text-nowrap truncate">{{ view().category?.name }}</p>
              </div>
            }
          </section>
        </div>

        <num-pad
          (displayChange)="setDisplayAmount($event)"
          (valueChange)="setAmount($event)"
        ></num-pad>
      </form>
    </ion-content>
  `,
  host: {
    '[style.--quick-transaction-form-color-primary]': '"var(--color-" + view().color + "-500)"',
    '[style.--quick-transaction-form-color-secondary]': '"var(--color-" + view().color + "-400)"',
  },
})
export class QuickTransactionForm {
  private _transactionService = inject(TransactionService);
  private _walletService = inject(WalletService);
  private _categoryService = inject(CategoryService);
  private _authService = inject(AuthService);
  private _modalCtrl = inject(ModalController);
  private _toastCtrl = inject(ToastController);
  private _navCtrl = inject(NavController);

  protected readonly transactionTypes = this._transactionService.types;

  protected status = signal<LoadingStatus>('idle');

  protected formGroup = new FormBuilder().nonNullable.group(
    {
      type: TransactionType.Expense,
      amount: [0, [Validators.min(0.01)]],
      category_id: '',
      wallet_id: ['', [Validators.required]],
      to_wallet_id: '',
    },
    {
      validators: [this.transactionValidator],
    },
  );

  private _formGroupValue = toSignal(this.formGroup.valueChanges, {
    initialValue: this.formGroup.getRawValue(),
  });

  protected view = computed(() => {
    const formValue = this._formGroupValue();
    const wallets = this._walletService.wallets();
    const allCats = this._categoryService
      .categories()
      .flatMap((c) => [c, ...(c.subCategories || [])]);

    return {
      isTransfer: formValue.type === TransactionType.Transfer,
      prefix: ['+', '-', ''][formValue.type ?? 1],
      wallet: wallets.find((w) => w.id === formValue.wallet_id),
      toWallet: wallets.find((w) => w.id === formValue.to_wallet_id),
      category: allCats.find((c) => c.id === formValue.category_id),
      color:
        this._walletService.walletColors[wallets.findIndex((w) => w.id === formValue.wallet_id)],
    };
  });

  protected displayAmount = signal<string>('0');

  constructor() {
    const { type, walletId } = inject(ActivatedRoute).snapshot.queryParams;

    this.formGroup.controls.type.setValue(Number(type) ?? TransactionType.Expense);
    this.formGroup.controls.wallet_id.setValue(walletId);

    const lastUsedCategory = this._categoryService.frequentCategories()[0];

    if (lastUsedCategory) {
      this.formGroup.controls.category_id.setValue(lastUsedCategory.id);
    }
  }

  async openTransactionDetailForm() {
    await this._navCtrl.navigateForward('/transaction-form', {
      state: { initialData: this._formGroupValue(), isEditting: false },
    });
  }

  async openWalletSelectionModalFor(field: 'wallet_id' | 'to_wallet_id') {
    const modal = await this._modalCtrl.create({
      component: WalletsModal,
      componentProps: {
        title: field === 'wallet_id' ? 'Wallet' : 'To wallet',
        excludeId: field === 'to_wallet_id' ? this._formGroupValue().wallet_id : undefined,
      },
    });

    await modal.present();

    const { data: selectedWallet } = await modal.onWillDismiss();

    if (selectedWallet) {
      this.formGroup.get(field)?.setValue(selectedWallet.id);
    }
  }

  async openCategorySelectionModal() {
    const modal = await this._modalCtrl.create({
      component: CategoriesModal,
    });

    await modal.present();

    const { data: selectedCategory } = await modal.onWillDismiss();

    if (selectedCategory) {
      this.formGroup.controls.category_id.setValue(selectedCategory.id);
    }
  }

  setDisplayAmount(value: string) {
    if (value.endsWith('.') || (value.includes('.') && value.endsWith('0'))) {
      this.displayAmount.set(value);
      return;
    }

    const num = Math.max(parseFloat(value) || 0, 0);

    const formattedValue = Number(num.toFixed(2)).toString();

    this.displayAmount.set(formattedValue);
  }

  setAmount(value: number) {
    this.formGroup.controls.amount.setValue(Math.max(0, value));
  }

  async save() {
    if (this.formGroup.invalid) return this.toastIfInvalid();

    try {
      const user = this._authService.currentUser();
      if (!user) throw new Error('User not found');

      const formValue = this.formGroup.getRawValue();

      const isTransfer = formValue.type === TransactionType.Transfer;
      const data = {
        ...formValue,
        category_id: isTransfer ? undefined : formValue.category_id,
        to_wallet_id: isTransfer ? formValue.to_wallet_id : undefined,
      };

      this.status.set('loading');

      await this._transactionService.create(data, user.uid);

      if (data.category_id) {
        this._categoryService.addToFrequent(data.category_id, user.uid);
      }

      this.showToast('New transaction has been created');

      this._navCtrl.back();
    } catch (error) {
      console.error('Error when saving transaction:', error);
      this.status.set('idle');

      this.showToast(`Failed to create new transaction. Please try again: ${error}`, 'danger');
    } finally {
      this.status.set('loaded');
    }
  }

  private async toastIfInvalid() {
    const errorMessages = [];

    const { amount: amountControl, wallet_id: walletControl } = this.formGroup.controls;

    if (amountControl.invalid) {
      errorMessages.push('Please fill out amount field');
    }

    if (walletControl.invalid) {
      errorMessages.push('Please fill out wallet field');
    }

    if (this.formGroup.hasError('categoryRequired')) {
      errorMessages.push('Please fill out category field');
    }

    if (this.formGroup.hasError('toWalletRequired')) {
      errorMessages.push('Please fill out to wallet field');
    }

    errorMessages.forEach(async (message) => await this.showToast(message, 'danger'));

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

  private transactionValidator(control: AbstractControl) {
    const type = control.get('type')?.value;
    const categoryId = control.get('category_id')?.value;
    const toWalletId = control.get('to_wallet_id')?.value;

    if ([TransactionType.Income, TransactionType.Expense].includes(type) && !categoryId) {
      return { categoryRequired: true };
    }

    if (type === TransactionType.Transfer && !toWalletId) {
      return { toWalletRequired: true };
    }

    return null;
  }
}

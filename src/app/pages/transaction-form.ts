import { Component, computed, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonContent,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  ModalController,
  IonInput,
  IonTextarea,
  ToastController,
  NavController,
  AlertController,
} from '@ionic/angular/standalone';
import { LoadingStatus } from '../models/loading-status';
import { Router } from '@angular/router';
import { TransactionType } from '../entities/transaction';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { CategoryService } from '../services/category.service';
import { CategoriesModal } from '../components/categories-modal';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletsModal } from '../components/wallets-modal';
import { WalletService } from '../services/wallet.service';
import { AuthService } from '../services/auth.service';

type InitialFormValue = {
  id?: string;
  type: TransactionType;
  amount: number;
  category_id?: string;
  wallet_id?: string;
  to_wallet_id?: string;
};

@Component({
  selector: 'transaction-form',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonContent,
    ReactiveFormsModule,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home" icon="close-outline"></ion-back-button>
        </ion-buttons>

        <ion-title>{{ title }}</ion-title>

        <ion-buttons slot="end">
          @if (isEditing) {
            <ion-button (click)="askForDelete()">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-button>
          }

          <ion-button (click)="save()">
            <ion-icon slot="icon-only" name="checkmark-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      @if (status() === 'loading') {
        <ion-progress-bar type="indeterminate"></ion-progress-bar>
      }
    </ion-header>

    <ion-content>
      <form [formGroup]="formGroup">
        <ion-list lines="none" class="pb-4! *:mb-2">
          <div class="px-4">
            <ion-select
              class="custom-input"
              label="Type"
              fill="solid"
              label-placement="floating"
              formControlName="type"
            >
              @for (type of view().types; track type.id) {
                <ion-select-option [value]="type.id">{{ type.name }}</ion-select-option>
              }
            </ion-select>
          </div>

          @if (view().isTransfer) {
            <ion-item class="relative">
              <ion-input
                class="custom-input"
                label="From wallet"
                label-placement="floating"
                fill="solid"
                readonly
                [value]="view().selectedWalletName"
              ></ion-input>

              <button
                class="absolute inset-0 z-10 bg-transparent"
                (click)="openWalletSelectionModalFor('wallet_id')"
              ></button>
            </ion-item>

            <ion-item class="relative">
              <ion-input
                class="custom-input"
                label="To wallet"
                label-placement="floating"
                fill="solid"
                readonly
                [value]="view().selectedToWalletName"
              ></ion-input>

              <button
                class="absolute inset-0 z-10 bg-transparent"
                (click)="openWalletSelectionModalFor('to_wallet_id')"
              ></button>
            </ion-item>
          } @else {
            <ion-item class="relative">
              <ion-input
                class="custom-input"
                label="Category"
                label-placement="floating"
                fill="solid"
                readonly
                [value]="view().selectedCategoryName"
              ></ion-input>
              <button
                class="absolute inset-0 z-10 bg-transparent"
                (click)="openCategorySelectionModal()"
              ></button>
            </ion-item>
          }

          <ion-item>
            <ion-input
              class="custom-input"
              formControlName="amount"
              label="Amount"
              label-placement="floating"
              fill="solid"
              type="number"
              inputmode="decimal"
              placeholder="0"
            >
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              class="custom-input"
              formControlName="counter_party"
              label="Counter party"
              label-placement="floating"
              fill="solid"
            >
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-textarea
              class="custom-input"
              formControlName="note"
              label="Note"
              [autoGrow]="true"
              label-placement="floating"
              fill="solid"
            >
            </ion-textarea>
          </ion-item>
        </ion-list>
      </form>
    </ion-content>
  `,
})
export class TransactionForm {
  private _transactionService = inject(TransactionService);
  private _categoryService = inject(CategoryService);
  private _walletService = inject(WalletService);
  private _authService = inject(AuthService);
  private _modalCtrl = inject(ModalController);
  private _toastCtrl = inject(ToastController);
  private _navCtrl = inject(NavController);
  private _alertCtrl = inject(AlertController);

  protected status = signal<LoadingStatus>('idle');

  private _initialData?: InitialFormValue;

  get isEditing() {
    return !!this._initialData;
  }

  get title() {
    return this.isEditing ? 'Edit transaction' : 'New transaction';
  }

  protected formGroup = new FormBuilder().nonNullable.group(
    {
      type: TransactionType.Expense,
      amount: [0, [Validators.min(0.01)]],
      category_id: '',
      wallet_id: ['', [Validators.required]],
      to_wallet_id: '',
      counter_party: '',
      note: '',
    },
    {
      validators: [this.transactionValidator],
    },
  );

  private _formGroupValue = toSignal(this.formGroup.valueChanges, {
    initialValue: this.formGroup.getRawValue(),
  });

  protected view = computed(() => ({
    types: this._transactionService.types,
    selectedCategoryName: this._categoryService
      .categories()
      .find((cat) => cat.id === this._formGroupValue().category_id)?.name,
    selectedWalletName: this._walletService
      .wallets()
      .find((wallet) => wallet.id === this._formGroupValue().wallet_id)?.name,
    selectedToWalletName: this._walletService
      .wallets()
      .find((wallet) => wallet.id === this._formGroupValue().to_wallet_id)?.name,
    isTransfer: this._formGroupValue().type === TransactionType.Transfer,
  }));

  constructor() {
    const currentNavigation = inject(Router).currentNavigation();

    const initialData = currentNavigation?.extras.state?.['initialData'];
    const isEditing = currentNavigation?.extras.state?.['isEditting'];

    if (isEditing) this._initialData = initialData;

    if (initialData) {
      this.patchFormValue(initialData);
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

  async askForDelete() {
    if (!this.isEditing) return;

    const alert = await this._alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            this.executeDelete();
          },
        },
      ],
    });

    await alert.present();
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

      if (this.isEditing) {
        await this._transactionService.update(this._initialData!.id!, data, user.uid);
        this.showToast('Transaction has been updated');
      } else {
        await this._transactionService.create(data, user.uid);
        this.showToast('New Transaction has been created');

        if (data.category_id) {
          this._categoryService.addToFrequent(data.category_id, user.uid);
        }
      }

      this._navCtrl.navigateBack('/home');
    } catch (error) {
      console.error('Error when saving transaction:', error);
      this.status.set('idle');

      this.showToast(`Failed to create new transaction. Please try again: ${error}`, 'danger');
    } finally {
      this.status.set('loaded');
    }
  }

  //#region Private methods
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

  private patchFormValue(value: InitialFormValue) {
    this.formGroup.patchValue(value);
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

  private async executeDelete() {
    this.status.set('loading');
    try {
      const user = this._authService.currentUser();
      if (!user) return;

      await this._transactionService.delete(this._initialData!.id!, user.uid);

      this._navCtrl.back();
      this.showToast('Transaction has been deleted successfully');
    } catch (error) {
      this.showToast('Failed to delete transaction. Please try again.', 'danger');
    } finally {
      this.status.set('loaded');
    }
  }
  //#endregion
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  NavController,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonNote,
  IonProgressBar,
  ToastController,
  IonBackButton,
  AlertController,
} from '@ionic/angular/standalone';
import { WalletService } from '../services/wallet.service';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'wallet-form',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    ReactiveFormsModule,
    IonList,
    IonItem,
    IonInput,
    IonNote,
    IonProgressBar,
    IonBackButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home" icon="close-outline"></ion-back-button>
        </ion-buttons>

        <ion-title>{{ title }}</ion-title>

        <ion-buttons slot="end">
          <ion-button (click)="askForDelete()">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>

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
          <ion-item class="mb-0!">
            <ion-input
              class="custom-input"
              formControlName="name"
              label="Wallet name"
              label-placement="stacked"
              type="text"
              placeholder="Cash, BIDV, OCB..."
              helperText="Should be your short bank name"
              fill="solid"
            >
            </ion-input>
          </ion-item>

          @if (formGroup.get('name')?.touched && formGroup.get('name')?.hasError('required')) {
            <ion-note color="danger" class="p-8">Wallet name is required</ion-note>
          }

          <ion-item>
            <ion-input
              class="custom-input"
              formControlName="balance"
              label="Initial value"
              label-placement="stacked"
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
              formControlName="currency"
              fill="solid"
              label="Currency"
              label-placement="stacked"
              type="text"
            >
            </ion-input>
          </ion-item>
        </ion-list>
      </form>
    </ion-content>
  `,
})
export class WalletForm {
  private _navCtrl = inject(NavController);
  private _walletService = inject(WalletService);
  private _authService = inject(AuthService);
  private _toastCtrl = inject(ToastController);
  private _alertCtrl = inject(AlertController);

  protected formGroup = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    balance: [0, [Validators.required, Validators.min(0)]],
    currency: ['VND', [Validators.required]],
  });

  protected status = signal<LoadingStatus>('idle');

  private readonly _walletId: string | null;

  get isEditing() {
    return !!this._walletId;
  }

  get title() {
    return this.isEditing ? 'Edit wallet' : 'New wallet';
  }

  constructor() {
    this._walletId = inject(ActivatedRoute).snapshot.paramMap.get('id');

    if (this._walletId) {
      this.loadWalletData(this._walletId);

      this.formGroup.controls.balance.disable();
    }
  }

  async save() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.status.set('loading');
    const formValue = this.formGroup.getRawValue();

    try {
      const user = this._authService.currentUser();
      if (!user) throw new Error('User not found');

      const data = {
        name: formValue.name,
        balance: Number(formValue.balance),
        currency: formValue.currency!,
      };

      if (this.isEditing && this._walletId) {
        await this._walletService.update(this._walletId, data, user.uid);
        this.showToast('Wallet has been updated');
      } else {
        await this._walletService.create(data, user.uid);
        this.showToast('New wallet has been created');
      }

      this._navCtrl.back();
    } catch (error) {
      console.error('Error when saving wallet:', error);
      this.status.set('idle');

      this.showToast(`Failed to create new wallet. Please try again: ${error}`, 'danger');
    } finally {
      this.status.set('loaded');
    }
  }

  async askForDelete() {
    if (!this._walletId) return;

    const alert = await this._alertCtrl.create({
      header: 'Confirm Delete',
      message:
        'Are you sure you want to delete this wallet? All related transactions will be affected.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
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

  //#region Private methods
  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this._toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }

  private loadWalletData(id: string) {
    const wallet = this._walletService.wallets().find((wallet) => wallet.id === id);

    if (wallet) {
      this.formGroup.setValue({
        name: wallet.name,
        currency: wallet.currency,
        balance: wallet.balance,
      });
    }
  }

  private async executeDelete() {
    this.status.set('loading');
    try {
      const user = this._authService.currentUser();
      if (!user) return;

      await this._walletService.delete(this._walletId!, user.uid);

      this._navCtrl.back();
      this.showToast('Wallet has been deleted successfully');
    } catch (error) {
      this.showToast('Failed to delete wallet. Please try again.', 'danger');
    } finally {
      this.status.set('loaded');
    }
  }
  //#endregion
}

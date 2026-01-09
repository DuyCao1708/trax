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
} from '@ionic/angular/standalone';
import { WalletService } from '../services/wallet.service';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';

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
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="cancel()" color="medium">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>New wallet</ion-title>

        <ion-buttons slot="end">
          <ion-button (click)="save()" color="primary">
            <ion-icon slot="icon-only" name="checkmark-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      @if (status() === 'loading') {
        <ion-progress-bar type="indeterminate"></ion-progress-bar>
      }
    </ion-header>

    <ion-content>
      <form [formGroup]="walletForm">
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

          @if (walletForm.get('name')?.touched && walletForm.get('name')?.hasError('required')) {
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
  styles: `
    .custom-input {
      margin-top: 8px;

      --highlight-color-focused: var(--ion-color-primary);
      --highlight-color-valid: var(--ion-color-primary);
    }

    .custom-input.has-focus {
      --background: var(--ion-color-step-50) !important;
    }
  `,
})
export class WalletForm {
  private _navCtrl = inject(NavController);
  private _walletService = inject(WalletService);
  private _authService = inject(AuthService);
  private _toastCtrl = inject(ToastController);

  protected walletForm = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    balance: [0, [Validators.required, Validators.min(0)]],
    currency: ['VND', [Validators.required]],
  });

  protected status = signal<LoadingStatus>('idle');

  cancel() {
    this._navCtrl.back();
  }

  async save() {
    if (this.walletForm.invalid) {
      this.walletForm.markAllAsTouched();
      return;
    }

    this.status.set('loading');
    const walletData = this.walletForm.getRawValue();

    try {
      const userId = this._authService.currentUser()?.uid;
      if (!userId) throw new Error('User not found');
      await this._walletService
        .create(
          {
            name: walletData.name,
            balance: Number(walletData.balance),
            currency: walletData.currency!,
          },
          userId,
        )
        .finally(() => this.status.set('loaded'));
      this._navCtrl.back();
      this.showToast('New wallet has been created');
    } catch (error) {
      console.error('Error when saving wallet:', error);
      this.status.set('idle');

      this.showToast(`Failed to create new wallet. Please try again: ${error}`, 'danger');
    } finally {
      this.status.set('loaded');
    }
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this._toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }
}

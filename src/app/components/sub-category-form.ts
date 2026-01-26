import { Component, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonProgressBar,
  ModalController,
  IonContent,
  IonList,
  IonItem,
  IonNote,
  IonInput,
  IonPopover,
  NavParams,
  ToastController,
} from '@ionic/angular/standalone';
import { LoadingStatus } from '../models/loading-status';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { AuthService } from '../services/auth.service';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'sub-category-form',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonProgressBar,
    IonContent,
    ReactiveFormsModule,
    IonList,
    IonItem,
    IonNote,
    IonInput,
    IonPopover,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>Create new subcategory</ion-title>

        <ion-buttons slot="end">
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
              label="Name"
              label-placement="floating"
              type="text"
              fill="solid"
            >
            </ion-input>
          </ion-item>

          @if (formGroup.get('name')?.touched && formGroup.get('name')?.hasError('required')) {
            <ion-note color="danger" class="p-8">Category name is required</ion-note>
          }

          <ion-item>
            <div
              id="color-picker-trigger"
              class="flex items-center justify-between w-full p-4 mt-2 border-b border-(--ion-background-color-step-500)"
            >
              <div class="flex items-center gap-3">
                <div
                  [style.background-color]="formGroup.get('color')?.value"
                  class="w-6 h-6 rounded-full shadow-sm"
                ></div>
                <span>Select color</span>
              </div>
              <ion-icon name="chevron-down-outline" color="medium"></ion-icon>
            </div>

            <ion-popover trigger="color-picker-trigger" dismiss-on-select="true">
              <ng-template>
                <div class="grid grid-cols-4 gap-3 p-4">
                  @for (color of colors; track color) {
                    @let colorVariable = 'var(--color-' + color + '-500)';
                    <div
                      (click)="formGroup.patchValue({ color: colorVariable })"
                      [style.background-color]="colorVariable"
                      class="p-5 justify-self-center rounded-full"
                      [class.ring-2]="formGroup.get('color')?.value === colorVariable"
                    ></div>
                  }
                </div>
              </ng-template>
            </ion-popover>
          </ion-item>

          <ion-item>
            <div
              id="icon-picker-trigger"
              class="flex items-center justify-between w-full p-4 border-b border-(--ion-background-color-step-500)"
            >
              <div class="flex items-center gap-3">
                <ion-icon class="w-6 h-6" [name]="formGroup.get('icon')?.value"></ion-icon>
                <span>Icon</span>
              </div>
              <ion-icon name="chevron-down-outline" color="medium"></ion-icon>
            </div>

            <ion-popover trigger="icon-picker-trigger" dismiss-on-select="true">
              <ng-template>
                <div class="grid grid-cols-4 gap-3 p-4">
                  @for (icon of icons; track icon) {
                    <ion-icon
                      class="w-6 h-6 justify-self-center"
                      [name]="icon"
                      (click)="formGroup.patchValue({ icon })"
                    ></ion-icon>
                  }
                </div>
              </ng-template>
            </ion-popover>
          </ion-item>
        </ion-list>
      </form>
    </ion-content>
  `,
})
export class SubCategoryForm {
  private _modalCtrl = inject(ModalController);
  private _navParams = inject(NavParams);
  private _toastCtrl = inject(ToastController);
  private _authService = inject(AuthService);
  private _categoryService = inject(CategoryService);

  protected status = signal<LoadingStatus>('idle');

  protected formGroup = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    icon: ['', [Validators.required]],
    color: ['', [Validators.required]],
    parent_id: ['', [Validators.required]],
  });

  protected readonly colors = CATEGORY_COLORS;

  protected readonly icons = CATEGORY_ICONS;

  defaultFormValue: {
    color: string;
    icon: string;
    parent_id: string;
  } = this._navParams.get('defaultFormValue');

  constructor() {
    this.formGroup.patchValue(this.defaultFormValue);
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

      const formValue = this.formGroup.getRawValue();

      const data = {
        ...formValue,
        color: this.extractColorName(formValue.color),
      };

      await this._categoryService.createSubCategory(data, user.uid);
      this.showToast('New sub-category has been created');

      this.dismiss();
    } catch (error) {
      console.error('Error when saving sub-category:', error);
      this.status.set('idle');

      this.showToast(`Failed to create new sub-category. Please try again: ${error}`, 'danger');
    } finally {
      this.status.set('loaded');
    }
  }

  async dismiss() {
    await this._modalCtrl.dismiss();
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

  private extractColorName(value: string): string {
    if (!value) return 'neutral';

    const regex = /var\(--color-([a-z0-9-]+)-\d+\)/;
    const match = value.match(regex);

    return match ? match[1] : value;
  }
}

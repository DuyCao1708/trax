import { Component, computed, inject, signal, viewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonIcon,
  IonProgressBar,
  ToastController,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  NavParams,
  ModalController,
  IonFab,
  IonFabButton,
  IonModal,
  IonListHeader,
  IonInput,
  IonNote,
  IonPopover,
} from '@ionic/angular/standalone';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';
import { Category, CategoryMapper } from '../models/category';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryItem } from './category-item';
import { DEFAULT_CATEGORIES } from '../migrations/default-categories';
import { BooleanNumber } from '../entities';
import { SubCategoryForm } from './sub-category-form';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

@Component({
  selector: 'category-form',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    ReactiveFormsModule,
    CategoryItem,
    IonFab,
    IonFabButton,
    IonModal,
    IonListHeader,
    FormsModule,
    IonInput,
    IonNote,
    IonPopover,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>{{ category().name }}</ion-title>
      </ion-toolbar>

      @if (status() === 'loading') {
        <ion-progress-bar type="indeterminate"></ion-progress-bar>
      }
    </ion-header>

    <ion-content>
      <form [formGroup]="formGroup">
        <ion-list lines="full">
          <ion-item [style.--background]="'var(--ion-background-color)'">
            <div class="flex items-center w-full my-4">
              <div class="flex-1"></div>

              <ion-button
                shape="round"
                class="flex-none w-16 h-16 translate-x-6"
                [style.--background]="formGroupValue().color"
              >
                <ion-icon
                  slot="icon-only"
                  class="text-white text-4xl"
                  [name]="formGroupValue().icon"
                ></ion-icon>
              </ion-button>

              <div class="flex-1"></div>
            </div>

            <ion-icon name="pencil" slot="end" (click)="openIconModal()"></ion-icon>
          </ion-item>

          <ion-item [style.--background]="'var(--ion-background-color)'">
            <ion-label>
              <span>Name</span>

              <p>{{ formGroupValue().name }}</p>
            </ion-label>

            <ion-icon name="pencil" slot="end" (click)="openNameModal()"></ion-icon>
          </ion-item>

          <ion-item [style.--background]="'var(--ion-background-color)'">
            <ion-toggle
              [formControl]="formGroup.controls.show"
              class="my-2"
              (ionChange)="saveFor('is_deleted')"
              >Show</ion-toggle
            >
          </ion-item>

          @if (category().subCategories?.length) {
            <ion-item
              class="font-medium opacity-50 text-sm"
              [style.--background]="'var(--ion-background-color)'"
              [style.--min-height]="'36px'"
            >
              SUBCATEGORIES
            </ion-item>

            @for (category of category().subCategories; track $index) {
              <category-item
                [category]="category"
                (click)="editSubCategory(category)"
              ></category-item>
            }
          }
        </ion-list>
      </form>

      <ion-modal
        #nameModal
        trigger="open-name-modal"
        [style.--width]="'fit-content'"
        [style.--min-width]="'240px'"
        [style.--height]="'fit-content'"
        [style.--border-radius]="'8px'"
        [style.--backdrop-opacity]="'0.3'"
      >
        <ng-template>
          <form [formGroup]="formGroup">
            <ion-list lines="none">
              <ion-list-header class="text-lg mt-2" [style.--ion-safe-area-left]="'16px'">
                <ion-label>Edit category</ion-label>
              </ion-list-header>

              <ion-item>
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

              <ion-item class="mt-4">
                <div class="flex justify-between items-center w-full">
                  <ion-button fill="clear" color="medium">Default</ion-button>

                  <div class="flex gap-2">
                    <ion-button fill="clear" (click)="nameModal.dismiss()">Cancel</ion-button>
                    <ion-button fill="clear" (click)="saveFor('name')">Confirm</ion-button>
                  </div>
                </div>
              </ion-item>
            </ion-list>
          </form>
        </ng-template>
      </ion-modal>

      <ion-modal
        #iconModal
        [style.--width]="'fit-content'"
        [style.--min-width]="'240px'"
        [style.--height]="'fit-content'"
        [style.--border-radius]="'8px'"
        [style.--backdrop-opacity]="'0.3'"
      >
        <ng-template>
          <form [formGroup]="formGroup">
            <ion-list lines="none">
              <ion-list-header class="text-lg mt-2" [style.--ion-safe-area-left]="'16px'">
                <ion-label>Change icon</ion-label>
              </ion-list-header>

              <ion-item>
                <div
                  id="color-picker-trigger"
                  class="flex items-center justify-between w-full p-3 mt-2 rounded-lg"
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
                  class="flex items-center justify-between w-full p-3 mt-2 rounded-lg"
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

              <ion-item class="mt-4">
                <div class="flex justify-between items-center w-full">
                  <ion-button fill="clear" color="medium">Default</ion-button>

                  <div class="flex gap-2">
                    <ion-button fill="clear" (click)="iconModal.dismiss()">Cancel</ion-button>
                    <ion-button fill="clear" (click)="saveFor('icon')">Confirm</ion-button>
                  </div>
                </div>
              </ion-item>
            </ion-list>
          </form>
        </ng-template>
      </ion-modal>

      @if (category().subCategories?.length) {
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button
            [style.--border-radius]="'12px'"
            [style.--color]="'var(--color-white)'"
            (click)="openSubCategoryForm()"
          >
            <ion-icon name="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      }
    </ion-content>
  `,
})
export class CategoryForm {
  private _navParams = inject(NavParams);
  private _modalCtrl = inject(ModalController);
  private _categoryService = inject(CategoryService);
  private _authService = inject(AuthService);
  private _toastCtrl = inject(ToastController);
  private _iconModal = viewChild.required<IonModal>('iconModal');
  private _nameModal = viewChild.required<IonModal>('nameModal');

  protected formGroup = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    icon: ['', [Validators.required]],
    color: ['', [Validators.required]],
    show: false,
  });

  protected formGroupValue = toSignal(this.formGroup.valueChanges, {
    initialValue: this.formGroup.getRawValue(),
  });

  protected status = signal<LoadingStatus>('idle');

  protected readonly categoryId: string = this._navParams.get('categoryId');

  protected readonly category = computed(
    () => this._categoryService.categories().find((cat) => cat.id === this.categoryId)!,
  );

  protected readonly colors = CATEGORY_COLORS;

  protected readonly icons = CATEGORY_ICONS;

  constructor() {
    this.setFormValue(this.category());
  }

  async editSubCategory(category: Category) {
    const modal = await this._modalCtrl.create({
      component: CategoryForm,
      componentProps: { categoryId: category.id },
    });

    await modal.present();
  }

  async openSubCategoryForm() {
    const modal = await this._modalCtrl.create({
      component: SubCategoryForm,
      componentProps: {
        defaultFormValue: {
          color: this.formGroupValue().color,
          icon: this.formGroupValue().icon,
          parent_id: this.category().id,
        },
      },
    });

    await modal.present();
  }

  async openIconModal() {
    await this._iconModal().present();
  }

  async openNameModal() {
    await this._nameModal().present();
  }

  async saveFor(field: 'name' | 'icon' | 'is_deleted') {
    const {
      name: nameControl,
      icon: iconControl,
      color: colorControl,
      show: showControl,
    } = this.formGroup.controls;

    let data;
    if (field === 'name') {
      if (nameControl.invalid) return nameControl.markAsTouched();

      data = { name: nameControl.value };
    } else if (field === 'icon') {
      if (iconControl.invalid || colorControl.invalid)
        return this.showToast('Please select icon & color');

      data = { color: this.extractColorName(colorControl.value), icon: iconControl.value };
    } else {
      data = { is_deleted: (showControl.value ? 0 : 1) as BooleanNumber };
    }

    this.status.set('loading');

    try {
      const user = this._authService.currentUser();
      if (!user) throw new Error('User not found');

      await this._categoryService.patch(this.category().id, data, user.uid);

      this.showToast('Category has been updated');
    } catch (error) {
      console.error('Error when saving wallet:', error);
      this.status.set('idle');

      this.showToast(`Failed to edit category. Please try again: ${error}`, 'danger');
    } finally {
      this.status.set('loaded');
    }
  }

  async setToDefaultFor(field: 'name' | 'icon') {
    const defaultCategory = DEFAULT_CATEGORIES.find((cat) => cat.id === this.category().id);

    if (!defaultCategory) return;

    if (field === 'name') {
      this.formGroup.patchValue({ name: defaultCategory.name });
    } else {
      this.formGroup.patchValue({ icon: defaultCategory.icon, color: defaultCategory.color });
    }

    await this.saveFor(field);
  }

  dismiss() {
    this._modalCtrl.dismiss();
  }

  //#region Private methods
  private setFormValue(category: Category) {
    this.formGroup.setValue({
      name: category.name,
      icon: category.icon,
      color: category.color,
      show: !category.isDeleted,
    });
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
  //#endregion
}

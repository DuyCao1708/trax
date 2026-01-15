import { Component, inject, signal, viewChild } from '@angular/core';
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
  IonSelectOption,
  IonSelect,
  IonPopover,
} from '@ionic/angular/standalone';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';
import { Category } from '../models/category';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryItem } from './category-item';

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

        <ion-title>{{ category.name }}</ion-title>
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
            <ion-toggle [formControl]="formGroup.controls.show" class="my-2">Show</ion-toggle>
          </ion-item>

          @if (category.subCategories?.length) {
            <ion-item
              class="font-medium opacity-50 text-sm"
              [style.--background]="'var(--ion-background-color)'"
              [style.--min-height]="'36px'"
            >
              SUBCATEGORIES
            </ion-item>

            @for (category of category.subCategories; track $index) {
              <category-item
                [category]="category"
                (click)="openSubcategoryForm(category)"
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
                    <ion-button fill="clear">Confirm</ion-button>
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
                    <ion-button fill="clear">Confirm</ion-button>
                  </div>
                </div>
              </ion-item>
            </ion-list>
          </form>
        </ng-template>
      </ion-modal>

      @if (category.subCategories?.length) {
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button [style.--border-radius]="'12px'" [style.--color]="'var(--color-white)'">
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

  readonly category: Category = this._navParams.get('category');

  readonly colors = [
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
    'slate',
    'gray',
    'neutral',
  ];

  protected icons = [
    // Nhóm 1: Food, Drinks & Shopping (Dữ liệu của bạn)
    'restaurant',
    'wine',
    'nutrition',
    'fast-food',
    'bag-handle',
    'shirt',
    'medical',
    'laptop',
    'happy',
    'gift',
    'beaker',
    'home',
    'diamond',
    'cart',
    'paw',
    'construct',

    // Nhóm 2: Housing & Transport (Dữ liệu của bạn)
    'bulb',
    'hammer',
    'cash',
    'business',
    'key',
    'settings',
    'bus',
    'briefcase',
    'airplane',
    'train',
    'car',
    'car-sport',
    'speedometer',
    'square',
    'person',
    'barbell',

    // Nhóm 3: Life & Communication (Dữ liệu của bạn)
    'library',
    'ticket',
    'school',
    'heart',
    'umbrella',
    'calendar',
    'dice',
    'tv',
    'flower',
    'wifi',
    'call',
    'mail',
    'download',
    'people',
    'swap-vertical',
    'document-text',

    // Nhóm 4: Financial & Investment (Dữ liệu của bạn)
    'shield-checkmark',
    'wallet',
    'receipt',
    'stats-chart',
    'apps',
    'trending-up',
    'save',
    'create',
    'checkmark-circle',
    'podium',
    'arrow-down-circle',
    'refresh',

    // Nhóm 5: Bổ sung để tròn mảng & Đa dạng (Chia hết cho 4)
    'share',
    'menu',
    'notifications',
    'camera',
    'game-controller',
    'leaf',
    'trophy',
    'water',
    'flashlight',
    'alarm',
    'medkit',
    'calculator',
  ];

  get isEditing() {
    return !!this.category;
  }

  constructor() {
    this.setFormValue(this.category);
  }

  async openSubcategoryForm(category: Category) {
    const modal = await this._modalCtrl.create({
      component: CategoryForm,
      componentProps: { category: category },
    });

    await modal.present();
  }

  async openIconModal() {
    await this._iconModal().present();
  }

  async openNameModal() {
    await this._nameModal().present();
  }

  selectIcon(icon: string) {
    this.formGroup.patchValue({ icon });
  }

  dismiss() {
    this._modalCtrl.dismiss();
  }

  private setFormValue(category: Category) {
    this.formGroup.setValue({
      name: category.name,
      icon: category.icon,
      color: category.color,
      show: !category.isDeleted,
    });
  }
}

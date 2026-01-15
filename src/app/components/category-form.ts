import { Component, inject, signal } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';
import { Category } from '../models/category';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

            <ion-icon name="pencil" slot="end"></ion-icon>
          </ion-item>

          <ion-item [style.--background]="'var(--ion-background-color)'">
            <ion-label>
              <span>Name</span>

              <p>{{ formGroupValue().name }}</p>
            </ion-label>

            <ion-icon name="pencil" slot="end"></ion-icon>
          </ion-item>

          <ion-item [style.--background]="'var(--ion-background-color)'">
            <ion-toggle formControlName="show" class="my-2">Show</ion-toggle>
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

      @if (category.subCategories?.length) {
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button
            (click)="dismiss()"
            [style.--border-radius]="'12px'"
            [style.--color]="'var(--color-white)'"
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

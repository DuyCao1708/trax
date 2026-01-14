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
  NavController,
  ToastController,
  AlertController,
  IonContent,
} from '@ionic/angular/standalone';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { LoadingStatus } from '../models/loading-status';
import { ActivatedRoute } from '@angular/router';
import { Category } from '../models/category';
import { FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'category-form',
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
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home" icon="arrow-back"></ion-back-button>
        </ion-buttons>

        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>

      @if (status() === 'loading') {
        <ion-progress-bar type="indeterminate"></ion-progress-bar>
      }
    </ion-header>

    <ion-content>
      <div class="relative flex justify-end h-16 mt-4">
        <ion-button
          shape="round"
          class="absolute top-1/2 left-1/2 -translate-1/2 mr-4 w-16 h-16"
          [style.--background]="colorValue()"
        >
          <ion-icon slot="icon-only" class="text-white text-4xl" [name]="iconValue()"></ion-icon>
        </ion-button>

        <ion-button shape="round" fill="clear">
          <ion-icon slot="icon-only" name="pencil" class="text-neutral-700"></ion-icon>
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: ``,
})
export class CategoryForm {
  private _navCtrl = inject(NavController);
  private _categoryService = inject(CategoryService);
  private _authService = inject(AuthService);
  private _toastCtrl = inject(ToastController);
  private _alertCtrl = inject(AlertController);

  protected formGroup = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    icon: ['', [Validators.required]],
    color: ['', [Validators.required]],
    is_deleted: false,
  });

  private _formGroupValue = toSignal(this.formGroup.valueChanges, {
    initialValue: this.formGroup.getRawValue(),
  });

  iconValue = computed(() => this._formGroupValue().icon || '');

  colorValue = computed(() => this._formGroupValue().color);

  protected status = signal<LoadingStatus>('idle');

  private readonly _categoryId: string | null;

  get isEditing() {
    return !!this._categoryId;
  }

  readonly title: string;

  constructor() {
    this._categoryId = inject(ActivatedRoute).snapshot.paramMap.get('id');
    const category = this._categoryService
      .categories()
      .find((category) => category.id === this._categoryId);

    if (category) {
      this.setFormValue(category);

      this.title = category.name;
    } else {
      this.title = 'New category';
    }
  }

  private setFormValue(category: Category) {
    this.formGroup.setValue({
      name: category.name,
      icon: category.icon,
      color: category.color,
      is_deleted: category.isDeleted,
    });
  }
}

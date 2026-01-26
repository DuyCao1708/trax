import { Component, computed, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
  IonContent,
  IonList,
  ModalController,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Category } from '../models/category';
import { CategoryService } from '../services/category.service';
import { CategoryItem } from './category-item';
import { CategoryForm } from './category-form';

@Component({
  selector: 'categories-settings',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonList,
    CategoryItem,
    IonButton,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>Edit category</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <h6 class="font-medium opacity-50 text-sm m-3">ALL CATEGORIES</h6>

      <ion-list lines="full">
        @for (category of categories(); track $index) {
          <category-item [category]="category" (click)="openCategoryForm(category)"></category-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class CategoriesSettings {
  private _categoryService = inject(CategoryService);
  private _modalCtrl = inject(ModalController);

  protected categories = computed(() =>
    this._categoryService.categories().filter((cat) => !cat.parentId),
  );

  async openCategoryForm(category: Category) {
    const modal = await this._modalCtrl.create({
      component: CategoryForm,
      componentProps: { categoryId: category.id },
    });

    await modal.present();
  }

  dismiss() {
    this._modalCtrl.dismiss();
  }
}

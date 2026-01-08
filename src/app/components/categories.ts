import { Component, inject } from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'categories',
  imports: [IonItem, IonLabel, IonList, IonListHeader, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-list class="relative">
      <ion-list-header>
        <ion-label class="ms-4 text-lg text-gray-500">Categories</ion-label>
      </ion-list-header>

      @if (!categories().length) {
        <div class="absolute inset-0 grid place-content-center">
          <ion-spinner name="dots"></ion-spinner>
        </div>
      }

      @for (category of categories(); track $index) {
        <ion-item>
          <ion-button shape="round" class="mr-2 w-8 h-8" [style.--background]="category.color">
            <ion-icon slot="icon-only" class="text-white text-lg" [name]="category.icon"></ion-icon>
          </ion-button>

          <ion-label>{{ category.name }}</ion-label>
        </ion-item>
      }
    </ion-list>
  `,
  styles: ``,
})
export class Categories {
  protected readonly categories = inject(CategoryService).categories;

  constructor() {}
}

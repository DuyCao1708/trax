import { Component, input } from '@angular/core';
import { Category } from '../models/category';
import { IonButton, IonIcon, IonLabel, IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'category-item',
  imports: [IonButton, IonIcon, IonLabel, IonItem],
  template: `
    <ion-item>
      <ion-button shape="round" class="mr-4 w-9 h-9 my-2" [style.--background]="category().color">
        <ion-icon slot="icon-only" class="text-white text-xl" [name]="category().icon"></ion-icon>
      </ion-button>

      <ion-label>{{ category().name }}</ion-label>
    </ion-item>
  `,
})
export class CategoryItem {
  category = input.required<Category>();
}

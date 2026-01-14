import { Component, inject } from '@angular/core';
import { Category } from '../models/category';
import { IonContent, IonList, NavParams } from '@ionic/angular/standalone';
import { CategoryItem } from './category-item';

@Component({
  selector: 'category-detail',
  imports: [IonContent, IonList, CategoryItem],
  template: `
    <ion-content>
      <h6 class="font-medium opacity-50 text-sm m-3">GENERAL</h6>

      <ion-list lines="none">
        <category-item [category]="category" (click)="onCategorySelected(category)"></category-item>
      </ion-list>

      <h6 class="font-medium opacity-50 text-sm m-3">ALL CATEGORIES</h6>

      <ion-list lines="full">
        @for (subCategory of category.subCategories || []; track $index) {
          <category-item
            [category]="subCategory"
            (click)="onCategorySelected(subCategory)"
          ></category-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class CategoryDetail {
  private _navParams = inject(NavParams);

  category: Category = this._navParams.get('category');
  onCategorySelected = this._navParams.get('onCategorySelected');
}

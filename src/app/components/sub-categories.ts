import { Component, computed, inject } from '@angular/core';
import { Category } from '../models/category';
import { IonList, NavParams } from '@ionic/angular/standalone';
import { CategoryItem } from './category-item';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'sub-categories',
  imports: [IonList, CategoryItem],
  template: `
    <h6 class="font-medium opacity-50 text-sm m-3">GENERAL</h6>

    <ion-list lines="none">
      <category-item
        [category]="category()"
        (click)="onCategorySelected(category())"
      ></category-item>
    </ion-list>

    <h6 class="font-medium opacity-50 text-sm m-3">ALL CATEGORIES</h6>

    <ion-list lines="full">
      @for (subCategory of subCategories(); track $index) {
        <category-item
          [category]="subCategory"
          (click)="onCategorySelected(subCategory)"
        ></category-item>
      }
    </ion-list>
  `,
  host: {
    class: 'justify-start! bg-(--ion-background-color)',
  },
})
export class SubCategories {
  private _navParams = inject(NavParams);
  private _categoryService = inject(CategoryService);

  categoryId: string = this._navParams.get('categoryId');
  category = computed(
    () => this._categoryService.categories().find((cat) => cat.id === this.categoryId)!,
  );
  subCategories = computed(
    () => this.category().subCategories?.filter((cat) => !cat.isDeleted) || [],
  );
  onCategorySelected = this._navParams.get('onCategorySelected');
}

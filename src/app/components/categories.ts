import { Component, computed, inject, output, Signal } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { IonList, IonContent, IonNav } from '@ionic/angular/standalone';
import { Category } from '../models/category';
import { CategoryDetail } from './category-detail';
import { CategoryItem } from './category-item';

@Component({
  selector: 'categories',
  imports: [IonList, IonContent, CategoryItem],
  template: `
    <ion-content>
      @if (frequentCategories().length) {
        <h6 class="font-medium opacity-50 text-sm m-3">MOST FREQUENT</h6>

        <section class="bg-(--ion-item-background) py-4">
          @for (category of frequentCategories(); track category.id) {
            {{ category.name }}
          }
        </section>
      }

      <h6 class="font-medium opacity-50 text-sm m-3">ALL CATEGORIES</h6>

      <ion-list lines="full">
        @for (category of categories(); track $index) {
          <category-item [category]="category" (click)="handleSelection(category)"></category-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class Categories {
  private _categoryService = inject(CategoryService);
  private _nav = inject(IonNav, { optional: true });

  protected categories = computed(() => {
    const allModels: Category[] = this._categoryService.categories();

    return allModels.reduce<Category[]>((tree, cat) => {
      if (!cat.parentId) {
        cat.subCategories = allModels.filter((sub) => sub.parentId === cat.id);
        tree.push(cat);
      }
      return tree;
    }, []);
  });

  protected frequentCategories = this._categoryService.frequentCategories;

  // Injectable from IonNav
  onCategorySelected = (category: Category) => {};

  handleSelection(category: Category) {
    if (category.subCategories?.length && this._nav) {
      this._nav.push(CategoryDetail, {
        category,
        onCategorySelected: this.onCategorySelected,
      });
    } else {
      this.onCategorySelected(category);
    }
  }
}

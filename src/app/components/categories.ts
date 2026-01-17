import { Component, computed, inject, signal } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { IonList, IonNav, NavParams, ModalController } from '@ionic/angular/standalone';
import { Category } from '../models/category';
import { SubCategories } from './sub-categories';
import { CategoryItem } from './category-item';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'categories',
  imports: [IonList, CategoryItem, ReactiveFormsModule],
  template: `
    @if (showFrequentCategories && frequentCategories().length) {
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
  `,
  host: {
    class: 'justify-start!',
  },
})
export class Categories {
  private _categoryService = inject(CategoryService);
  private _modalCtrl = inject(ModalController);
  private _nav = inject(IonNav);
  private _navParams = inject(NavParams);

  protected isSearching = signal<boolean>(false);

  protected searchControl = new FormControl<string>('', { nonNullable: true });

  protected categories = computed(() =>
    this._categoryService.categories().filter((cat) => !cat.isDeleted && !cat.parentId),
  );

  protected frequentCategories = this._categoryService.frequentCategories;

  readonly showFrequentCategories = this._navParams.get('showFrequentCategories');

  readonly onCategorySelected = this._navParams.get('onCategorySelected') || (() => {});

  handleSelection(category: Category) {
    if (category.subCategories?.length && this._nav) {
      this._nav.push(SubCategories, {
        categoryId: category.id,
        onCategorySelected: this.onCategorySelected,
      });
    } else {
      this.onCategorySelected(category);
    }
  }

  async handleBack() {
    if (this.isSearching()) {
      this.isSearching.set(false);
      return;
    }

    this._modalCtrl.dismiss();
  }
}

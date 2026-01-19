import { Component, computed, inject, signal } from '@angular/core';
import { CategoryService } from '../services/category.service';
import {
  IonList,
  IonNav,
  NavParams,
  ModalController,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Category } from '../models/category';
import { SubCategories } from './sub-categories';
import { CategoryItem } from './category-item';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'categories',
  imports: [IonList, CategoryItem, ReactiveFormsModule, IonButton, IonIcon],
  template: `
    @if (showFrequentCategories && frequentCategories().length) {
      <h6 class="font-medium opacity-50 text-sm m-3">MOST FREQUENT</h6>

      <section class="bg-(--ion-item-background) ">
        <div
          class="py-4 flex items-start overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
          (scroll)="handleFrequentCategoriesScroll($event)"
        >
          @for (page of categoryPages(); track $index) {
            <div class="flex-none w-full flex snap-start">
              @for (category of page; track category.id) {
                <div
                  class="w-1/4 flex flex-col items-center px-1"
                  (click)="onCategorySelected(category)"
                >
                  <ion-button shape="round" class="w-9 h-9" [style.--background]="category.color">
                    <ion-icon
                      slot="icon-only"
                      class="text-white text-xl"
                      [name]="category.icon"
                    ></ion-icon>
                  </ion-button>

                  <span class="text-sm mt-2 px-4 leading-tight line-clamp-2 w-full text-center">
                    {{ category.name }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        @if (categoryPages().length > 1) {
          <div class="flex items-center justify-center h-6 gap-2 pb-4">
            @for (page of categoryPages(); track $index) {
              <div
                class="rounded-full transition-all"
                [class]="
                  currentStep() === $index
                    ? 'h-2 w-2 bg-blue-500'
                    : 'h-1.5 w-1.5 bg-(--ion-background-color-step-300) '
                "
              ></div>
            }
          </div>
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
  styles: `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `,
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

  readonly currentStep = signal(0);

  readonly categoryPages = computed(() => {
    const cats = this.frequentCategories();
    const pages = [];
    for (let i = 0; i < cats.length; i += 4) {
      pages.push(cats.slice(i, i + 4));
    }
    return pages;
  });

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

  handleFrequentCategoriesScroll(event: any) {
    const container = event.target;
    const pageWidth = container.clientWidth;

    const step = Math.round(container.scrollLeft / pageWidth);

    if (this.currentStep() !== step) {
      this.currentStep.set(step);
    }
  }
}

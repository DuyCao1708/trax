import { Component, computed, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavParams } from '@ionic/angular/common';
import { IonContent, IonList } from '@ionic/angular/standalone';
import { CategoryItem } from './category-item';
import { CategoryService } from '../services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'categories-search-result',
  imports: [IonContent, IonList, CategoryItem],
  template: `
    <ion-content>
      <ion-list lines="full">
        @for (category of filteredCategories(); track $index) {
          <category-item
            [showParent]="true"
            [category]="category"
            (click)="onCategorySelected(category)"
          ></category-item>
        } @empty {
          <div class="p-4 text-center opacity-50">No entries found.</div>
        }
      </ion-list>
    </ion-content>
  `,
})
export class CategoriesSearchResult {
  private _categoryService = inject(CategoryService);
  private navParams = inject(NavParams);

  protected categories = this._categoryService.categories;

  searchControl: FormControl<string> = this.navParams.get('searchControl');
  onCategorySelected = this.navParams.get('onCategorySelected');

  searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => this.removeAccents(term.toLowerCase().trim())),
    ),
    { initialValue: '' },
  );

  protected filteredCategories = computed(() => {
    const term = this.searchTerm();

    const all = this._categoryService.categories();

    if (!term) return all;

    const tokens = term.split(/\s+/).filter((t) => t.length > 0);

    return all
      .map((cat) => {
        const selfScore = this.calculateFuzzyScore(cat.name, term, tokens);

        const parentScore = cat.parentCategory
          ? this.calculateFuzzyScore(cat.parentCategory.name, term, tokens)
          : 0;

        let finalScore = 0;

        if (selfScore > 0) {
          finalScore = selfScore;
        } else if (parentScore > 0) {
          finalScore = Math.min(parentScore, 40); // to prioritize self score
        }

        return { ...cat, _score: finalScore };
      })
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score || a.name.length - b.name.length);
  });

  private calculateFuzzyScore(target: string, query: string, tokens: string[]): number {
    const targetNorm = this.removeAccents(target.toLowerCase());
    const queryNorm = this.removeAccents(query.toLowerCase());

    // 1. Khớp tuyệt đối
    if (targetNorm === queryNorm) return 100;

    // 2. Khớp khởi đầu (Starts with)
    if (targetNorm.startsWith(queryNorm)) return 90;

    // 3. Khớp từ đơn lẻ trong chuỗi
    if (targetNorm.includes(queryNorm)) return 85;

    // 4. Khớp Fuzzy cho từng token (Vd: "drk fd")
    const isFuzzyMatch = tokens.every((token) => {
      const pattern = token.split('').join('.*');
      return new RegExp(pattern).test(targetNorm);
    });

    if (isFuzzyMatch) {
      const sequencePattern = tokens.join('.*');
      return new RegExp(sequencePattern).test(targetNorm) ? 80 : 70;
    }

    return 0;
  }

  private removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
}

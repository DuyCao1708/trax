import { Injectable, signal } from '@angular/core';
import { Category } from '../models/category';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _categories = signal<Category[]>([]);
  readonly categories = this._categories.asReadonly();

  private readonly STORAGE_KEY = 'categories';

  constructor() {
    this.loadInitialData();
  }

  async updateCategories(categories: Category[]) {
    this._categories.set(categories);
    await this.saveToStorage(categories);
  }

  private async loadInitialData() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });

    if (value) {
      this._categories.set(JSON.parse(value));
    } else {
      const defaultData = this.getDefaultCategories();
      await this.saveToStorage(defaultData);
      this._categories.set(defaultData);
    }
  }

  private async saveToStorage(data: Category[]) {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(data),
    });
  }

  private getDefaultCategories(): Category[] {
    return [
      { id: 1, name: 'Ăn uống', icon: 'fast-food', color: '#ef4444', isDefault: true },
      { id: 2, name: 'Di chuyển', icon: 'car', color: '#3b82f6', isDefault: true },
      { id: 3, name: 'Mua sắm', icon: 'cart', color: '#eab308', isDefault: true },
      { id: 4, name: 'Nhà cửa', icon: 'home', color: '#8b5cf6', isDefault: true },
      { id: 5, name: 'Sức khỏe', icon: 'medical', color: '#10b981', isDefault: true },
      { id: 6, name: 'Giải trí', icon: 'game-controller', color: '#f97316', isDefault: true },
      { id: 7, name: 'Giáo dục', icon: 'school', color: '#6366f1', isDefault: true },
      { id: 8, name: 'Làm đẹp', icon: 'shirt', color: '#ec4899', isDefault: true },
      { id: 9, name: 'Tiền bạc', icon: 'wallet', color: '#22c55e', isDefault: true },
      { id: 10, name: 'Khác', icon: 'ellipsis-horizontal', color: '#64748b', isDefault: true },
    ];
  }
}

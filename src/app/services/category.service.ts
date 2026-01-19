import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { Category, CategoryMapper } from '../models/category';
import { DatabaseService } from './database.service';
import { CategoryEntity } from '../entities/category';
import { BooleanNumber, Entities, SyncStatus } from '../entities';
import { OPERATION_KEYS } from '../constants';
import { Preferences } from '@capacitor/preferences';
import { SyncableEntityService } from './syncable-entity.service';
import { SyncService } from './sync.service';
import { v4 as uuid } from 'uuid';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends SyncableEntityService<CategoryEntity> {
  private _databaseService = inject(DatabaseService);

  protected version = inject(SyncService).getEntityVersion(Entities.Categories);

  protected entities = signal<CategoryEntity[]>([]);

  readonly categories = computed(() => {
    const allModels = this.entities().map(CategoryMapper.toModel);

    const categoryMap = new Map<string, Category>();
    allModels.forEach((cat) => categoryMap.set(cat.id, cat));

    allModels.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          cat.parentCategory = parent;

          if (!parent.subCategories) parent.subCategories = [];
          parent.subCategories.push(cat);
        }
      }
    });

    return allModels;
  });

  private _frequentIds = signal<string[]>([]);

  readonly frequentCategories = computed(() =>
    this.categories().filter((cat) => this._frequentIds().includes(cat.id)),
  );

  constructor() {
    super(Entities.Categories);
    const authService = inject(AuthService);

    effect(() => {
      const user = authService.currentUser();

      if (user)
        untracked(() => {
          this.loadFrequents(user.uid);
        });
      else if (!user) this._frequentIds.set([]);
    });
  }

  async loadFrequents(userId: string) {
    const key = `${OPERATION_KEYS.FREQUENT_CATEGORIES}_${userId}`;
    const { value } = await Preferences.get({ key });

    if (value) {
      const ids = JSON.parse(value);
      this._frequentIds.set(Array.isArray(ids) ? ids : []);
    }
  }

  async loadAll(userId: string): Promise<CategoryEntity[]> {
    const sql = `SELECT * FROM ${Entities.Categories} WHERE (user_id = ? OR user_id = 'system')`;
    const result = await this._databaseService.query(sql, [userId]);

    const data = result.values || [];
    this.entities.set(data);

    return data;
  }

  async patch(
    id: string,
    data: Partial<{ name: string; icon: string; color: string; is_deleted: BooleanNumber }>,
    userId: string,
  ) {
    const category = this.entities().find((cat) => cat.id === id);

    if (!category) return;

    const updatedAt = Date.now();

    const updatedData = {
      ...data,
      user_id: userId,
      sync_status: SyncStatus.Pending,
      updated_at: updatedAt,
    };

    const keys = Object.keys(updatedData);
    const sql = `UPDATE ${Entities.Categories} SET ${keys.map((key) => `${key} = ?`).join(',')} WHERE id = ?`;

    await this._databaseService.execute(sql, [...Object.values(updatedData), id]);

    this.entities.update((current) =>
      current.map((category) => (category.id === id ? { ...category, ...updatedData } : category)),
    );

    this.sync(userId);
  }

  async createSubCategory(
    data: { name: string; icon: string; color: string; parent_id: string },
    userId: string,
  ) {
    const newCategory: CategoryEntity = {
      id: uuid(),
      ...data,
      user_id: userId,
      updated_at: Date.now(),
      is_deleted: 0,
      sync_status: SyncStatus.Pending,
    };

    const keys = Object.keys(newCategory);
    const values = keys.map((key) => (newCategory as any)[key]);
    const sql = `INSERT INTO ${Entities.Categories} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

    await this._databaseService.execute(sql, values);

    this.entities.update((current) => [...current, newCategory]);

    this.sync(userId);

    return newCategory;
  }

  async delete(id: string, userId: string) {
    const category = this.categories().find((cat) => cat.id === id);

    if (!category) return;

    const deletedItem = {
      ...category,
      user_id: userId,
      is_deleted: 1,
      sync_status: SyncStatus.Pending,
      updated_at: Date.now(),
    };

    const keys = Object.keys(deletedItem);
    const placeholders = keys.map(() => '?').join(',');
    const sql = `INSERT OR REPLACE INTO ${Entities.Categories} (${keys.join(',')}) VALUES (${placeholders})`;

    await this._databaseService.execute(sql, Object.values(deletedItem));

    this.entities.update((current) => current.filter((wallet) => wallet.id !== id));

    this.sync(userId);
  }

  async addToFrequent(id: string, userId: string) {
    const key = `${OPERATION_KEYS.FREQUENT_CATEGORIES}_${userId}`;

    const { value } = await Preferences.get({ key });

    let ids: string[] = value ? JSON.parse(value) : [];

    ids = [id, ...ids.filter((oldId) => oldId !== id)];

    ids = ids.slice(0, 8);

    await Preferences.set({
      key,
      value: JSON.stringify(ids),
    });

    this._frequentIds.set(ids);
  }
}

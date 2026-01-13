import { computed, effect, inject, Injectable, linkedSignal, Signal, signal } from '@angular/core';
import { Category, CategoryMapper } from '../models/category';
import { DatabaseService } from './database.service';
import { AuthService } from './auth.service';
import { SyncService } from './sync.service';
import { CategoryEntity } from '../entities/category';
import { Entities, SyncStatus } from '../entities';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _databaseService = inject(DatabaseService);
  private _authService = inject(AuthService);
  private _syncService = inject(SyncService);

  private _entities = signal<CategoryEntity[]>([]);

  readonly categories = computed(() => this._entities().map(CategoryMapper.toModel));

  constructor() {
    effect(() => {
      const user = this._authService.currentUser();

      if (user) this.loadAll(user.uid);
      else this._entities.set([]);
    });
  }

  async loadAll(userId: string): Promise<CategoryEntity[]> {
    const sql = `SELECT * FROM ${Entities.Categories} WHERE (user_id = ? OR user_id = 'system') AND is_deleted = 0`;
    const result = await this._databaseService.query(sql, [userId]);

    const data = result.values || [];
    this._entities.set(data);

    return data;
  }

  async update(id: string, data: { name: string; icon: string; color: string }, userId: string) {
    const category = this._entities().find((cat) => cat.id === id);

    if (!category) return;

    const updatedAt = Date.now();

    const updatedData = {
      ...category,
      name: data.name,
      icon: data.icon,
      color: data.color,
      user_id: userId,
      sync_status: SyncStatus.Pending,
      updated_at: updatedAt,
    };

    const keys = Object.keys(updatedData);
    const sql = `INSERT OR REPLACE INTO ${Entities.Categories} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`;

    await this._databaseService.execute(sql, Object.values(updatedData));

    this._entities.update((current) =>
      current.map((category) => (category.id === id ? { ...category, ...data } : category)),
    );

    this._syncService.syncTableOnly(Entities.Categories, userId);
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

    this._entities.update((current) => current.filter((wallet) => wallet.id !== id));

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }
}

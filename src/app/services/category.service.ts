import { inject, Injectable, linkedSignal, Signal, signal } from '@angular/core';
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
  private _isLoading = false;

  private _entities = signal<CategoryEntity[]>([]);

  private _models = linkedSignal(() => this._entities().map(CategoryMapper.toModel));

  get categories(): Signal<Category[]> {
    const currentWallets = this._models();
    const user = this._authService.currentUser();

    if (currentWallets.length === 0 && user && !this._isLoading) {
      this.loadAll(user.uid);
    }

    return this._models;
  }

  async loadAll(userId: string): Promise<CategoryEntity[]> {
    this._isLoading = true;
    try {
      const sql = `SELECT * FROM ${Entities.Categories} WHERE (user_id = ? OR user_id = 'system') AND is_deleted = 0`;
      const result = await this._databaseService.query(sql, [userId]);

      const data = result.values || [];
      this._entities.set(data);

      return data;
    } finally {
      this._isLoading = false;
    }
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

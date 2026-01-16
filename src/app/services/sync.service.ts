import { inject, Injectable, Injector, Type } from '@angular/core';
import { Entities } from '../entities';
import { SyncableEntityService } from './syncable-entity.service';
import { WalletService } from './wallet.service';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private _injector = inject(Injector);
  private _registry = new Map<Entities, Type<SyncableEntityService<any>>>([
    [Entities.Categories, CategoryService],
    [Entities.Wallets, WalletService],
  ]);
  private _activeSyncs = new Set<Entities>();

  async syncAll(userId: string) {
    const tasks = Array.from(this._registry.keys()).map(
      async (entity) => await this.syncEntity(entity, userId),
    );

    await Promise.allSettled(tasks);
  }

  async syncEntity(entity: Entities, userId: string) {
    const token = this._registry.get(entity);

    if (!token || this._activeSyncs.has(entity)) return;

    const service = this._injector.get(token);

    this._activeSyncs.add(entity);

    try {
      await service.sync(userId);
    } catch (error) {
      console.error(`Sync failed for ${entity}:`, error);
    } finally {
      this._activeSyncs.delete(entity);
    }
  }
}

import {
  effect,
  inject,
  Injectable,
  Injector,
  Signal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { Entities } from '../entities';
import { SyncableEntityService } from './syncable-entity.service';
import { WalletService } from './wallet.service';
import { CategoryService } from './category.service';
import { SyncResult } from '../models';
import { AuthService } from './auth.service';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { OPERATION_KEYS } from '../constants';

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

  private _entityVersions = new Map<Entities, WritableSignal<number>>();

  constructor() {
    for (const entity of this._registry.keys()) {
      this._entityVersions.set(entity, signal(1));
    }

    const authService = inject(AuthService);

    effect(async () => {
      const user = authService.currentUser();

      if (user) {
        const status = await Network.getStatus();

        if (status.connected) {
          await this.syncAll(user.uid);
        }
      } else {
        const { value: cachedUser } = await Preferences.get({ key: OPERATION_KEYS.CACHED_USER });

        if (!cachedUser) {
          this.setAllVersions(0);
        }
      }
    });
  }

  getEntityVersion(entity: Entities): Signal<number> {
    const version = this._entityVersions.get(entity);

    if (!version) {
      throw Error(`Entity ${entity} has not been registered in SyncService`);
    }
    return version.asReadonly();
  }

  async syncAll(userId: string) {
    const tasks = Array.from(this._registry.keys()).map(async (entity) => {
      const result = await this.syncEntity(entity, userId);

      if (result === SyncResult.HasChanged) {
        const version = this._entityVersions.get(entity);
        if (version) version.set(version() + 1);
      }
    });

    await Promise.allSettled(tasks);
  }

  async syncEntity(entity: Entities, userId: string): Promise<SyncResult> {
    const token = this._registry.get(entity);

    if (!token || this._activeSyncs.has(entity)) return SyncResult.NothingChanged;

    const service = this._injector.get(token);

    this._activeSyncs.add(entity);

    try {
      return await service.sync(userId);
    } catch (error) {
      console.error(`Sync failed for ${entity}:`, error);
      return SyncResult.NothingChanged;
    } finally {
      this._activeSyncs.delete(entity);
    }
  }

  private setAllVersions(val: number) {
    this._entityVersions.forEach((version) => version.set(val));
  }
}

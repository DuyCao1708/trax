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
import { TransactionService } from './transaction.service';

interface SyncServiceRegistration {
  service: Type<SyncableEntityService<any>>;
  dependsOn?: Entities[];
}

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private _injector = inject(Injector);
  private _registry = new Map<Entities, SyncServiceRegistration>([
    [Entities.Categories, { service: CategoryService }],
    [Entities.Wallets, { service: WalletService }],
    [Entities.Transactions, { service: TransactionService, dependsOn: [Entities.Wallets] }],
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

        this.setAllVersions(1);
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
    const pending = new Set(this._registry.keys());
    const completed = new Set<Entities>();
    const failed = new Set<Entities>();

    while (pending.size > 0) {
      const readyToSync = Array.from(pending).filter((entity) => {
        const deps = this._registry.get(entity)?.dependsOn || [];

        if (deps.some((dep) => failed.has(dep))) {
          failed.add(entity);
          pending.delete(entity);
          console.warn(`Skipping ${entity} because its dependency failed.`);
          return false;
        }

        return deps.every((dep) => completed.has(dep));
      });

      if (readyToSync.length === 0) {
        console.error('Circular dependency detected or missing entity!');
        break;
      }

      const tasks = readyToSync.map(async (entity) => {
        try {
          const result = await this.syncEntity(entity, userId);

          if (result.hasChanged) {
            const version = this._entityVersions.get(entity);
            if (version) version.set(version() + 1);
          }

          completed.add(entity);
          pending.delete(entity);
        } catch (error) {
          console.error(`Sync failed for ${entity}:`, error);
          failed.add(entity);
        }
      });

      await Promise.allSettled(tasks);
    }
  }

  async syncEntity(entity: Entities, userId: string): Promise<SyncResult<any>> {
    const token = this._registry.get(entity);

    if (!token || this._activeSyncs.has(entity)) return { hasChanged: false };

    const service = this._injector.get(token.service);

    this._activeSyncs.add(entity);

    try {
      return await service.sync(userId);
    } catch (error) {
      console.error(`Sync failed for ${entity}:`, error);
      return { hasChanged: false };
    } finally {
      this._activeSyncs.delete(entity);
    }
  }

  private setAllVersions(val: number) {
    this._entityVersions.forEach((version) => version.set(val));
  }
}

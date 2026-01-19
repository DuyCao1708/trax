import { effect, inject, Injectable, Signal, untracked, WritableSignal } from '@angular/core';
import { Entities, SyncableEntity, SyncStatus } from '../entities';
import { DatabaseService } from './database.service';
import { OPERATION_KEYS } from '../constants';
import { Preferences } from '@capacitor/preferences';
import { collection, doc, getDocs, orderBy, query, where, writeBatch } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { SyncResult } from '../models';

@Injectable({
  providedIn: 'root',
})
export abstract class SyncableEntityService<T extends SyncableEntity> {
  protected databaseService = inject(DatabaseService);
  protected firestore = inject(FirebaseService).database;

  protected abstract entities: WritableSignal<T[]>;
  protected abstract version: Signal<number>;

  constructor(protected tableName: Entities) {
    const authService = inject(AuthService);

    effect(() => {
      const user = authService.currentUser();
      const version = this.version();

      if (user && version > 0)
        untracked(() => {
          this.loadAll(user.uid);
        });
      else if (!user) this.entities.set([]);
    });
  }

  abstract loadAll(userId: string): Promise<T[]>;

  async pull(userId: string): Promise<SyncResult<T>> {
    try {
      const lastSyncTs = await this.getLastSyncTimestamp(userId);

      const colRef = collection(this.firestore, `${Entities.Users}/${userId}/${this.tableName}`);
      const q = query(colRef, where('updated_at', '>', lastSyncTs), orderBy('updated_at', 'asc'));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return { hasChanged: false };

      const items = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as T),
        id: doc.id,
        sync_status: SyncStatus.Synced,
      }));

      await this.upsertLocal(...items);

      const latestSyncTs = items[items.length - 1].updated_at;
      await this.setLastTimestamp(latestSyncTs, userId);

      return { hasChanged: true, changes: items };
    } catch (error) {
      console.error(`Pull failed: ${this.tableName}`, error);
      return { hasChanged: false };
    }
  }

  async push(userId: string): Promise<SyncResult<T>> {
    const sql = `SELECT * FROM ${this.tableName} WHERE sync_status IN (?, ?) AND user_id = ?`;

    const localItems = await this.databaseService.query(sql, [
      SyncStatus.Pending,
      SyncStatus.Failed,
      userId,
    ]);

    const items = localItems.values || [];
    if (!items.length) return { hasChanged: false };

    const CHUNK_SIZE = 500;
    const totalItems = items.length;
    let pushedItems = [];

    for (let i = 0; i < totalItems; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const chunkIds = chunk.map((item) => item.id);
      const batch = this.getUpdateFirestoreBatch(chunk, userId);

      try {
        await batch.commit();

        await this.updateLocalSyncStatus(SyncStatus.Synced, chunkIds);
        pushedItems.push(...chunk);
      } catch (error) {
        console.error(`Push failed for ${this.tableName}:`, error);

        await this.updateLocalSyncStatus(SyncStatus.Failed, chunkIds);
      }
    }

    return pushedItems ? { hasChanged: true, changes: pushedItems } : { hasChanged: false };
  }

  async sync(userId: string): Promise<SyncResult<T>> {
    const pullResult = await this.pull(userId);
    const pushResult = await this.push(userId);

    const allChanges: T[] = [
      ...(pullResult.hasChanged ? pullResult.changes : []),
      ...(pushResult.hasChanged ? pushResult.changes : []),
    ];

    if (pullResult.hasChanged || pushResult.hasChanged) {
      await this.afterSyncChanged(userId, allChanges);
    }

    return {
      hasChanged: pullResult.hasChanged || pushResult.hasChanged,
      changes: allChanges,
    };
  }

  protected async afterSyncChanged(userId: string, changes: T[]): Promise<void> {
    return Promise.resolve();
  }

  //#region Private methods
  private async getLastSyncTimestamp(userId: string): Promise<number> {
    const key = this.getLastSyncKey(userId);
    const { value: lastSync } = await Preferences.get({ key });
    return lastSync ? parseInt(lastSync) : 0;
  }

  private async setLastTimestamp(timestamp: number, userId: string) {
    const key = this.getLastSyncKey(userId);
    await Preferences.set({
      key,
      value: timestamp.toString(),
    });
  }

  private getLastSyncKey(userId: string) {
    const key = `${OPERATION_KEYS.LAST_SYNC}_${this.tableName}_${userId}`;
    return key;
  }

  private async upsertLocal(...dataList: T[]) {
    if (!dataList.length) return;

    const firstItem = dataList[0];
    const keys = Object.keys(firstItem);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(',');

    const updateClause = keys
      .filter((key) => key != 'id')
      .map((key) => `${key} = EXCLUDED.${key}`)
      .join(', ');

    const sql = `
    INSERT INTO ${this.tableName} (${columns}) 
    VALUES (${placeholders})
    ON CONFLICT(id) DO UPDATE SET ${updateClause}
    WHERE EXCLUDED.updated_at > IFNULL(${this.tableName}.updated_at, 0)
    AND ${this.tableName}.sync_status != ${SyncStatus.Pending}
  `;

    const set = dataList.map((item) => ({
      statement: sql,
      values: keys.map((k) => (item as any)[k]),
    }));

    await this.databaseService.executeSet(set);
  }

  private async updateLocalSyncStatus(status: SyncStatus, ids: string[]) {
    if (!ids.length) return;

    const placeholders = ids.map(() => '?').join(',');

    const sql = `UPDATE ${this.tableName} SET sync_status = ? WHERE id IN (${placeholders})`;

    return await this.databaseService.execute(sql, [status, ...ids]);
  }

  private getUpdateFirestoreBatch(dataList: T[], userId: string) {
    const batch = writeBatch(this.firestore);

    for (const item of dataList) {
      const { id, sync_status, ...dataToSync } = item;

      const docRef = doc(this.firestore, `${Entities.Users}/${userId}/${this.tableName}`, id);

      batch.set(docRef, dataToSync, { merge: true });
    }

    return batch;
  }
  //#endregion
}

import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Preferences } from '@capacitor/preferences';
import { FirebaseService } from './firebase.service';
import { Entities, SyncStatus, SyncableEntity } from '../entities';
import { collection, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { OPERATION_KEYS } from '../constants/index';
import { Network } from '@capacitor/network';
import { CategoryEntity } from '../entities/category';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private _databaseService = inject(DatabaseService);
  private _firestore = inject(FirebaseService).database;

  private _isSyncing = false;
  private _syncingTables: { [key: string]: boolean } = {};

  async syncAll(userId: string) {
    if (this._isSyncing) return;

    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }

    this._isSyncing = true;

    try {
      for (const tableName of Object.values(Entities).filter(
        (entity) => ![Entities.Users].includes(entity),
      )) {
        await this.pushTable(tableName, userId);
        await this.pullTable(tableName, userId);
      }
    } finally {
      this._isSyncing = false;
    }
  }

  async syncTableOnly(tableName: Entities, userId: string, pushOnly = false) {
    if (this._syncingTables[tableName]) return;

    const status = await Network.getStatus();
    if (!status.connected) return;

    this._syncingTables[tableName] = true;

    try {
      await this.pushTable(tableName, userId);

      if (!pushOnly) {
        await this.pullTable(tableName, userId);
      }
    } finally {
      this._syncingTables[tableName] = false;
    }
  }

  //#region Private methods
  private async pushTable(tableName: Entities, userId: string) {
    const localData = await this._databaseService.query(
      `SELECT * FROM ${tableName} WHERE sync_status IN (?, ?) AND user_id = ?`,
      [SyncStatus.Pending, SyncStatus.Failed, userId],
    );

    if (localData.values?.length) {
      for (const item of localData.values) {
        try {
          await this.updateFirebaseDoc(tableName, item.id, item, userId);

          await this._databaseService.execute(
            `UPDATE ${tableName} SET sync_status = ? WHERE id = ?`,
            [SyncStatus.Synced, item.id],
          );
        } catch (error) {
          await this._databaseService.execute(
            `UPDATE ${tableName} SET sync_status = ? WHERE id = ?`,
            [SyncStatus.Failed, item.id],
          );
        }
      }
    }
  }

  private async pullTable(tableName: Entities, userId: string) {
    try {
      const syncKey = `${OPERATION_KEYS.LAST_SYNC}_${tableName}_${userId}`;
      const { value: lastSync } = await Preferences.get({ key: syncKey });
      const lastSyncTs = lastSync ? parseInt(lastSync) : 0;

      const colRef = collection(this._firestore, `${Entities.Users}/${userId}/${tableName}`);
      const q = query(colRef, where('updated_at', '>', lastSyncTs), orderBy('updated_at', 'asc'));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let latestTimestamp = lastSyncTs;

        const transformer = SYNC_TRANSFORMERS[tableName] || SYNC_TRANSFORMERS['default'];

        for (const fbDoc of querySnapshot.docs) {
          const remoteItem = fbDoc.data();
          const id = fbDoc.id;

          const transformedItem = transformer({ ...remoteItem, id }, userId);

          await this.upsertLocal(tableName, transformedItem);

          if (remoteItem['updated_at'] > latestTimestamp) {
            latestTimestamp = remoteItem['updated_at'];
          }
        }

        await Preferences.set({
          key: syncKey,
          value: latestTimestamp.toString(),
        });
      }
    } catch (e) {
      console.error(`Pull failed: ${tableName}`, e);
    }
  }

  private async updateFirebaseDoc(
    tableName: Entities,
    id: string,
    data: any,
    userId: string,
  ): Promise<void> {
    const docRef = doc(this._firestore, `${Entities.Users}/${userId}/${tableName}/${id}`);
    const { sync_status, ...dataToSync } = data;
    return await setDoc(docRef, dataToSync, { merge: true });
  }

  private async upsertLocal(tableName: Entities, data: any) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const placeholders = keys.map(() => '?').join(',');
    const columns = keys.join(',');

    const sql = `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    await this._databaseService.execute(sql, values);
  }
  //#endregion Private methods
}

export type TransformerFn<T = any> = (
  data: T & SyncableEntity,
  userId: string,
) => T & SyncableEntity;

export const SYNC_TRANSFORMERS: Partial<Record<Entities, TransformerFn>> & {
  default: TransformerFn;
} = {
  [Entities.Categories]: (data: CategoryEntity, userId) => ({
    ...data,
    user_id: userId,
    sync_status: SyncStatus.Synced,
  }),
  default: (data, userId) => ({
    ...data,
    sync_status: SyncStatus.Synced,
  }),
};

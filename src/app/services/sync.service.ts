import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Preferences } from '@capacitor/preferences';
import { FirebaseService } from './firebase.service';
import { Entities, SyncStatus } from '../entities';
import { collection, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { SETTINGS_KEYS } from '../constants/index.ts';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private _databaseService = inject(DatabaseService);
  private _firestore = inject(FirebaseService).database;

  private _isSyncing = false;

  async syncAll(userId: string) {
    if (this._isSyncing) return;

    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }

    this._isSyncing = true;

    try {
      for (const tableName of Object.values(Entities)) {
        await this.pushTable(tableName, userId);
        await this.pullTable(tableName, userId);
      }
    } finally {
      this._isSyncing = false;
    }
  }

  //#region Private methods
  private async pushTable(tableName: string, userId: string) {
    const localData = await this._databaseService.query(
      `SELECT * FROM ${tableName} WHERE sync_status IN (?, ?) AND user_id = ?`,
      [SyncStatus.Pending, SyncStatus.Failed, userId],
    );

    if (localData.values?.length) {
      for (const item of localData.values) {
        try {
          await this.updateFirebaseDoc(tableName, item.id, item);

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

  private async pullTable(tableName: string, userId: string) {
    try {
      const syncKey = `${SETTINGS_KEYS.LAST_SYNC}_${tableName}_${userId}`;
      const { value: lastSync } = await Preferences.get({ key: syncKey });
      const lastSyncTs = lastSync ? parseInt(lastSync) : 0;

      const colRef = collection(this._firestore, tableName);
      const q = query(
        colRef,
        where('user_id', '==', userId),
        where('updated_at', '>', lastSyncTs),
        orderBy('updated_at', 'asc'),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let latestTimestamp = lastSyncTs;

        for (const fbDoc of querySnapshot.docs) {
          const remoteItem = fbDoc.data();
          const id = fbDoc.id;

          await this.upsertLocal(tableName, { ...remoteItem, id });

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

  private async updateFirebaseDoc(tableName: string, id: string, data: any): Promise<void> {
    const docRef = doc(this._firestore, tableName, id);
    const { sync_status, ...dataToSync } = data;
    return await setDoc(docRef, dataToSync, { merge: true });
  }

  private async upsertLocal(tableName: string, data: any) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    keys.push('sync_status');
    values.push(SyncStatus.Synced);

    const placeholders = keys.map(() => '?').join(',');
    const columns = keys.join(',');

    const sql = `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    await this._databaseService.execute(sql, values);
  }
  //#endregion Private methods
}

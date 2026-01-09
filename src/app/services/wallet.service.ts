import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { WalletEntity } from '../entities/wallet';
import { Entities, SyncStatus } from '../entities';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private _databaseService = inject(DatabaseService);
  private _syncService = inject(SyncService);

  constructor() {
    const sql = `UPDATE wallets SET is_deleted = 0, sync_status = 2;`;
    const result = this._databaseService.query(sql);
  }

  async getAll(userId: string) {
    const sql = `SELECT * FROM ${Entities.Wallets} WHERE user_id = ? AND is_deleted = 0 ORDER BY updated_at DESC`;
    const result = await this._databaseService.query(sql, [userId]);
    return result.values || [];
  }

  async create(data: { name: string; balance: number; currency: string }, userId: string) {
    const newWallet: Omit<WalletEntity, 'id'> = {
      ...data,
      user_id: userId,
      updated_at: Date.now(),
      is_deleted: 0,
      sync_status: SyncStatus.Pending,
    };

    const sql = `INSERT INTO ${Entities.Wallets} (name, balance, currency, user_id, updated_at, is_deleted, sync_status) VALUES (?,?,?,?,?,?,?)`;

    await this._databaseService.execute(sql, [
      newWallet.name,
      newWallet.balance,
      newWallet.currency,
      newWallet.user_id,
      newWallet.updated_at,
      newWallet.is_deleted,
      newWallet.sync_status,
    ]);

    this._syncService.syncTableOnly(Entities.Wallets, userId);

    return newWallet;
  }

  async delete(id: string, userId: string) {
    const now = Date.now();
    const sql = `UPDATE ${Entities.Wallets} SET is_deleted = 1, updated_at = ?, sync_status = ? WHERE id = ?`;

    await this._databaseService.execute(sql, [now, SyncStatus.Pending, id]);

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }
}

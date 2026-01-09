import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { WalletEntity } from '../entities/wallet';
import { Entities, SyncStatus } from '../entities';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private _databaseService = inject(DatabaseService);

  async getAll(userId: string) {
    const sql = `SELECT * FROM ${Entities.Wallets} WHERE user_id = ? AND is_deleted = 0 ORDER BY updated_at DESC`;
    const result = await this._databaseService.query(sql, [userId]);
    return result.values || [];
  }

  async create(name: string, balance: number, userId: string) {
    const newWallet: WalletEntity = {
      id: crypto.randomUUID(),
      name: name,
      balance: balance,
      user_id: userId,
      updated_at: Date.now(),
      is_deleted: 0,
      sync_status: SyncStatus.Pending,
    };

    const sql = `INSERT INTO ${Entities.Wallets} (id, name, balance, user_id, updated_at, is_deleted sync_status) VALUES (?,?,?,?,?,?,?)`;

    await this._databaseService.execute(sql, [
      newWallet.id,
      newWallet.name,
      newWallet.balance,
      newWallet.user_id,
      newWallet.updated_at,
      newWallet.sync_status,
    ]);

    return newWallet;
  }
}

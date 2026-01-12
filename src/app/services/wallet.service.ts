import { inject, Injectable, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { WalletEntity } from '../entities/wallet';
import { Entities, SyncStatus } from '../entities';
import { SyncService } from './sync.service';
import { v4 as uuid } from 'uuid';
import { Wallet, WalletMapper } from '../models/wallet';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private _databaseService = inject(DatabaseService);
  private _syncService = inject(SyncService);

  private _wallets = signal<Wallet[]>([]);

  readonly wallets = this._wallets.asReadonly();

  get walletColors() {
    return ['teal', 'blue', 'amber', 'red', 'violet', 'pink', 'cyan', 'orange'];
  }

  async loadAll(userId: string): Promise<WalletEntity[]> {
    const sql = `SELECT * FROM ${Entities.Wallets} WHERE user_id = ? AND is_deleted = 0 ORDER BY sort_order ASC`;
    const result = await this._databaseService.query(sql, [userId]);

    const data = result.values || [];
    this._wallets.set(data.map(WalletMapper.toModel));

    return data;
  }

  async create(data: { name: string; balance: number; currency: string }, userId: string) {
    const newWallet: WalletEntity = {
      id: uuid(),
      ...data,
      user_id: userId,
      updated_at: Date.now(),
      is_deleted: 0,
      sort_order: this.wallets().length,
      sync_status: SyncStatus.Pending,
    };

    const sql = `INSERT INTO ${Entities.Wallets} (id, name, balance, currency, user_id, updated_at, is_deleted, sort_order, sync_status) VALUES (?,?,?,?,?,?,?,?,?)`;

    await this._databaseService.execute(sql, [
      newWallet.id,
      newWallet.name,
      newWallet.balance,
      newWallet.currency,
      newWallet.user_id,
      newWallet.updated_at,
      newWallet.is_deleted,
      newWallet.sort_order,
      newWallet.sync_status,
    ]);

    this._wallets.update((current) => [WalletMapper.toModel(newWallet), ...current]);

    this._syncService.syncTableOnly(Entities.Wallets, userId);

    return newWallet;
  }

  async update(
    id: string,
    data: { name: string; balance: number; currency: string },
    userId: string,
  ) {
    const updatedAt = Date.now();

    const sql = `
    UPDATE ${Entities.Wallets} 
    SET name = ?, balance = ?, currency = ?, updated_at = ?, sync_status = ? 
    WHERE id = ? AND user_id = ?
  `;

    await this._databaseService.execute(sql, [
      data.name,
      data.balance,
      data.currency,
      updatedAt,
      SyncStatus.Pending,
      id,
      userId,
    ]);

    this._wallets.update((current) =>
      current.map((wallet) => (wallet.id === id ? { ...wallet, ...data } : wallet)),
    );

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }

  async reorderWallets(newOrder: Wallet[], userId: string) {
    this._wallets.set(newOrder);

    for (let i = 0; i < newOrder.length; i++) {
      const sql = `
        UPDATE ${Entities.Wallets} 
        SET sort_order = ?, updated_at = ?, sync_status = ? 
        WHERE id = ?
      `;
      await this._databaseService.execute(sql, [i, Date.now(), SyncStatus.Pending, newOrder[i].id]);
    }

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }

  async delete(id: string, userId: string) {
    const now = Date.now();
    const sql = `UPDATE ${Entities.Wallets} SET is_deleted = 1, updated_at = ?, sync_status = ? WHERE id = ?`;

    await this._databaseService.execute(sql, [now, SyncStatus.Pending, id]);

    this._wallets.update((current) => current.filter((wallet) => wallet.id !== id));

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }
}

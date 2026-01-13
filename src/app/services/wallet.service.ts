import { computed, effect, inject, Injectable, linkedSignal, Signal, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { WalletEntity } from '../entities/wallet';
import { Entities, SyncStatus } from '../entities';
import { SyncService } from './sync.service';
import { v4 as uuid } from 'uuid';
import { Wallet, WalletMapper } from '../models/wallet';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private _databaseService = inject(DatabaseService);
  private _authService = inject(AuthService);
  private _syncService = inject(SyncService);
  private _isLoading = false;

  private _entities = signal<WalletEntity[]>([]);

  private _models = linkedSignal(() => this._entities().map(WalletMapper.toModel));

  get wallets(): Signal<Wallet[]> {
    const currentWallets = this._models();
    const user = this._authService.currentUser();

    if (currentWallets.length === 0 && user && !this._isLoading) {
      this.loadAll(user.uid);
    }

    return this._models;
  }

  get walletColors() {
    return ['teal', 'blue', 'amber', 'red', 'violet', 'pink', 'cyan', 'orange'];
  }

  constructor() {
    effect(() => {
      const user = this._authService.currentUser();

      if (!user) this._entities.set([]);
    });
  }

  async loadAll(userId: string): Promise<WalletEntity[]> {
    this._isLoading = true;
    try {
      const sql = `SELECT * FROM ${Entities.Wallets} WHERE user_id = ? AND is_deleted = 0 ORDER BY sort_order ASC`;
      const result = await this._databaseService.query(sql, [userId]);

      const data = result.values || [];
      this._entities.set(data);

      return data;
    } finally {
      this._isLoading = false;
    }
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

    this._entities.update((current) => [...current, newWallet]);

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

    this._entities.update((current) =>
      current.map((wallet) => (wallet.id === id ? { ...wallet, ...data } : wallet)),
    );

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }

  async reorderWallets(newOrder: Wallet[], userId: string) {
    const updatedAt = Date.now();
    const currentEntities = this._entities();

    const updatedEntities = newOrder.map((model, index) => {
      const entity = currentEntities.find((e) => e.id === model.id);
      return {
        ...entity,
        sort_order: index,
        sync_status: SyncStatus.Pending,
        updated_at: updatedAt,
      } as WalletEntity;
    });

    this._entities.set(updatedEntities);

    const statements = updatedEntities.map((e) => ({
      statement: `UPDATE ${Entities.Wallets} SET sort_order = ?, sync_status = ${SyncStatus.Pending}, updated_at = ${updatedAt} WHERE id = ?`,
      values: [e.sort_order, e.id],
    }));
    await this._databaseService.executeSet(statements);

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }

  async delete(id: string, userId: string) {
    const updatedAt = Date.now();
    const sql = `UPDATE ${Entities.Wallets} SET is_deleted = 1, updated_at = ?, sync_status = ? WHERE id = ?`;

    await this._databaseService.execute(sql, [updatedAt, SyncStatus.Pending, id]);

    this._entities.update((current) => current.filter((wallet) => wallet.id !== id));

    this._syncService.syncTableOnly(Entities.Wallets, userId);
  }
}

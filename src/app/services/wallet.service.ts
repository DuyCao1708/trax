import { computed, inject, Injectable, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { WalletEntity } from '../entities/wallet';
import { Entities, SyncStatus } from '../entities';
import { v4 as uuid } from 'uuid';
import { Wallet, WalletMapper } from '../models/wallet';
import { SyncableEntityService } from './syncable-entity.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root',
})
export class WalletService extends SyncableEntityService<WalletEntity> {
  private _databaseService = inject(DatabaseService);

  protected version = inject(SyncService).getEntityVersion(Entities.Categories);

  protected entities = signal<WalletEntity[]>([]);

  readonly wallets = computed(() => this.entities().map(WalletMapper.toModel));

  get walletColors() {
    return ['teal', 'blue', 'amber', 'red', 'violet', 'pink', 'cyan', 'orange'];
  }

  constructor() {
    super(Entities.Wallets);
  }

  async loadAll(userId: string): Promise<WalletEntity[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ? AND is_deleted = 0 ORDER BY sort_order ASC`;
    const result = await this._databaseService.query(sql, [userId]);

    const data = result.values || [];
    this.entities.set(data);

    return data;
  }

  async create(data: { name: string; initial_balance: number; currency: string }, userId: string) {
    const newWallet: WalletEntity = {
      id: uuid(),
      ...data,
      balance: data.initial_balance,
      user_id: userId,
      updated_at: Date.now(),
      is_deleted: 0,
      sort_order: this.wallets().length,
      sync_status: SyncStatus.Pending,
    };

    const sql = `INSERT INTO ${this.tableName} (id, name, balance, initial_balance, currency, user_id, updated_at, is_deleted, sort_order, sync_status) VALUES (?,?,?,?,?,?,?,?,?,?)`;

    await this._databaseService.execute(sql, [
      newWallet.id,
      newWallet.name,
      newWallet.balance,
      newWallet.initial_balance,
      newWallet.currency,
      newWallet.user_id,
      newWallet.updated_at,
      newWallet.is_deleted,
      newWallet.sort_order,
      newWallet.sync_status,
    ]);

    this.entities.update((current) => [...current, newWallet]);

    this.sync(userId);

    return newWallet;
  }

  async update(id: string, data: { name: string; currency: string }, userId: string) {
    const updatedAt = Date.now();

    const sql = `
    UPDATE ${this.tableName} 
    SET name = ?, currency = ?, updated_at = ?, sync_status = ? 
    WHERE id = ? AND user_id = ?
  `;

    await this._databaseService.execute(sql, [
      data.name,
      data.currency,
      updatedAt,
      SyncStatus.Pending,
      id,
      userId,
    ]);

    this.entities.update((current) =>
      current.map((wallet) => (wallet.id === id ? { ...wallet, ...data } : wallet)),
    );

    this.sync(userId);
  }

  async updateBalanceLocal(walletId: string, amount: number, userId: string) {
    const sql = `UPDATE ${this.tableName} SET balance = balance + ?, updated_at = ? WHERE id = ? & user_id = ?`;
    await this.databaseService.execute(sql, [amount, Date.now(), walletId, userId]);

    this.entities.update((list) =>
      list.map((w) => (w.id === walletId ? { ...w, balance: w.balance + amount } : w)),
    );
  }

  async reconcileBalance(walletId: string, userId: string) {
    const sql = `
    SELECT 
      (SELECT initial_balance FROM ${this.tableName} WHERE id = ?) as baseAmount,
      TOTAL(
        CASE 
          WHEN wallet_id = ? AND type = 0 THEN amount    
          WHEN wallet_id = ? AND type = 1 THEN -amount   
          WHEN wallet_id = ? AND type = 2 THEN -amount   
          WHEN to_wallet_id = ? AND type = 2 THEN amount  
          ELSE 0 
        END
      ) as transactionDelta
    FROM ${Entities.Transactions}
    WHERE (wallet_id = ? OR to_wallet_id = ?) 
      AND is_deleted = 0 
      AND user_id = ?
  `;

    const result = await this.databaseService.query(sql, [
      walletId,
      walletId,
      walletId,
      walletId,
      walletId,
      walletId,
      walletId,
      userId,
    ]);

    const row = result.values?.[0];
    const netBalance = (row?.baseAmount ?? 0) + (row?.transactionDelta ?? 0);

    await this.databaseService.execute(
      `UPDATE ${this.tableName} SET balance = ?, updated_at = ?, sync_status = ? WHERE id = ?`,
      [netBalance, Date.now(), SyncStatus.Pending, walletId],
    );

    this.entities.update((list) =>
      list.map((w) => (w.id === walletId ? { ...w, balance: netBalance } : w)),
    );
  }

  async reorderWallets(newOrder: Wallet[], userId: string) {
    const updatedAt = Date.now();
    const currentEntities = this.entities();

    const updatedEntities = newOrder.map((model, index) => {
      const entity = currentEntities.find((e) => e.id === model.id);
      return {
        ...entity,
        sort_order: index,
        sync_status: SyncStatus.Pending,
        updated_at: updatedAt,
      } as WalletEntity;
    });

    this.entities.set(updatedEntities);

    const statements = updatedEntities.map((e) => ({
      statement: `UPDATE ${this.tableName} SET sort_order = ?, sync_status = ${SyncStatus.Pending}, updated_at = ${updatedAt} WHERE id = ?`,
      values: [e.sort_order, e.id],
    }));
    await this._databaseService.executeSet(statements);

    this.sync(userId);
  }

  async delete(id: string, userId: string) {
    const updatedAt = Date.now();
    const sql = `UPDATE ${this.tableName} SET is_deleted = 1, updated_at = ?, sync_status = ? WHERE id = ?`;

    await this._databaseService.execute(sql, [updatedAt, SyncStatus.Pending, id]);

    this.entities.update((current) => current.filter((wallet) => wallet.id !== id));

    this.sync(userId);
  }
}

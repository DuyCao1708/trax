import { inject, Injectable } from '@angular/core';
import { TransactionEntity, TransactionType } from '../entities/transaction';
import { SyncableEntityService } from './syncable-entity.service';
import { Entities, SyncStatus } from '../entities';
import { v4 as uuid } from 'uuid';
import { WalletService } from './wallet.service';

export interface TransactionLoadOptions {
  walletIds?: string[];
  categoryIds?: string[];
  type?: TransactionType;
  startAt?: number;
  endAt?: number;
  pageIndex: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService extends SyncableEntityService<TransactionEntity> {
  private _walletService = inject(WalletService);

  get types() {
    return Object.entries(TransactionType)
      .filter(([_, value]) => !isNaN(Number(value)))
      .map(([key, value], index) => ({
        name: key,
        id: value,
        icon: ['add-outline', 'remove-outline', 'swap-horizontal-outline'][index],
      }));
  }

  constructor() {
    super(Entities.Transactions);
  }

  async fetch(userId: string, options: TransactionLoadOptions): Promise<TransactionEntity[]> {
    const { walletIds = [], categoryIds = [], type, startAt, endAt, pageSize, pageIndex } = options;
    const offset = pageIndex * pageSize;

    const params: any[] = [userId];
    let filterSql = '';

    if (walletIds.length > 0) {
      const placeholders = walletIds.map(() => '?').join(',');
      filterSql += ` AND (t.wallet_id IN (${placeholders}) OR t.to_wallet_id IN (${placeholders}))`;
      params.push(...walletIds, ...walletIds);
    }

    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => '?').join(',');
      filterSql += ` AND t.category_id IN (${placeholders})`;
      params.push(...categoryIds);
    }

    if (type) {
      filterSql += ` AND t.type = ?`;
      params.push(type);
    }

    if (startAt) {
      filterSql += ` AND t.updated_at >= ?`;
      params.push(startAt);
    }
    if (endAt) {
      filterSql += ` AND t.updated_at <= ?`;
      params.push(endAt);
    }

    const sql = `
      SELECT 
        t.*, 
        c.name as category_name, c.icon as category_icon, c.color as category_color,
        w.name as wallet_name,
        tw.name as to_wallet_name
      FROM ${this.tableName} t
      LEFT JOIN ${Entities.Categories} c ON t.category_id = c.id
      LEFT JOIN ${Entities.Wallets} w ON t.wallet_id = w.id
      LEFT JOIN ${Entities.Wallets} tw ON t.to_wallet_id = tw.id
      WHERE t.user_id = ? AND t.is_deleted = 0 ${filterSql}
      ORDER BY t.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(pageSize, offset);

    const result = await this.databaseService.query(sql, params);
    const data = result.values || [];

    return data;
  }

  async create(
    data: {
      type: TransactionType;
      amount: number;
      category_id?: string;
      wallet_id: string;
      to_wallet_id?: string;
      counter_party?: string;
    },
    userId: string,
  ) {
    const newTransaction: TransactionEntity = {
      id: uuid(),
      ...data,
      user_id: userId,
      updated_at: Date.now(),
      is_deleted: 0,
      sync_status: SyncStatus.Pending,
    };

    const keys = Object.keys(newTransaction);
    const values = keys.map((key) => (newTransaction as any)[key]);
    const sql = `INSERT INTO ${Entities.Transactions} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

    await this.databaseService.execute(sql, values);

    await this.handleBalanceUpdate(newTransaction, userId);

    this.sync(userId);

    return newTransaction;
  }

  protected override async afterSyncChanged(userId: string, changes: TransactionEntity[]) {
    if (!changes || changes.length === 0) return;

    const affectedWalletIds = [
      ...new Set(changes.flatMap((t) => [t.wallet_id, t.to_wallet_id].filter((id) => !!id))),
    ] as string[];

    if (affectedWalletIds.length > 0) {
      await this._walletService.reconcileMultiple(affectedWalletIds, userId);
      this._walletService.push(userId);
    }
  }

  //#region Private methods
  private async handleBalanceUpdate(transaction: TransactionEntity, userId: string) {
    if (transaction.type === TransactionType.Income) {
      await this._walletService.updateBalanceLocal(
        transaction.wallet_id,
        transaction.amount,
        userId,
      );
    } else if (transaction.type === TransactionType.Expense) {
      await this._walletService.updateBalanceLocal(
        transaction.wallet_id,
        -transaction.amount,
        userId,
      );
    } else if (transaction.type === TransactionType.Transfer) {
      await this._walletService.updateBalanceLocal(
        transaction.wallet_id,
        -transaction.amount,
        userId,
      );
      if (transaction.to_wallet_id) {
        await this._walletService.updateBalanceLocal(
          transaction.to_wallet_id,
          transaction.amount,
          userId,
        );
      }
    }
  }
  //#endregion
}

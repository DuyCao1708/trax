import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { TransactionEntity, TransactionType } from '../entities/transaction';
import { SyncableEntityService } from './syncable-entity.service';
import { Entities, SyncStatus } from '../entities';
import { v4 as uuid } from 'uuid';
import { WalletService } from './wallet.service';
import { TransactionMapper } from '../models/transaction';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService extends SyncableEntityService<TransactionEntity> {
  private _walletService = inject(WalletService);

  protected entities = signal<TransactionEntity[]>([]);

  readonly transactions = computed(() => this.entities().map(TransactionMapper.toModel));

  protected version = inject(SyncService).getEntityVersion(Entities.Categories);

  private _currentPage = 0;
  private _pageSize = 10;
  private _hasMore = signal(true);

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

    effect(() => console.log(this.transactions()));
  }

  async load(userId: string, options: { reset: boolean } = { reset: true }) {
    const { reset } = options;
    this._currentPage = reset ? 0 : this._currentPage + 1;

    const newData = await this.loadByPage(userId, this._currentPage);

    if (reset) {
      this.entities.set(newData);
      this._hasMore.set(true);
    } else {
      this.entities.update((prev) => [...prev, ...newData]);
    }

    if (newData.length < this._pageSize) {
      this._hasMore.set(false);
    }

    return this.entities();
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

    this.entities.update((list) => [newTransaction, ...list]);

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

  private async loadByPage(userId: string, page: number): Promise<TransactionEntity[]> {
    const offset = page * this._pageSize;

    const sql = `
      SELECT 
        t.*, 
        c.name as category_name, c.icon as category_icon, c.color as category_color,
        w.name as wallet_name
      FROM ${this.tableName} t
      LEFT JOIN ${Entities.Categories} c ON t.category_id = c.id
      LEFT JOIN ${Entities.Wallets} w ON t.wallet_id = w.id
      WHERE t.user_id = ? AND t.is_deleted = 0
      ORDER BY t.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await this.databaseService.query(sql, [userId, this._pageSize, offset]);
    return result.values || [];
  }
  //#endregion
}

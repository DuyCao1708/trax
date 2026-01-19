import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { TransactionEntity, TransactionType } from '../entities/transaction';
import { SyncableEntityService } from './syncable-entity.service';
import { Entities, SyncStatus } from '../entities';
import { v4 as uuid } from 'uuid';
import { WalletService } from './wallet.service';
import { SyncResult } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TransactionService extends SyncableEntityService<TransactionEntity> {
  private _walletService = inject(WalletService);

  protected override entities: WritableSignal<TransactionEntity[]> = signal([]);

  protected override version: Signal<number> = signal(0);

  override loadAll(userId: string): Promise<TransactionEntity[]> {
    throw new Error('Method not implemented.');
  }

  constructor() {
    super(Entities.Transactions);
  }

  get types() {
    return Object.entries(TransactionType)
      .filter(([_, value]) => !isNaN(Number(value)))
      .map(([key, value], index) => ({
        name: key,
        id: value,
        icon: ['add-outline', 'remove-outline', 'swap-horizontal-outline'][index],
      }));
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

  override async afterPullChanged(userId: string, changes: TransactionEntity[]) {
    if (!changes || changes.length === 0) return;

    const affectedWalletIds = [
      ...new Set(changes.flatMap((t) => [t.wallet_id, t.to_wallet_id].filter((id) => !!id))),
    ] as string[];

    if (affectedWalletIds.length > 0) {
      await Promise.all(
        affectedWalletIds.map((id) => this._walletService.reconcileBalance(id, userId)),
      );
    }

    this._walletService.push(userId);
  }

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
}

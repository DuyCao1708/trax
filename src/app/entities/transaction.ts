import { SyncableEntity } from '.';
import { CategoryEntity } from './category';
import { WalletEntity } from './wallet';

export interface TransactionEntity extends SyncableEntity {
  type: TransactionType;
  amount: number;
  category_id?: string;
  category?: CategoryEntity;
  wallet_id: string;
  wallet?: WalletEntity;
  to_wallet_id?: string;
  to_wallet?: WalletEntity;
  counter_party?: string;
  note?: string;
}

export enum TransactionType {
  Income = 0,
  Expense = 1,
  Transfer = 2,
}

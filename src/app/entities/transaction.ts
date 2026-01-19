import { SyncableEntity } from '.';

export interface TransactionEntity extends SyncableEntity {
  type: TransactionType;
  amount: number;
  category_id?: string;
  wallet_id: string;
  to_wallet_id?: string;
  counter_party?: string;
  note?: string;
}

export enum TransactionType {
  Income = 0,
  Expense = 1,
  Transfer = 2,
}

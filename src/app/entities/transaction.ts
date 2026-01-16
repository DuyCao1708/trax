import { SyncableEntity } from '.';

export interface TransactionEntity extends SyncableEntity {
  type: TransactionType;
  amount: number;
  date: Date;
  category: string;
  wallet_id: string;
  to_wallet_id?: string;
  counter_party?: string;
}

export enum TransactionType {
  Income = 0,
  Expense = 1,
  Transfer = 2,
}

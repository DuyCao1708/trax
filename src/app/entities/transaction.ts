export interface TransactionEntity {
  type: TransactionType;
  amount: number;
  date: Date;
  category: string;
  wallet_id: string;
  counter_party: string;
  note: string;
}

export enum TransactionType {
  In = 0,
  Out = 1,
}

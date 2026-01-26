import { SyncableEntity } from '.';

export interface WalletEntity extends SyncableEntity {
  name: string;
  balance: number;
  currency: string;
  initial_balance: number;
  sort_order: number;
}

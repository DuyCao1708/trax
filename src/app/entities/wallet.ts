import { SyncableEntity } from '.';

export interface WalletEntity extends SyncableEntity {
  name: string;
  balance: number;
  currency: string;
  sort_order: number;
}

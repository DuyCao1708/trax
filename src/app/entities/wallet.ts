import { SyncableEntity } from '.';

export interface WalletEntity extends SyncableEntity {
  id: string;
  name: string;
  balance: number;
  currency: string;
  sort_order: number;
}

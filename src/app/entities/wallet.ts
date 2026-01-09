import { BooleanNumber, SyncStatus } from '.';

export interface WalletEntity {
  id: string;
  name: string;
  balance: number;
  currency: string;
  user_id?: string;
  updated_at: number;
  is_deleted: BooleanNumber;
  sync_status: SyncStatus;
}

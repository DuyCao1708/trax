import { WalletEntity } from '../entities/wallet';
import { Mapper } from './mapper';

export interface Wallet extends Omit<
  WalletEntity,
  'user_id' | 'updated_at' | 'is_deleted' | 'sync_status' | 'sort_order'
> {}

export const WalletMapper: Mapper<WalletEntity, Wallet> = {
  toModel: (entity: WalletEntity) => ({
    id: entity.id,
    name: entity.name,
    initial_balance: entity.initial_balance,
    balance: entity.balance,
    currency: entity.currency,
  }),
};

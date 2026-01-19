import { TransactionEntity } from '../entities/transaction';
import { Category, CategoryMapper } from './category';
import { Mapper } from './mapper';
import { Wallet, WalletMapper } from './wallet';

export interface Transaction extends Omit<
  TransactionEntity,
  | 'category_id'
  | 'category'
  | 'wallet_id'
  | 'wallet'
  | 'to_wallet_id'
  | 'to_wallet'
  | 'counter_party'
  | 'user_id'
  | 'updated_at'
  | 'is_deleted'
  | 'sync_status'
> {
  category?: Category;
  categoryId?: string;
  wallet?: Wallet;
  walletId: string;
  toWallet?: Wallet;
  toWalletId?: string;
  counterParty?: string;
}

export const TransactionMapper: Mapper<TransactionEntity, Transaction> = {
  toModel: (entity: TransactionEntity) => ({
    id: entity.id,
    type: entity.type,
    amount: entity.amount,
    categoryId: entity.category_id,
    category: entity.category ? CategoryMapper.toModel(entity.category) : undefined,
    walletId: entity.wallet_id,
    wallet: entity.wallet ? WalletMapper.toModel(entity.wallet) : undefined,
    toWalletId: entity.to_wallet_id,
    toWallet: entity.to_wallet ? WalletMapper.toModel(entity.to_wallet) : undefined,
    counterParty: entity.counter_party,
    note: entity.note,
  }),
};

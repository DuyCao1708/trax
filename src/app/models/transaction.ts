import { TransactionEntity } from '../entities/transaction';
import { Category } from './category';
import { Mapper } from './mapper';
import { Wallet } from './wallet';

export interface Transaction extends Omit<
  TransactionEntity,
  | 'category_id'
  | 'category_color'
  | 'category_name'
  | 'category_icon'
  | 'wallet_id'
  | 'wallet_name'
  | 'to_wallet_id'
  | 'to_wallet_name'
  | 'counter_party'
  | 'user_id'
  | 'updated_at'
  | 'is_deleted'
  | 'sync_status'
> {
  category?: Partial<Category>;
  wallet?: Partial<Wallet>;
  toWallet?: Partial<Wallet>;
  counterParty?: string;
  updatedAt: number;
}

export const TransactionMapper: Mapper<TransactionEntity, Transaction> = {
  toModel: (entity: TransactionEntity) => ({
    id: entity.id,
    type: entity.type,
    amount: entity.amount,
    category: entity.to_wallet_id
      ? {
          name: 'Transfer, withdraw',
          color: 'var(--color-emerald-500)',
          icon: 'swap-horizontal-outline',
        }
      : {
          id: entity.category_id,
          name: entity.category_name,
          color: `var(--color-${entity.category_color}-500)`,
          icon: entity.category_icon,
        },
    wallet: {
      id: entity.wallet_id,
      name: entity.wallet_name,
    },
    toWallet: entity.to_wallet_id
      ? {
          id: entity.to_wallet_id,
          name: entity.to_wallet_name,
        }
      : undefined,
    counterParty: entity.counter_party,
    note: entity.note,
    updatedAt: entity.updated_at,
  }),
};

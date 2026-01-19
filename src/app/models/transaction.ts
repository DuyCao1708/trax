import { TransactionEntity } from '../entities/transaction';

export interface Transaction extends Omit<
  TransactionEntity,
  'category_id' | 'wallet_id' | 'to_wallet_id' | 'counter_party'
> {
  categoryId?: string;
  walletId: string;
  toWalletId?: string;
  counterParty?: string;
}

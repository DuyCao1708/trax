import { TransactionEntity } from '../entities/transaction';

export interface Transaction extends Omit<TransactionEntity, 'wallet' | 'counter_party'> {
  wallet: string;
  counterParty: string;
}

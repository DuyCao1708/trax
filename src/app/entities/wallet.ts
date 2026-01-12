import { SynctableEntity } from '.';

export interface WalletEntity extends SynctableEntity {
  id: string;
  name: string;
  balance: number;
  currency: string;
  sort_order: number;
}

export enum Entities {
  Patterns = 'patterns',
  Wallets = 'wallets',
  Categories = 'categories',
  Users = 'users',
}

export type BooleanNumber = 0 | 1 | '0' | '1';

export enum SyncStatus {
  Failed = 0,
  Synced = 1,
  Pending = 2,
}

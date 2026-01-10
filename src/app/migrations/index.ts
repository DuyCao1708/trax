import { Entities } from '../entities';

export const MIGRATION_STATEMENTS = [
  {
    toVersion: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS ${Entities.Wallets} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        currency TEXT NOT NULL,
        user_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        sync_status INTEGER DEFAULT 0
      );`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Wallets}_user_id ON wallets(user_id);`,
    ],
  },
  {
    toVersion: 2,
    statements: [
      `ALTER TABLE ${Entities.Wallets} ADD COLUMN sort_order INTEGER DEFAULT 0;`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Wallets}_sort_order ON ${Entities.Wallets}(sort_order);`,
    ],
  },
];

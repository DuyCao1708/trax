import { Entities } from '../entities';

export const MIGRATION_STATEMENTS = [
  {
    toVersion: 1,
    statements: [
      // Wallets table
      `CREATE TABLE IF NOT EXISTS ${Entities.Wallets} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        currency TEXT NOT NULL,
        user_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        sync_status INTEGER DEFAULT 2
      );`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Wallets}_user_id ON wallets(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Wallets}_sort_order ON ${Entities.Wallets}(sort_order);`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS ${Entities.Categories} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        parent_id TEXT,
        is_default INTEGER DEFAULT 0,
        user_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0, 
        sync_status INTEGER DEFAULT 2,
        FOREIGN KEY (parent_id) REFERENCES ${Entities.Categories} (id) ON DELETE SET NULL
      );`,

      `CREATE INDEX IF NOT EXISTS idx_${Entities.Categories}_user_id ON ${Entities.Categories}(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Categories}_parent_id ON ${Entities.Categories}(parent_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Categories}_user_active ON ${Entities.Categories}(user_id, is_deleted);`,

      // `INSERT OR IGNORE INTO ${Entities.Categories} (id, name, icon, color, parent_id, is_default, user_id, updated_at, is_deleted, sync_status)
      //   VALUES ('sys_food', 'Ăn uống', 'restaurant', '#FF9500', NULL, 1, 'system', ${Date.now()}, 0, 1);`,
    ],
  },
];

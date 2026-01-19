import { Entities, SyncStatus } from '../entities';
import { DEFAULT_CATEGORIES } from './default-categories';

export const MIGRATION_STATEMENTS = [
  {
    toVersion: 1,
    statements: [
      //#region Wallets table
      `CREATE TABLE IF NOT EXISTS ${Entities.Wallets} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        initial_balance REAL DEFAULT 0,
        currency TEXT NOT NULL,
        user_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        sync_status INTEGER DEFAULT ${SyncStatus.Pending}
      );`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Wallets}_user_id ON ${Entities.Wallets}(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Wallets}_sort_order ON ${Entities.Wallets}(sort_order);`,
      //#endregion Wallets table

      //#region Categories table
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
        sync_status INTEGER DEFAULT ${SyncStatus.Pending},
        FOREIGN KEY (parent_id) REFERENCES ${Entities.Categories} (id) ON DELETE SET NULL
      );`,

      `CREATE INDEX IF NOT EXISTS idx_${Entities.Categories}_user_id ON ${Entities.Categories}(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Categories}_parent_id ON ${Entities.Categories}(parent_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Categories}_user_active ON ${Entities.Categories}(user_id, is_deleted);`,

      ...DEFAULT_CATEGORIES.map(
        (cat) => `
        INSERT OR IGNORE INTO ${Entities.Categories} 
        (id, name, icon, color, parent_id, is_default, user_id, updated_at, is_deleted, sync_status)
        VALUES (
          '${cat.id}', 
          '${cat.name.replace(/'/g, "''")}', 
          '${cat.icon}', 
          '${cat.color}', 
          ${cat.parent_id ? `'${cat.parent_id}'` : 'NULL'}, 
          1, 
          'system', 
          ${cat.updated_at}, 
          0, 
          ${SyncStatus.Synced}
        );
      `,
      ),
      //#endregion Categories table

      //#region Transactions table
      `CREATE TABLE IF NOT EXISTS ${Entities.Transactions} (
        id TEXT PRIMARY KEY,
        type INTEGER NOT NULL,
        amount REAL NOT NULL,
        category_id TEXT,
        wallet_id TEXT NOT NULL,
        to_wallet_id TEXT,
        counter_party TEXT,
        note TEXT,
        user_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        sync_status INTEGER DEFAULT ${SyncStatus.Pending}
      );`,

      `CREATE INDEX IF NOT EXISTS idx_${Entities.Transactions}_user_id ON ${Entities.Transactions}(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${Entities.Transactions}_wallet_date ON ${Entities.Transactions}(wallet_id, updated_at DESC);`,
      //#endregion
    ],
  },
];

export const APP_UPGRADES = [
  {
    toVersion: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        color TEXT,
        user_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        sync_status INTEGER DEFAULT 0
      );`,
      `CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);`,
    ],
  },
  // Sau này nếu thêm bảng Giao dịch, bạn chỉ cần thêm:
  /*
  {
    toVersion: 2,
    statements: [
      `CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, amount REAL, wallet_id TEXT);`
    ]
  }
  */
];

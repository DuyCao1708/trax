import { inject, Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SqliteService } from './sqlite.service';
import { MIGRATION_STATEMENTS } from '../migrations';
import { DATABASE_NAME } from '../constants/index';
import { Entities, SyncStatus } from '../entities';
import { DEFAULT_CATEGORIES } from '../migrations/default-categories';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private _sqliteService = inject(SqliteService);
  private _database!: SQLiteDBConnection;

  async initializeDatabase() {
    await CapacitorSQLite.addUpgradeStatement({
      database: DATABASE_NAME,
      upgrade: MIGRATION_STATEMENTS,
    });

    const lastVersion = MIGRATION_STATEMENTS[MIGRATION_STATEMENTS.length - 1].toVersion;
    this._database = await this._sqliteService.openDatabase(DATABASE_NAME, lastVersion);
  }

  async query(sql: string, params: any[] = []) {
    return await this._database.query(sql, params);
  }

  async execute(sql: string, params: any[] = []) {
    const res = await this._database.run(sql, params);

    if (this._sqliteService.platform === 'web') {
      await this._sqliteService.sqliteConnection.saveToStore(DATABASE_NAME);
    }

    return res;
  }

  async executeSet(set: { statement: string; values: any[] }[]) {
    const res = await this._database.executeSet(set);

    if (this._sqliteService.platform === 'web') {
      await this._sqliteService.sqliteConnection.saveToStore(DATABASE_NAME);
    }

    return res;
  }

  async reset() {
    const tables = Object.values(Entities).filter((t) => t !== Entities.Users);

    await this.executeSet(
      tables.map((table) => ({
        statement: `DELETE FROM ${table}`,
        values: [],
      })),
    );

    await this.seedDefaultCategories();
  }

  private async seedDefaultCategories() {
    const now = Date.now();
    const statements = DEFAULT_CATEGORIES.map((cat) => ({
      statement: `INSERT OR REPLACE INTO ${Entities.Categories} 
      (id, name, icon, color, parent_id, is_default, user_id, updated_at, is_deleted, sync_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [
        cat.id,
        cat.name,
        cat.icon,
        cat.color,
        cat.parent_id,
        1,
        'system',
        now,
        0,
        SyncStatus.Synced,
      ],
    }));

    await this.executeSet(statements);
  }
}

import { inject, Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SqliteService } from './sqlite.service';
import { APP_UPGRADES } from '../upgrades/app.upgrade.statements';
import { DATABASE_NAME } from '../constants/index.ts';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private _sqliteService = inject(SqliteService);
  private _database!: SQLiteDBConnection;

  async initializeDatabase() {
    await CapacitorSQLite.addUpgradeStatement({
      database: DATABASE_NAME,
      upgrade: APP_UPGRADES,
    });

    const lastVersion = APP_UPGRADES[APP_UPGRADES.length - 1].toVersion;
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
}

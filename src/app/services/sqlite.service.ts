import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  sqliteConnection!: SQLiteConnection;
  platform!: string;

  async initializePlugin(): Promise<void> {
    this.platform = Capacitor.getPlatform();
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initWebStore(): Promise<void> {
    try {
      await this.sqliteConnection.initWebStore();
    } catch (err) {
      console.error('initWebStore error:', err);
    }
  }

  async openDatabase(dbName: string, version: number): Promise<SQLiteDBConnection> {
    await this.sqliteConnection.checkConnectionsConsistency();
    const isConn = (await this.sqliteConnection.isConnection(dbName, false)).result;

    let db: SQLiteDBConnection;
    if (isConn) {
      db = await this.sqliteConnection.retrieveConnection(dbName, false);
    } else {
      db = await this.sqliteConnection.createConnection(
        dbName,
        false,
        'no-encryption',
        version,
        false,
      );
    }
    await db.open();
    return db;
  }
}

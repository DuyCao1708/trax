import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { SqliteService } from './sqlite.service';
import { AuthService } from './auth.service';
import { Network } from '@capacitor/network';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root',
})
export class InitializeAppService {
  private _sqliteService = inject(SqliteService);
  private _databaseService = inject(DatabaseService);
  private _authService = inject(AuthService);
  private _syncService = inject(SyncService);

  async initializeApp() {
    try {
      await this.initializeDatabase();
      await this._authService.initializeAuth();

      this.listenOnNetworkChanges();
    } catch (error) {
      console.error('App init error:', error);
    }
  }

  private listenOnNetworkChanges() {
    Network.addListener('networkStatusChange', (status) => {
      if (status.connected) {
        const userId = this._authService.currentUser()?.uid;
        if (userId) {
          this._syncService.syncAll(userId);
        }
      }
    });
  }

  private async initializeDatabase() {
    try {
      await this._sqliteService.initializePlugin();

      if (this._sqliteService.platform === 'web') {
        await this._sqliteService.initWebStore();
      }

      await this._databaseService.initializeDatabase();
    } catch (error) {
      console.error('Database init error:', error);
    }
  }
}

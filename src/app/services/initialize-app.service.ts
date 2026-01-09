import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { SqliteService } from './sqlite.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class InitializeAppService {
  private sqliteService = inject(SqliteService);
  private databaseService = inject(DatabaseService);
  private _authService = inject(AuthService);

  async initializeApp() {
    try {
      await this.initializeDatabase();
      await this._authService.initializeAuth();
    } catch (error) {
      console.error('App init error:', error);
    }
  }

  private async initializeDatabase() {
    try {
      await this.sqliteService.initializePlugin();

      if (this.sqliteService.platform === 'web') {
        await this.sqliteService.initWebStore();
      }

      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Database init error:', error);
    }
  }
}

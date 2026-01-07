import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private _authService = inject(AuthService);
  private _firebaseService = inject(FirebaseService);
}

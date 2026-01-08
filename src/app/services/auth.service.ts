import { inject, Injectable, signal } from '@angular/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { FirebaseService } from './firebase.service';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  User,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { LoadingStatus } from '../models/loading-status';
import { Preferences } from '@capacitor/preferences';
import { SETTINGS_KEYS, STORAGE_KEYS } from '../constants/storage-keys';
import { AlertController } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser } from '../entities/app-user';
import { Entities } from '../entities';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(FirebaseService).auth;
  private _database = inject(FirebaseService).database;
  private _alert = inject(AlertController);
  private _router = inject(Router);

  currentUser = signal<User | null>(null);

  status = signal<LoadingStatus>('idle');

  constructor() {
    this.status.set('loading');

    onAuthStateChanged(this._auth, async (user) => this.handleUserChanged(user));
  }

  async loginWithGoogle() {
    try {
      this.status.set('loading');

      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);

        await signInWithCredential(this._auth, credential);
      } else {
        this.status.set('loaded');
      }
    } catch (error) {
      this.status.set('loaded');
      console.error('Google login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      this.status.set('loading');
      await signOut(this._auth);

      await Preferences.remove({ key: SETTINGS_KEYS.USE_BIOMETRIC });

      if (Capacitor.isNativePlatform()) {
        await this.deleteBiometricCredentials();
      }
    } catch (error) {
      this.status.set('loaded');
      console.error('Logout error:', error);
    }
  }

  async toggleBiometric(isEnabled: boolean) {
    const user = this.currentUser();
    if (!user) return;

    if (isEnabled) {
      const verified = await this.verifyBiometric();
      if (verified) {
        await this.saveBiometricCredentials(user);
        await Preferences.set({ key: SETTINGS_KEYS.USE_BIOMETRIC, value: 'true' });
      } else {
        return;
      }
    } else {
      await this.deleteBiometricCredentials();
      await Preferences.set({ key: SETTINGS_KEYS.USE_BIOMETRIC, value: 'false' });
    }

    await this.updateBiometricStatus(this.currentUser()!.uid, isEnabled);
  }

  //#region Private methods
  private async handleUserChanged(user: User | null) {
    if (!user) {
      this.currentUser.set(null);
      this.status.set('loaded');
      return;
    }

    const { value } = await Preferences.get({ key: SETTINGS_KEYS.USE_BIOMETRIC });

    if (value === 'true') {
      const credentials = await this.getStoredCredentials();

      if (credentials && credentials.password === user.uid) {
        this.completeLogin(user);
      } else {
        await this.logout();
      }

      return;
    }

    if (value === null) {
      const userDoc = await getDoc(doc(this._database, `${Entities.Users}/${user.uid}`));
      const userData = userDoc.data() as AppUser;

      if (userData?.biometric_enabled) {
        const verified = await this.verifyBiometric();

        if (verified) {
          await this.saveBiometricCredentials(user);
          await Preferences.set({ key: SETTINGS_KEYS.USE_BIOMETRIC, value: 'true' });
        }
      } else {
        this.askToEnableBiometric(user);
      }
    }

    this.completeLogin(user);
  }

  private async checkBiometric() {
    const result = await NativeBiometric.isAvailable();

    if (result.isAvailable) {
      console.log(`Biometric type: ${result.biometryType}`);
    }

    return result.isAvailable;
  }

  private async verifyBiometric() {
    const verified = await NativeBiometric.verifyIdentity({
      reason: 'For secure access to your account',
      title: 'Xác thực đó là bạn',
      description: 'Vui lòng quét vân tay để tiếp tục.',
    })
      .then(() => true)
      .catch(() => false);

    return verified;
  }

  private async askToEnableBiometric(user: User) {
    const isAvailable = await this.checkBiometric();
    if (!isAvailable) return;

    const alert = await this._alert.create({
      header: 'Bảo mật vân tay',
      message: 'Bạn có muốn sử dụng vân tay để đăng nhập nhanh cho lần sau không?',
      buttons: [
        {
          text: 'Để sau',
          role: 'cancel',
        },
        {
          text: 'Đồng ý',
          handler: async () => {
            const verified = await this.verifyBiometric();

            if (verified) {
              await this.saveBiometricCredentials(user);
              await Preferences.set({ key: SETTINGS_KEYS.USE_BIOMETRIC, value: 'true' });
              await this.updateBiometricStatus(user.uid, true);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private async updateBiometricStatus(uid: string, isEnabled: boolean) {
    try {
      const userDocRef = doc(this._database, `${Entities.Users}/${uid}`);

      const user: AppUser = {
        biometric_enabled: isEnabled,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, user, { merge: true });
    } catch (error) {
      console.error('Sync to Cloud failed:', error);
    }
  }

  private async saveBiometricCredentials(user: User) {
    try {
      await NativeBiometric.setCredentials({
        username: user.email || '',
        password: user.uid,
        server: STORAGE_KEYS.AUTH_CREDENTIAL,
      });
    } catch (error) {
      console.error('Stored credential failed:', error);
    }
  }

  private async getStoredCredentials() {
    try {
      const isVerified = await this.verifyBiometric();

      if (!isVerified) return null;

      const credentials = await NativeBiometric.getCredentials({
        server: STORAGE_KEYS.AUTH_CREDENTIAL,
      });

      return credentials;
    } catch (error) {
      console.error('Cannot get credential:', error);
      return null;
    }
  }

  private async deleteBiometricCredentials() {
    await NativeBiometric.deleteCredentials({
      server: STORAGE_KEYS.AUTH_CREDENTIAL,
    });
  }

  private completeLogin(user: User) {
    this.currentUser.set(user);
    this.status.set('loaded');
    this._router.navigate(['/home']);
  }
  //#endregion Private methods
}

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
import { Preferences } from '@capacitor/preferences';
import { OPERATION_KEYS } from '../constants/index';
import { AlertController } from '@ionic/angular/standalone';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser } from '../entities/app-user';
import { Entities } from '../entities';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(FirebaseService).auth;
  private _firestore = inject(FirebaseService).database;
  private _databaseService = inject(DatabaseService);
  private _alert = inject(AlertController);
  private _router = inject(Router);

  currentUser = signal<User | null>(null);

  private _isListenerSetup = false;

  async initializeAuth() {
    const { value: cachedUser } = await Preferences.get({ key: OPERATION_KEYS.CACHED_USER });

    if (!cachedUser) {
      return;
    }

    const { value: isBioEnabled } = await Preferences.get({ key: OPERATION_KEYS.USE_BIOMETRIC });
    if (isBioEnabled == '1') {
      const isVerified = await this.verifyBiometric();

      if (!isVerified) {
        this._router.navigate(['/locked'], {
          queryParams: { redirectUrl: this._router.url },
        });
        return;
      }
    }

    const user = JSON.parse(cachedUser);
    this.currentUser.set(user);

    this.setupAuthListener();
  }

  async loginWithGoogle() {
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result.credential?.idToken;
    if (idToken) {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(this._auth, credential);
      await this.updateUserCache(userCredential.user);

      this.currentUser.set(userCredential.user);

      this.restoreSettingsFromCloud(userCredential.user);

      this._router.navigate(['/home']);
    }
  }

  async logout() {
    await signOut(this._auth);

    await this.removeUserOperationPreferences();

    await this._databaseService.reset();

    this.currentUser.set(null);
    this._router.navigate(['/']);
  }

  async toggleBiometric(isEnabled: boolean) {
    const user = this.currentUser();
    if (!user) return false;

    if (isEnabled) {
      const verified = await this.verifyBiometric();
      if (!verified) return false;

      await Preferences.set({ key: OPERATION_KEYS.USE_BIOMETRIC, value: '1' });
    } else {
      await Preferences.set({ key: OPERATION_KEYS.USE_BIOMETRIC, value: '0' });
    }

    await this.updateBiometricStatusOnCloud(user.uid, isEnabled);
    return true;
  }

  //#region Private methods
  private async verifyBiometric(): Promise<boolean> {
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) return true;

    return await NativeBiometric.verifyIdentity({
      title: 'Identity Verification',
      description: 'Please scan your fingerprint or face to continue.',
    })
      .then(() => true)
      .catch(() => false);
  }

  private async updateUserCache(user: User) {
    const profile = {
      uid: user.uid,
      email: user.email,
    };
    await Preferences.set({ key: OPERATION_KEYS.CACHED_USER, value: JSON.stringify(profile) });
  }

  private async updateBiometricStatusOnCloud(uid: string, isEnabled: boolean) {
    const userDocRef = doc(this._firestore, `${Entities.Users}/${uid}`);
    const user: AppUser = {
      biometric_enabled: isEnabled ? 1 : 0,
      updated_at: new Date().getTime(),
    };
    await setDoc(userDocRef, user, { merge: true });
  }

  private async restoreSettingsFromCloud(user: User) {
    try {
      const userDoc = await getDoc(doc(this._firestore, `${Entities.Users}/${user.uid}`));
      const userData = userDoc.data() as AppUser;

      if (userData?.biometric_enabled) {
        await Preferences.set({ key: OPERATION_KEYS.USE_BIOMETRIC, value: '1' });
      } else {
        this.askToEnableBiometric();
      }
    } catch (e) {
      console.error('Restore settings failed', e);
    }
  }

  private async askToEnableBiometric() {
    const res = await NativeBiometric.isAvailable();
    if (!res.isAvailable) return;

    const alert = await this._alert.create({
      header: 'Enable Biometrics',
      message: 'Would you like to use biometrics for faster login next time?',
      buttons: [
        { text: 'Maybe Later', role: 'cancel' },
        {
          text: 'Enable',
          handler: () => this.toggleBiometric(true),
        },
      ],
    });
    await alert.present();
  }

  private async removeUserOperationPreferences() {
    const { keys } = await Preferences.keys();
    const staticKeys = Object.values(OPERATION_KEYS);

    for (const key of keys) {
      const shouldRemove = staticKeys.some((sKey) => key.startsWith(sKey));

      if (shouldRemove) {
        await Preferences.remove({ key });
      }
    }
  }

  private setupAuthListener() {
    if (this._isListenerSetup) return;

    onAuthStateChanged(this._auth, (fbUser) => {
      if (fbUser) {
        this.updateUserCache(fbUser);
      } else if (this.currentUser()) {
        this.logout();
      }
    });

    this._isListenerSetup = true;
  }
  //#endregion Private methods
}

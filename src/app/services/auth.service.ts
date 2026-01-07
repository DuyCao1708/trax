import { inject, Injectable, signal } from '@angular/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { FirebaseService } from './firebase.service';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(FirebaseService).auth;

  currentUser = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(this._auth, (user) => {
      this.currentUser.set(user);
      if (user) {
        console.log('User logged in:', user.displayName);
      } else {
        console.log('User logged out');
      }
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this._auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Đăng nhập bằng Facebook
  async loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(this._auth, provider);
      return result.user;
    } catch (error) {
      console.error('Facebook login error:', error);
      throw error;
    }
  }

  async checkBiometric() {
    const result = await NativeBiometric.isAvailable();

    if (result.isAvailable) {
      console.log(`Biometric type: ${result.biometryType}`);
    }

    return result.isAvailable;
  }

  async logout() {
    try {
      await signOut(this._auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async verify() {
    const verified = await NativeBiometric.verifyIdentity({
      reason: 'For secure access to your account',
      title: 'Authentication',
      subtitle: 'Verify your identity',
      description: 'Place your finger on the sensor',
    })
      .then(() => true)
      .catch(() => false);

    if (verified) {
      console.log('Authentication successful');
    }

    return verified;
  }

  async saveCredentials() {
    await NativeBiometric.setCredentials({
      username: 'user@example.com',
      password: 'securepassword',
      server: 'https://api.example.com',
    });
  }

  async getCredentials() {
    const credentials = await NativeBiometric.getCredentials({
      server: 'https://api.example.com',
    });

    console.log(credentials.username);
    console.log(credentials.password);
  }

  async deleteCredentials() {
    await NativeBiometric.deleteCredentials({
      server: 'https://api.example.com',
    });
  }
}

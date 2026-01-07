import { Injectable } from '@angular/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  async checkBiometric() {
    const result = await NativeBiometric.isAvailable();

    if (result.isAvailable) {
      console.log(`Biometric type: ${result.biometryType}`);
    }

    return result.isAvailable;
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

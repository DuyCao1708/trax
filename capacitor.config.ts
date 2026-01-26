import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'trax.app',
  appName: 'Trax',
  webDir: 'dist/trax/browser',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'trax-app',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Xác thực ví',
      },
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Xác thực ví',
        biometricSubTitle: 'Vui lòng xác thực để mở cơ sở dữ liệu',
      },
      electronIsEncryption: true,
      electronWindowsLocation: 'C:\\ProgramData\\CapacitorSQLite',
      electronMacLocation: '/Users/Shared/CapacitorSQLite',
      electronLinuxLocation: '~/.local/share/CapacitorSQLite',
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
  android: {
    adjustMarginsForEdgeToEdge: 'auto',
  },
};

export default config;

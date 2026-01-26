# <img src="public/logo.svg" width="128" vertical-align="middle">

**Trax** is a lightweight and intuitive personal finance management tool. This version focuses on manual transaction tracking with real-time synchronization across all your devices, helping you stay on top of your financial health.

---

<p align="center">
  <img width="24%" alt="Screen Shot 2026-01-26 at 14 27 35" src="https://github.com/user-attachments/assets/0e06847d-da51-4b9f-8770-7140d2e642ab" />
  <img width="24%"  alt="Screen Shot 2026-01-26 at 14 29 12" src="https://github.com/user-attachments/assets/b23542e1-ef33-4f0a-a889-70dd8db390a2" />
  <img width="24%"alt="Screen Shot 2026-01-26 at 14 29 52" src="https://github.com/user-attachments/assets/0ff8de47-ad74-4302-98b5-0bf5acbf709b" />
  <img width="24%" alt="Screen Shot 2026-01-26 at 14 30 28" src="https://github.com/user-attachments/assets/a23d7f4a-38b2-4847-b447-5f20d1eff200" />
</p>

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it as you wish.

*See the [LICENSE](LICENSE) file for more details.*

## ✨ Key Features
* **Real-time Cloud Sync:** Keep your data consistent across multiple devices. Never lose your financial records thanks to Firebase integration.
* **Wallet & Category Management:** Fully customizable system to add, edit, or delete wallets and expense categories to fit your lifestyle.
* **Full Transaction CRUD:** Easily Create, Read, Update, and Delete your transactions with a clean and user-friendly interface.
* **Advanced Filtering:** Quickly analyze your spending with powerful filters by **Time (Date Range)** and **Specific Categories**.
* **Expense Structure Visualization:** Gain a clear understanding of where your money goes with a detailed breakdown of your expense structure.
* **Secure Google Login:** Quick and secure access using your Google account via Firebase Authentication.

## 🔒 Data Privacy & Security

As an experimental personal finance tool, **Trax** treats your data with absolute transparency:

* **Purpose of Data Storage:** Your financial data is stored on **Firebase Cloud** for the **sole purpose of synchronization** between your devices. This ensures that when you add a transaction on one phone, it appears on your other devices instantly.
* **Minimal Data Collection:** We only store what you explicitly enter (transactions, wallet names, and categories). We do not track your location, device ID, or any other metadata.
* **Google Authentication:** Your login is handled entirely by Google. Trax never sees or stores your password; it only receives a secure token to identify your account for syncing.
* **No Data Mining:** Your financial records are private. We do not analyze, sell, or share your data with any third parties. It sits securely in your personal Firebase silo.

## 📥 Download

Ready to use **Trax**? You don't need to build it from source.

1. Go to the **[Latest Release](https://github.com/DuyCao1708/trax/releases/latest)**.
2. Under the **Assets** section, download the `.apk` file.
3. Open the file on your Android device to install.

> **Tip:** You might need to allow "Install from unknown sources" in your Android settings as this is an experimental app outside the Play Store.

## 🛠 Tech Stack
- **Frontend:** Angular 21
- **Native Bridge:** Capacitor 8
- **Database:** Firebase Firestore & Capacitor SQLite
- **Authentication:** Firebase Auth (Google Provider)

## 🎨 Credits & Inspiration

The UI/UX design and core features of **Trax** are heavily inspired by **[Wallet by BudgetBakers](https://budgetbakers.com/)**. 

While Trax is built from scratch as a personal project to practice **Angular** and **Capacitor**, it aims to replicate the intuitive flow and clean aesthetics that make BudgetBakers' application a gold standard in personal finance management.

## 🚀 Getting Started

Follow these steps to set up the development environment and run **Trax** on your local machine.

### 📋 Prerequisites

To ensure compatibility with **Android Studio Narwhal**, please use the following environment:

* **Node.js**: v20.x or later (LTS)
* **Package Manager**: npm v10.x or later
* **Android Studio**: Narwhal (2025.1.4)
* **JDK**: v21 (Bundled with Android Studio Narwhal)
* **Android SDK**: API Level 35
* **Ionic CLI**: `npm install -g @ionic/cli`

### ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DuyCao1708/trax.git
    cd trax
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration (Action Required):**
    For security reasons, configuration files are excluded. Since Trax is a WebView-based app, you must create **two apps** within your Firebase Project:

    * **App 1: Web App (For WebView & Web Development)**
        * Create a Web App in the Firebase Console.
        * Copy the `firebaseConfig` object.
        * Paste it into your local files: `src/environments/environment.ts` and `src/environments/environment.development.ts`.
    
    * **App 2: Android App (For Native Mobile Features)**
        * Create an Android App using your package name (e.g., `com.duycao.trax`).
        * **Certificate Fingerprints:** You **must** add your **SHA-1** and **SHA-256** fingerprints (for both Debug and Release keys) to the Firebase Console. This is required for Google Sign-In to function on mobile devices.

### 🏃 Running the App

#### 1. Web Development
For standard browser-based development:
```bash
ng serve
```

#### 2. Mobile Debugging (Live Reload via ADB)
To debug directly on a physical Android device, use the Capacitor CLI combined with ADB (via USB or Wi-Fi). This allows you to see your changes instantly on the phone without re-building the APK.

##### Prerequisites:
  - Enable Developer Options and USB Debugging on your Android device.
  - Ensure your computer and phone are on the same Wi-Fi network (if debugging via Wi-Fi).
  - Connect your device via USB or pair it via ADB Wireless.

```bash
adb pair [your-device-ip:port-to-pair]
adb connect [your-device-ip:port-to-connect]
npx cap run android --host 0.0.0.0 --port 4200 --live-reload --target [your-device-adb-id]
```
  



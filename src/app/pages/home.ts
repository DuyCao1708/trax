import { Component, effect, inject, signal } from '@angular/core';
import { Wallets } from '../components/wallets';
import { Header } from '../components/header';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { SyncService } from '../services/sync.service';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { WalletService } from '../services/wallet.service';
import { TransactionsOverview } from '../components/transactions-overview';
import { Wallet } from '../models/wallet';
import { ExpensesStructure } from '../components/expenses-structure';

@Component({
  selector: 'home',
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    Wallets,
    Header,
    IonFab,
    IonFabButton,
    IonIcon,
    RouterLink,
    IonFabList,
    TransactionsOverview,
    ExpensesStructure,
  ],
  template: `
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <header></header>

      <wallets
        class="block px-3 pb-4 border-b border-(--ion-text-color-step-800)"
        (walletsSelected)="selectedWallets.set($event)"
      ></wallets>

      <expenses-structure class="mt-2 mx-3" [fromWallets]="selectedWallets()"></expenses-structure>

      <transactions-overview
        class="mt-2 mx-3"
        [fromWallets]="selectedWallets()"
      ></transactions-overview>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button [style.--color]="'var(--color-white)'">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>

        <ion-fab-list side="top">
          @for (type of transactionTypes; track type.id) {
            <ion-fab-button
              [routerLink]="['/quick-transaction-form']"
              [queryParams]="{ type: type.id, walletId: selectedWallets()[0]?.id }"
              [attr.data-label]="type.name"
            >
              <ion-icon [name]="type.icon"></ion-icon>
            </ion-fab-button>
          }
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  `,
  styles: `
    ion-fab-button:not(:has(ion-fab-list.fab-list-active)) {
      --border-radius: 12px;
    }

    ion-fab-list ion-fab-button {
      position: relative;
      --color: var(--ion-color-dark);
    }

    ion-fab-list ion-fab-button:after {
      content: attr(data-label);
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateX(-100%) translateY(-50%);
      font-weight: 500;
    }
  `,
})
export class Home {
  private _authService = inject(AuthService);
  private _syncService = inject(SyncService);
  private _transactionService = inject(TransactionService);
  private _walletService = inject(WalletService);

  protected readonly transactionTypes = this._transactionService.types;

  protected selectedWallets = signal<Wallet[]>([]);

  async handleRefresh(event: RefresherCustomEvent) {
    try {
      const userId = this._authService.currentUser()?.uid;
      if (userId) {
        await this._syncService.syncAll(userId);
        this._walletService.load(userId);
      }
    } catch (error) {
      console.error('Lỗi khi refresh:', error);
    } finally {
      event.target.complete();
    }
  }
}

// async ngOnInit() {
// const bidvPattern = {
//   bank_key: 'BIDV',
//   // Lưu ý: Trong chuỗi String của TypeScript, bạn cần double backslash \\ cho Regex
//   regex_str:
//     'Thời gian giao dịch: (?<time>[\\d:]+) (?<date>[\\d\\/]+)[\\s\\S]*Số tiền GD: (?<type>[\\+\\-])(?<amount>[\\d,.]+) VND[\\s\\S]*Số dư cuối: (?<balance>[\\d,.]+) VND[\\s\\S]*Nội dung giao dịch: (?<note>[\\s\\S]*?)(?=\\nMã giao dịch|$)',
//   signature: 'BIDV: {type}{amount} - {note}',
//   wallet_id: 1,
//   created_at: new Date(), // Firebase sẽ tự hiểu là Timestamp
//   usage_count: 0,
//   confidence_score: 1.0,
//   is_active: true,
// };
// const rawSms =
//   '{"packageName":"com.vnpay.bidv","title":"Thông báo BIDV","text":"Thời gian giao dịch: 16:43 06/01/2026\\nTài khoản thanh toán: 6201178820\\nSố tiền GD: -10,000 VND\\nSố dư cuối: 10,902,324 VND\\nNội dung giao dịch: MB-TKThe 0004100022679006_NGUYEN THI VAN ANH, tai OCB. ND TU CAO DUY Chuyen tien -CTLNHIDO000013992840879\\nMã giao dịch: 0833KVsA-85xDcYQ33"}';
// const result = this.parseNotif(rawSms, bidvPattern);
// console.log('Kết quả bóc tách:', result);
// }

// parseNotif(smsText: string, pattern: PatternEntity): any {
//   // 1. Khởi tạo Regex từ chuỗi đã lưu trong DB
//   const regex = new RegExp(pattern.regex_str, 'i');

//   // 2. Thực hiện so khớp
//   const match = smsText.match(regex);

//   if (match && match.groups) {
//     const { type, amount, date, time, note } = match.groups;

//     // 3. Hậu xử lý dữ liệu thô từ chuỗi thành kiểu dữ liệu chuẩn
//     return {
//       type: type === '+' ? TransactionType.Income : TransactionType.Expense,
//       amount: parseFloat(amount.replace(/,/g, '')), // "10,000" -> 10000
//       date: this.parseDateTime(date, time),
//       note: note.trim(),
//       bankKey: pattern.bank_key,
//     };
//   }
//   return null;
// }

// private parseDateTime(dateStr: string, timeStr: string): Date {
//   // Chuyển "06/01/2026" + "16:43" -> Object Date
//   const [day, month, year] = dateStr.split('/').map(Number);
//   const [hour, min] = timeStr.split(':').map(Number);
//   return new Date(year, month - 1, day, hour, min);
// }

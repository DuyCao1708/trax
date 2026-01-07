import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NotificationReader } from 'notification-reader';
import { AiService } from './services/ai.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Transaction } from './models/transaction';
import { PatternEntity } from './entities/pattern';
import { TransactionType } from './entities/transaction';
import { DatabaseService } from './services/database.service';
import { IonButton } from '@ionic/angular/standalone';
import { Categories } from './components/categories';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IonButton, Categories],
  template: `
    <categories></categories>

    <router-outlet />
  `,
  styles: [],
})
export class App implements AfterViewInit {
  private _authService = inject(AuthService);
  private _aiService = inject(AiService);
  private _databaseService = inject(DatabaseService);

  message = signal('Chờ đăng nhập');

  notifications = signal<string[]>([]);

  analyzedObjs = signal<Transaction[]>([]);

  constructor() {
    const bidvPattern = {
      bank_key: 'BIDV',
      // Lưu ý: Trong chuỗi String của TypeScript, bạn cần double backslash \\ cho Regex
      regex_str:
        'Thời gian giao dịch: (?<time>[\\d:]+) (?<date>[\\d\\/]+)[\\s\\S]*Số tiền GD: (?<type>[\\+\\-])(?<amount>[\\d,.]+) VND[\\s\\S]*Số dư cuối: (?<balance>[\\d,.]+) VND[\\s\\S]*Nội dung giao dịch: (?<note>[\\s\\S]*?)(?=\\nMã giao dịch|$)',
      signature: 'BIDV: {type}{amount} - {note}',
      wallet_id: 1,
      created_at: new Date(), // Firebase sẽ tự hiểu là Timestamp
      usage_count: 0,
      confidence_score: 1.0,
      is_active: true,
    };

    const rawSms =
      '{"packageName":"com.vnpay.bidv","title":"Thông báo BIDV","text":"Thời gian giao dịch: 16:43 06/01/2026\\nTài khoản thanh toán: 6201178820\\nSố tiền GD: -10,000 VND\\nSố dư cuối: 10,902,324 VND\\nNội dung giao dịch: MB-TKThe 0004100022679006_NGUYEN THI VAN ANH, tai OCB. ND TU CAO DUY Chuyen tien -CTLNHIDO000013992840879\\nMã giao dịch: 0833KVsA-85xDcYQ33"}';

    const result = this.parseNotif(rawSms, bidvPattern);
    console.log('Kết quả bóc tách:', result);
  }

  parseNotif(smsText: string, pattern: PatternEntity): any {
    // 1. Khởi tạo Regex từ chuỗi đã lưu trong DB
    const regex = new RegExp(pattern.regex_str, 'i');

    // 2. Thực hiện so khớp
    const match = smsText.match(regex);

    if (match && match.groups) {
      const { type, amount, date, time, note } = match.groups;

      // 3. Hậu xử lý dữ liệu thô từ chuỗi thành kiểu dữ liệu chuẩn
      return {
        type: type === '+' ? TransactionType.In : TransactionType.Out,
        amount: parseFloat(amount.replace(/,/g, '')), // "10,000" -> 10000
        date: this.parseDateTime(date, time),
        note: note.trim(),
        bankKey: pattern.bank_key,
      };
    }
    return null;
  }

  private parseDateTime(dateStr: string, timeStr: string): Date {
    // Chuyển "06/01/2026" + "16:43" -> Object Date
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, min] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, min);
  }

  async ngOnInit() {}

  async ngAfterViewInit() {}
}

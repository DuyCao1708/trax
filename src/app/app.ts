import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NotificationReader } from 'notification-reader';
import { AiService } from './services/ai.service';
import { JsonPipe } from '@angular/common';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Transaction } from './models/transaction';
import { PatternEntity } from './entities/pattern';
import { TransactionType } from './entities/transaction';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe],
  template: `
    <p class="text-red-500 mt-10">{{ message() }}</p>

    <p>Version 1.0</p>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mr-2"
      (click)="exportDevNotifications()"
    >
      Export to file
    </button>

    <button
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
      (click)="clearDevNotifications()"
    >
      Clear
    </button>

    <div class="border-b my-4"></div>

    Notifications:
    <ul>
      @for (item of notifications(); track item; let index = $index) {
        <li>{{ index + 1 }}. {{ item }}</li>
        <div class="not-last:border-b border-dashed my-1"></div>
      }
    </ul>

    <div class="border-b my-4"></div>

    Analyzed info:
    <ul>
      @for (item of analyzedObjs(); track item; let index = $index) {
        <li>{{ index + 1 }}. {{ item | json }}</li>
        <div class="not-last:border-b border-dashed my-1"></div>
      }
    </ul>

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

  async ngOnInit() {
    console.log(await this._databaseService.getCategories());
    // if (!(await this._authService.checkBiometric())) {
    //   this.message.set('Không thể đăng nhập');
    //   return;
    // }

    // const isVerified = await this._authService.verify();
    // this.message.set(isVerified ? 'Đã đăng nhập' : 'Chưa đăng nhập');

    this.askPermission();
    this.listenNotifications();
  }

  async ngAfterViewInit() {
    // this.notifications.update((list) => [
    //   '{"packageName":"com.vnpay.bidv","title":"Thông báo BIDV","text":"Thời gian giao dịch: 16:43 06/01/2026\\nTài khoản thanh toán: 6201178820\\nSố tiền GD: -10,000 VND\\nSố dư cuối: 10,902,324 VND\\nNội dung giao dịch: MB-TKThe 0004100022679006_NGUYEN THI VAN ANH, tai OCB. ND TU CAO DUY Chuyen tien -CTLNHIDO000013992840879\\nMã giao dịch: 0833KVsA-85xDcYQ33"}',
    //   ...list,
    // ]);
    // const analyzed = await this._aiService.prompt(
    //   '{"packageName":"com.vnpay.bidv","title":"Thông báo BIDV","text":"Thời gian giao dịch: 16:43 06/01/2026\\nTài khoản thanh toán: 6201178820\\nSố tiền GD: -10,000 VND\\nSố dư cuối: 10,902,324 VND\\nNội dung giao dịch: MB-TKThe 0004100022679006_NGUYEN THI VAN ANH, tai OCB. ND TU CAO DUY Chuyen tien -CTLNHIDO000013992840879\\nMã giao dịch: 0833KVsA-85xDcYQ33"}',
    // );
    // if (analyzed) {
    //   try {
    //     this.analyzedObjs.update((list) => [JSON.parse(analyzed), ...list]);
    //   } catch {
    //     alert(`Cannot parse, raw response: ${analyzed}`);
    //   }
    // }
  }

  async askPermission() {
    console.log('Calling requestPermission...');
    await NotificationReader.requestPermission();
  }

  async listenNotifications() {
    NotificationReader.addListener('notificationReceived', async (data: any) => {
      const raw = JSON.stringify(data);

      this.notifications.update((list) => [raw, ...list]);

      this.saveNotification(raw);

      const analyzed = await this._aiService.prompt(raw);

      if (analyzed) {
        try {
          this.analyzedObjs.update((list) => [JSON.parse(analyzed), ...list]);
        } catch {
          alert(`Cannot parse, raw response: ${analyzed}`);
        }
      }
    });
  }

  private readonly DEV_KEY = '__DEV_NOTIFICATIONS__';

  private saveNotification(raw: string) {
    const list = JSON.parse(localStorage.getItem(this.DEV_KEY) ?? '[]');
    list.unshift({
      raw,
      at: Date.now(),
    });
    localStorage.setItem(this.DEV_KEY, JSON.stringify(list));
  }

  async exportDevNotifications() {
    try {
      const data = localStorage.getItem(this.DEV_KEY);

      if (!data) return;

      const fileName = `notifications-${Date.now()}.json`;

      const file = await Filesystem.writeFile({
        path: fileName,
        data,
        directory: Directory.Cache, // dùng Cache để dễ share
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: 'Export notifications',
        text: 'Dev notifications export',
        files: [file.uri], // dùng uri, không phải tên file
      });
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  clearDevNotifications() {
    localStorage.removeItem(this.DEV_KEY);
    this.notifications.set([]);
    this.analyzedObjs.set([]);
  }
}

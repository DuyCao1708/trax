import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Firestore, getFirestore } from 'firebase/firestore';
import {
  GenerativeModel,
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  SchemaType,
} from 'firebase/ai';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly _app: FirebaseApp;

  readonly database: Firestore;
  readonly generativeModel: GenerativeModel;

  constructor() {
    this._app = initializeApp(environment.firebase);

    this.database = getFirestore(this._app);
    this.generativeModel = this.getGenerativeModel();
  }

  private getGenerativeModel() {
    const ai = getAI(this._app, { backend: new GoogleAIBackend() });

    const transactionSchema = {
      type: SchemaType.OBJECT,
      properties: {
        id: {
          type: SchemaType.NUMBER,
          description: 'Số ID tự tăng hoặc số định danh duy nhất cho giao dịch (nếu có)',
        },
        type: {
          type: SchemaType.STRING,
          enum: ['IN', 'OUT'],
          description: 'Giao dịch nhận tiền (IN) hoặc chuyển tiền/thanh toán (OUT)',
        },
        amount: {
          type: SchemaType.NUMBER,
          description: 'Số tiền giao dịch',
        },
        currency: {
          type: SchemaType.STRING,
          description: 'Đơn vị tiền tệ, mặc định là VND',
        },
        date: {
          type: SchemaType.STRING,
          description: 'Ngày giao dịch định dạng ISO',
        },
        category: {
          type: SchemaType.STRING,
          enum: ['Food', 'Transport', 'Shopping', 'Salary', 'Medical', 'Others'],
          description: 'Phân loại giao dịch',
        },
        walletId: {
          type: SchemaType.STRING,
          description: 'ID ví (mặc định có thể để "default")',
        },
        counterParty: {
          type: SchemaType.STRING,
          description: 'Tên người gửi hoặc người nhận (nếu có)',
        },
        note: {
          type: SchemaType.STRING,
          description: 'Nội dung chi tiết của giao dịch',
        },
      },
      required: ['id', 'type', 'amount', 'currency', 'date', 'category', 'walletId'],
    };

    return getGenerativeModel(ai, {
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: transactionSchema,
      },
      systemInstruction:
        'You are a smart parser. Extract all important information from the following Vietnamese bank notification and return a JSON object with this structure',
    });
  }
}

import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private _model = inject(FirebaseService).generativeModel;

  async prompt(data: string) {
    if (!this._model) {
      alert('Model is not ready');
      return;
    }

    const result = await this._model.generateContent(data);

    const response = result.response;
    const text = response.text();
    return text;
  }
}

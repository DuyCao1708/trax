import { Injectable } from '@angular/core';
import { TransactionType } from '../entities/transaction';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  get types() {
    return Object.entries(TransactionType)
      .filter(([_, value]) => !isNaN(Number(value)))
      .map(([key, value], index) => ({
        name: key,
        id: value,
        icon: ['add-outline', 'remove-outline', 'swap-horizontal-outline'][index],
      }));
  }
}

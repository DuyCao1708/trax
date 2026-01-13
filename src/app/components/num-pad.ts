import { Component, output, signal } from '@angular/core';
import { NumPadDelete, NumPadKey, NumPadOperator, NumPadSeparator } from '../models/num-pad';
import { IonRippleEffect } from '@ionic/angular/standalone';

@Component({
  selector: 'num-pad',
  imports: [IonRippleEffect],
  template: `
    <section class="flex-1 grid grid-cols-3 col-span-8 bg-neutral-800">
      @for (key of keys(); track key) {
        <div
          class="ion-activatable relative overflow-hidden text-center text-3xl font-light py-10"
          (click)="handleKey(key)"
        >
          {{ key }}
          <ion-ripple-effect></ion-ripple-effect>
        </div>
      }
    </section>

    <section class="flex flex-col justify-evenly w-[20%] bg-neutral-900">
      @for (operator of operators(); track operator) {
        <div
          class="ion-activatable relative overflow-hidden text-center text-3xl font-light py-7"
          (click)="handleOperator(operator)"
        >
          {{ operator }}
          <ion-ripple-effect></ion-ripple-effect>
        </div>
      }
    </section>
  `,
  host: {
    class: 'flex text-neutral-400',
  },
})
export class NumPad {
  keys = signal<(NumPadKey | NumPadDelete | NumPadSeparator)[]>([
    7,
    8,
    9,
    4,
    5,
    6,
    1,
    2,
    3,
    ',',
    0,
    '←',
  ]);

  operators = signal<NumPadOperator[]>(['÷', '*', '−', '+', '=']);

  displayChange = output<string>();
  valueChange = output<number>();

  private _displayValue = signal<string>('0');
  protected activeOperator = signal<NumPadOperator | null>(null);
  private _firstOperand = signal<number | null>(null);
  private _waitForSecondOperand = signal<boolean>(false);

  handleKey(key: NumPadKey | NumPadDelete | NumPadSeparator) {
    if (typeof key === 'number' || key === ',') {
      this.inputDigit(key);
    } else if (key === '←') {
      this.backspace();
    }

    this.displayChange.emit(this._displayValue());
  }

  private inputDigit(digit: number | ',') {
    const val = digit === ',' ? '.' : digit.toString();
    const current = this._displayValue();

    if (this._waitForSecondOperand()) {
      this._displayValue.set(val);
      this._waitForSecondOperand.set(false);
    } else {
      if (val === '.' && current.includes('.')) return;
      this._displayValue.set(current === '0' && val !== '.' ? val : current + val);
    }
  }

  private backspace() {
    const current = this._displayValue();
    if (current.length > 1) {
      this._displayValue.set(current.slice(0, -1));
    } else {
      this._displayValue.set('0');
    }
  }

  handleOperator(nextOperator: NumPadOperator) {
    const inputValue = parseFloat(this._displayValue());

    if (this._firstOperand() === null) {
      if (nextOperator !== '=') {
        this._firstOperand.set(inputValue);
      }
    } else if (this._waitForSecondOperand()) {
      this.activeOperator.set(nextOperator === '=' ? null : nextOperator);
      return;
    } else if (this.activeOperator()) {
      const result = this.calculate(this._firstOperand()!, inputValue, this.activeOperator()!);

      this._displayValue.set(String(result));
      this._firstOperand.set(result);

      this.valueChange.emit(result);
      this.displayChange.emit(String(result));
    }

    this._waitForSecondOperand.set(true);
    this.activeOperator.set(nextOperator === '=' ? null : nextOperator);

    if (nextOperator === '=') {
      this._firstOperand.set(null);
      this._waitForSecondOperand.set(false);
    }
  }

  private calculate(first: number, second: number, op: NumPadOperator): number {
    switch (op) {
      case '+':
        return first + second;
      case '−':
        return first - second;
      case '*':
        return first * second;
      case '÷':
        return second !== 0 ? first / second : 0;
      default:
        return second;
    }
  }
}

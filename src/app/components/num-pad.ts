import { Component, signal } from '@angular/core';
import { NumPadDelete, NumPadKey, NumPadOperator, NumPadSeparator } from '../models/num-pad';

@Component({
  selector: 'num-pad',
  imports: [],
  template: `
    <section class="flex-1 grid grid-cols-3 col-span-8 bg-neutral-800">
      @for (key of keys(); track key) {
        <div class="text-center text-3xl font-light py-7">{{ key }}</div>
      }
    </section>

    <section class="flex flex-col justify-evenly w-[20%]">
      @for (operator of operators(); track operator) {
        <div class="text-center text-3xl font-light py-7">{{ operator }}</div>
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
}

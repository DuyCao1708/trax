import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[autofocus]',
})
export class Autofocus {
  private _element = inject(ElementRef);

  ngAfterViewInit() {
    setTimeout(() => {
      // Đối với ion-input, chúng ta cần gọi method setFocus() của nó
      if (this._element.nativeElement.setFocus) {
        this._element.nativeElement.setFocus();
      } else {
        this._element.nativeElement.focus();
      }
    }, 100);
  }
}

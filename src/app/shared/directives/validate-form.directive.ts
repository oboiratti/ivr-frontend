import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive({
  selector: '[validate-form]'
})
export class ValidateFormDirective {

  @Input('validate-form') form: FormGroup
  @Output() valid = new EventEmitter<void>()

  constructor() {}

  @HostListener('click')
  doClick() {
    this.markAsDirty();
    this.respondWithValid();
  }

  private markAsDirty() {
    Object.keys(this.form.controls).forEach((field) => {
      this.form.controls[field].markAsDirty();
    })
  }

  private respondWithValid() {
    if (this.form.valid) {
      this.valid.emit();
    }
  }
}

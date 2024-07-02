import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-errors-wrapper',
  template: `
    <div class="form-group">
      <ng-content></ng-content>
      <div class="error-container">
        <ng-container *ngIf="control?.dirty || control?.touched">
          <ng-container *ngFor="let key of control.errors | object_keys">
            <div class="error-message" *ngIf="control.hasError(key)">
              {{ key | format_error: label:control.getError(key):errorMessages }}
            </div>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
})
export class FormErrorWrapperComponent {
  @Input() control: FormControl;
  @Input() label: string = 'Field';
  @Input() errorMessages: {};
  @Input() submitValue: string;
}

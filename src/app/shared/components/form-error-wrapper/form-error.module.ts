import { NgModule } from "@angular/core";
import { ErrorMessageFormatter } from "./error-message.pipe";
import { FormErrorWrapperComponent } from "./form-error-wrapper.component";
import { ObjectKeysSpreadPipe } from "./object-keys-spread.pipe";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
@NgModule({
  declarations: [FormErrorWrapperComponent, ObjectKeysSpreadPipe, ErrorMessageFormatter],
  imports: [CommonModule, FormsModule ],
  exports: [FormErrorWrapperComponent],
})
export class FormErrorModule {}

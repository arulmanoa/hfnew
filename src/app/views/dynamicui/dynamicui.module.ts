import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicuiRoutingModule } from './dynamicui-routing.module';
import { DynamicuiComponent } from './dynamicui/dynamicui.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DynamicuiService } from './services/dynamicui.service';
import { SuccessuiComponent } from './successui/successui.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    // DynamicuiComponent
    // SuccessuiComponent
  ],
  imports: [
    CommonModule,
    // FormsModule,
    // RouterModule,
    // ReactiveFormsModule,
    // HttpClientModule,
    // AngularFontAwesomeModule,
    // FormsModule,
    // BsDatepickerModule.forRoot(),
    // ToastrModule.forRoot({
    //   timeOut: 5000,
    //   //positionClass: 'toast-bottom-right',
    //   positionClass: 'toast-top-center',
    //   preventDuplicates: false,
    // }),
    // NgbModule,
    // NgSelectModule,
    DynamicuiRoutingModule
  ],
  entryComponents: [
    // DynamicuiComponent,

  ],
  exports: [
    // DynamicuiComponent
  ]
  ,
  providers: [
    // DynamicuiService 
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
  ]
})
export class DynamicuiModule { }

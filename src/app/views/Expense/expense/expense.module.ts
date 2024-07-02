import { CommonModule } from '@angular/common';
import { ExpenseComponent } from '../expense/expense.component';
import { ExpenseentiriesComponent } from '../expenseentiries/expenseentiries/expenseentiries.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Injector, APP_INITIALIZER, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule, MatDialogModule } from '@angular/material';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NZ_I18N, en_US } from "ng-zorro-antd";
import { NgZorroAntdModule, NZ_ICONS, NzSelectModule } from "ng-zorro-antd";
import { IconDefinition } from "@ant-design/icons-angular";
import * as AllIcons from "@ant-design/icons-angular/icons";
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { TooltipModule } from 'ng2-tooltip-directive'; 
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    // ExpenseComponent,
    // ExpenseentiriesComponent,
  ],
  imports: [
    CommonModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    NgSelectModule,
    NgbModule.forRoot(),
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    NgxSpinnerModule,
    AngularSlickgridModule.forRoot({
      enableAutoResize: true,
    }),
    DragDropModule,
    NgZorroAntdModule.forRoot(),
    NzTableModule, Ng2SearchPipeModule,
    TooltipModule, NzPopconfirmModule, 
    SharedModule, MatTooltipModule
  ]
})
export class ExpenseModule { }

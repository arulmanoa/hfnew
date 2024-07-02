import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NZ_I18N, en_US } from "ng-zorro-antd";
import { NgZorroAntdModule, NZ_ICONS, NzSelectModule } from "ng-zorro-antd";
import { NgxWebstorageModule } from 'ngx-webstorage';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconDefinition } from "@ant-design/icons-angular";
import * as AllIcons from "@ant-design/icons-angular/icons";
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgSelectModule } from '@ng-select/ng-select'; 

import { InvestmentRoutingModule } from './investment-routing.module';
import { InvestmentComponent } from './investment/investment.component';
import { ManageinvestmentComponent } from './shared/modals/manageinvestment/manageinvestment.component';
import { LayoutModule } from 'src/app/layouts/layout.module';
import { MatTooltipModule } from '@angular/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { HousePropertyModalComponent } from './shared/modals/house-property-modal/house-property-modal.component';
import { InvestmentVerificationComponent } from './investment-verification/investment-verification.component';
import { PreviewDocumentsModalComponent } from './shared/modals/preview-documents-modal/preview-documents-modal.component';
import { ExemptionModalComponent } from './shared/modals/exemption-modal/exemption-modal.component';
import { PerquisitesModalComponent } from './shared/modals/perquisites-modal/perquisites-modal.component';
import { OtherincomeModalComponent } from './shared/modals/otherincome-modal/otherincome-modal.component';
import { InvestmentpreviewmodalComponent } from './shared/modals/investmentpreviewmodal/investmentpreviewmodal.component';
import { TaxcalculatorComponent } from './taxcalculator/taxcalculator.component';
import { PreviousEmploymentModalComponent } from './shared/modals/previous-employment-modal/previous-employment-modal.component';
import { PositiveNumberDirective } from './shared/directives/PositiveNumberDirective';
import { MaxValueDirective } from './shared/directives/MaxValueDirective';

const antDesignIcons = AllIcons as { 
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  key => antDesignIcons[key]
);


@NgModule({
  declarations: [InvestmentComponent, ManageinvestmentComponent, HousePropertyModalComponent, InvestmentVerificationComponent, PreviewDocumentsModalComponent, ExemptionModalComponent, PerquisitesModalComponent, OtherincomeModalComponent, InvestmentpreviewmodalComponent, PreviousEmploymentModalComponent, PositiveNumberDirective, MaxValueDirective],
  imports: [
    CommonModule, 
    FormsModule,
    SharedModule,
    LayoutModule,
    ReactiveFormsModule,    
    NgxWebstorageModule.forRoot(),
    NgbModule.forRoot(),
    NgZorroAntdModule.forRoot(),
    InvestmentRoutingModule,
    BsDatepickerModule.forRoot(), NgSelectModule, DatepickerModule.forRoot(),
    MatTooltipModule,
  

  ],
  entryComponents: [
    ManageinvestmentComponent,
    HousePropertyModalComponent,
    ExemptionModalComponent,PerquisitesModalComponent, OtherincomeModalComponent,InvestmentpreviewmodalComponent,PreviousEmploymentModalComponent
  ],
  exports: [
    NgZorroAntdModule,
    InvestmentComponent, ManageinvestmentComponent,
    HousePropertyModalComponent,
    ExemptionModalComponent,PerquisitesModalComponent, OtherincomeModalComponent,InvestmentpreviewmodalComponent,PreviousEmploymentModalComponent
  ],
  providers: [
    
  { provide: NZ_I18N, useValue: en_US }, { provide: NZ_ICONS, useValue: icons }
  ],
  
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class InvestmentModule { }

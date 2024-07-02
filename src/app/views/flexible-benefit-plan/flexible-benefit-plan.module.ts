import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LOCALE_ID } from "@angular/core";
import localeIn from '@angular/common/locales/en-IN';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeIn);
import { NgZorroAntdModule, NZ_ICONS } from "ng-zorro-antd";
import { NgxWebstorageModule } from 'ngx-webstorage';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconDefinition } from "@ant-design/icons-angular";
import * as AllIcons from "@ant-design/icons-angular/icons";
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgSelectModule } from '@ng-select/ng-select'; 
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { LayoutModule } from 'src/app/layouts/layout.module';
import { ChartsModule } from 'ng2-charts';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularSlickgridModule } from 'angular-slickgrid';

import { FlexibleBenefitPlanRoutingModule } from './flexible-benefit-plan.routing.module';
import { FlexibleBenefitsPlanDeclarationComponent } from './flexible-benefits-plan-declaration/flexible-benefits-plan-declaration.component';
import { FlexiBenefitPlanTimeSlotComponent } from './flexi-benefit-plan-time-slot/flexi-benefit-plan-time-slot.component';
import { FbpListingForEmployeeComponent } from "./fbp-listing-for-employee/fbp-listing-for-employee.component";
import { SharedModule } from 'primeng/components/common/shared';

const antDesignIcons = AllIcons as { 
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  key => antDesignIcons[key]
);


@NgModule({
  declarations: [
    FlexibleBenefitsPlanDeclarationComponent,
    FlexiBenefitPlanTimeSlotComponent,
    FbpListingForEmployeeComponent
  ],
  imports: [
    CommonModule, 
    FormsModule,
    LayoutModule,
    SharedModule,
    NgxSpinnerModule,
    ChartsModule,
    NzDrawerModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    AngularSlickgridModule.forRoot({
      enableAutoResize: true,
    }),   
    NgxWebstorageModule.forRoot(),
    NgbModule.forRoot(),
    NgZorroAntdModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    DatepickerModule.forRoot(),
    MatTooltipModule,
    FlexibleBenefitPlanRoutingModule
  ],
  entryComponents: [],
  exports: [
    NgZorroAntdModule
  ],
  providers: [
    
    { provide: LOCALE_ID, useValue: "en-IN" }, { provide: NZ_ICONS, useValue: icons }
  ],
  
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class FlexibleBenefitPlanModule { }

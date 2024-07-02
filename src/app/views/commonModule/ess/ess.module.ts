import { CommonModule } from '@angular/common';
import { EssRoutingModule } from './ess-routing.module';
import { orderBy } from 'lodash';
//import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
//import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { AngularSlickgridModule } from 'angular-slickgrid';
import { SubmissionListComponent } from 'src/app/views/onboarding/submission-list/submission-list.component';
import { OnboardingOpsListComponent } from 'src/app/views/onboarding/onboarding-ops-list/onboarding-ops-list.component';
import { VendorOnboardingComponent } from 'src/app/views/onboarding/vendor-onboarding/vendor-onboarding.component';
import { BrowserModule, TransferState, BrowserTransferStateModule } from '@angular/platform-browser';
import { Injector, APP_INITIALIZER, NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler,Pipe, PipeTransform } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { MatInputModule, MatTreeModule, MatCardModule, MatButtonToggleModule, MatTabsModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { LOCATION_INITIALIZED } from '@angular/common';
import { TabsModule as ngxtabsmodule } from 'ngx-tabset';
//import { AppRoutingModule } from './app-routing.module';
import {
  MatButtonModule, MatCheckboxModule,
  MatIconModule, MatMenuModule, MatSidenavModule,
  MatExpansionModule, MatListModule
} from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { TranslateModule, TranslateService, TranslateStore, TranslateLoader, TranslateCompiler } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { LightboxModule } from 'ngx-lightbox';
import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ChartsModule } from 'ng2-charts';
import { CarouselModule } from 'ngx-owl-carousel-o';

// import { Ng2SmartTableModule } from 'ng2-smart-table';
import * as bootstrap from "bootstrap";
import * as $ from "jquery";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { TooltipModule } from 'ng2-tooltip-directive';
import { AngularSplitModule } from 'angular-split';

import { FileDownloadComponent } from '../../../components/shared/file-download/file-download.component';
import { LoaderComponent } from '../../../components/shared/loader/loader.component';

import { OrderByPipe } from '../../../components/shared/OrderByPipe';

import { AppComponent } from '../../../app.component';
import { GridAddItemComponent } from '../../../components/rules/ruleslist/test.component';
import { RulesetComponent } from '../../../components/rules/rulesetlist/ruleset.component';
import { RuleBuilderComponent } from '../../../components/rules/ruleeditor/rulebuilder.component';
import { SidebarLeftComponent } from '../../../layouts/sidebar-left/sidebar-left.component';
import { PageNotFoundComponent } from '../../../components/shared/page-not-found/page-not-found.component';
import { ToolBarComponent } from '../../../layouts/tool-bar/tool-bar.component';
import { NgbdModalConfig } from '../../../components/shared/modal-config/modal-config';


// main structure modules

import { LayoutModule } from '../../../layouts/layout.module';
import { SharedModule } from '../../../shared/shared.module';
import { AccountModule } from '../../../account/account.module';
import { MastersModule } from '../../../masters/masters.module';
import { UnauthorizedModule } from '../../../unauthorized/unauthorized.module';

import { PagenotfoundComponent } from '../../../shared/components/pagenotfound/pagenotfound.component';
import { CountrymanagerComponent } from '../../../masters/country/countryasset/countryasset.component';
import { StatemanagerComponent } from '../../../views/masters/states/statesasset/statesasset.component';


import { UserEndUiComponent } from '../../../views/personalised-display/user-end-ui/user-end-ui.component';
import { ConfigureDisplayComponent } from '../../../views/personalised-display/configure-display/configure-display.component';
import { SearchbarViewComponent } from '../../../views/personalised-display/searchbar-view/searchbar-view.component';

//own services
//LoaderInterceptor
import { JwtInterceptor, HttpErrorInterceptor, } from '../../../_helpers';
import { EncrDecrService } from '../../../_services/service/encr-decr.service';
import { EventEmiterService } from '../../../components/Service/event.emmiter.service';
import { HttpService } from '../../../_services/service/http.service';
import { ExcelService } from '../../../_services/service/excel.service';
//own components without module
import { PrivateLayoutModule } from '../../../privatelayout/privatelayout.module';

// pages

// import{PipeEnumToString}from './views/onboarding/onboarding-qc/onboarding-qc.component';
//import { OnboardingOpsListComponent } from './views/onboarding/onboarding-ops-list/onboarding-ops-list.component';
import { VendoronboardingListComponent } from 'src/app/views/onboarding/vendoronboarding-list/vendoronboarding-list.component'
//import { LifecycleListComponent } from 'src/app/views/Employee/lifecycle-list/lifecycle-list.component';


import { AppInitService } from '../../../_services/service/app.init';
import { ScaleComponent } from '../../../views/scale/scale.component';
import { ScaleListComponent } from '../../../views/scale-list/scale-list.component';
import { FakeComponent } from '../../../views/personalised-display/fake/fake.component';
import { FormUiComponent } from '../../../views/generic-form/form-ui/form-ui.component';
import { ConfigureFormComponent } from '../../../views/generic-form/configure-form/configure-form.component';
import { PopoverModule } from "ngx-smart-popover";

import { NZ_I18N, en_US } from "ng-zorro-antd";
import { NgZorroAntdModule, NZ_ICONS, NzSelectModule } from "ng-zorro-antd";
import { ConfigureInputsComponent } from '../../../views/generic-form/configure-form/configure-inputs/configure-inputs.component';
import { ConfigureGridComponent } from '../../../views/generic-form/configure-form/configure-grid/configure-grid.component';
import { ConfigureImportComponent } from '../../../views/generic-import/configure-import/configure-import.component';
import { ConfigureImportInputsComponent } from '../../../views/generic-import/configure-import/configure-import-inputs/configure-import-inputs.component';
import { ImportUiComponent } from '../../../views/generic-import/import-ui/import-ui.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { TextMaskModule } from 'angular2-text-mask';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UniquePipe } from '../../../views/payroll/payout/uniquePipe';
import { CommaSeparatedStringsFilterComponent } from '../../../grid-filters/comma-separated-strings/comma-separated-strings-filter/comma-separated-strings-filter.component';
import { TrendModule } from 'ngx-trend';
import { ServiceWorkerModule, SwRegistrationOptions } from '@angular/service-worker';
import { environment } from '../../../../environments/environment';
import { ExportAsModule } from 'ngx-export-as';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { WebcamModule } from 'ngx-webcam';
import { ExpenseModule } from '../../../views/Expense/expense/expense.module';
import ConfigJson from 'src/assets/json/config.json';
import * as AllIcons from "@ant-design/icons-angular/icons";
import { IconDefinition } from "@ant-design/icons-angular";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ProfileComponent } from 'src/app/views/ESS/ess/profile/profile.component';
import { MybankComponent } from 'src/app/views/ESS/ess/mybank/mybank.component';
import { NomineeInformationComponent } from 'src/app/views/ESS/ess/nominee-information/nominee-information.component';
import { OfficialInformationComponent } from 'src/app/views/ESS/ess/official-information/official-information.component';
import { MyinvestmentComponent } from 'src/app/views/ESS/ess/myinvestment/myinvestment.component';
import { MydocumentsComponent } from 'src/app/views/ESS/ess/mydocuments/mydocuments.component';
import { PreviousEmploymentComponent } from 'src/app/views/ESS/ess/previous-employment/previous-employment.component';
import { MypaymentsComponent } from 'src/app/views/ESS/ess/mypayments/mypayments.component';
import { SalaryDetailsComponent } from 'src/app/views/ESS/ess/salary-details/salary-details.component';
import { MycommunicationsComponent } from 'src/app/views/ESS/ess/mycommunications/mycommunications.component';
import { MyeducationComponent } from 'src/app/views/ESS/ess/myeducation/myeducation.component';
import { MyexperienceComponent } from 'src/app/views/ESS/ess/myexperience/myexperience.component';
// import { EmployeeDeductionsComponent } from 'src/app/views/ESS/ess/employee-deductions/employee-deductions.component';
import { TaxslipComponent } from 'src/app/views/Employee/taxslip/taxslip.component';
import { PayslipComponent } from 'src/app/views/Employee/payslip/payslip.component';
import { ExpenceBillEntryComponent } from "src/app/views/Employee/expence-bill-entry/expence-bill-entry.component";
import { BenefitsclubComponent } from 'src/app/views/Employee/benefitsclub/benefitsclub.component';
import { HrpolicyComponent } from 'src/app/views/Employee/hrpolicy/hrpolicy.component';
import { EmployeeDocsComponent } from 'src/app/views/Employee/employee-docs/employee-docs.component';
import { CustomdashboardComponent } from 'src/app/dashboard/customdashboard/customdashboard.component';
import { EmployeeDeductionsComponent } from '../../ESS/ess/employee-deductions/employee-deductions.component';
import { EssComponent } from '../../ESS/ess/ess.component';
import { EmployeeResignationComponent } from '../../ESS/ess/employee-resignation/employee-resignation.component';
import { OnlineJoiningKitComponent } from '../../ESS/ess/online-joining-kit/online-joining-kit.component';
import { SalarybreakupmodalComponent } from '../../ESS/shared/salarybreakupmodal/salarybreakupmodal.component';
import { AdditionaldetailsComponent } from '../../ESS/ess/additionaldetails/additionaldetails.component';
import { UppercaseInputDirective } from '../../ESS/shared/directives/UppercaseInputDirective';
import { AutocompleteOffDirective } from '../../ESS/shared/directives/AutocompleteOffDirective';
import { UploadHrDocsComponent } from '../../Employee/hrpolicy/upload-hr-docs/upload-hr-docs.component';
import { EmployeesInfoComponent } from '../../Employee/employees-info/employees-info.component';


@NgModule({
  declarations: [
    OrderByPipe,
    ProfileComponent,
    MybankComponent,
    NomineeInformationComponent,
    OfficialInformationComponent,
    MyinvestmentComponent,
    MydocumentsComponent,
    PreviousEmploymentComponent,
    MypaymentsComponent,
    SalaryDetailsComponent,
    MycommunicationsComponent,
    MyeducationComponent,
    MyexperienceComponent,
    EmployeeDeductionsComponent,
    TaxslipComponent,
    PayslipComponent,
    ExpenceBillEntryComponent,
    BenefitsclubComponent,
    HrpolicyComponent,
    EmployeeDocsComponent,
    CustomdashboardComponent,
    EssComponent,
    EmployeeResignationComponent,
    OnlineJoiningKitComponent,
    SalarybreakupmodalComponent,
   AdditionaldetailsComponent,
   UppercaseInputDirective,
   AutocompleteOffDirective,
   UploadHrDocsComponent,
   EmployeesInfoComponent
   ,
   
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    //BrowserAnimationsModule,

    // HttpModule,
    //BrowserTransferStateModule,
     LayoutModule,
    // SocialLoginModule,
    HttpClientModule,

    NgxWebstorageModule.forRoot(),
    NgbModule.forRoot(),
    // TabsModule.forRoot(),
    // ngxtabsmodule.forRoot(),
     NgxPaginationModule,

     SharedModule,
    // MastersModule,
    // AccountModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
    BsDatepickerModule.forRoot(),
    // LightboxModule, PrivateLayoutModule, UnauthorizedModule,
    // MatInputModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatToolbarModule,
     NgSelectModule,
    // Ng2SmartTableModule,
    // MatIconModule, MatMenuModule, MatSidenavModule, MatExpansionModule, MatListModule,
    // MatTreeModule, MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatTreeModule,
    // MatTabsModule,
    // NgbModule,
    DatepickerModule.forRoot(),
    // ServiceWorkerModule.register('/ngsw-worker.js', { enabled: enablePwa }),
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: enablePwa }),
    // AngularFontAwesomeModule, PopoverModule,
    // AngularEditorModule, MatTooltipModule,
    MatTooltipModule,
    AngularSlickgridModule.forRoot({
      enableAutoResize: true,
    }),
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: (createTranslateLoader),
    //     deps: [HttpClient]
    //   }
    // }),
    // TableModule,
    // TooltipModule,
    Ng2SearchPipeModule,
    ChartsModule,
    // CalendarModule.forRoot({
    //   provide: DateAdapter,
    //   useFactory: adapterFactory,
    // }),
    // TextMaskModule,
    NgZorroAntdModule.forRoot(),
    // AngularSplitModule.forRoot(),
    // CarouselModule,
    // TrendModule,
    // ExportAsModule,
    // WebcamModule,
    // ProgressbarModule.forRoot(),
    // ExpenseModule,
    EssRoutingModule
  ],

  entryComponents:
    [
ProfileComponent,
    MybankComponent,
    MycommunicationsComponent,
    OfficialInformationComponent,
    NomineeInformationComponent,
    MyinvestmentComponent,
    PreviousEmploymentComponent,
    MydocumentsComponent,
    MypaymentsComponent,
    MyeducationComponent,
    MyexperienceComponent,
    SalaryDetailsComponent,
    EmployeeDeductionsComponent,
    SalarybreakupmodalComponent,
    AdditionaldetailsComponent,
    UploadHrDocsComponent,
    
    ],
    exports:[SalarybreakupmodalComponent,AdditionaldetailsComponent],
  providers: [
   
  ],

  //bootstrap: [AppComponent],

  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EssModule { }

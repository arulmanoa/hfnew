import { Injector, APP_INITIALIZER, NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MastersRoutingModule } from './masters-routing.module';

import { SubmissionListComponent } from 'src/app/views/onboarding/submission-list/submission-list.component';
import { OnboardingOpsListComponent } from 'src/app/views/onboarding/onboarding-ops-list/onboarding-ops-list.component';
import { VendorOnboardingComponent } from 'src/app/views/onboarding/vendor-onboarding/vendor-onboarding.component';
import { BrowserModule, TransferState, BrowserTransferStateModule } from '@angular/platform-browser';

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
//import { GridAddItemComponent } from '../../../components/rules/ruleslist/test.component';
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
//import { ScaleComponent } from '../../../views/scale/scale.component';
//import { ScaleListComponent } from '../../../views/scale-list/scale-list.component';
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


import { StatesComponent } from 'src/app/views/masters/states/statelist/states.component';
import { CityListComponent } from 'src/app/views/masters/city/city-list/city-list.component';
import { CityModelComponent } from 'src/app/shared/modals/city-modal/city-model.component';
import { MinimumwagesComponent } from 'src/app/views/masters/minimumwages/minimumwages.component';
import { ScaleListComponent } from 'src/app/views/scale-list/scale-list.component';
import { ScaleComponent } from 'src/app/views/scale/scale.component';
import { BankListComponent } from 'src/app/views/bank-list/bank-list.component';
import { StepperComponent } from 'src/app/views/New-Client/stepper/stepper.component';
import { ClientLocationComponent } from 'src/app/shared/modals/client-location/client-location.component';
import { ClientContractComponent } from 'src/app/views/clientContract/client-contract/client-contract.component';
import { ClientLocationListComponent } from 'src/app/views/client-location-list/client-location-list.component';
import { ClientContactComponent } from 'src/app/shared/modals/client-contact/client-contact.component';
import { ClientContactListComponent } from 'src/app/views/client-contact-list/client-contact-list.component';
import { CountriesComponent } from 'src/app/masters/countries/countries.component';
import { RulesListComponent } from 'src/app/components/rules/ruleslist/ruleslist.component';
import { TemplateListingComponent } from 'src/app/components/letterTemplates/listing/templatelisting.component';
import { BankBranchComponent } from 'src/app/shared/modals/bank-branch/bank-branch.component';
import { BankComponent } from '../../bank/bank.component';
import { AddUpdateClientComponent } from '../../New-Client/add-update-client/add-update-client.component';
import { CountryComponent } from '../../masters/country/countrylist/country.component';
import { RulesetListComponent } from 'src/app/components/rules/rulesetlist/rulesetlist.component';
import { LetterTemplateComponent } from 'src/app/components/letterTemplates/editor/letterTemplate.component';
import { WeekOffConfigurationComponent } from '../../masters/week-off-configuration/week-off-configuration.component';
import { GridAddItemComponent } from 'src/app/components/rules/ruleslist/test.component';
import { ShiftMappingComponent } from 'src/app/masters/shift-mapping/shift-mapping.component'
import { ChangepasswordComponent } from 'src/app/account/changepassword/changepassword.component';
import { WeekOffListingComponent } from 'src/app/views/masters/week-off-listing/week-off-listing.component';
import { WeekOffConfigListingComponent } from 'src/app/views/masters/week-off-config-listing/week-off-config-listing.component';
import { ShiftMasterListingComponent } from 'src/app/views/masters/shift-master-listing/shift-master-listing.component';
import { ShiftMasterListingConfigComponent } from 'src/app/views/masters/shift-master-listing-config/shift-master-listing-config.component';
import { ShiftListingComponent } from 'src/app/views/masters/shift-listing/shift-listing.component';
import { AlertpushmessageComponent } from '../../masters/alertpushmessage/alertpushmessage.component';

import { ShiftChangeRequestComponent } from '../../masters/shift-change-request/shift-change-request.component';
import { EmployeeDetailsListingAndUpdateComponent } from '../../masters/employee-details-listing-and-update/employee-details-listing-and-update.component';
import { ApproveEditEmployeeDetailsListingComponent } from '../../masters/approve-edit-employee-details-listing/approve-edit-employee-details-listing.component';
import { RowDetailPreloadComponent } from '../../masters/approve-edit-employee-details-listing/rowdetail-preload.component';
import { RowDetailViewComponent } from '../../masters/approve-edit-employee-details-listing/rowdetail-view.component';

@NgModule({
  declarations: [
    
    StatesComponent,
    CityListComponent,
    // CityModelComponent,
    MinimumwagesComponent,
    ScaleListComponent,
    ScaleComponent,
    BankListComponent,
    StepperComponent,
    ClientLocationComponent,
    ClientContractComponent,
    ClientLocationListComponent,
    ClientContactComponent,
    ClientContactListComponent,
    CountriesComponent,
    RulesListComponent,
    TemplateListingComponent,
    CountrymanagerComponent,
    StatemanagerComponent,
    BankBranchComponent,
    BankComponent,
    AddUpdateClientComponent,
    CountryComponent,
    LetterTemplateComponent,
    RulesetListComponent,
    RuleBuilderComponent,
    RulesetComponent,
    WeekOffConfigurationComponent,
    GridAddItemComponent,
    RulesetComponent,
    ShiftMappingComponent,
    ChangepasswordComponent,
    WeekOffListingComponent,
    WeekOffConfigListingComponent,
    ShiftMasterListingComponent,
    ShiftMasterListingConfigComponent,
    ShiftListingComponent,
    AlertpushmessageComponent,
    ShiftChangeRequestComponent,
    EmployeeDetailsListingAndUpdateComponent,
    ApproveEditEmployeeDetailsListingComponent,
    RowDetailPreloadComponent,
    RowDetailViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    //BrowserAnimationsModule,
    // MastersModule,
    // HttpModule,
    //BrowserTransferStateModule,
    LayoutModule,
    // SocialLoginModule,
    HttpClientModule,

    NgxWebstorageModule.forRoot(),
    NgbModule.forRoot(),
    // TabsModule.forRoot(),
    // ngxtabsmodule.forRoot(),
    // NgxPaginationModule,

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
     AngularEditorModule,
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
    // ChartsModule,
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
    MastersRoutingModule
  ],
  entryComponents:
    [
      RulesetComponent, RuleBuilderComponent, BankBranchComponent, RowDetailPreloadComponent, RowDetailViewComponent
    ],
  providers: [
    
  ],

  //bootstrap: [AppComponent],

  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CommonMastersModule { }

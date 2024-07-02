import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule, MatTreeModule, MatCardModule, MatButtonToggleModule, MatTabsModule } from '@angular/material';
import {
  MatButtonModule, MatCheckboxModule,
  MatIconModule, MatMenuModule, MatSidenavModule,
  MatExpansionModule, MatListModule
} from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { MenuitemloaderComponent } from './menu/menuitem/menuitemloader/menuitemloader.component';
import { FooterComponent } from './footer/footer.component';
import { BannerComponent } from './banner/banner.component';
import { SnackBarComponent } from './layout.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { LayoutRoutingModule } from './layout-routing.module';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { PagenotfoundComponent } from '../shared/components/pagenotfound/pagenotfound.component';
import { SearchbarViewComponent } from 'src/app/views/personalised-display/searchbar-view/searchbar-view.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap';
import { OnboardingComponent } from '../views/onboarding/onboarding.component';
import { CommaSeparatedStringsFilterComponent } from '../grid-filters/comma-separated-strings/comma-separated-strings-filter/comma-separated-strings-filter.component';
import { DynamicfieldformComponent } from '../views/generic-form/dynamicfieldform/dynamicfieldform.component';
import { SidebarLeftComponent } from './sidebar-left/sidebar-left.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { GridViewComponent } from '../views/personalised-display/grid-view/grid-view.component';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { RulesetListComponent } from '../components/rules/rulesetlist/rulesetlist.component';
import { RulesetComponent } from '../components/rules/rulesetlist/ruleset.component';
import { RuleBuilderComponent } from '../components/rules/ruleeditor/rulebuilder.component';
import { LetterTemplateComponent } from '../components/letterTemplates/editor/letterTemplate.component';
import { TemplateListingComponent } from '../components/letterTemplates/listing/templatelisting.component';
import { FormViewComponent } from '../views/generic-form/form-view/form-view.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaintenanceComponent } from '../maintenance/maintenance.component';
import { InvestmentsubmissionslotComponent } from '../views/investmentsubmissionslot/investmentsubmissionslot.component';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';
import { TaxcalculatorComponent } from '../views/investment/taxcalculator/taxcalculator.component';
import { OnboardingExtendedDetailsComponent } from '../views/onboarding/shared/modals/onboarding-extended-details/onboarding-extended-details.component';
import { NapsOnboardingComponent } from '../views/onboarding/shared/modals/naps-onboarding/naps-onboarding.component';
import { UserverificationComponent } from '../views/common/shared/userverification/userverification.component';
import { OnboardingadditionalinfoComponent } from '../views/onboarding/shared/modals/onboardingadditionalinfo/onboardingadditionalinfo.component';
import { Ng2CompleterModule } from "ng2-completer";
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AdditionaloperationalinfoComponent } from '../views/onboarding/shared/modals/additionaloperationalinfo/additionaloperationalinfo.component';
import { ResignationHistoryComponent } from '../views/ESS/ess/employee-resignation/resignation-history/resignation-history.component';

@NgModule({
  declarations: [

    LayoutComponent,
    HeaderComponent,
    MenuComponent,
    MenuitemloaderComponent,
    FooterComponent, BannerComponent,
    SnackBarComponent,
    BreadcrumbComponent,
    DashboardComponent,
    // PagenotfoundComponent,
    SearchbarViewComponent,
    // OnboardingComponent,
    CommaSeparatedStringsFilterComponent,
    DynamicfieldformComponent,
    SidebarLeftComponent,
    ToolBarComponent,
    GridViewComponent,
    FormViewComponent,
    MaintenanceComponent,
    InvestmentsubmissionslotComponent ,
    TaxcalculatorComponent,
    OnboardingExtendedDetailsComponent,
    NapsOnboardingComponent,
    UserverificationComponent,
    OnboardingadditionalinfoComponent,
    AdditionaloperationalinfoComponent,
    ResignationHistoryComponent

  ],
  imports: [ 
    CommonModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    InfiniteScrollModule,

    // RouterModule,
    MatProgressBarModule,
    // MatSnackBarModule,
    // NgSelectModule,
    // MatInputModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatToolbarModule, 
    NgSelectModule,
    NgbModule.forRoot(),
    // MatIconModule, MatMenuModule, MatSidenavModule, MatExpansionModule, MatListModule,
    // MatTreeModule, MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatTreeModule,
    // MatTabsModule,
    MatTooltipModule,
    LayoutRoutingModule,
    SharedModule,
    ChartsModule,
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    AngularSlickgridModule.forRoot({
      enableAutoResize: true,
    }),
    Ng2SearchPipeModule,
    DeviceDetectorModule.forRoot(),
    Ng2CompleterModule
  ],
  entryComponents: [
    SnackBarComponent,
    BreadcrumbComponent,
    SearchbarViewComponent,
    CommaSeparatedStringsFilterComponent,
    GridViewComponent,
    FormViewComponent,
    DynamicfieldformComponent,
    TaxcalculatorComponent,
    OnboardingExtendedDetailsComponent,
    NapsOnboardingComponent,
    UserverificationComponent,
    OnboardingadditionalinfoComponent,
    AdditionaloperationalinfoComponent,
    ResignationHistoryComponent
    

  ],
  exports: [
    BreadcrumbComponent,
    SearchbarViewComponent,
    TooltipModule,
    CommaSeparatedStringsFilterComponent,
    GridViewComponent,
    FormViewComponent,
    DynamicfieldformComponent,
    TaxcalculatorComponent,
    OnboardingExtendedDetailsComponent,
    NapsOnboardingComponent,
    UserverificationComponent,
    OnboardingadditionalinfoComponent,
    AdditionaloperationalinfoComponent
    
    
    
  ],
  providers: [
    DeviceDetectorService
  ],
})
export class LayoutModule { }

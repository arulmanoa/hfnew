import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

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
import { CountryComponent } from 'src/app/views/masters/country/countrylist/country.component';
import { RulesetListComponent } from 'src/app/components/rules/rulesetlist/rulesetlist.component';
import { RuleBuilderComponent } from 'src/app/components/rules/ruleeditor/rulebuilder.component';
import { LetterTemplateComponent } from 'src/app/components/letterTemplates/editor/letterTemplate.component';

import { GridAddItemComponent } from 'src/app/components/rules/ruleslist/test.component';
import { WeekOffConfigurationComponent } from '../../masters/week-off-configuration/week-off-configuration.component';
import { ShiftMappingComponent } from 'src/app/masters/shift-mapping/shift-mapping.component'
import { ChangepasswordComponent } from 'src/app/account/changepassword/changepassword.component';
import { WeekOffListingComponent } from 'src/app/views/masters/week-off-listing/week-off-listing.component';
import { WeekOffConfigListingComponent } from 'src/app/views/masters/week-off-config-listing/week-off-config-listing.component';
import { ShiftMasterListingComponent } from 'src/app/views/masters/shift-master-listing/shift-master-listing.component';
import { ShiftMasterListingConfigComponent } from 'src/app/views/masters/shift-master-listing-config/shift-master-listing-config.component';
import { ShiftListingComponent } from 'src/app/views/masters/shift-listing/shift-listing.component';
import { AlertpushmessageComponent } from '../../masters/alertpushmessage/alertpushmessage.component';
import { BankComponent } from '../../bank/bank.component';
import { ShiftChangeRequestComponent } from '../../masters/shift-change-request/shift-change-request.component';
import { EmployeeDetailsListingAndUpdateComponent } from '../../masters/employee-details-listing-and-update/employee-details-listing-and-update.component';
import { ApproveEditEmployeeDetailsListingComponent } from '../../masters/approve-edit-employee-details-listing/approve-edit-employee-details-listing.component';
const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
    { path: 'country', component: CountryComponent, canActivate: [MaintenanceGuard, AuthGuard], data: { breadcrumb: 'Country List' } },
    { path: 'stateList', component: StatesComponent,canActivate: [MaintenanceGuard, AuthGuard], data: { breadcrumb: 'State List' }},
    { path: 'cityList', component: CityListComponent, canActivate: [MaintenanceGuard, AuthGuard], data: { breadcrumb: 'City List' } },
    { path: 'city', component: CityModelComponent, },
    { path: 'minimumwagesList', component: MinimumwagesComponent, data: { breadcrumb: 'Minimumwages List' }, canActivate: [AuthGuard] },
    { path: 'scalelist', component: ScaleListComponent,canActivate: [AuthGuard] },
    { path: 'scale', component: ScaleComponent, resolve: { DataInterface: RowDataService } },
    { path: 'banklist', component: BankListComponent,canActivate: [AuthGuard] },
    { path: 'bank', component: BankComponent},
    { path: 'clientlocation', component: ClientLocationComponent },
    { path: 'clientContract', component: ClientContractComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Client Contract' } },
    { path: 'clientlocationlist', component: ClientLocationListComponent },
    { path: 'clientcontact', component: ClientContactComponent },
    { path: 'clientcontactlist', component: ClientContactListComponent },
    { path: 'countries', component: CountriesComponent },
    { path: 'ClientNew', component: StepperComponent },
    { path: 'ruleslist', component: RulesListComponent },
    { path: 'templatelist', component: TemplateListingComponent, canActivate: [AuthGuard] },
    { path: 'rulesetlist', component: RulesetListComponent },
    { path: 'rulebuilder', component: RuleBuilderComponent },
    { path: 'lettertemplate', component: LetterTemplateComponent },
    { path: 'rulesetlist', component: RulesetListComponent },
    { path: 'rulebuilder', component: RuleBuilderComponent },
    { path: 'test', component: GridAddItemComponent },
    { path: 'weekoffconfig',component:WeekOffConfigurationComponent,data:{breadcrumb:'Employee WeekOff'}},
    { path: 'shiftmapping', component: ShiftMappingComponent,data: { breadcrumb: 'Shift Mapping' } },//not required for seperate page it is coming from slider.
    { path : 'changepassword',component: ChangepasswordComponent,data: { breadcrumb: 'Change Password' } },
    { path : 'weekOffListing',component: WeekOffListingComponent,data: { breadcrumb: 'Week Off List' } },
    { path : 'weekOffConfigListing',component: WeekOffConfigListingComponent,data: { breadcrumb: 'Week Off Configuration List' } },
    { path : 'shiftMasterListing',component: ShiftMasterListingComponent,data: { breadcrumb: 'Shift List' } },//display master data screen
    { path : 'shiftMasterListingConfig',component: ShiftMasterListingConfigComponent,data: { breadcrumb: 'Shift List Config' } },// Hr only screnn for shift Master
    { path : 'shiftChangeRequest',component: ShiftChangeRequestComponent,data: { breadcrumb: 'Shift Change Request' } },// employee/mgr shift change request
    { path : 'shiftMapListing',component: ShiftListingComponent,data: { breadcrumb: 'Shift Mapping List' } },//manager/Hr screnn for shift transction
    { path : 'notify',component: AlertpushmessageComponent,data: { breadcrumb: 'Cloud Push Message' } },//manager/Hr screnn for shift transction
    {
      path: 'employeeDetails',
      component: EmployeeDetailsListingAndUpdateComponent, data: { breadcrumb: 'Employee Data' }
    },
    {
      path: 'employeeData',
      component: ApproveEditEmployeeDetailsListingComponent, data: { breadcrumb: 'Employee Data' }
    }
    //{ path: 'country', component: CountryComponent, data: { title: 'Country', breadcrumb: 'Country' }, canActivate: [AuthGuard] },
  ]
}];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MastersRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}

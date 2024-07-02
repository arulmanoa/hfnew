

import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from './_guards';
// import { LayoutComponent } from './layouts/layout.component';
//aacount Module
import { LoginComponent } from './account/login/login.component';
import { ForgotpasswordComponent } from './account/forgotpassword/forgotpassword.component';

import { DashboardComponent } from './dashboard/dashboard.component';
// import { CountriesComponent } from './masters/countries/countries.component';
// //import { OnboardingOpsListComponent } from './views/onboarding/onboarding-ops-list/onboarding-ops-list.component';
// import { OnboardingQcListComponent } from './views/onboarding/onboarding_qclist/onboarding-qc-list.component';

// import { ClientLocationComponent } from './shared/modals/client-location/client-location.component';
// import { ClientLocationListComponent } from './views/client-location-list/client-location-list.component';
// import { ClientContactComponent } from './shared/modals/client-contact/client-contact.component';
// import { ClientContactListComponent } from './views/client-contact-list/client-contact-list.component';
// import { CandidateAcceptanceComponent } from './views/candidate/candidate-acceptance/candidate-acceptance.component';
// import { ProductComponent } from './views/product/product.component';
// import { ProductApplicabilityComponent } from './shared/modals/product-applicability/product-applicability.component';
// import { ProductListComponent } from './views/product-list/product-list.component';
// import { SuccessScreenComponent } from './shared/components/success-screen/success-screen.component';
// import { MigrationListComponent } from './views/migration/migration-list/migration-list.component';
import { EmployeeListComponent } from './views/Employee/employee-list/employee-list.component';
// import { RegenerateLetterComponent } from './views/Employee/regenerate-letter/regenerate-letter.component';

// import { BankComponent } from './views/bank/bank.component';
// import { BankListComponent } from './views/bank-list/bank-list.component';
// import { BankBranchComponent } from './shared/modals/bank-branch/bank-branch.component';
// import { EmployeeReportListComponent } from './Reports/employee-report-list/employee-report-list.component';
// import { OnboardingMakeofferComponent } from './views/onboarding/onboarding-makeoffer/onboarding-makeoffer.component';
// import { OnboardingDetailsComponent } from './views/onboarding/onboarding-details/onboarding-details.component';
// import { CityListComponent } from './views/masters/city/city-list/city-list.component';
// import { CityModelComponent } from './shared/modals/city-modal/city-model.component';
// import { MinimumwagesComponent } from './views/masters/minimumwages/minimumwages.component';

import { AccessdeniedComponent } from './shared/components/accessdenied/accessdenied.component';
import { PagenotfoundComponent } from './shared/components/pagenotfound/pagenotfound.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { CandidateOTPComponent } from './account/candidate-otp/candidate-otp.component';
import { CandidateAcceptanceComponent } from './views/candidate/candidate-acceptance/candidate-acceptance.component';
import { OnboardingComponent } from './views/onboarding/onboarding.component';
import { SuccessScreenComponent } from './shared/components/success-screen/success-screen.component';
import { RulesetListComponent } from './components/rules/rulesetlist/rulesetlist.component';
import { RuleBuilderComponent } from './components/rules/ruleeditor/rulebuilder.component';
import { LetterTemplateComponent } from './components/letterTemplates/editor/letterTemplate.component';
import { TemplateListingComponent } from './components/letterTemplates/listing/templatelisting.component';
// //import { SubmissionListComponent } from './views/onboarding/submission-list/submission-list.component';
// import { LifecycleListComponent } from './views/Employee/lifecycle-list/lifecycle-list.component';
// import { RevisonSalaryComponent } from './views/Employee/revison-salary/revison-salary.component';
// import { ScaleListComponent } from './views/scale-list/scale-list.component';
// import { ScaleComponent } from './views/scale/scale.component';
// import { UserEndUiComponent } from './views/personalised-display/user-end-ui/user-end-ui.component';
// import { ConfigureDisplayComponent } from './views/personalised-display/configure-display/configure-display.component';
// import { PayrollinputtransactionComponent } from './views/payroll/payrollinputtransaction/payrollinputtransaction.component';
// import { FakeComponent } from './views/personalised-display/fake/fake.component';
// import { RowDataService } from './views/personalised-display/row-data.service';
// import { FormUiComponent } from './views/generic-form/form-ui/form-ui.component';
// import { PaygroupComponent } from './views/paygroup/paygroup.component';
// import { ConfigureFormComponent } from './views/generic-form/configure-form/configure-form.component';
// import { ConfigureInputsComponent } from './views/generic-form/configure-form/configure-inputs/configure-inputs.component';
// import { SaleordersComponent } from './views/payroll/saleorders/saleorders.component';
// import { ConfigureGridComponent } from './views/generic-form/configure-form/configure-grid/configure-grid.component';
// import { ConfigureImportComponent } from './views/generic-import/configure-import/configure-import.component';
// import { ConfigureImportInputsComponent } from './views/generic-import/configure-import/configure-import-inputs/configure-import-inputs.component';
// import { ImportUiComponent } from './views/generic-import/import-ui/import-ui.component';
// import { SalarytransactionComponent } from './views/payroll/salarytransaction/salarytransaction.component';
// import { ClientContractComponent } from './views/clientContract/client-contract/client-contract.component';
// import { LifecycleQclistComponent } from './views/Employee/lifecycle-qclist/lifecycle-qclist.component';
// import { LifecycleQcComponent } from './views/Employee/lifecycle-qc/lifecycle-qc.component';
// import { FinalsettlementComponent } from './views/finalsettlement/finalsettlement/finalsettlement.component';
// import { ResignationListComponent } from './views/finalsettlement/resignation-list/resignation-list.component';
// import { FnftransactionComponent } from './views/finalsettlement/fnftransaction/fnftransaction.component';
// import { TaxslipComponent } from './views/Employee/taxslip/taxslip.component';
// import { ReimbursementComponent } from './views/reimbursement/reimbursement/reimbursement.component';
// import { PayoutComponent } from './views/payroll/payout/payout.component';
// import { EmployeeDocsComponent } from './views/Employee/employee-docs/employee-docs.component';
// import { SelfserviceQclistComponent } from './views/Employee/selfservice-qclist/selfservice-qclist.component';
// import { SelfserviceQcComponent } from './views/Employee/selfservice-qc/selfservice-qc.component';
// import { AdhocPaymentsComponent } from './views/adhocPayments/adhoc-payments/adhoc-payments.component';
// import { HelpComponent } from './shared/components/help/help.component';
// import { InvestmentsQclistComponent } from './views/Employee/investments-qclist/investments-qclist.component';
// import { InvestmentsQcComponent } from './views/Employee/investments-qc/investments-qc.component';
// import { CustomReportComponent } from './views/custom-report/custom-report/custom-report.component';
// import { AttendanceentriesComponent } from './views/attendance/attendanceentries/attendanceentries.component';
// import { EmployeeAttendanceComponent } from './views/attendance/employee-attendance/employee-attendance.component';
// import { TeamattendanceComponent } from './views/attendance/teamattendance/teamattendance.component';
// import { EmployeeleaveentriesComponent } from './views/leavemanagement/employeeleaveentries/employeeleaveentries.component';
// import { TeamleaverequestComponent } from './views/leavemanagement/teamleaverequest/teamleaverequest.component';
// import { PayslipComponent } from './views/Employee/payslip/payslip.component';
// import { ConfirmSeparationComponent } from './views/finalsettlement/confirm-separation/confirm-separation.component';
// import { ManagerleaverequestComponent } from './views/leavemanagement/managerleaverequest/managerleaverequest.component';
// import { BenefitsclubComponent } from './views/Employee/benefitsclub/benefitsclub.component';
// import { HrpolicyComponent } from './views/Employee/hrpolicy/hrpolicy.component';
// import { EntitlementdefinitionComponent } from './views/leavemanagement/entitlementdefinition/entitlementdefinition.component';
// import { ChangepasswordComponent } from './account/changepassword/changepassword.component';
// import { HrattendanceentriesComponent } from './views/attendance/hrattendanceentries/hrattendanceentries.component';
// import { Genericimport2Component } from './views/generic-import/genericimport2/genericimport2.component';
// import { ExpenseentiriesComponent } from './views/Expense/expenseentiries/expenseentiries/expenseentiries.component';
// import { ExpenseComponent } from './views/Expense/expense/expense.component';
// //import { VendorOnboardingComponent } from './views/onboarding/vendor-onboarding/vendor-onboarding.component';
// import { NotificationHistoryComponent } from './views/notification/notification-history/notification-history.component';
// import { OrganizationAttendanceComponent } from './views/attendance/organization-attendance/organization-attendance.component';
// import { VendoronboardingListComponent } from './views/onboarding/vendoronboarding-list/vendoronboarding-list.component';
// //import { StepperComponent } from 'src/app/views/New-Client/stepper/stepper.component';
// import { VendorQcComponent } from './views/onboarding/vendor-qc/vendor-qc.component';
// import { VendorQcListComponent } from './views/onboarding/vendor-qc-list/vendor-qc-list.component';
// // import { NewContractComponent } from 'src/app/shared/components/contract-new/contract-new.component';
// import { TaxEntryDetailsComponent } from './views/Employee/tax-entry-details/tax-entry-details.component';
// import { ExpenceBillEntryComponent } from "./views/Employee/expence-bill-entry/expence-bill-entry.component";
// import { ExemptionQcComponent } from "./views/Employee/exemption-qc/exemption-qc.component"
// import { AttendanceComponent } from 'src/app/views/attendance/attendance/attendance.component';
// import { EmployeePermissionComponent } from 'src/app/views/permissions/employee-permission/employee-permission.component'
// import { EmployeeCompensationUiComponent } from 'src/app/views/Compensation/employee-compensation-ui/employee-compensation-ui.component';
// import { ProductYearlyTaxDetailsComponent } from 'src/app/shared/modals/product-yearly-tax-details/product-yearly-tax-details.component'

// import { EssComponent } from './views/ESS/ess/ess.component';
// import { ProfileComponent } from './views/ESS/ess/profile/profile.component';
// import { MybankComponent } from './views/ESS/ess/mybank/mybank.component';
// import { MydocumentsComponent } from './views/ESS/ess/mydocuments/mydocuments.component';
// import { PreviousEmploymentComponent } from './views/ESS/ess/previous-employment/previous-employment.component';
// import { NomineeInformationComponent } from './views/ESS/ess/nominee-information/nominee-information.component';
// import { MypaymentsComponent } from './views/ESS/ess/mypayments/mypayments.component';
// import { OfficialInformationComponent } from './views/ESS/ess/official-information/official-information.component';
// import { MyinvestmentComponent } from './views/ESS/ess/myinvestment/myinvestment.component';
// import { EmployeeRequestApproverListingComponent } from 'src/app/views/employee-request/employee-request-approver-listing/employee-request-approver-listing.component'
// import { EssRoutingModule } from './views/ESS/ess/ess-routing.module';
// import { EmployeeMyRequestsUiComponent } from 'src/app/views/emloyeemyrequests/employee-myrequests-ui/employee-myrequests-ui.component';
// //import {EmployeeRequestComponent} from 'src/app/views/employee-request/employee-request/employee-request/employee-request.component'
// import { PreloadAllModules } from '@angular/router';
// import { InvestmentpreviewComponent } from './views/Employee/investmentpreview/investmentpreview.component';
// //import { SmedashboardcomponentComponent } from './views/smedashboard/smedashboardcomponent/smedashboardcomponent.component';
// import { OnboardingProcessLogsComponent } from 'src/app/views/onboarding/onboarding-process-logs/onboarding-process-logs.component';
// import { CustomPreloadingStrategy } from './preloader';

// The last route is the empty path route. This specifies
// the route to redirect to if the client side path is empty.
const appRoutes: Routes = [
  //Site routes goes here 

  // {
  //   path: 'ess',
  //   loadChildren: () => import('./views/ESS/ess/ess.module').then(m => m.EssModule)
  // },


  // App routes goes here here


  {
    path: '',
    loadChildren: './account/account.module#AccountModule',   
    data: { preload: true, delay: false },
  },
  
  {
    path: 'dynamic', 
    loadChildren: './views/dynamicui/dynamicui.module#DynamicuiModule',
    data: { preload: true, delay: false },
  },

  { 
    path: 'app',
    loadChildren: './layouts/layout.module#LayoutModule',
    data: { preload: true, delay: false, breadcrumb: 'Home' }
  },


  //   { path: 'ruleslist', component: RulesListComponent },
  //   { path: 'test', component: GridAddItemComponent },
  // { path: 'rulesetlist', component: RulesetListComponent },
  // { path: 'rulebuilder', component: RuleBuilderComponent },
  //{ path: 'lettertemplate', component: LetterTemplateComponent },

  //no layout routes  
  
  { path: '', redirectTo: '/login', pathMatch: 'full' , data: { breadcrumb: 'Login'} },
  // { path: '', redirectTo: '/login/:clientCode', pathMatch: 'full' , data: { breadcrumb: 'Login'} },

  { path: '**', component: PagenotfoundComponent },


];


const config: ExtraOptions = {
  useHash: true,
};
// Pass the configured routes to the forRoot() method
// to let the angular router know about our routes
// Export the imported RouterModule so router directives
// are available to the module that imports this AppRoutingModule
@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {
    initialNavigation: 'enabled', onSameUrlNavigation: 'reload', useHash: true, scrollPositionRestoration: 'enabled',
    // preloadingStrategy: CustomPreloadingStrategy
  })

  ],
  // imports: [RouterModule.forRoot(appRoutes, config)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  // if(window) {
  //   window.console.log = window.console.warn = window.console.info = function () {
  //     // Don't log anything.
  //   };
  // }

}

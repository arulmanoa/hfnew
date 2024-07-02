import { T } from '@angular/cdk/keycodes';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LetterTemplateComponent } from '../components/letterTemplates/editor/letterTemplate.component';
import { TemplateListingComponent } from '../components/letterTemplates/listing/templatelisting.component';
import { RuleBuilderComponent } from '../components/rules/ruleeditor/rulebuilder.component';
import { RulesetListComponent } from '../components/rules/rulesetlist/rulesetlist.component';
import { RulesListComponent } from '../components/rules/ruleslist/ruleslist.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { DashboardModule } from '../dashboard/dashboard.module';
import { MaintenanceComponent } from '../maintenance/maintenance.component';
import { AccessdeniedComponent } from '../shared/components/accessdenied/accessdenied.component';
import { PagenotfoundComponent } from '../shared/components/pagenotfound/pagenotfound.component';
import { EssComponent } from '../views/ESS/ess/ess.component';
import { InvestmentsubmissionslotComponent } from '../views/investmentsubmissionslot/investmentsubmissionslot.component';
import { RowDataService } from '../views/personalised-display/row-data.service';
import { AuthGuard } from '../_guards';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,

    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full', data: { breadcrumb: 'Login' } },
      {
        path: 'dashboard',
        pathMatch: 'full',
        component: DashboardComponent,
        data: { breadcrumb: 'Dashboard' },
        canActivate: [AuthGuard]
      },
      {
          path: 'dashboard',
          pathMatch: 'full',
          loadChildren: '../dashboard/dashboard.module#DashboardModule', 
          data: { preload: true, delay: false, breadcrumb: 'Onboarding' },
      },
      {
        path: 'onboarding',
        loadChildren: '../views/commonModule/onboarding/onboarding.module#OnboardingModule',
        data: { preload: true, delay: false, breadcrumb: 'Onboarding' },
      },
      {
          path: 'attendance',
          loadChildren: '../views/commonModule/attendance_leave/attendance-leave.module#AttendanceLeaveModule',
          data: { preload: true, delay: false, breadcrumb: 'Attendance', },
      },
      {
        path: 'attendance',
        loadChildren: '../views/commonModule/attendance/attendance.module#AttendanceModule',
        data: { preload: true, delay: false, breadcrumb: 'Attendance', },
      },
      {
        path: 'leaves',
        loadChildren: '../views/commonModule/leave/leave.module#LeaveModule',
        data: { preload: true, delay: false, breadcrumb: 'Leaves', },
      },
      {
        path: 'expense',
        loadChildren: '../views/commonModule/common-expense/common-expense.module#CommonExpenseModule',
        data: { preload: true, delay: false, breadcrumb: 'Expense' },
      },
      {
        path: 'reports',
        loadChildren: '../views/commonModule/custom-reports/custom-reports.module#CustomReportsModule',
        data: { preload: true, delay: false, breadcrumb: 'Reports' },
      },
      {
        path: 'elc',
        loadChildren: '../views/commonModule/elc/elc.module#ELCModule',
        data: { preload: true, delay: false, breadcrumb: 'Elc' },
      },
      {
        path: 'ess',
        loadChildren: '../views/commonModule/ess/ess.module#EssModule',
        data: { preload: true, delay: false, breadcrumb: 'Ess' },
      },

      {
        path: 'fnf',
        loadChildren: '../views/commonModule/fnf/fnf.module#FnfModule',
        data: { preload: true, delay: false, breadcrumb: 'FnF' },
      },
      {
          path: 'essfnf',
          loadChildren: '../views/commonModule/fnf-ess/fnf-ess.module#FnfEssModule',
          data: { preload: true, delay: false, breadcrumb: 'FnF' },
      },
      {
        path: 'forms',
        loadChildren: '../views/commonModule/generic-form/generic-form.module#GenericFormModule',
        data: { preload: true, delay: false, breadcrumb: 'Generic Form' },
      },
      {
        path: 'imports',
        loadChildren: '../views/commonModule/generic-import/generic-import.module#GenericImportModule',
        data: { preload: true, delay: false, breadcrumb: 'Generic Import' },
      },
      {
        path: 'product',
        loadChildren: '../views/commonModule/product/product.module#ProductModule',
        data: { preload: true, delay: false, breadcrumb: 'Product' },
      },
      {
        path: 'payroll',
        loadChildren: '../views/commonModule/payroll/payroll.module#PayrollModule',
        data: { preload: true, delay: false, breadcrumb: 'Payroll' },
      },
      {
        path: 'onboardingqc',
        loadChildren: '../views/commonModule/onboardingQc/onboarding-qc.module#OnboardingQcModule',
        data: { preload: true, delay: false, breadcrumb: 'Onboarding Qc' },
      },
      {
          path: 'onboarding',
          loadChildren: '../views/commonModule/onboarding/onboarding.module#OnboardingModule',
          data: { preload: true, delay: false, breadcrumb: 'onboarding' },
      },
      {
          path: 'notification',
          loadChildren: '../views/commonModule/notification/notification.module#NotificationModule',
          data: { preload: true, delay: false, breadcrumb: 'Notification' },
      },
      {
        path: 'masters',
        loadChildren: '../views/commonModule/masters/masters.module#CommonMastersModule',
        data: { preload: true, delay: false, breadcrumb: 'Settings' },
      },
      {
        path: 'listing',
        loadChildren: '../views/commonModule/generic-ui/generic-ui.module#GenericUiModule',
        data: { preload: true, delay: false, breadcrumb: 'Listing' },
      },
      {
        path: 'decryption',
        component: MaintenanceComponent
      },
      {
        path: 'accessdenied',
        component: AccessdeniedComponent
      },
      {
        path: 'investment',
        loadChildren: '../views/investment/investment.module#InvestmentModule',
        // canActivate : [AuthGuardService] , data : { role : 'admin'}
        data: { preload: true, delay: false, breadcrumb: 'Investment' },
      },

      {
        path: 'investmentSubmissionSlot',
        component: InvestmentsubmissionslotComponent
      },
      {
        path: 'flexibleBenefitPlan',
        loadChildren: '../views/flexible-benefit-plan/flexible-benefit-plan.module#FlexibleBenefitPlanModule',
        data: { preload: true, delay: false, breadcrumb: 'Flexible Benefit Plan' },
      },

      {
        path: 'timesheet',
        loadChildren: '../views/time-sheeting/time-sheeting.module#TimeSheetingModule',
        data: { preload: true, delay: false, breadcrumb: 'Timesheet' },
      },

      // { path: 'ruleslist', component: RulesListComponent },

      // { path: 'templatelist', component: TemplateListingComponent, canActivate: [AuthGuard] },


    ],

  },
  // { path: '**', component: Pagenotfo   undComponent },


];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }

import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

import { CustomReportComponent } from 'src/app/views/custom-report/custom-report/custom-report.component';
import { NotificationHistoryComponent } from 'src/app/views/notification/notification-history/notification-history.component';
import { EmployeeReportListComponent } from 'src/app/Reports/employee-report-list/employee-report-list.component';
import { GeneratePayslipComponent } from '../../payroll/generate-payslip/generate-payslip.component';
import { BranchGapReportComponent } from '../../custom-report/branch-gap-report/branch-gap-report.component';
import { GenericLeaveReportsComponent } from '../../custom-report/generic-leave-reports/generic-leave-reports.component';

const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
    { path: 'customreports', component: CustomReportComponent, canActivate: [AuthGuard]},
    { path: 'notifications', component: NotificationHistoryComponent, data: { breadcrumb: 'Notifications' } },
    { path: 'employeereportlist', component: EmployeeReportListComponent, canActivate: [AuthGuard] },
    { path: 'generatepayslip', 
       component: GeneratePayslipComponent, 
       data: { title: 'Generate Payslip', breadcrumb: 'Generate Payslip' } ,
       canActivate: [AuthGuard]       
    },
    { 
      path: 'branchGapReport',
      component: BranchGapReportComponent,
      data: { title: 'Branch Gap Report', breadcrumb: 'Branch Gap Report' } ,
      canActivate: [AuthGuard]
    },
    { 
      path: 'compOffReport',
      component: GenericLeaveReportsComponent,
      data: { title: 'Compensationoff Report', breadcrumb: 'Compensationoff Report' } ,
      // canActivate: [AuthGuard]
    },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomReportsRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}


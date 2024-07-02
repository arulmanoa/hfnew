import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';

import { RowDataService } from 'src/app/views/personalised-display/row-data.service';

import { UserEndUiComponent } from 'src/app/views/personalised-display/user-end-ui/user-end-ui.component';
import { ConfigureDisplayComponent } from 'src/app/views/personalised-display/configure-display/configure-display.component';
import { FakeComponent } from 'src/app/views/personalised-display/fake/fake.component';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { EssComponent } from 'src/app/views/ESS/ess/ess.component';
import { EmployeeListComponent } from 'src/app/views/Employee/employee-list/employee-list.component';
import { InvestmentpreviewComponent } from '../../Employee/investmentpreview/investmentpreview.component';
import { ReimbursementforfinanceComponent } from '../../payroll/reimbursementforfinance/reimbursementforfinance.component';
const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
    { path: 'ui/:code', component: UserEndUiComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: '' }, canActivate: [AuthGuard] },
      { path: 'configure', component: ConfigureDisplayComponent, data: { breadcrumb: 'Configuration' } },
      { path: 'fakeLink', component: FakeComponent, resolve: { DataInterface: RowDataService } },
      { path: 'employeelist', component: EmployeeListComponent, data: { breadcrumb: 'Employee List' }, canActivate: [AuthGuard] },
      { path: 'expenseRequests', component: ReimbursementforfinanceComponent, data: { breadcrumb: 'Expense Requests' }, canActivate: [AuthGuard] },
      {
        path : 'investmentpreview',
        component :  InvestmentpreviewComponent,
        data: { breadcrumb: 'Investment Preview' }
      }
    ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GenericUiRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}


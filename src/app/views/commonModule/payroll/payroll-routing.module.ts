import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { SalarytransactionComponent } from 'src/app/views/payroll/salarytransaction/salarytransaction.component';
import { PayrollinputtransactionComponent } from 'src/app/views/payroll/payrollinputtransaction/payrollinputtransaction.component';
import { SaleordersComponent } from 'src/app/views/payroll/saleorders/saleorders.component';
import { PayoutComponent } from 'src/app/views/payroll/payout/payout.component';
import { ReimbursementComponent } from 'src/app/views/reimbursement/reimbursement/reimbursement.component';
import { AdhocPaymentsComponent } from 'src/app/views/adhocPayments/adhoc-payments/adhoc-payments.component';

const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
    { path: 'payroll/:code', component: SalarytransactionComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: '' }, canActivate: [AuthGuard] },
    { path: 'payrolltransactions', component: PayrollinputtransactionComponent, data: { breadcrumb: 'Payroll Transaction' }, canActivate: [AuthGuard] },
    { path: 'payrolltransaction/:code', component: SaleordersComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: '' }, canActivate: [AuthGuard] },
    { path: 'payoutTransaction_finance', component: PayoutComponent,resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Payout Request Transaction' }, canActivate: [AuthGuard]  },
    { path: 'payoutTransaction_ops', component: PayoutComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Payout Request Transaction' }, canActivate: [AuthGuard] },
    { path: 'payoutTransaction', component: PayoutComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Payout Request Transaction' }, canActivate: [AuthGuard] },
    { path: 'reimbursement', component: ReimbursementComponent, data: { breadcrumb: 'Reimbursement' }, canActivate: [AuthGuard] },
    { path: 'adhoc', component: AdhocPaymentsComponent, data: { breadcrumb: 'Adhoc Payment' } },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}










import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

import { ExpenseentiriesComponent } from 'src/app/views/Expense/expenseentiries/expenseentiries/expenseentiries.component';
import { ExpenseComponent } from 'src/app/views/Expense/expense/expense.component';
const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
    { path: 'claimentries', component: ExpenseentiriesComponent,  data: { breadcrumb: 'Claim Entries' }, canActivate: [AuthGuard]},
    { path: 'claims', component: ExpenseComponent,  data: { breadcrumb: 'Claims' }, canActivate: [AuthGuard] },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonExpenseRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}

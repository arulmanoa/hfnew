import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';

import { ResignationListComponent } from 'src/app/views/finalsettlement/resignation-list/resignation-list.component';
import { FinalsettlementComponent } from 'src/app/views/finalsettlement/finalsettlement/finalsettlement.component';
import { FnftransactionComponent } from 'src/app/views/finalsettlement/fnftransaction/fnftransaction.component';
import { ConfirmSeparationComponent } from 'src/app/views/finalsettlement/confirm-separation/confirm-separation.component';

const routes: Routes = [{
  path: '',
 // canActivate: [AuthGuard],
  children: [
    { path: 'resignationlist', component: ResignationListComponent, data: { breadcrumb: 'Resignation List' }, canActivate: [AuthGuard]},
    { path: 'finalsettlement', component: FinalsettlementComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: 'Final Settlement' } },
    { path: 'fnftransaction', component: FnftransactionComponent, data: { breadcrumb: 'Final Transactions' }, canActivate: [AuthGuard] },
    { path: 'confirmSeparation', component: ConfirmSeparationComponent,data: { breadcrumb: 'Confirm Separation' } },
    //{ path: 'resignationlist', component: ResignationListComponent, data: { breadcrumb: 'Resignation List' } },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FnfRoutingModule { 
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}


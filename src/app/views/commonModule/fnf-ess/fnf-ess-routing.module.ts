import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

import { ResignationListComponent } from 'src/app/views/finalsettlement/resignation-list/resignation-list.component';

const routes: Routes = [{
  path: '',
 // canActivate: [AuthGuard],
  children: [
    //{ path: 'resignationlist', component: ResignationListComponent, data: { breadcrumb: 'Resignation List' } },
  
    //  { path: 'resignationlist', component: ResignationListComponent, data: { breadcrumb: 'Resignation List' }, canActivate: [AuthGuard] },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FnfEssRoutingModule { 
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}


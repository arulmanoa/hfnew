import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

import { LifecycleListComponent } from 'src/app/views/Employee/lifecycle-list/lifecycle-list.component';
import { RevisonSalaryComponent } from 'src/app/views/Employee/revison-salary/revison-salary.component';
import { LifecycleQclistComponent } from 'src/app/views/Employee/lifecycle-qclist/lifecycle-qclist.component';
import { LifecycleQcComponent } from 'src/app/views/Employee/lifecycle-qc/lifecycle-qc.component';
const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
    {
      path: 'employeeLifecycleList', component: LifecycleListComponent,
      data: { title: 'employeeLifecycleList', breadcrumb: 'ELC List' },
      //canActivate: [AuthGuard]
    },
    { path: 'revisionSalary', component: RevisonSalaryComponent, data: { title: 'revisionSalary', breadcrumb: 'ELC Revision' } },
    {
      path: 'lifecycle_qclist', component: LifecycleQclistComponent,
      //canActivate: [MaintenanceGuard, AuthGuard], 
      data: { breadcrumb: 'ELC List' }
    },
    { path: 'lifecycle_qc', component: LifecycleQcComponent, data: { breadcrumb: 'lifecycle qc' } },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ELCRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}

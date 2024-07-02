import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { FormUiComponent } from 'src/app/views/generic-form/form-ui/form-ui.component';
import { ConfigureFormComponent } from 'src/app/views/generic-form/configure-form/configure-form.component';
import { ConfigureInputsComponent } from 'src/app/views/generic-form/configure-form/configure-inputs/configure-inputs.component';
import { ConfigureGridComponent } from 'src/app/views/generic-form/configure-form/configure-grid/configure-grid.component';

const routes: Routes = [{
  path: '',
 // canActivate: [AuthGuard],
  children: [
   //Generic Form
   { path: 'form/:code', component: FormUiComponent, resolve: { DataInterface: RowDataService }, data: { breadcrumb: '' } },
   { path: 'configure/form', component: ConfigureFormComponent },
   { path: 'configureInputs', component: ConfigureInputsComponent },
   { path: 'configureGrid', component: ConfigureGridComponent },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GenericFormRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}







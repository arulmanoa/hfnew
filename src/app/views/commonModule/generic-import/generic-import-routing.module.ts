import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

import { ImportUiComponent } from 'src/app/views/generic-import/import-ui/import-ui.component';
import { ConfigureImportComponent } from 'src/app/views/generic-import/configure-import/configure-import.component';
import { ConfigureImportInputsComponent } from 'src/app/views/generic-import/configure-import/configure-import-inputs/configure-import-inputs.component';
import { Genericimport2Component } from 'src/app/views/generic-import/genericimport2/genericimport2.component';

const routes: Routes = [{
  path: '',
 //canActivate: [AuthGuard],
  children: [
   //Generic Import
   { path: 'import', component: ImportUiComponent,canActivate: [MaintenanceGuard] },
   { path: 'import/:code', component: ImportUiComponent , canActivate: [MaintenanceGuard] },
   { path: 'configure/import', component: ConfigureImportComponent },
   { path: 'configureImportInputs', component: ConfigureImportInputsComponent },
   { path: 'genericImport', component: Genericimport2Component },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GenericImportRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}


import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { ConfigureDisplayComponent } from 'src/app/views/personalised-display/configure-display/configure-display.component';
const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard],
  children: [
    { path: 'configure', component: ConfigureDisplayComponent, data: { breadcrumb: 'Configuration' } }
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigureRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}








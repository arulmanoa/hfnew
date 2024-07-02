import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';

import { NotificationHistoryComponent } from 'src/app/views/notification/notification-history/notification-history.component';

const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
   // { path: 'notifications', component: NotificationHistoryComponent, data: { breadcrumb: 'Notifications' } },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}

